import type { AccountRepository } from '@domain/repositories/AccountRepository';
import type { TransactionRepository } from '@domain/repositories/TransactionRepository';
import { NotFoundError } from '@domain/errors/DomainError';
import { Account } from '@domain/entities/Account';
import { AccountMapper } from '../mappers/AccountMapper';
import type { AccountOverviewDTO } from '../dtos/AccountDTO';

interface GetAccountOverviewInput {
  readonly accountId: string;
}

/**
 * GetAccountOverview use case.
 *
 * SRP: orchestrates loading of account data for the overview endpoint.
 *      Does not compute analytics, format responses, or touch SQL.
 * DIP: depends only on domain repository interfaces — never on Drizzle or Elysia.
 */
export class GetAccountOverview {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(input: GetAccountOverviewInput): Promise<AccountOverviewDTO> {
    // Load account (with wallets pre-loaded by the repository)
    const account = await this.accountRepo.findById(input.accountId);
    if (!account) throw new NotFoundError('Account', input.accountId);

    // Load all transactions to compute totalIncome / totalOutcome on the entity
    const allTransactions = await this.transactionRepo.findByAccountId(input.accountId);

    // Rebuild the account aggregate with transactions so computed getters work
    const fullAccount = new Account({
      id: account.id,
      ownerName: account.ownerName,
      wallets: account.wallets,
      transactions: allTransactions,
    });

    // Recent transactions for the "last activity" panel (last 10)
    const recentTransactions = allTransactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return AccountMapper.toOverviewDTO(fullAccount, recentTransactions);
  }
}
