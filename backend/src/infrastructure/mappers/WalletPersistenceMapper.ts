import { CardWallet } from '@domain/entities/CardWallet';
import { CardNumber } from '@domain/value-objects/CardNumber';
import { Money } from '@domain/value-objects/Money';
import { WalletType } from '@domain/enums/WalletType';
import type { CardWalletRow } from '../db/schema';

/**
 * Maps between DB rows and CardWallet domain entities.
 *
 * ⚠️ This is the ONLY place in the codebase that calls `CardNumber.toRaw()`.
 * Reconstruction from DB reads the stored raw value and wraps it in the VO.
 * Persistence reads the raw value via `toRaw()` for INSERT/UPDATE.
 */
export class WalletPersistenceMapper {
  static toDomain(row: CardWalletRow): CardWallet {
    return new CardWallet({
      id: row.id,
      accountId: row.accountId,
      label: row.label,
      cardNumber: new CardNumber(row.cardNumber), // reconstructed from stored raw
      balance: Money.fromMinorUnits(row.balanceMinor, row.currency),
      monthlyLimit: Money.fromMinorUnits(row.monthlyLimitMinor, row.currency),
      isActive: row.isActive,
      type: row.type as WalletType,
    });
  }

  static toPersistence(entity: CardWallet): Omit<CardWalletRow, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      accountId: entity.accountId,
      label: entity.label,
      cardNumber: entity.cardNumber.toRaw(), // ⚠️ infrastructure-only call
      balanceMinor: entity.balance.toMinorUnits(),
      monthlyLimitMinor: entity.monthlyLimit.toMinorUnits(),
      currency: entity.balance.currency,
      isActive: entity.isActive,
      type: entity.type,
    };
  }
}
