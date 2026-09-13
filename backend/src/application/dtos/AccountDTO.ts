import type { WalletDTO } from './WalletDTO';
import type { TransactionDTO } from './TransactionDTO';

/** Lightweight wallet entry in the account overview response. */
export interface WalletSummaryDTO {
  readonly id: string;
  readonly label: string;
  readonly maskedCardNumber: string;
  readonly balance: number;
  readonly currency: string;
  readonly type: string;
  readonly isActive: boolean;
}

export interface AccountOverviewDTO {
  readonly id: string;
  readonly ownerName: string;
  readonly totalBalance: number;
  readonly totalIncome: number;
  readonly totalOutcome: number;
  readonly currency: string;
  readonly wallets: WalletSummaryDTO[];
  readonly recentTransactions: TransactionDTO[];
}

export interface AccountWalletsDTO {
  readonly accountId: string;
  readonly wallets: WalletDTO[];
}
