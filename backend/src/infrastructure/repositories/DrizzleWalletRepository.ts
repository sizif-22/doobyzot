import { eq } from 'drizzle-orm';
import type { DrizzleDb } from '../db/drizzle';
import { cardWallets } from '../db/schema';
import type { WalletRepository } from '@domain/repositories/WalletRepository';
import type { CardWallet } from '@domain/entities/CardWallet';
import type { Money } from '@domain/value-objects/Money';
import { WalletPersistenceMapper } from '../mappers/WalletPersistenceMapper';

/**
 * Drizzle-backed WalletRepository.
 *
 * updateBalance() is an optimised targeted UPDATE — avoids a full entity
 * round-trip for the most frequent write operation in the system.
 */
export class DrizzleWalletRepository implements WalletRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<CardWallet | null> {
    const rows = await this.db
      .select()
      .from(cardWallets)
      .where(eq(cardWallets.id, id))
      .limit(1);

    const row = rows[0];
    return row ? WalletPersistenceMapper.toDomain(row) : null;
  }

  async findByAccountId(accountId: string): Promise<CardWallet[]> {
    const rows = await this.db
      .select()
      .from(cardWallets)
      .where(eq(cardWallets.accountId, accountId));

    return rows.map(WalletPersistenceMapper.toDomain);
  }

  async save(wallet: CardWallet): Promise<void> {
    const row = WalletPersistenceMapper.toPersistence(wallet);
    await this.db
      .insert(cardWallets)
      .values({ ...row })
      .onConflictDoUpdate({
        target: cardWallets.id,
        set: {
          label: row.label,
          cardNumber: row.cardNumber,
          balanceMinor: row.balanceMinor,
          monthlyLimitMinor: row.monthlyLimitMinor,
          currency: row.currency,
          isActive: row.isActive,
          type: row.type,
          updatedAt: new Date(),
        },
      });
  }

  async updateBalance(walletId: string, newBalance: Money): Promise<void> {
    await this.db
      .update(cardWallets)
      .set({
        balanceMinor: newBalance.toMinorUnits(),
        updatedAt: new Date(),
      })
      .where(eq(cardWallets.id, walletId));
  }
}
