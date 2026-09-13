export interface DailySpendingDTO {
  readonly date: string; // YYYY-MM-DD
  readonly amount: number;
  readonly currency: string;
}

export interface CategorySpendingDTO {
  readonly category: string;
  readonly total: number;
  readonly currency: string;
  readonly percentage: number;
  readonly transactionCount: number;
}

export interface AnalyticsDTO {
  readonly accountId: string;
  readonly range: string;
  readonly totalIncome: number;
  readonly totalOutcome: number;
  readonly currency: string;
  readonly dailySpending: DailySpendingDTO[];
  readonly spendingByCategory: CategorySpendingDTO[];
}
