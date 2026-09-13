import type { CardWallet } from '../entities/CardWallet';
import type { Money } from '../value-objects/Money';

/**
 * ISP: WalletRepository owns only wallet-level persistence concerns.
 * updateBalance() is a focused write operation — avoids loading the full entity
 * just to persist a balance change, and makes atomic DB updates straightforward.
 */
export interface WalletRepository {
  findById(id: string): Promise<CardWallet | null>;
  findByAccountId(accountId: string): Promise<CardWallet[]>;
  save(wallet: CardWallet): Promise<void>;
  updateBalance(walletId: string, newBalance: Money): Promise<void>;
}
