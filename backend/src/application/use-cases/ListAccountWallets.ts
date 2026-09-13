import type { AccountRepository } from '@domain/repositories/AccountRepository';
import type { WalletRepository } from '@domain/repositories/WalletRepository';
import type { TransactionRepository } from '@domain/repositories/TransactionRepository';
import { NotFoundError } from '@domain/errors/DomainError';
import { WalletMapper } from '../mappers/WalletMapper';
import { AccountMapper } from '../mappers/AccountMapper';
import type { AccountWalletsDTO } from '../dtos/AccountDTO';

interface ListAccountWalletsInput {
  readonly accountId: string;
}

/**
 * ListAccountWallets use case.
 * Returns full wallet DTOs (with analytics) for all wallets on an account.
 */
export class ListAccountWallets {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly walletRepo: WalletRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(input: ListAccountWalletsInput): Promise<AccountWalletsDTO> {
    const account = await this.accountRepo.findById(input.accountId);
    if (!account) throw new NotFoundError('Account', input.accountId);

    const wallets = await this.walletRepo.findByAccountId(input.accountId);

    // Load current month's transactions for analytics per wallet
    const since = new Date();
    since.setDate(1); // start of current month
    since.setHours(0, 0, 0, 0);
    const monthTransactions = await this.transactionRepo.findByAccountId(
      input.accountId,
      since,
    );

    const walletDTOs = WalletMapper.toDTOList(wallets, monthTransactions);
    return AccountMapper.toWalletsDTO(input.accountId, walletDTOs);
  }
}
