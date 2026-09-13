import { eq } from 'drizzle-orm';
import type { DrizzleDb } from '../db/drizzle';
import { accounts, cardWallets } from '../db/schema';
import type { AccountRepository } from '@domain/repositories/AccountRepository';
import type { Account } from '@domain/entities/Account';
import { AccountPersistenceMapper } from '../mappers/AccountPersistenceMapper';
import { WalletPersistenceMapper } from '../mappers/WalletPersistenceMapper';

/**
 * Drizzle-backed AccountRepository.
 *
 * LSP: swappable with InMemoryAccountRepository — use cases see only the interface.
 * SRP: only persistence logic, no business rules.
 * DIP: use cases depend on the AccountRepository interface, not this class.
 */
export class DrizzleAccountRepository implements AccountRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<Account | null> {
    // JOIN accounts with their wallets in a single round-trip
    const rows = await this.db
      .select()
      .from(accounts)
      .leftJoin(cardWallets, eq(cardWallets.accountId, accounts.id))
      .where(eq(accounts.id, id));

    if (rows.length === 0) return null;

    const accountRow = rows[0]!.accounts;
    const walletRows = rows
      .filter((r) => r.card_wallets !== null)
      .map((r) => WalletPersistenceMapper.toDomain(r.card_wallets!));

    return AccountPersistenceMapper.toDomain(accountRow, walletRows);
  }

  async save(account: Account): Promise<void> {
    const row = AccountPersistenceMapper.toPersistence(account);
    await this.db
      .insert(accounts)
      .values({ ...row })
      .onConflictDoUpdate({
        target: accounts.id,
        set: {
          ownerName: row.ownerName,
          updatedAt: new Date(),
        },
      });
  }
}
