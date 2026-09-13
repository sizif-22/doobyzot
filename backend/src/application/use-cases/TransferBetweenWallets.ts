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
import type { TransferCommand, TransferResultDTO } from '../dtos/TransactionDTO';

/**
 * TransferBetweenWallets use case.
 *
 * Creates a paired (Outcome + Income) transaction set across two wallets.
 *
 * Note on atomicity: operations are sequential. For true ACID atomicity,
 * wrap in a database transaction via a Unit-of-Work adapter (future enhancement).
 */
export class TransferBetweenWallets {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(command: TransferCommand): Promise<TransferResultDTO> {
    const [source, destination] = await Promise.all([
      this.walletRepo.findById(command.sourceWalletId),
      this.walletRepo.findById(command.destinationWalletId),
    ]);

    if (!source) throw new NotFoundError('Wallet', command.sourceWalletId);
    if (!destination) throw new NotFoundError('Wallet', command.destinationWalletId);

    if (!source.isActive) throw new WalletInactiveError(command.sourceWalletId);
    if (!destination.isActive) throw new WalletInactiveError(command.destinationWalletId);

    const amount = Money.fromMajorUnits(command.amount, command.currency);

    if (!source.balance.isGreaterThanOrEqual(amount)) {
      throw new InsufficientFundsError();
    }

    const now = new Date();

    const outgoing = new Transaction({
      id: crypto.randomUUID(),
      walletId: source.id,
      accountId: source.accountId,
      title: command.title,
      category: 'transfer',
      amount,
      date: now,
      type: TransactionType.Outcome,
    });

    const incoming = new Transaction({
      id: crypto.randomUUID(),
      walletId: destination.id,
      accountId: destination.accountId,
      title: command.title,
      category: 'transfer',
      amount,
      date: now,
      type: TransactionType.Income,
    });

    // Persist both transactions
    await Promise.all([
      this.transactionRepo.save(outgoing),
      this.transactionRepo.save(incoming),
    ]);

    // Update both balances
    await Promise.all([
      this.walletRepo.updateBalance(source.id, source.balance.subtract(amount)),
      this.walletRepo.updateBalance(destination.id, destination.balance.add(amount)),
    ]);

    return {
      outgoing: TransactionMapper.toDTO(outgoing),
      incoming: TransactionMapper.toDTO(incoming),
    };
  }
}
