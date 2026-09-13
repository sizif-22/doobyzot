import { Elysia, t } from 'elysia';
import type { AccountController } from '../controllers/AccountController';

/**
 * Account route module.
 * Handler reads: validate → call controller → return DTO.
 * No business logic here.
 */
export function createAccountRoutes(controller: AccountController) {
  return new Elysia({ prefix: '/accounts' })
    .get(
      '/:id',
      ({ params }) => controller.getOverview(params.id),
      {
        params: t.Object({ id: t.String({ minLength: 1 }) }),
        detail: { summary: 'Get account overview', tags: ['Accounts'] },
      },
    )
    .get(
      '/:id/wallets',
      ({ params }) => controller.listWallets(params.id),
      {
        params: t.Object({ id: t.String({ minLength: 1 }) }),
        detail: { summary: 'List wallets for an account', tags: ['Accounts'] },
      },
    );
}
