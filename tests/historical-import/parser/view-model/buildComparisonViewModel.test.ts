import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { parseWorkbookArrayBuffer } from '../../../../src/features/historical-import/parser/parseWorkbookArrayBuffer';
import { validateWorkbookSchema } from '../../../../src/features/historical-import/parser/schema/validateWorkbookSchema';
import { validateWorkbookCrossSheet } from '../../../../src/features/historical-import/parser/cross-sheet/validateWorkbookCrossSheet';
import { normalizeWorkbook } from '../../../../src/features/historical-import/parser/normalization/normalizeWorkbook';
import { calculateWorkbookMetrics } from '../../../../src/features/historical-import/parser/metrics/calculateWorkbookMetrics';
import { compareWorkbookPeriods } from '../../../../src/features/historical-import/parser/comparison/compareWorkbookPeriods';
import { buildComparisonViewModel } from '../../../../src/features/historical-import/parser/view-model/buildComparisonViewModel';
import type { PeriodComparisonResult } from '../../../../src/features/historical-import/parser/comparison/comparisonTypes';

describe('buildComparisonViewModel', () => {
  let comparisonResult: PeriodComparisonResult;

  beforeAll(async () => {
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
    const baseNormalizationResult = normalizeWorkbook({
      parserResult: baseParserResult,
      schemaResult: baseSchemaResult,
      crossSheetResult: baseCrossSheetResult,
      schemaKind: 'base',
      sourceFileName: 'synthetic-survey-base.xlsx'
    });
    const baseMetrics = calculateWorkbookMetrics({
      canonicalWorkbook: baseNormalizationResult.workbook,
      schemaKind: 'base'
    });

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
    const compNormalizationResult = normalizeWorkbook({
      parserResult: compParserResult,
      schemaResult: compSchemaResult,
      crossSheetResult: compCrossSheetResult,
      schemaKind: 'comparison',
      sourceFileName: 'synthetic-survey-comparison.xlsx'
    });
    const compMetrics = calculateWorkbookMetrics({
      canonicalWorkbook: compNormalizationResult.workbook,
      schemaKind: 'comparison'
    });

    comparisonResult = compareWorkbookPeriods({
      base: baseMetrics,
      comparison: compMetrics
    });
  });

  describe('Positive Path: Base vs Comparison', () => {
    it('generates a complete dashboard view model without mutating input', () => {
      const originalInputStr = JSON.stringify(comparisonResult);

      const result = buildComparisonViewModel({ comparisonResult });

      const afterInputStr = JSON.stringify(comparisonResult);
      expect(originalInputStr).toEqual(afterInputStr); // Immutability verified

      expect(result.status).toBe('VIEW_MODEL_READY');
      expect(result.dashboard).not.toBeNull();

      const dashboard = result.dashboard!;
      expect(dashboard.dashboardTitle).toBe('Comparativo de Periodos');
      expect(dashboard.summaryCards).toHaveLength(4);
      expect(dashboard.kpiCards).toHaveLength(4);

      // question rows count = 16 (only comparable questions)
      expect(dashboard.questionRows).toHaveLength(16);

      const questionIds = dashboard.questionRows.map(r => r.questionId);
      expect(questionIds).not.toContain('Q-LEGACY-001');
      expect(questionIds).not.toContain('Q-NEW-001');

      // verify explicitly exposed counts
      expect(dashboard.metadata.totalComparableQuestions).toBe(16);
      expect(dashboard.metadata.totalBaseOnlyQuestions).toBe(1);
      expect(dashboard.metadata.totalComparisonOnlyQuestions).toBe(1);

      // distribution rows exist
      expect(dashboard.distributionRows.length).toBeGreaterThan(0);

      // filters contain options
      expect(dashboard.filters.questionTypes.length).toBeGreaterThan(0);
      expect(dashboard.filters.directions.length).toBeGreaterThan(0);
      expect(dashboard.filters.tones.length).toBeGreaterThan(0);

      // semantic tones assigned
      const hasTones = dashboard.questionRows.some(row => row.tone !== 'NEUTRAL');
      expect(hasTones).toBe(true);

      // check no colors or classes exist (e.g. no hex colors, no 'text-white')
      const jsonDump = JSON.stringify(dashboard);
      expect(jsonDump).not.toMatch(/#[0-9A-Fa-f]{6}/);
      expect(jsonDump).not.toMatch(/text-white/);
    });
  });

  describe('Negative Mutation Tests', () => {
    it('rejects if comparisonResult status is rejected', () => {
      const clonedResult: PeriodComparisonResult = JSON.parse(JSON.stringify(comparisonResult));
      clonedResult.status = 'COMPARISON_REJECTED';

      const result = buildComparisonViewModel({ comparisonResult: clonedResult });
      expect(result.status).toBe('VIEW_MODEL_REJECTED');
      expect(result.issues[0].code).toBe('COMPARISON_RESULT_NOT_READY');
      expect(result.dashboard).toBeNull();
    });

    it('rejects if summary is missing', () => {
      const clonedResult: PeriodComparisonResult = JSON.parse(JSON.stringify(comparisonResult));
      clonedResult.summary = null;

      const result = buildComparisonViewModel({ comparisonResult: clonedResult });
      expect(result.status).toBe('VIEW_MODEL_REJECTED');
      expect(result.issues[0].code).toBe('MISSING_COMPARISON_SUMMARY');
      expect(result.dashboard).toBeNull();
    });

    it('rejects if question comparisons are missing', () => {
      const clonedResult: PeriodComparisonResult = JSON.parse(JSON.stringify(comparisonResult));
      clonedResult.questionComparisons = {};

      const result = buildComparisonViewModel({ comparisonResult: clonedResult });
      expect(result.status).toBe('VIEW_MODEL_REJECTED');
      expect(result.issues[0].code).toBe('MISSING_QUESTION_COMPARISONS');
      expect(result.dashboard).toBeNull();
    });

    it('generates empty state if no comparable questions', () => {
      const clonedResult: PeriodComparisonResult = JSON.parse(JSON.stringify(comparisonResult));
      // Mark all as NOT_COMPARABLE
      for (const key of Object.keys(clonedResult.questionComparisons)) {
        clonedResult.questionComparisons[key].status = 'BASE_ONLY';
      }

      const result = buildComparisonViewModel({ comparisonResult: clonedResult });
      expect(result.status).toBe('VIEW_MODEL_READY');
      expect(result.dashboard?.emptyState).not.toBeNull();
      expect(result.dashboard?.emptyState?.title).toBe('No hay preguntas comparables');
    });

    it('handles unsupported directions gracefully', () => {
      const clonedResult: PeriodComparisonResult = JSON.parse(JSON.stringify(comparisonResult));
      if (clonedResult.participation?.participationRate) {
        // We cast because TypeScript won't allow invalid enum values naturally
        (clonedResult.participation.participationRate.direction as string) = 'SOME_WEIRD_DIRECTION';
      }

      const result = buildComparisonViewModel({ comparisonResult: clonedResult });
      expect(result.status).toBe('VIEW_MODEL_READY');
      const partCard = result.dashboard?.summaryCards.find(c => c.id === 'participation');
      expect(partCard?.direction).toBe('NONE');
      expect(partCard?.tone).toBe('NEUTRAL');
    });
  });
});
