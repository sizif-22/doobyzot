import type { GetWalletById } from '@application/use-cases/GetWalletById';
import type { ListWalletTransactions } from '@application/use-cases/ListWalletTransactions';
import type { TransactionFilter } from '@domain/repositories/TransactionRepository';
import type { TransactionType } from '@domain/enums/TransactionType';

/**
 * WalletController.
 * SRP: HTTP-level coordination only. Builds filter objects from validated query params.
 */
export class WalletController {
  constructor(
    private readonly getWalletByIdUseCase: GetWalletById,
    private readonly listWalletTransactionsUseCase: ListWalletTransactions,
  ) {}

  async getWallet(walletId: string) {
    return this.getWalletByIdUseCase.execute({ walletId });
  }

  async listTransactions(
    walletId: string,
    query: {
      type?: string;
      category?: string;
      from?: string;
      to?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    // Build the filter object conditionally — exactOptionalPropertyTypes requires
    // we only include keys whose values are defined, not assign `undefined` directly.
    const filter: TransactionFilter = {};
    if (query.type !== undefined) filter.type = query.type as TransactionType;
    if (query.category !== undefined) filter.category = query.category;
    if (query.from !== undefined) filter.from = new Date(query.from);
    if (query.to !== undefined) filter.to = new Date(query.to);
    if (query.limit !== undefined) filter.limit = query.limit;
    if (query.offset !== undefined) filter.offset = query.offset;

    return this.listWalletTransactionsUseCase.execute({ walletId, filter });
  }
}
