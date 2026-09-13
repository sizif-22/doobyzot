import { Money } from '../value-objects/Money';
import type { CardWallet } from './CardWallet';
import type { Transaction } from './Transaction';
import { TransactionType } from '../enums/TransactionType';

export interface AccountProps {
  readonly id: string;
  readonly ownerName: string;
  readonly wallets: CardWallet[];
  /** Transactions are optional — only loaded when analytics are needed. */
  readonly transactions?: Transaction[];
}

/**
 * Account aggregate root.
 *
 * totalBalance  — computed from wallet balances (never stored).
 * totalIncome   — computed from transaction list (never stored).
 * totalOutcome  — computed from transaction list (never stored).
 *
 * Assumes single-currency operation. For multi-currency extend Money with
 * a conversion strategy before summing.
 */
export class Account {
  readonly id: string;
  readonly ownerName: string;
  readonly wallets: CardWallet[];
  readonly transactions: Transaction[];

  constructor(props: AccountProps) {
    this.id = props.id;
    this.ownerName = props.ownerName;
    this.wallets = props.wallets;
    this.transactions = props.transactions ?? [];
  }

  get totalBalance(): Money {
    if (this.wallets.length === 0) return Money.zero('USD');
    const currency = this.wallets[0]!.balance.currency;
    return this.wallets.reduce(
      (sum, w) => sum.add(w.balance),
      Money.zero(currency),
    );
  }

  get totalIncome(): Money {
    const incomes = this.transactions.filter((t) => t.type === TransactionType.Income);
    if (incomes.length === 0) return Money.zero('USD');
    return incomes.reduce(
      (sum, t) => sum.add(t.amount),
      Money.zero(incomes[0]!.amount.currency),
    );
  }

  get totalOutcome(): Money {
    const outcomes = this.transactions.filter((t) => t.type === TransactionType.Outcome);
    if (outcomes.length === 0) return Money.zero('USD');
    return outcomes.reduce(
      (sum, t) => sum.add(t.amount),
      Money.zero(outcomes[0]!.amount.currency),
    );
  }
}
