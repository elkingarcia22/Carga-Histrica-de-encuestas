import type { ContractAssemblyCapability, ContractAssemblyInput, ContractAssemblyResult, ContractAssemblyMode } from './types';
import type { ParsedWorkbookPreview, ParsedSheetPreview } from '../local-parser/types';
import type {
  SurveyFileAnalysisContract,
  AnalysisWarning,
  RequiredUserDecision,
  AnalysisAuditEntry,
  SurveyColumn,
  ColumnSemanticRole,
  DetectedDemographic,
  DetectedQuestion,
  DetectedResponseScale,
  PiiRiskLevel
} from '../survey-file-analysis/types';
import type { MockUbitsCatalogs } from '../mock-ubits-catalogs/types';

export function getContractAssemblerCapabilities(): ContractAssemblyCapability {
  return {
    usesParserPreviewAsSourceOfTruth: true,
    usesMockCatalogsAsReference: true,
    requiresUserDecisionForAmbiguity: true,
    aiIsNotSourceOfTruth: true,
    createsDraftContract: true,
    matchingEngineEnabled: false,
    claudeEnabled: false,
    uiIntegrationEnabled: false,
  };
}

export function createDefaultContractAssemblyInput(parsedPreview: ParsedWorkbookPreview, mockCatalogs: MockUbitsCatalogs, mode: ContractAssemblyMode = 'INTERACTIVE'): ContractAssemblyInput {
  return {
    parsedPreview,
    mockCatalogs,
    mode,
    options: {},
  };
}

export function validateContractAssemblyInput(input: ContractAssemblyInput): boolean {
  if (!input || !input.parsedPreview || !input.mockCatalogs) {
    return false;
  }
  return true;
}

