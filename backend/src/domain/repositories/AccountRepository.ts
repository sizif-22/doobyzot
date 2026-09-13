import type { Account } from '../entities/Account';

/**
 * ISP: AccountRepository is narrow — only account-level concerns.
 * Wallet or transaction queries live in their own interfaces.
 */
export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
}
