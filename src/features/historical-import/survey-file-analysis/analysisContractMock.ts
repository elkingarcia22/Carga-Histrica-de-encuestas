import type { SurveyFileAnalysisContract } from "./types";

export const sampleSurveyFileAnalysisContract: SurveyFileAnalysisContract = {
  analysisId: "analysis-syn-001",
  createdAt: new Date().toISOString(),
  files: [
    {
      fileName: "Encuesta_Clima_2023.xlsx",
      fileSize: 1048576,
      fileType: "xlsx",
      md5hash: "1ab2c3d4e5f6g7h8i9j0",
    },
  ],
  detectedSurveys: [
    {
      surveyId: "survey-det-001",
      name: "Resultados Clima",
      rowCount: 150,
    },
  ],
  selectedSurveyId: "survey-det-001",
  sheets: [
    {
      sheetName: "Data",
      columnsCount: 15,
      rowsCount: 150,
      isEmpty: false,
    },
    {
      sheetName: "Diccionario",
      columnsCount: 2,
      rowsCount: 15,
      isEmpty: false,
    },
  ],
  columns: [
    {
      columnIndex: 0,
      originalHeader: "Email",
      normalizedHeader: "email",
      inferredDataType: "string",
      emptyCellsRatio: 0,
      semanticRole: "participant_id",
    },
    {
      columnIndex: 1,
      originalHeader: "PAIS",
      normalizedHeader: "pais",
      inferredDataType: "string",
      emptyCellsRatio: 0,
      semanticRole: "demographic",
    },
    {
      columnIndex: 2,
      originalHeader: "Mi líder me apoya",
      normalizedHeader: "mi_lider_me_apoya",
      inferredDataType: "integer",
      emptyCellsRatio: 0,
      semanticRole: "question",
    },
  ],
  demographics: [
    {
      id: "demo-det-001",
      columnReference: 1,
      originalName: "PAIS",
      proposedDemographicId: "demo-pais-001",
      matchStatus: "alias",
      matchDetails: {
        method: "alias",
        confidence: "high",
        reason: "Matched via dictionary alias 'PAIS' -> 'País'",
      },
    },
  ],
  demographicValues: [
    {
      demographicId: "demo-det-001",
      originalValue: "Colombia",
      mappedValue: "Colombia",
      isNew: false,
    },
    {
      demographicId: "demo-det-001",
      originalValue: "Honduras",
      mappedValue: "Honduras",
      isNew: true,
    },
  ],
  dimensions: [
    {
      id: "dim-det-001",
      originalDimensionName: "Liderazgo",
      mappedDimensionId: "dim-liderazgo",
      matchStatus: "existing",
    },
  ],
  questions: [
    {
      id: "q-det-001",
      columnReference: 2,
      originalQuestionText: "Mi líder me apoya",
      mappedQuestionId: "q-oficial-101",
      assignedDimensionId: "dim-det-001",
      matchStatus: "similar",
      matchDetails: {
        method: "fuzzy",
        confidence: "medium",
        reason: "Fuzzy match with 'Siento el apoyo de mi líder'",
      },
    },
  ],
  responseScale: [
    {
      questionId: "q-det-001",
      detectedScaleType: "LIKERT_5",
      minValue: 1,
      maxValue: 5,
    },
  ],
  participantDetection: {
    isAnonymous: false,
    anonymityStatus: "identified",
    participantColumns: [0],
  },
  participantMatches: [
    {
      totalParticipantsInFile: 150,
      exactMatches: 140,
      notFound: 8,
      ambiguousMatches: 2,
    },
  ],
  piiDetection: {
    hasPII: false,
    piiColumns: [0],
    riskLevel: "low",
  },
  warnings: [
    {
      id: "warn-001",
      severity: "info",
      message: "New demographic value detected: Honduras",
      columnReference: 1,
    },
  ],
  requiredUserDecisions: [
    {
      id: "dec-001",
      type: "map_question",
      status: "pending",
      promptDescription: "Verify question mapping for 'Mi líder me apoya'",
      relatedEntityId: "q-det-001",
    },
  ],
  auditTrail: [
    {
      id: "aud-001",
      timestamp: new Date().toISOString(),
      action: "ANALYSIS_COMPLETED",
      userId: "system",
      oldValue: null,
      newValue: "Analysis generated successfully",
    },
  ],
  readyForComparison: {
    isReady: false,
    contractId: "",
    generatedAt: null,
  },
  matchingResult: {
    overallConfidence: "medium",
    matchedQuestionsCount: 1,
    matchedDemographicsCount: 1,
    newDimensionsCount: 0,
  },
};
