import { Elysia, t } from 'elysia';
import type { WalletController } from '../controllers/WalletController';

/**
 * Wallet route module.
 * Query parameters for transaction filtering are validated with t.Object.
 */
export function createWalletRoutes(controller: WalletController) {
  return new Elysia({ prefix: '/wallets' })
    .get(
      '/:id',
      ({ params }) => controller.getWallet(params.id),
      {
        params: t.Object({ id: t.String({ minLength: 1 }) }),
        detail: { summary: 'Get wallet by ID (with analytics)', tags: ['Wallets'] },
      },
    )
    .get(
      '/:id/transactions',
      ({ params, query }) => controller.listTransactions(params.id, query),
      {
        params: t.Object({ id: t.String({ minLength: 1 }) }),
        query: t.Object({
          type: t.Optional(t.Union([t.Literal('income'), t.Literal('outcome')])),
          category: t.Optional(t.String()),
          from: t.Optional(t.String({ format: 'date' })),
          to: t.Optional(t.String({ format: 'date' })),
          limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
          offset: t.Optional(t.Numeric({ minimum: 0 })),
        }),
        detail: {
          summary: 'List transactions for a wallet (with optional filters)',
          tags: ['Wallets'],
        },
      },
    );
}
