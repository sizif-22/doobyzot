import { Money } from '../value-objects/Money';
import type { Transaction } from '../entities/Transaction';

/**
 * Output of a strategy's computeInsights() call.
 */
export interface CategoryInsight {
  readonly total: Money;
  readonly transactionCount: number;
  readonly averageAmount: Money;
}

/**
 * OCP — CategoryStrategy interface.
 *
 * The AnalyticsCalculator is closed for modification:
 * - Adding a new category requires only implementing this interface and
 *   registering it in the composition root (container.ts).
 * - No switch/if-else statements in the calculator.
 *
 * SRP — each strategy knows only how to analyse its own category.
 */
export interface CategoryStrategy {
  /** The category name this strategy handles, e.g. 'food', 'transport'. */
  readonly categoryName: string;
  computeInsights(transactions: Transaction[]): CategoryInsight;
}

/**
 * Strategy registry — populated at the composition root.
 * AnalyticsCalculator depends on this registry, not on concrete strategies.
 */
export class CategoryStrategyRegistry {
  readonly #strategies = new Map<string, CategoryStrategy>();
  readonly #defaultStrategy: CategoryStrategy;

  constructor(defaultStrategy: CategoryStrategy) {
    this.#defaultStrategy = defaultStrategy;
  }

  /** Fluent registration — returns `this` to allow chaining. */
  register(strategy: CategoryStrategy): this {
    this.#strategies.set(strategy.categoryName, strategy);
    return this;
  }

  get(categoryName: string): CategoryStrategy {
    return this.#strategies.get(categoryName) ?? this.#defaultStrategy;
  }
}

/**
 * Default strategy — sums amounts and computes a simple average.
 * Used as the fallback for any category without a dedicated strategy.
 *
 * OCP: registering a specialised strategy for a category overrides this;
 * DefaultCategoryStrategy itself is never modified to add new categories.
 */
export class DefaultCategoryStrategy implements CategoryStrategy {
  readonly categoryName: string;

  constructor(categoryName = '__default__') {
    this.categoryName = categoryName;
  }

  computeInsights(transactions: Transaction[]): CategoryInsight {
    if (transactions.length === 0) {
      throw new Error('computeInsights called with an empty transaction list');
    }

    const currency = transactions[0]!.amount.currency;

    const total = transactions.reduce(
      (sum, t) => sum.add(t.amount),
      Money.zero(currency),
    );

    const averageAmount = Money.fromMinorUnits(
      Math.round(total.toMinorUnits() / transactions.length),
      currency,
    );

    return { total, transactionCount: transactions.length, averageAmount };
  }
}
