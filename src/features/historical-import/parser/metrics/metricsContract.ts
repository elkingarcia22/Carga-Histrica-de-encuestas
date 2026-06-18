import type {
  WorkbookMetricsIssue,
  WorkbookMetricsIssueCode,
  WorkbookMetricsIssueSeverity
} from './metricsTypes';

export function createMetricsIssue(
  code: WorkbookMetricsIssueCode,
  severity: WorkbookMetricsIssueSeverity,
  message: string
): WorkbookMetricsIssue {
  return { code, severity, message };
}
