export interface WalletDTO {
  readonly id: string;
  readonly accountId: string;
  readonly label: string;
  readonly maskedCardNumber: string; // always masked — raw never leaves the domain
  readonly balance: number;
  readonly currency: string;
  readonly monthlyLimit: number;
  readonly monthlySpent: number;
  readonly limitUsedPercent: number;
  readonly isActive: boolean;
  readonly type: string;
}
