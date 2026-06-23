export type XlsxContentAnalysisConfidence = 'high' | 'medium' | 'low' | 'blocked';

export type XlsxSheetRole =
  | 'raw_responses'
  | 'aggregated_results'
  | 'demographics'
  | 'question_catalog'
  | 'metadata'
  | 'segment_summary'
  | 'unknown';

export type XlsxColumnRole =
  | 'question_candidate'
  | 'demographic_candidate'
  | 'participant_identifier_candidate'
  | 'response_value'
  | 'dimension_or_category'
  | 'segment_label'
  | 'metric_or_aggregate'
  | 'metadata'
  | 'unknown';

export interface XlsxWorkbookInspection {
  sheetCount: number;
  totalVisibleCells: number;
  sampleCellPatterns: string[];
}

export interface XlsxSheetInspection {
  sheetName: string;
  rowCount: number;
  columnCount: number;
  suggestedRole: XlsxSheetRole;
  confidence: XlsxContentAnalysisConfidence;
  classificationReason: string;
}

export interface XlsxHeaderDetection {
  headerRowIndex: number;
  confidence: XlsxContentAnalysisConfidence;
  sampleColumnLabels: string[];
}

export interface XlsxColumnProfile {
  columnLabel: string;
  suggestedRole: XlsxColumnRole;
  confidence: XlsxContentAnalysisConfidence;
  redactedExamples: string[];
}

export interface XlsxQuestionCandidate {
  columnLabel: string;
  detectedSignals: string[];
}

export interface XlsxDemographicCandidate {
  columnLabel: string;
  detectedSignals: string[];
}

export interface XlsxResponseScaleCandidate {
  detectedSignals: string[];
}

export interface XlsxSegmentFileRole {
  role: string;
}

export type XlsxHumanDecisionKind =
  | 'confirm_primary_file'
  | 'confirm_sheet_role'
  | 'confirm_header_row'
  | 'confirm_question_columns'
  | 'confirm_demographic_columns'
  | 'confirm_segment_role'
  | 'confirm_response_scale'
  | 'review_privacy_risk';

export interface XlsxHumanDecisionOption {
  id: string;
  label: string;
}

export interface XlsxHumanDecisionCandidate {
  id: string;
  kind: XlsxHumanDecisionKind;
  title: string;
  affectedFileName: string;
  affectedSheetName?: string;
  affectedColumnLabels?: string[];
  detectedIssue: string;
  recommendation: string;
  suggestedOptionId: string;
  options: XlsxHumanDecisionOption[];
  impact: string;
  confidence: XlsxContentAnalysisConfidence;
}

export interface XlsxUxOutputSection {
  title: string;
  summary: string;
  bullets: string[];
  severity: 'info' | 'warning' | 'error' | 'success';
  confidence: XlsxContentAnalysisConfidence;
  relatedDecisions: string[];
}

export interface XlsxContentAnalysisResult {
  confidence: XlsxContentAnalysisConfidence;
  workbookInspection: XlsxWorkbookInspection;
  sheets: XlsxSheetInspection[];
  decisions: XlsxHumanDecisionCandidate[];
  uxOutput: XlsxUxOutputSection[];
}

export interface XlsxContentAnalysisPrivacyBoundary {
  privacyAssured: boolean;
  classificationReason: string;
}

export interface XlsxContentAnalysisCapabilities {
  canAnalyze: boolean;
  classificationReason: string;
}
