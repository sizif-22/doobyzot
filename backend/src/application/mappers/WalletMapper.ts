import type { CardWallet } from '@domain/entities/CardWallet';
import type { Transaction } from '@domain/entities/Transaction';
import type { WalletDTO } from '../dtos/WalletDTO';
import type { WalletSummaryDTO } from '../dtos/AccountDTO';

/**
 * Maps domain CardWallet entities to WalletDTOs.
 * Card number is always masked here — raw digits never leave this layer.
 */
export class WalletMapper {
  static toDTO(wallet: CardWallet, transactions: Transaction[]): WalletDTO {
    return {
      id: wallet.id,
      accountId: wallet.accountId,
      label: wallet.label,
      maskedCardNumber: wallet.cardNumber.masked(), // raw never exposed
      balance: wallet.balance.amount,
      currency: wallet.balance.currency,
      monthlyLimit: wallet.monthlyLimit.amount,
      monthlySpent: wallet.monthlySpent(transactions).amount,
      limitUsedPercent: parseFloat(wallet.limitUsedPercent(transactions).toFixed(2)),
      isActive: wallet.isActive,
      type: wallet.type,
    };
  }

  static toSummaryDTO(wallet: CardWallet): WalletSummaryDTO {
    return {
      id: wallet.id,
      label: wallet.label,
      maskedCardNumber: wallet.cardNumber.masked(),
      balance: wallet.balance.amount,
      currency: wallet.balance.currency,
      type: wallet.type,
      isActive: wallet.isActive,
    };
  }

  static toDTOList(wallets: CardWallet[], transactions: Transaction[]): WalletDTO[] {
    return wallets.map((w) => WalletMapper.toDTO(w, transactions));
  }
}
