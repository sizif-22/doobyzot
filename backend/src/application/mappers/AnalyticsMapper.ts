import type { AnalyticsResult } from '@domain/services/AnalyticsCalculator';
import type { AnalyticsDTO, DailySpendingDTO, CategorySpendingDTO } from '../dtos/AnalyticsDTO';
import type { AnalyticsRange } from '@domain/enums/AnalyticsRange';

export class AnalyticsMapper {
  static toDTO(
    accountId: string,
    range: AnalyticsRange,
    result: AnalyticsResult,
  ): AnalyticsDTO {
    const currency =
      result.totalIncome.currency !== 'USD'
        ? result.totalIncome.currency
        : result.totalOutcome.currency;

    const dailySpending: DailySpendingDTO[] = result.dailySpending.map((d) => ({
      date: d.date,
      amount: d.amount.amount,
      currency: d.amount.currency,
    }));

    const spendingByCategory: CategorySpendingDTO[] = result.spendingByCategory.map((c) => ({
      category: c.category,
      total: c.total.amount,
      currency: c.total.currency,
      percentage: parseFloat(c.percentage.toFixed(2)),
      transactionCount: c.transactionCount,
    }));

    return {
      accountId,
      range,
      totalIncome: result.totalIncome.amount,
      totalOutcome: result.totalOutcome.amount,
      currency,
      dailySpending,
      spendingByCategory,
    };
  }
}
