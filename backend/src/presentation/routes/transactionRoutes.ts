import { Elysia, t } from 'elysia';
import type { TransactionController } from '../controllers/TransactionController';

/**
 * Transaction route module.
 * POST body is fully validated with t.Object before reaching the controller.
 */
export function createTransactionRoutes(controller: TransactionController) {
  return new Elysia({ prefix: '/transactions' })
    .post(
      '/',
      ({ body }) => controller.createTransaction(body),
      {
        body: t.Object({
          walletId: t.String({ minLength: 1 }),
          accountId: t.String({ minLength: 1 }),
          title: t.String({ minLength: 1, maxLength: 255 }),
          category: t.String({ minLength: 1, maxLength: 100 }),
          amount: t.Number({ minimum: 0.01 }),
          currency: t.String({ minLength: 3, maxLength: 3 }),
          type: t.Union([t.Literal('income'), t.Literal('outcome')]),
        }),
        detail: { summary: 'Create a new transaction', tags: ['Transactions'] },
      },
    )
    .post(
      '/transfer',
      ({ body }) => controller.transfer(body),
      {
        body: t.Object({
          sourceWalletId: t.String({ minLength: 1 }),
          destinationWalletId: t.String({ minLength: 1 }),
          amount: t.Number({ minimum: 0.01 }),
          currency: t.String({ minLength: 3, maxLength: 3 }),
          title: t.String({ minLength: 1, maxLength: 255 }),
        }),
        detail: {
          summary: 'Transfer funds between two wallets',
          tags: ['Transactions'],
        },
      },
    );
}
