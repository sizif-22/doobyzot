import type { AccountRepository } from '@domain/repositories/AccountRepository';
import type { TransactionRepository } from '@domain/repositories/TransactionRepository';
import { NotFoundError } from '@domain/errors/DomainError';
import { AnalyticsRange } from '@domain/enums/AnalyticsRange';
import type { AnalyticsCalculator } from '@domain/services/AnalyticsCalculator';
import { AnalyticsMapper } from '../mappers/AnalyticsMapper';
import type { AnalyticsDTO } from '../dtos/AnalyticsDTO';

interface GetMonthlyAnalyticsInput {
  readonly accountId: string;
  readonly range: AnalyticsRange;
}

/**
 * GetMonthlyAnalytics use case.
 *
 * Resolves the date range from the AnalyticsRange enum, fetches transactions,
 * delegates computation to the pure AnalyticsCalculator domain service,
 * and maps results to a serialisable DTO.
 */
export class GetMonthlyAnalytics {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly calculator: AnalyticsCalculator,
  ) {}

  async execute(input: GetMonthlyAnalyticsInput): Promise<AnalyticsDTO> {
    const account = await this.accountRepo.findById(input.accountId);
    if (!account) throw new NotFoundError('Account', input.accountId);

    const since = GetMonthlyAnalytics.resolveSinceDate(input.range);
    const transactions = await this.transactionRepo.findByAccountId(
      input.accountId,
      since,
    );

    const result = this.calculator.calculate(transactions);
    return AnalyticsMapper.toDTO(input.accountId, input.range, result);
  }

  private static resolveSinceDate(range: AnalyticsRange): Date | undefined {
    const now = new Date();
    switch (range) {
      case AnalyticsRange.Week: {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return d;
      }
      case AnalyticsRange.Month: {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 1);
        return d;
      }
      case AnalyticsRange.Year: {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        return d;
      }
      case AnalyticsRange.All:
        return undefined; // no date filter
    }
  }
}
