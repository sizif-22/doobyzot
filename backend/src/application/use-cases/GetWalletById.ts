import type { WalletRepository } from '@domain/repositories/WalletRepository';
import type { TransactionRepository } from '@domain/repositories/TransactionRepository';
import { NotFoundError } from '@domain/errors/DomainError';
import { WalletMapper } from '../mappers/WalletMapper';
import type { WalletDTO } from '../dtos/WalletDTO';

interface GetWalletByIdInput {
  readonly walletId: string;
}

/**
 * GetWalletById use case.
 * Fetches a single wallet with current-month analytics.
 */
export class GetWalletById {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(input: GetWalletByIdInput): Promise<WalletDTO> {
    const wallet = await this.walletRepo.findById(input.walletId);
    if (!wallet) throw new NotFoundError('Wallet', input.walletId);

    // Current month's transactions for limit analytics
    const since = new Date();
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    const monthTransactions = await this.transactionRepo.findByWalletId(
      input.walletId,
      { from: since },
    );

    return WalletMapper.toDTO(wallet, monthTransactions);
  }
}
