import type { PeriodComparisonInput, PeriodComparisonResult } from './comparisonTypes';

export interface ComparisonContract {
  compareWorkbookPeriods(input: PeriodComparisonInput): PeriodComparisonResult;
}
