import type { WalletRepository } from '@domain/repositories/WalletRepository';
import type { TransactionRepository } from '@domain/repositories/TransactionRepository';
import {
  NotFoundError,
  InsufficientFundsError,
  WalletInactiveError,
} from '@domain/errors/DomainError';
import { Transaction } from '@domain/entities/Transaction';
import { Money } from '@domain/value-objects/Money';
import { TransactionType } from '@domain/enums/TransactionType';
import { TransactionMapper } from '../mappers/TransactionMapper';
import type { CreateTransactionCommand, TransactionDTO } from '../dtos/TransactionDTO';

/**
 * CreateTransaction use case.
 *
 * SRP: validates business invariants (wallet active, sufficient funds),
 *      creates the domain entity, and persists via repositories.
 *      Does not touch SQL, HTTP, or response formatting.
 */
export class CreateTransaction {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(command: CreateTransactionCommand): Promise<TransactionDTO> {
    const wallet = await this.walletRepo.findById(command.walletId);
    if (!wallet) throw new NotFoundError('Wallet', command.walletId);

    if (!wallet.isActive) throw new WalletInactiveError(command.walletId);

    const amount = Money.fromMajorUnits(command.amount, command.currency);
    const type =
      command.type === 'income' ? TransactionType.Income : TransactionType.Outcome;

    // Domain rule: outcome transactions must not exceed available balance
    if (type === TransactionType.Outcome) {
      if (!wallet.balance.isGreaterThanOrEqual(amount)) {
        throw new InsufficientFundsError();
      }
    }

    const transaction = new Transaction({
      id: crypto.randomUUID(),
      walletId: command.walletId,
      accountId: command.accountId,
      title: command.title,
      category: command.category,
      amount,
      date: new Date(),
      type,
    });

    // Persist transaction
    await this.transactionRepo.save(transaction);

    // Update wallet balance (immutable update)
    const newBalance =
      type === TransactionType.Income
        ? wallet.balance.add(amount)
        : wallet.balance.subtract(amount);

    await this.walletRepo.updateBalance(command.walletId, newBalance);

    return TransactionMapper.toDTO(transaction);
  }
}
