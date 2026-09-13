import { eq, and, gte, lte, asc } from 'drizzle-orm';
import type { DrizzleDb } from '../db/drizzle';
import { transactions } from '../db/schema';
import type { TransactionRepository, TransactionFilter } from '@domain/repositories/TransactionRepository';
import type { Transaction } from '@domain/entities/Transaction';
import { TransactionPersistenceMapper } from '../mappers/TransactionPersistenceMapper';

/**
 * Drizzle-backed TransactionRepository.
 * Supports optional TransactionFilter for flexible, narrow queries.
 */
export class DrizzleTransactionRepository implements TransactionRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<Transaction | null> {
    const rows = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    const row = rows[0];
    return row ? TransactionPersistenceMapper.toDomain(row) : null;
  }

  async findByWalletId(
    walletId: string,
    filter?: TransactionFilter,
  ): Promise<Transaction[]> {
    const conditions = [eq(transactions.walletId, walletId)];

    if (filter?.type !== undefined) {
      conditions.push(eq(transactions.type, filter.type));
    }
    if (filter?.from !== undefined) {
      conditions.push(gte(transactions.date, filter.from));
    }
    if (filter?.to !== undefined) {
      conditions.push(lte(transactions.date, filter.to));
    }

    const query = this.db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(asc(transactions.date));

    const rows = await (filter?.limit !== undefined
      ? query.limit(filter.limit).offset(filter.offset ?? 0)
      : query);

    return rows.map(TransactionPersistenceMapper.toDomain);
  }

  async findByAccountId(accountId: string, since?: Date): Promise<Transaction[]> {
    const conditions = [eq(transactions.accountId, accountId)];

    if (since !== undefined) {
      conditions.push(gte(transactions.date, since));
    }

    const rows = await this.db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(asc(transactions.date));

    return rows.map(TransactionPersistenceMapper.toDomain);
  }

  async save(transaction: Transaction): Promise<void> {
    const row = TransactionPersistenceMapper.toPersistence(transaction);
    await this.db.insert(transactions).values({ ...row });
  }
}
