import { Transaction } from '@domain/entities/Transaction';
import { Money } from '@domain/value-objects/Money';
import { TransactionType } from '@domain/enums/TransactionType';
import type { TransactionRow } from '../db/schema';

/**
 * Maps between DB rows (infrastructure) and Transaction domain entities.
 * SRP: only data transformation, no queries or business logic.
 */
export class TransactionPersistenceMapper {
  static toDomain(row: TransactionRow): Transaction {
    return new Transaction({
      id: row.id,
      walletId: row.walletId,
      accountId: row.accountId,
      title: row.title,
      category: row.category,
      amount: Money.fromMinorUnits(row.amountMinor, row.currency),
      date: row.date,
      type: row.type as TransactionType,
    });
  }

  static toPersistence(entity: Transaction): Omit<TransactionRow, 'createdAt'> {
    return {
      id: entity.id,
      walletId: entity.walletId,
      accountId: entity.accountId,
      title: entity.title,
      category: entity.category,
      amountMinor: entity.amount.toMinorUnits(),
      currency: entity.amount.currency,
      date: entity.date,
      type: entity.type,
    };
  }
}
