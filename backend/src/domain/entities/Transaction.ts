import type { Money } from '../value-objects/Money';
import type { TransactionType } from '../enums/TransactionType';

export interface TransactionProps {
  readonly id: string;
  readonly walletId: string;
  readonly accountId: string;
  readonly title: string;
  readonly category: string;
  readonly amount: Money;
  readonly date: Date;
  readonly type: TransactionType;
}

/**
 * Transaction entity.
 *
 * SRP: represents a single financial movement — nothing else.
 * Fully immutable once constructed; no setters.
 */
export class Transaction {
  readonly id: string;
  readonly walletId: string;
  readonly accountId: string;
  readonly title: string;
  readonly category: string;
  readonly amount: Money;
  readonly date: Date;
  readonly type: TransactionType;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.walletId = props.walletId;
    this.accountId = props.accountId;
    this.title = props.title;
    this.category = props.category;
    this.amount = props.amount;
    this.date = props.date;
    this.type = props.type;
  }
}
