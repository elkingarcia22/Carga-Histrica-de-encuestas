import type { ChatMessage, ApprovalBlock, SessionState, MockMapping, MockIssue } from "./conversationalImportTypes";

export const mockMessages: ChatMessage[] = [
  {
    id: "msg_1",
    role: "assistant",
    type: "text",
    content: "¡Hola! Soy el asistente de importación de encuestas. Por favor, sube tus archivos de datos históricos para comenzar.",
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "msg_2",
    role: "user",
    type: "text",
    content: "Subí los archivos de encuesta 2024 y 2025.",
    timestamp: new Date(Date.now() - 55000).toISOString(),
  },
  {
    id: "msg_3",
    role: "assistant",
    type: "file_staging",
    content: "He recibido tus archivos.",
    timestamp: new Date(Date.now() - 50000).toISOString(),
  },
  {
    id: "msg_4",
    role: "assistant",
    type: "structure_summary",
    content: "Analicé la estructura sintética. Encontré 6 demográficos, 8 dimensiones y 42 preguntas.",
    timestamp: new Date(Date.now() - 40000).toISOString(),
  },
  {
    id: "msg_5",
    role: "assistant",
    type: "warning",
    content: "Hay 3 preguntas sin dimensión clara. ¿Quieres revisarlas?",
    timestamp: new Date(Date.now() - 35000).toISOString(),
  },
  {
    id: "msg_6",
    role: "user",
    type: "text",
    content: "Cambia Área por Gerencia.",
    timestamp: new Date(Date.now() - 20000).toISOString(),
  },
  {
    id: "msg_7",
    role: "assistant",
    type: "text",
    content: "¡Listo! He renombrado el demográfico 'Área' a 'Gerencia'.",
    timestamp: new Date(Date.now() - 15000).toISOString(),
  },
  {
    id: "msg_8",
    role: "user",
    type: "text",
    content: "Apruebo demográficos.",
    timestamp: new Date(Date.now() - 10000).toISOString(),
  },
  {
    id: "msg_9",
    role: "assistant",
    type: "approval_request",
    content: "Demográficos aprobados. ¿Quieres proceder a revisar las dimensiones?",
    timestamp: new Date(Date.now() - 5000).toISOString(),
  }
];

export const mockApprovalBlocks: ApprovalBlock[] = [
  {
    id: "block_files",
    name: "Archivos",
    status: "approved",
    totalItems: 2,
    approvedItems: 2,
    warningCount: 0,
    blockingIssueCount: 0,
  },
  {
    id: "block_demographics",
    name: "Demográficos",
    status: "approved",
    totalItems: 6,
    approvedItems: 6,
    warningCount: 0,
    blockingIssueCount: 0,
  },
  {
    id: "block_dimensions",
    name: "Dimensiones",
    status: "pending",
    totalItems: 8,
    approvedItems: 0,
    warningCount: 1,
    blockingIssueCount: 0,
  },
  {
    id: "block_questions",
    name: "Preguntas",
    status: "pending",
    totalItems: 42,
    approvedItems: 0,
    warningCount: 3,
    blockingIssueCount: 0,
  },
  {
    id: "block_mapping",
    name: "Mapeo pregunta-dimensión",
    status: "pending",
    totalItems: 42,
    approvedItems: 0,
    warningCount: 3,
    blockingIssueCount: 0,
  },
];

export const mockDemographics = [
  "Gerencia",
  "País",
  "Nivel",
  "Antigüedad",
  "Modalidad de trabajo",
  "Género"
];

export const mockDimensions = [
  "Liderazgo",
  "Cultura",
  "Comunicación",
  "Bienestar",
  "Desarrollo",
  "Reconocimiento",
  "Autonomía",
  "Compromiso"
];

export const mockUnmappedQuestions = [
  "¿Sientes que tu trabajo es valorado?",
  "¿Tienes los recursos necesarios para trabajar?",
  "¿Recomendarías trabajar aquí?"
];

export const mockMappings: MockMapping[] = [
  { question: "¿Cómo calificas tu ambiente de trabajo?", dimension: "Cultura" },
  { question: "¿Tienes oportunidades de crecimiento?", dimension: "Desarrollo" },
];

export const mockIssues: MockIssue[] = [
  { type: "warning", message: "3 preguntas sin dimensión clara detectadas." },
  { type: "error", message: "Falta aprobación de dimensiones antes de continuar." }
];

export const mockSessionState: SessionState = "REVIEWING_DIMENSIONS";
