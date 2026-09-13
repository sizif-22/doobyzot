import type { CreateTransaction } from '@application/use-cases/CreateTransaction';
import type { TransferBetweenWallets } from '@application/use-cases/TransferBetweenWallets';
import type { CreateTransactionCommand, TransferCommand } from '@application/dtos/TransactionDTO';

/**
 * TransactionController.
 * SRP: validates input shape (done by Elysia t.* in routes), then delegates to use cases.
 */
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransaction,
    private readonly transferBetweenWalletsUseCase: TransferBetweenWallets,
  ) {}

  async createTransaction(body: CreateTransactionCommand) {
    return this.createTransactionUseCase.execute(body);
  }

  async transfer(body: TransferCommand) {
    return this.transferBetweenWalletsUseCase.execute(body);
  }
}
