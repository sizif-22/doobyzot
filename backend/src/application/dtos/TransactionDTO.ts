export interface TransactionDTO {
  readonly id: string;
  readonly walletId: string;
  readonly accountId: string;
  readonly title: string;
  readonly category: string;
  readonly amount: number;
  readonly currency: string;
  readonly date: string; // ISO 8601
  readonly type: string; // 'income' | 'outcome'
}

export interface CreateTransactionCommand {
  readonly walletId: string;
  readonly accountId: string;
  readonly title: string;
  readonly category: string;
  readonly amount: number;
  readonly currency: string;
  readonly type: 'income' | 'outcome';
}

export interface TransferCommand {
  readonly sourceWalletId: string;
  readonly destinationWalletId: string;
  readonly amount: number;
  readonly currency: string;
  readonly title: string;
}

export interface TransferResultDTO {
  readonly outgoing: TransactionDTO;
  readonly incoming: TransactionDTO;
}
