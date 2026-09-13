import type { Transaction } from '@domain/entities/Transaction';
import type { TransactionDTO } from '../dtos/TransactionDTO';

/**
 * Maps domain Transaction entities to TransactionDTOs.
 * SRP: only mapping logic lives here — no business rules.
 */
export class TransactionMapper {
  static toDTO(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      accountId: transaction.accountId,
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amount.amount,
      currency: transaction.amount.currency,
      date: transaction.date.toISOString(),
      type: transaction.type,
    };
  }

  static toDTOList(transactions: Transaction[]): TransactionDTO[] {
    return transactions.map(TransactionMapper.toDTO);
  }
}
