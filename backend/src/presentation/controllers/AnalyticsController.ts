import type { GetMonthlyAnalytics } from '@application/use-cases/GetMonthlyAnalytics';
import { AnalyticsRange } from '@domain/enums/AnalyticsRange';

/**
 * AnalyticsController.
 * Converts the raw query-string range value to the typed AnalyticsRange enum.
 */
export class AnalyticsController {
  constructor(private readonly getMonthlyAnalyticsUseCase: GetMonthlyAnalytics) {}

  async getAnalytics(accountId: string, range: string) {
    const analyticsRange = this.parseRange(range);
    return this.getMonthlyAnalyticsUseCase.execute({ accountId, range: analyticsRange });
  }

  private parseRange(raw: string): AnalyticsRange {
    const validValues = Object.values(AnalyticsRange) as string[];
    if (validValues.includes(raw)) return raw as AnalyticsRange;
    return AnalyticsRange.Month; // sensible default
  }
}
