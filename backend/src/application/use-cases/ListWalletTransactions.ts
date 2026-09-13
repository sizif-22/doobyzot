import type { WalletRepository } from '@domain/repositories/WalletRepository';
import type { TransactionRepository, TransactionFilter } from '@domain/repositories/TransactionRepository';
import { NotFoundError } from '@domain/errors/DomainError';
import { TransactionMapper } from '../mappers/TransactionMapper';
import type { TransactionDTO } from '../dtos/TransactionDTO';

interface ListWalletTransactionsInput {
  readonly walletId: string;
  readonly filter?: TransactionFilter;
}

/**
 * ListWalletTransactions use case.
 * Verifies the wallet exists, then delegates filtered lookup to the repository.
 */
export class ListWalletTransactions {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(input: ListWalletTransactionsInput): Promise<TransactionDTO[]> {
    const wallet = await this.walletRepo.findById(input.walletId);
    if (!wallet) throw new NotFoundError('Wallet', input.walletId);

    const transactions = await this.transactionRepo.findByWalletId(
      input.walletId,
      input.filter,
    );

    return TransactionMapper.toDTOList(transactions);
  }
}
