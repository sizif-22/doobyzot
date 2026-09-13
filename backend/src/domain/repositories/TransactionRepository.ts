import type { Transaction } from '../entities/Transaction';
import type { TransactionType } from '../enums/TransactionType';

/**
 * Optional filter criteria for transaction queries.
 * All fields are optional; omitting a field applies no filter for that dimension.
 */
export interface TransactionFilter {
  type?: TransactionType;
  category?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

/**
 * ISP: TransactionRepository owns only transaction-level persistence.
 * findByAccountId() supports the account analytics use cases without
 * joining through wallets.
 */
export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByWalletId(walletId: string, filter?: TransactionFilter): Promise<Transaction[]>;
  findByAccountId(accountId: string, since?: Date): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
}
