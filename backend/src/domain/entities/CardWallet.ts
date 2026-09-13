import { Money } from '../value-objects/Money';
import type { CardNumber } from '../value-objects/CardNumber';
import type { WalletType } from '../enums/WalletType';
import type { Transaction } from './Transaction';
import { TransactionType } from '../enums/TransactionType';

export interface CardWalletProps {
  readonly id: string;
  readonly accountId: string;
  readonly label: string;
  readonly cardNumber: CardNumber;
  readonly balance: Money;
  readonly monthlyLimit: Money;
  readonly isActive: boolean;
  readonly type: WalletType;
}

/**
 * CardWallet entity.
 *
 * Computed analytics (monthlySpent, limitUsedPercent) are methods that accept
 * a transaction list rather than storing derived data — keeping state minimal.
 *
 * withBalance() returns a new wallet (immutable update pattern).
 */
export class CardWallet {
  readonly id: string;
  readonly accountId: string;
  readonly label: string;
  readonly cardNumber: CardNumber;
  readonly balance: Money;
  readonly monthlyLimit: Money;
  readonly isActive: boolean;
  readonly type: WalletType;

  constructor(props: CardWalletProps) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.label = props.label;
    this.cardNumber = props.cardNumber;
    this.balance = props.balance;
    this.monthlyLimit = props.monthlyLimit;
    this.isActive = props.isActive;
    this.type = props.type;
  }

  /**
   * Sum of all outcome transactions for this wallet in the given list.
   * Callers pass the relevant month's transactions; entity has no I/O.
   */
  monthlySpent(transactions: Transaction[]): Money {
    const walletOutcomes = transactions.filter(
      (t) => t.walletId === this.id && t.type === TransactionType.Outcome,
    );
    if (walletOutcomes.length === 0) return Money.zero(this.balance.currency);
    return walletOutcomes.reduce(
      (sum, t) => sum.add(t.amount),
      Money.zero(this.balance.currency),
    );
  }

  /**
   * 0–100 percentage of monthly limit consumed.
   * Returns 0 if no limit is set.
   */
  limitUsedPercent(transactions: Transaction[]): number {
    if (this.monthlyLimit.isZero()) return 0;
    return this.monthlySpent(transactions).percentageOf(this.monthlyLimit);
  }

  /** Immutable balance update — returns new instance. */
  withBalance(newBalance: Money): CardWallet {
    return new CardWallet({ ...this, balance: newBalance });
  }
}
