import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { parseWorkbookArrayBuffer, ParserResult } from '../../../../src/features/historical-import/parser/parseWorkbookArrayBuffer';
import { validateWorkbookSchema, SchemaValidationResult } from '../../../../src/features/historical-import/parser/schema/validateWorkbookSchema';
import { validateWorkbookCrossSheet, CrossSheetValidationResult } from '../../../../src/features/historical-import/parser/cross-sheet/validateWorkbookCrossSheet';
import { normalizeWorkbook, NormalizationResult, CanonicalWorkbook } from '../../../../src/features/historical-import/parser/normalization/normalizeWorkbook';
import { calculateWorkbookMetrics } from '../../../../src/features/historical-import/parser/metrics/calculateWorkbookMetrics';

describe('calculateWorkbookMetrics', () => {
  let baseParserResult: ParserResult;
  let baseSchemaResult: SchemaValidationResult;
  let baseCrossSheetResult: CrossSheetValidationResult;
  let baseNormalizationResult: NormalizationResult;
  
  let compParserResult: ParserResult;
  let compSchemaResult: SchemaValidationResult;
  let compCrossSheetResult: CrossSheetValidationResult;
  let compNormalizationResult: NormalizationResult;

  beforeAll(async () => {
    // Base setup
    const baseFixturePath = path.join(__dirname, '../../../../fixtures/historical-import/synthetic-survey-base.xlsx');
    const baseFileBuffer = fs.readFileSync(baseFixturePath);
    const baseArrayBuffer = new Uint8Array(baseFileBuffer).buffer;

    baseParserResult = await parseWorkbookArrayBuffer({
      buffer: baseArrayBuffer,
      metadata: { fileName: 'synthetic-survey-base.xlsx', fileSize: baseArrayBuffer.byteLength }
    });
    baseSchemaResult = validateWorkbookSchema({
      parserResult: baseParserResult,
      expectedSchemaKind: 'base'
    });
    baseCrossSheetResult = validateWorkbookCrossSheet({
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

    // Comparison setup
    const compFixturePath = path.join(__dirname, '../../../../fixtures/historical-import/synthetic-survey-comparison.xlsx');
    const compFileBuffer = fs.readFileSync(compFixturePath);
    const compArrayBuffer = new Uint8Array(compFileBuffer).buffer;

    compParserResult = await parseWorkbookArrayBuffer({
      buffer: compArrayBuffer,
      metadata: { fileName: 'synthetic-survey-comparison.xlsx', fileSize: compArrayBuffer.byteLength }
    });
    compSchemaResult = validateWorkbookSchema({
      parserResult: compParserResult,
      expectedSchemaKind: 'comparison'
    });
    compCrossSheetResult = validateWorkbookCrossSheet({
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
  });

  describe('Positive tests', () => {
    it('should calculate metrics for base golden fixture successfully', () => {
      expect(baseNormalizationResult.workbook).toBeDefined();
      const canonicalWorkbook = baseNormalizationResult.workbook!;
      
      const originalWorkbookStr = JSON.stringify(canonicalWorkbook);

      const result = calculateWorkbookMetrics({
        canonicalWorkbook,
        schemaKind: 'base'
      });

      // Immutability check
      expect(JSON.stringify(canonicalWorkbook)).toBe(originalWorkbookStr);

      expect(result.status).toBe('METRICS_CALCULATED');
      expect(result.summary).not.toBeNull();

      if (result.summary) {
        expect(result.summary.totalEligibleRespondents).toBe(24);
        expect(result.summary.totalResponses).toBe(18);
        expect(result.summary.totalQuestions).toBe(17);
        expect(result.summary.totalAnswerValues).toBe(306);
        expect(result.summary.questionMetricsCount).toBe(17);
        expect(result.summary.participationRate).toBe(18 / 24);
        
        // Count blanks directly from canonical to verify match
        let manualBlanks = 0;
        canonicalWorkbook.responses.forEach(r => {
          const answeredQuestionIds = new Set(r.answers.map(a => a.questionId));
          canonicalWorkbook.questions.forEach(q => {
            if (!answeredQuestionIds.has(q.questionId)) {
              manualBlanks++;
            } else {
              const a = r.answers.find(ans => ans.questionId === q.questionId);
              if (a && (a.valueKind === 'BLANK' || a.rawValue === null || a.rawValue === undefined || a.rawValue === '')) {
                manualBlanks++;
              }
            }
          });
        });
        expect(result.summary.blankAnswerCount).toBe(manualBlanks);
      }

      // Check existence of specific question metric types
      let hasLikert = false;
      let hasEnps = false;
      let hasOpenText = false;
      
      Object.values(result.questionMetrics).forEach(qm => {
        if (qm.questionType === 'LIKERT' || qm.questionType === 'LIKERT_1_TO_5') {
          hasLikert = true;
          expect(qm.likertMetrics).toBeDefined();
        } else if (qm.questionType === 'ENPS' || qm.questionType === 'ENPS_EXPORTED_1_TO_11') {
          hasEnps = true;
          expect(qm.enpsMetrics).toBeDefined();
        } else if (qm.questionType === 'OPEN_TEXT') {
          hasOpenText = true;
          expect(qm.openTextMetrics).toBeDefined();
        }
      });

      expect(hasLikert).toBe(true);
      expect(hasEnps).toBe(true);
      expect(hasOpenText).toBe(true);
    });

    it('should calculate metrics for comparison golden fixture successfully', () => {
      expect(compNormalizationResult.workbook).toBeDefined();
      const canonicalWorkbook = compNormalizationResult.workbook!;

      const result = calculateWorkbookMetrics({
        canonicalWorkbook,
        schemaKind: 'comparison'
      });

      expect(result.status).toBe('METRICS_CALCULATED');
      expect(result.summary).not.toBeNull();

      if (result.summary) {
        expect(result.summary.totalEligibleRespondents).toBe(28);
        expect(result.summary.totalResponses).toBe(22);
        expect(result.summary.totalQuestions).toBe(17);
        expect(result.summary.totalAnswerValues).toBe(374);
        expect(result.summary.questionMetricsCount).toBe(17);
        expect(result.summary.participationRate).toBe(22 / 28);
        
        let manualBlanks = 0;
        canonicalWorkbook.responses.forEach(r => {
          const answeredQuestionIds = new Set(r.answers.map(a => a.questionId));
          canonicalWorkbook.questions.forEach(q => {
            if (!answeredQuestionIds.has(q.questionId)) {
              manualBlanks++;
            } else {
              const a = r.answers.find(ans => ans.questionId === q.questionId);
              if (a && (a.valueKind === 'BLANK' || a.rawValue === null || a.rawValue === undefined || a.rawValue === '')) {
                manualBlanks++;
              }
            }
          });
        });
        expect(result.summary.blankAnswerCount).toBe(manualBlanks);
      }
    });
  });

  describe('Negative mutation tests', () => {
    let clonedWorkbook: CanonicalWorkbook;

    beforeEach(() => {
      clonedWorkbook = JSON.parse(JSON.stringify(baseNormalizationResult.workbook));
    });

    it('should reject if canonical workbook is missing', () => {
      const result = calculateWorkbookMetrics({
        canonicalWorkbook: null,
        schemaKind: 'base'
      });

      expect(result.status).toBe('METRICS_REJECTED');
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'CANONICAL_WORKBOOK_NOT_READY'
          })
        ])
      );
    });

    it('should reject if questions are empty', () => {
      clonedWorkbook.questions = [];
      const result = calculateWorkbookMetrics({
        canonicalWorkbook: clonedWorkbook,
        schemaKind: 'base'
      });

      expect(result.status).toBe('METRICS_REJECTED');
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'EMPTY_QUESTION_SET'
          })
        ])
      );
    });

    it('should reject if respondents are empty', () => {
      clonedWorkbook.respondents = [];
      const result = calculateWorkbookMetrics({
        canonicalWorkbook: clonedWorkbook,
        schemaKind: 'base'
      });

      expect(result.status).toBe('METRICS_REJECTED');
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'EMPTY_RESPONDENT_SET'
          })
        ])
      );
    });

    it('should reject if responses are empty', () => {
      clonedWorkbook.responses = [];
      const result = calculateWorkbookMetrics({
        canonicalWorkbook: clonedWorkbook,
        schemaKind: 'base'
      });

      expect(result.status).toBe('METRICS_REJECTED');
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'EMPTY_RESPONSE_SET'
          })
        ])
      );
    });

    it('should warn on invalid numeric answer for Likert', () => {
      const likertQ = clonedWorkbook.questions.find(q => q.questionType === 'LIKERT' || q.questionType === 'LIKERT_1_TO_5');
      let mutated = false;
      if (likertQ) {
        clonedWorkbook.responses.forEach(r => {
          const answer = r.answers.find(a => a.questionId === likertQ.questionId);
          if (answer) {
            answer.valueKind = 'NUMBER';
            answer.rawValue = 'NOT_A_NUMBER';
            mutated = true;
          } else {
            r.answers.push({
              questionId: likertQ.questionId,
              valueKind: 'NUMBER',
              rawValue: 'NOT_A_NUMBER',
              respondentId: r.respondentId
            });
            mutated = true;
          }
        });
      }

      const result = calculateWorkbookMetrics({
        canonicalWorkbook: clonedWorkbook,
        schemaKind: 'base'
      });

      expect(mutated).toBe(true);
      expect(result.status).toBe('METRICS_CALCULATED_WITH_WARNINGS');
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'INVALID_NUMERIC_ANSWER'
          })
        ])
      );
    });
    
    it('should warn on invalid numeric answer for eNPS', () => {
      const enpsQ = clonedWorkbook.questions.find(q => q.questionType === 'ENPS' || q.questionType === 'ENPS_EXPORTED_1_TO_11');
      let mutated = false;
      if (enpsQ) {
        clonedWorkbook.responses.forEach(r => {
          const answer = r.answers.find(a => a.questionId === enpsQ.questionId);
          if (answer) {
            answer.valueKind = 'NUMBER';
            answer.rawValue = 'NOT_A_NUMBER';
            mutated = true;
          } else {
            r.answers.push({
              questionId: enpsQ.questionId,
              valueKind: 'NUMBER',
              rawValue: 'NOT_A_NUMBER',
              respondentId: r.respondentId
            });
            mutated = true;
          }
        });
      }

      const result = calculateWorkbookMetrics({
        canonicalWorkbook: clonedWorkbook,
        schemaKind: 'base'
      });

      expect(mutated).toBe(true);
      expect(result.status).toBe('METRICS_CALCULATED_WITH_WARNINGS');
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'INVALID_NUMERIC_ANSWER'
          })
        ])
      );
    });
  });
});
