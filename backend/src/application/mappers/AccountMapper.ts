import type { Account } from '@domain/entities/Account';
import type { Transaction } from '@domain/entities/Transaction';
import type { AccountOverviewDTO, AccountWalletsDTO } from '../dtos/AccountDTO';
import type { WalletDTO } from '../dtos/WalletDTO';
import { TransactionMapper } from './TransactionMapper';
import { WalletMapper } from './WalletMapper';

export class AccountMapper {
  static toOverviewDTO(
    account: Account,
    recentTransactions: Transaction[],
  ): AccountOverviewDTO {
    const currency = account.wallets[0]?.balance.currency ?? 'USD';

    return {
      id: account.id,
      ownerName: account.ownerName,
      totalBalance: account.totalBalance.amount,
      totalIncome: account.totalIncome.amount,
      totalOutcome: account.totalOutcome.amount,
      currency,
      wallets: account.wallets.map((w) => WalletMapper.toSummaryDTO(w)),
      recentTransactions: TransactionMapper.toDTOList(recentTransactions),
    };
  }

  static toWalletsDTO(accountId: string, wallets: WalletDTO[]): AccountWalletsDTO {
    return { accountId, wallets };
  }
}