export function assembleDraftSurveyFileAnalysisContract(input: ContractAssemblyInput): ContractAssemblyResult {
  if (!validateContractAssemblyInput(input)) {
    return {
      status: 'failed',
      draftContractCreated: false,
      requiredNextPhase: 'none'
    };
  }

  const { parsedPreview, mockCatalogs } = input;
  const warnings: AnalysisWarning[] = [];
  const decisions: RequiredUserDecision[] = [];
  const auditTrail: AnalysisAuditEntry[] = [];

  const addAudit = (action: string, details: string) => {
    auditTrail.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      userId: 'system',
      oldValue: null,
      newValue: null,
      reason: details
    });
  };

  addAudit('parser_preview_received', 'Received preview for assembly');

  // Sheet selection
  let selectedSheet: ParsedSheetPreview;
  const validSheets = parsedPreview.sheets.filter(s => s.rowCount > 0 && s.headerDetection.confidenceScore > 0.5);

  if (validSheets.length === 1) {
    selectedSheet = validSheets[0];
    addAudit('primary_sheet_selected', `Selected sheet: ${selectedSheet.sheetName}`);
  } else if (validSheets.length > 1) {
    warnings.push({ id: crypto.randomUUID(), severity: 'warning', message: 'multiple_sheets_detected' });
    decisions.push({ id: crypto.randomUUID(), type: 'resolve_ambiguity', status: 'pending', promptDescription: 'select_primary_sheet' });
    selectedSheet = validSheets[0]; // fallback
    addAudit('primary_sheet_selected', `Fallback selected sheet: ${selectedSheet.sheetName}`);
  } else {
    warnings.push({ id: crypto.randomUUID(), severity: 'critical', message: 'empty_sheet_ignored' });
    return {
      status: 'failed',
      draftContractCreated: false,
      requiredNextPhase: 'none',
      warnings,
      decisions,
      auditTrail
    };
  }

  if (selectedSheet.headerDetection.confidenceScore < 0.8) {
     warnings.push({ id: crypto.randomUUID(), severity: 'warning', message: 'low_header_confidence' });
  }

  const columns: SurveyColumn[] = [];
  const demographics: DetectedDemographic[] = [];
  const questions: DetectedQuestion[] = [];
  const responseScale: DetectedResponseScale[] = [];
  let hasPii = false;
  const piiColumns: number[] = [];
  let maxPiiRisk: PiiRiskLevel = 'none';

  // Normalize and classify columns
  const normalizeHeader = (h: string) => h.trim().toLowerCase().replace(/[^\w\s\u00C0-\u017F]/gi, '').replace(/\s+/g, ' ');

  const participantCols: number[] = [];
  let identifiedSignals = 0;

  selectedSheet.columns.forEach(col => {
    const norm = normalizeHeader(col.rawHeader || 'unknown');
    let role: ColumnSemanticRole = 'unknown';

    // Participant identifiers
    if (/(email|correo|documento|id|cc|nombre|employee)/i.test(norm)) {
      role = 'participant_id';
      participantCols.push(col.index);
      identifiedSignals++;

      if (/(email|documento|cc|salario|phone|telefono)/i.test(norm)) {
        hasPii = true;
        piiColumns.push(col.index);
        maxPiiRisk = 'medium';
      }
    }
    // Demographics
    else if (/(pa[íi]s|area|gerencia|cargo|antig[üu]edad|sede|departamento|rol)/i.test(norm)) {
      role = 'demographic';
      const aliasMatch = mockCatalogs.aliases.find(a => a.normalizedText === norm && a.targetEntityType === 'DEMOGRAPHIC');
      demographics.push({
        id: crypto.randomUUID(),
        columnReference: col.index,
        originalName: col.rawHeader,
        proposedDemographicId: aliasMatch ? (aliasMatch.targetEntityId || null) : null,
        matchStatus: aliasMatch ? 'alias' : 'new',
        matchDetails: {
          method: aliasMatch ? 'alias' : 'no_match',
          confidence: aliasMatch ? 'high' : 'none'
        }
      });
      if (!aliasMatch) {
        decisions.push({ id: crypto.randomUUID(), type: 'approve_demographics', status: 'pending', promptDescription: 'create_survey_only_demographic_value' });
      } else {
        decisions.push({ id: crypto.randomUUID(), type: 'approve_demographics', status: 'pending', promptDescription: 'confirm_demographic_mapping' });
      }
    }
    // Metadata / Timestamp
    else if (/(fecha|timestamp|createdat|date)/i.test(norm)) {
      role = 'metadata';
    }
    // Score
    else if (/(score|nps|puntaje)/i.test(norm)) {
      role = 'question';
    }
    // Dimension label
    else if (/(dimensi[óo]n|secci[óo]n|categor[íi]a)/i.test(norm)) {
      role = 'metadata';
    }
    // Question (fallback by length)
    else if (norm.length > 30 || norm.includes('?')) {
      role = 'question';
      questions.push({
        id: crypto.randomUUID(),
        columnReference: col.index,
        originalQuestionText: col.rawHeader,
        mappedQuestionId: null,
        assignedDimensionId: null,
        matchStatus: 'new',
        matchDetails: {
          method: 'no_match',
          confidence: 'none'
        }
      });
      decisions.push({ id: crypto.randomUUID(), type: 'map_question', status: 'pending', promptDescription: 'confirm_new_question' });
      warnings.push({ id: crypto.randomUUID(), severity: 'warning', message: 'unmatched_question', columnReference: col.index });
      responseScale.push({
        questionId: questions[questions.length - 1].id,
        detectedScaleType: 'UNKNOWN',
        minValue: null,
        maxValue: null
      });
      decisions.push({ id: crypto.randomUUID(), type: 'map_question', status: 'pending', promptDescription: 'confirm_non_comparable_question' });
    }

    if (role === 'unknown') {
      warnings.push({ id: crypto.randomUUID(), severity: 'warning', message: 'unsupported_columns', columnReference: col.index });
    }

    columns.push({
      columnIndex: col.index,
      originalHeader: col.rawHeader,
      normalizedHeader: norm,
      inferredDataType: 'unknown',
      emptyCellsRatio: col.isEmpty ? 1 : 0,
      semanticRole: role
    });
  });

  addAudit('headers_normalized', 'Normalized all headers');
  addAudit('columns_classified', 'Classified columns by semantic role');

  if (hasPii) {
    warnings.push({ id: crypto.randomUUID(), severity: 'warning', message: 'possible_pii_detected' });
    decisions.push({ id: crypto.randomUUID(), type: 'resolve_pii', status: 'pending', promptDescription: 'accept_or_exclude_pii_columns' });
  }

  let anonymityStatus: 'anonymous' | 'identified' | 'mixed' | 'unknown';
  const isAnonymous = identifiedSignals === 0;
  if (isAnonymous) {
    anonymityStatus = 'anonymous';
    decisions.push({ id: crypto.randomUUID(), type: 'resolve_ambiguity', status: 'pending', promptDescription: 'confirm_anonymity' });
  } else if (identifiedSignals === participantCols.length && identifiedSignals > 0) {
    anonymityStatus = 'identified';
  } else {
    anonymityStatus = 'mixed';
    warnings.push({ id: crypto.randomUUID(), severity: 'warning', message: 'ambiguous_participant_identifier' });
    decisions.push({ id: crypto.randomUUID(), type: 'resolve_ambiguity', status: 'pending', promptDescription: 'resolve_ambiguous_column' });
  }

  const draftContract: SurveyFileAnalysisContract = {
    analysisId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    files: [{ fileName: parsedPreview.fileName, fileSize: 0, fileType: parsedPreview.fileKind === 'CSV' ? 'csv' : 'xlsx', md5hash: '' }],
    detectedSurveys: [],
    selectedSurveyId: null,
    sheets: [{ sheetName: selectedSheet.sheetName, columnsCount: selectedSheet.columnCount, rowsCount: selectedSheet.rowCount, isEmpty: false }],
    columns,
    demographics,
    demographicValues: [],
    dimensions: [],
    questions,
    responseScale,
    participantDetection: {
      isAnonymous,
      anonymityStatus,
      participantColumns: participantCols
    },
    participantMatches: [],
    piiDetection: {
      hasPII: hasPii,
      piiColumns,
      riskLevel: maxPiiRisk
    },
    warnings,
    requiredUserDecisions: decisions,
    auditTrail,
    readyForComparison: {
      isReady: false,
      contractId: '',
      generatedAt: null
    },
    matchingResult: {
      overallConfidence: 'none',
      matchedQuestionsCount: 0,
      matchedDemographicsCount: 0,
      newDimensionsCount: 0
    }
  };

  addAudit('warnings_generated', `Generated ${warnings.length} warnings`);
  addAudit('user_decisions_required', `Generated ${decisions.length} user decisions`);
  addAudit('draft_contract_created', 'Created draft contract');

  return {
    status: 'awaiting_decision',
    draftContractCreated: true,
    requiredNextPhase: 'none',
    draftContract,
    warnings,
    decisions,
    auditTrail
  };
}

export function createContractAssemblyPlan(input: ContractAssemblyInput): ContractAssemblyResult {
  return assembleDraftSurveyFileAnalysisContract(input);
}
