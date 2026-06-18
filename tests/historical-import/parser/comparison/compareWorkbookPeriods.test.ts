import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { parseWorkbookArrayBuffer } from '../../../../src/features/historical-import/parser/parseWorkbookArrayBuffer';
import { validateWorkbookSchema } from '../../../../src/features/historical-import/parser/schema/validateWorkbookSchema';
import { validateWorkbookCrossSheet } from '../../../../src/features/historical-import/parser/cross-sheet/validateWorkbookCrossSheet';
import { normalizeWorkbook, NormalizationResult } from '../../../../src/features/historical-import/parser/normalization/normalizeWorkbook';
import { calculateWorkbookMetrics } from '../../../../src/features/historical-import/parser/metrics/calculateWorkbookMetrics';
import { compareWorkbookPeriods } from '../../../../src/features/historical-import/parser/comparison/compareWorkbookPeriods';
import type { WorkbookMetricsResult } from '../../../../src/features/historical-import/parser/metrics/metricsTypes';
import type { PeriodComparisonInput } from '../../../../src/features/historical-import/parser/comparison/comparisonTypes';

describe('compareWorkbookPeriods', () => {
  let baseMetrics: WorkbookMetricsResult;
  let compMetrics: WorkbookMetricsResult;
  let baseNormalizationResult: NormalizationResult;
  let compNormalizationResult: NormalizationResult;

  beforeAll(async () => {
    // Base setup
    const baseFixturePath = path.join(__dirname, '../../../../fixtures/historical-import/synthetic-survey-base.xlsx');
    const baseFileBuffer = fs.readFileSync(baseFixturePath);
    const baseArrayBuffer = new Uint8Array(baseFileBuffer).buffer;

    const baseParserResult = await parseWorkbookArrayBuffer({
      buffer: baseArrayBuffer,
      metadata: { fileName: 'synthetic-survey-base.xlsx', fileSize: baseArrayBuffer.byteLength }
    });
    const baseSchemaResult = validateWorkbookSchema({
      parserResult: baseParserResult,
      expectedSchemaKind: 'base'
    });
    const baseCrossSheetResult = validateWorkbookCrossSheet({
      parserResult: baseParserResult,
      schemaResult: baseSchemaResult,
      schemaKind: 'base'
    });
    baseNormalizationResult = normalizeWorkbook({
      parserResult: baseParserResult,
      schemaResult: baseSchemaResult,
      crossSheetResult: baseCrossSheetResult,
      schemaKind: 'base',
      sourceFileName: 'synthetic-survey-base.xlsx'
    });
    baseMetrics = calculateWorkbookMetrics({
      canonicalWorkbook: baseNormalizationResult.workbook,
      schemaKind: 'base'
    });

    // Comparison setup
    const compFixturePath = path.join(__dirname, '../../../../fixtures/historical-import/synthetic-survey-comparison.xlsx');
    const compFileBuffer = fs.readFileSync(compFixturePath);
    const compArrayBuffer = new Uint8Array(compFileBuffer).buffer;

    const compParserResult = await parseWorkbookArrayBuffer({
      buffer: compArrayBuffer,
      metadata: { fileName: 'synthetic-survey-comparison.xlsx', fileSize: compArrayBuffer.byteLength }
    });
    const compSchemaResult = validateWorkbookSchema({
      parserResult: compParserResult,
      expectedSchemaKind: 'comparison'
    });
    const compCrossSheetResult = validateWorkbookCrossSheet({
      parserResult: compParserResult,
      schemaResult: compSchemaResult,
      schemaKind: 'comparison'
    });
    compNormalizationResult = normalizeWorkbook({
      parserResult: compParserResult,
      schemaResult: compSchemaResult,
      crossSheetResult: compCrossSheetResult,
      schemaKind: 'comparison',
      sourceFileName: 'synthetic-survey-comparison.xlsx'
    });
    compMetrics = calculateWorkbookMetrics({
      canonicalWorkbook: compNormalizationResult.workbook,
      schemaKind: 'comparison'
    });
  });

  it('Positive: calculates correct comparison for golden fixtures', () => {
    const input: PeriodComparisonInput = {
      base: baseMetrics,
      comparison: compMetrics
    };

    // Deep clone to check immutability
    const baseSnapshot = JSON.stringify(baseMetrics);
    const compSnapshot = JSON.stringify(compMetrics);

    const result = compareWorkbookPeriods(input);

    expect(result.status).toBe('COMPARISON_CALCULATED');
    expect(result.summary).not.toBeNull();
    if (result.summary) {
      expect(result.summary.baseWorkbookKind).toBe('base');
      expect(result.summary.comparisonWorkbookKind).toBe('comparison');

      const bSummary = baseMetrics.summary!;
      const cSummary = compMetrics.summary!;

      expect(result.summary.participationRateDelta).toBe(cSummary.participationRate - bSummary.participationRate);
      expect(result.summary.totalComparableQuestions).toBeGreaterThan(0);
    }

    expect(result.participation).not.toBeNull();
    expect(result.completion).not.toBeNull();
    expect(result.blankAnswers).not.toBeNull();

    const qComparisons = Object.values(result.questionComparisons);
    expect(qComparisons.length).toBeGreaterThan(0);

    const likertComparisons = qComparisons.filter(q => q.likertComparison);
    expect(likertComparisons.length).toBeGreaterThan(0);

    const enpsComparisons = qComparisons.filter(q => q.enpsComparison);
    expect(enpsComparisons.length).toBeGreaterThan(0);

    const openTextComparisons = qComparisons.filter(q => q.openTextComparison);
    expect(openTextComparisons.length).toBeGreaterThan(0);

    const distributionComparisons = qComparisons.filter(q => q.distributionDelta.length > 0);
    expect(distributionComparisons.length).toBeGreaterThan(0);

    // Verify input immutability
    expect(JSON.stringify(baseMetrics)).toBe(baseSnapshot);
    expect(JSON.stringify(compMetrics)).toBe(compSnapshot);
  });

  describe('Negative Mutation Tests', () => {
    let baseClone: WorkbookMetricsResult;
    let compClone: WorkbookMetricsResult;

    beforeEach(() => {
      baseClone = JSON.parse(JSON.stringify(baseMetrics));
      compClone = JSON.parse(JSON.stringify(compMetrics));
    });

    it('rejects if base metrics are not ready', () => {
      baseClone.status = 'METRICS_FAILED';
      const result = compareWorkbookPeriods({ base: baseClone, comparison: compClone });
      expect(result.status).toBe('COMPARISON_REJECTED');
      expect(result.issues[0].code).toBe('BASE_METRICS_NOT_READY');
    });

    it('rejects if comparison metrics are not ready', () => {
      compClone.status = 'METRICS_FAILED';
      const result = compareWorkbookPeriods({ base: baseClone, comparison: compClone });
      expect(result.status).toBe('COMPARISON_REJECTED');
      expect(result.issues[0].code).toBe('COMPARISON_METRICS_NOT_READY');
    });

    it('rejects if base has no questionMetrics', () => {
      baseClone.questionMetrics = {};
      const result = compareWorkbookPeriods({ base: baseClone, comparison: compClone });
      expect(result.status).toBe('COMPARISON_REJECTED');
      expect(result.issues[0].code).toBe('MISSING_BASE_QUESTION_METRICS');
    });

    it('rejects if comparison has no questionMetrics', () => {
      compClone.questionMetrics = {};
      const result = compareWorkbookPeriods({ base: baseClone, comparison: compClone });
      expect(result.status).toBe('COMPARISON_REJECTED');
      expect(result.issues[0].code).toBe('MISSING_COMPARISON_QUESTION_METRICS');
    });

    it('identifies question found only in base', () => {
      const someKey = Object.keys(compClone.questionMetrics)[0];
      const initialBaseOnly = Object.keys(baseClone.questionMetrics).filter(k => !compClone.questionMetrics[k]).length;
      delete compClone.questionMetrics[someKey];
      const result = compareWorkbookPeriods({ base: baseClone, comparison: compClone });
      expect(result.summary?.totalBaseOnlyQuestions).toBe(initialBaseOnly + 1);
      expect(result.questionComparisons[someKey].status).toBe('BASE_ONLY');
      expect(result.issues.some(i => i.code === 'QUESTION_NOT_FOUND_IN_COMPARISON')).toBe(true);
    });

    it('identifies question found only in comparison', () => {
      const someKey = Object.keys(baseClone.questionMetrics)[0];
      const initialCompOnly = Object.keys(compClone.questionMetrics).filter(k => !baseClone.questionMetrics[k]).length;
      delete baseClone.questionMetrics[someKey];
      const result = compareWorkbookPeriods({ base: baseClone, comparison: compClone });
      expect(result.summary?.totalComparisonOnlyQuestions).toBe(initialCompOnly + 1);
      expect(result.questionComparisons[someKey].status).toBe('COMPARISON_ONLY');
      expect(result.issues.some(i => i.code === 'QUESTION_NOT_FOUND_IN_BASE')).toBe(true);
    });

    it('warns on question type mismatch', () => {
      const someKey = Object.keys(baseClone.questionMetrics)[0];
      baseClone.questionMetrics[someKey].questionType = 'MULTIPLE_CHOICE_SINGLE';
      compClone.questionMetrics[someKey].questionType = 'LIKERT';
      const result = compareWorkbookPeriods({ base: baseClone, comparison: compClone });
      expect(result.status).toBe('COMPARISON_CALCULATED_WITH_WARNINGS');
      expect(result.questionComparisons[someKey].status).toBe('NOT_COMPARABLE');
      expect(result.issues.some(i => i.code === 'QUESTION_TYPE_MISMATCH')).toBe(true);
    });

    it('handles base value zero for relative delta safely', () => {
      if (baseClone.summary) {
         baseClone.summary.totalResponses = 0;
      }
      const result = compareWorkbookPeriods({ base: baseClone, comparison: compClone });
      expect(result.participation?.totalResponses.relativeDelta).toBeNull();
    });
  });
});
