import type { GetAccountOverview } from '@application/use-cases/GetAccountOverview';
import type { ListAccountWallets } from '@application/use-cases/ListAccountWallets';

/**
 * AccountController.
 *
 * SRP: receives use case results, returns DTOs — no business logic.
 * Route handlers in accountRoutes.ts call these methods.
 * Domain errors propagate naturally and are caught by Elysia's onError hook.
 */
export class AccountController {
  constructor(
    private readonly getAccountOverviewUseCase: GetAccountOverview,
    private readonly listAccountWalletsUseCase: ListAccountWallets,
  ) {}

  async getOverview(accountId: string) {
    return this.getAccountOverviewUseCase.execute({ accountId });
  }

  async listWallets(accountId: string) {
    return this.listAccountWalletsUseCase.execute({ accountId });
  }
}
