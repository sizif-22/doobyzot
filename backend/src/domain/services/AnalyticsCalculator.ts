import { Money } from '../value-objects/Money';
import type { Transaction } from '../entities/Transaction';
import type { CardWallet } from '../entities/CardWallet';
import { TransactionType } from '../enums/TransactionType';
import type { CategoryStrategyRegistry } from './CategoryStrategy';

// ─── Result types ────────────────────────────────────────────────────────────

export interface DailySpendingEntry {
  /** ISO date string: YYYY-MM-DD */
  readonly date: string;
  readonly amount: Money;
}

export interface CategorySpending {
  readonly category: string;
  readonly total: Money;
  /** 0–100 percentage of total outcome spending */
  readonly percentage: number;
  readonly transactionCount: number;
}

export interface AnalyticsResult {
  readonly totalIncome: Money;
  readonly totalOutcome: Money;
  readonly dailySpending: DailySpendingEntry[];
  readonly spendingByCategory: CategorySpending[];
}

// ─── AnalyticsCalculator ─────────────────────────────────────────────────────

/**
 * Pure domain service — no I/O, no side effects.
 * Accepts transaction and wallet data from use cases and returns analytics results.
 *
 * SRP: only analytics computation logic lives here.
 * OCP: category-specific logic is delegated to the CategoryStrategyRegistry —
 *      new categories extend the registry without touching this class.
 * DIP: depends on CategoryStrategyRegistry interface (populated at the root).
 */
export class AnalyticsCalculator {
  constructor(private readonly registry: CategoryStrategyRegistry) {}

  // ─── Individual metrics ──────────────────────────────────────────────────

  totalIncome(transactions: Transaction[]): Money {
    const incomes = transactions.filter((t) => t.type === TransactionType.Income);
    if (incomes.length === 0) return Money.zero('USD');
    return incomes.reduce(
      (sum, t) => sum.add(t.amount),
      Money.zero(incomes[0]!.amount.currency),
    );
  }

  totalOutcome(transactions: Transaction[]): Money {
    const outcomes = transactions.filter((t) => t.type === TransactionType.Outcome);
    if (outcomes.length === 0) return Money.zero('USD');
    return outcomes.reduce(
      (sum, t) => sum.add(t.amount),
      Money.zero(outcomes[0]!.amount.currency),
    );
  }

  /**
   * Groups outcome transactions by day and sums each day's spending.
   * Result is sorted chronologically.
   */
  dailySpending(transactions: Transaction[]): DailySpendingEntry[] {
    const grouped = new Map<string, Money>();

    for (const tx of transactions) {
      if (tx.type !== TransactionType.Outcome) continue;
      const dateKey = tx.date.toISOString().split('T')[0]!;
      const current = grouped.get(dateKey) ?? Money.zero(tx.amount.currency);
      grouped.set(dateKey, current.add(tx.amount));
    }

    return Array.from(grouped.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Breaks down outcome spending by category.
   * Each category's insight is computed by its registered strategy (OCP).
   */
  spendingByCategory(transactions: Transaction[]): CategorySpending[] {
    const outcomes = transactions.filter((t) => t.type === TransactionType.Outcome);

    // Group by category
    const grouped = new Map<string, Transaction[]>();
    for (const tx of outcomes) {
      const existing = grouped.get(tx.category) ?? [];
      existing.push(tx);
      grouped.set(tx.category, existing);
    }

    const totalOutcome = this.totalOutcome(transactions);
    const totalMinor = totalOutcome.toMinorUnits();

    return Array.from(grouped.entries()).map(([category, txs]) => {
      const strategy = this.registry.get(category);
      const insight = strategy.computeInsights(txs);
      return {
        category,
        total: insight.total,
        percentage: totalMinor > 0
          ? (insight.total.toMinorUnits() / totalMinor) * 100
          : 0,
        transactionCount: insight.transactionCount,
      };
    });
  }

  /**
   * Percentage of the monthly limit consumed for a given wallet.
   * Delegates to the wallet entity's own method to keep entity logic in entity.
   */
  limitUsedPercent(wallet: CardWallet, transactions: Transaction[]): number {
    return wallet.limitUsedPercent(transactions);
  }

  /** Convenience: compute all analytics at once. */
  calculate(transactions: Transaction[]): AnalyticsResult {
    return {
      totalIncome: this.totalIncome(transactions),
      totalOutcome: this.totalOutcome(transactions),
      dailySpending: this.dailySpending(transactions),
      spendingByCategory: this.spendingByCategory(transactions),
    };
  }
}
