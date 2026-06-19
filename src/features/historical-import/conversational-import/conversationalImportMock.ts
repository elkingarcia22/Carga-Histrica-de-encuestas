import type { ChatMessage, ApprovalBlock, SessionState, MockMapping, MockIssue, SyntheticMountedSurveyFile } from "./conversationalImportTypes";

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


export const mockSyntheticFiles: SyntheticMountedSurveyFile[] = [
  {
    id: "file_2024",
    displayName: "encuesta-clima-2024-sintetica.xlsx",
    periodLabel: "2024",
    surveyType: "clima",
    fileKind: "xlsx_mock",
    source: "synthetic",
    status: "staged",
    rowsLabel: "1.2k rows",
    sheetsLabel: "1 sheet",
    safetyLabel: "Sandbox",
  },
  {
    id: "file_2025",
    displayName: "encuesta-clima-2025-sintetica.xlsx",
    periodLabel: "2025",
    surveyType: "clima",
    fileKind: "xlsx_mock",
    source: "synthetic",
    status: "staged",
    rowsLabel: "1.5k rows",
    sheetsLabel: "1 sheet",
    safetyLabel: "Sandbox",
  }
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

export interface MockChatSession {
  id: string;
  title: string;
  date: string;
  isActive?: boolean;
}

export const mockChatSessions: MockChatSession[] = [
  { id: "sess_1", title: "Comparativo 2024 vs 2025", date: "Hoy", isActive: true },
  { id: "sess_2", title: "Importación Clima Q3", date: "Ayer" },
  { id: "sess_3", title: "Encuesta Engagement Mkt", date: "Hace 3 días" },
  { id: "sess_4", title: "Pulsos semanales Ago", date: "Semana pasada" },
];

export const initialMessages: ChatMessage[] = [
  {
    id: "msg_init",
    role: "assistant",
    type: "text",
    content: "¡Hola! Soy el asistente de importación de encuestas. Por favor, selecciona una acción rápida o sube tus archivos de datos históricos para comenzar.",
    timestamp: new Date().toISOString(),
  }
];

export const simulatedMountMessages = (): ChatMessage[] => [
  {
    id: "msg_init",
    role: "assistant",
    type: "text",
    content: "¡Hola! Soy el asistente de importación de encuestas. Por favor, selecciona una acción rápida o sube tus archivos de datos históricos para comenzar.",
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "msg_user_mount",
    role: "user",
    type: "text",
    content: "Montar archivos sintéticos",
    timestamp: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: "msg_assistant_staged",
    role: "assistant",
    type: "synthetic_file_mount_summary",
    content: "Listo. Preparé dos archivos sintéticos de encuesta para revisar su estructura antes de generar el comparativo.",
    boundaryNote: "Sandbox sintético: no se cargaron archivos reales ni se procesaron XLSX reales.",
    files: mockSyntheticFiles,
    nextActions: [
      { id: "action_review", label: "Empezar revisión guiada", actionType: "start_guided_review" }
    ],
    timestamp: new Date(Date.now() - 30000).toISOString(),
  }
];

export const simulatedGuidedReviewStartMessages = (): ChatMessage[] => [
  {
    id: "msg_user_start_review",
    role: "user",
    type: "text",
    content: "Empezar revisión guiada",
    timestamp: new Date(Date.now() - 25000).toISOString(),
  },
  {
    id: "msg_assistant_files_review",
    role: "assistant",
    type: "guided_review_step",
    content: "Listo. Antes de comparar, revisemos primero los archivos sintéticos detectados.\n\nEncontré:\n1. encuesta-clima-2024-sintetica.xlsx\n2. encuesta-clima-2025-sintetica.xlsx\n\n¿Apruebas estos archivos para continuar?",
    nextActions: [
      { id: "action_approve_files", label: "Aprobar archivos", actionType: "approve_files" },
      { id: "action_change_files", label: "Cambiar archivos sintéticos", actionType: "change_files" },
      { id: "action_detail_files", label: "Ver detalle", actionType: "detail_files" }
    ],
    timestamp: new Date(Date.now() - 20000).toISOString(),
  }
];

export const simulatedFilesApprovedMessages = (): ChatMessage[] => [
  {
    id: "msg_user_approve_files",
    role: "user",
    type: "text",
    content: "Aprobar archivos",
    timestamp: new Date(Date.now() - 15000).toISOString(),
  },
  {
    id: "msg_assistant_files_approved",
    role: "assistant",
    type: "text",
    content: "Archivos aprobados. En el siguiente paso revisaremos los demográficos detectados.",
    timestamp: new Date(Date.now() - 10000).toISOString(),
  }
];

export const simulatedDemographicsReviewStartMessages = (): ChatMessage[] => [
  {
    id: "msg_assistant_demographics_review",
    role: "assistant",
    type: "guided_review_step",
    content: "Ahora revisemos los demográficos detectados.\n\nEncontré estos campos:\n1. Gerencia\n2. Área\n3. Cargo\n4. Antigüedad\n\n¿Apruebas estos demográficos?",
    nextActions: [
      { id: "action_approve_demographics", label: "Aprobar demográficos", actionType: "approve_demographics" },
      { id: "action_correct_demographics", label: "Corregir demográficos", actionType: "correct_demographics" },
      { id: "action_detail_demographics", label: "Ver detalle", actionType: "detail_demographics" }
    ],
    timestamp: new Date(Date.now() - 8000).toISOString(),
  }
];

export const simulatedDemographicsApprovedMessages = (): ChatMessage[] => [
  {
    id: "msg_user_approve_demographics",
    role: "user",
    type: "text",
    content: "Aprobar demográficos",
    timestamp: new Date(Date.now() - 6000).toISOString(),
  },
  {
    id: "msg_assistant_demographics_approved",
    role: "assistant",
    type: "guided_review_step",
    content: "Demográficos aprobados. En el siguiente paso revisaremos las dimensiones detectadas.",
    nextActions: [
      { id: "action_start_dimensions", label: "Continuar con dimensiones", actionType: "start_dimensions_review" }
    ],
    timestamp: new Date(Date.now() - 4000).toISOString(),
  }
];

export const simulatedDemographicsChangesMessages = (): ChatMessage[] => [
  {
    id: "msg_user_correct_demographics",
    role: "user",
    type: "text",
    content: "Corregir demográficos",
    timestamp: new Date(Date.now() - 6000).toISOString(),
  },
  {
    id: "msg_assistant_demographics_changes",
    role: "assistant",
    type: "text",
    content: "Entendido. Dejamos los demográficos en revisión para ajustar nombres o inclusiones antes de continuar.",
    timestamp: new Date(Date.now() - 4000).toISOString(),
  }
];

export const simulatedDimensionsReviewStartMessages = (): ChatMessage[] => [
  {
    id: "msg_user_start_dimensions",
    role: "user",
    type: "text",
    content: "Continuar con dimensiones",
    timestamp: new Date(Date.now() - 3000).toISOString(),
  },
  {
    id: "msg_assistant_dimensions_review",
    role: "assistant",
    type: "guided_review_step",
    content: "Ahora revisemos las dimensiones detectadas.\n\nEncontré estas dimensiones:\n1. Liderazgo\n2. Comunicación\n3. Bienestar\n4. Desarrollo\n\n¿Apruebas estas dimensiones?",
    nextActions: [
      { id: "action_approve_dimensions", label: "Aprobar dimensiones", actionType: "approve_dimensions" },
      { id: "action_correct_dimensions", label: "Corregir dimensiones", actionType: "correct_dimensions" },
      { id: "action_detail_dimensions", label: "Ver detalle", actionType: "detail_dimensions" }
    ],
    timestamp: new Date(Date.now() - 2000).toISOString(),
  }
];

export const simulatedDimensionsApprovedMessages = (): ChatMessage[] => [
  {
    id: "msg_user_approve_dimensions",
    role: "user",
    type: "text",
    content: "Aprobar dimensiones",
    timestamp: new Date(Date.now() - 1500).toISOString(),
  },
  {
    id: "msg_assistant_dimensions_approved",
    role: "assistant",
    type: "text",
    content: "Dimensiones aprobadas. En el siguiente paso revisaremos las preguntas detectadas.",
    timestamp: new Date(Date.now() - 1000).toISOString(),
  }
];

export const simulatedDimensionsChangesMessages = (): ChatMessage[] => [
  {
    id: "msg_user_correct_dimensions",
    role: "user",
    type: "text",
    content: "Corregir dimensiones",
    timestamp: new Date(Date.now() - 1500).toISOString(),
  },
  {
    id: "msg_assistant_dimensions_changes",
    role: "assistant",
    type: "text",
    content: "Entendido. Dejamos las dimensiones en revisión para ajustar nombres, inclusiones o agrupaciones antes de continuar.",
    timestamp: new Date(Date.now() - 1000).toISOString(),
  }
];

export const simulatedFilesChangesMessages = (): ChatMessage[] => [
  {
    id: "msg_user_change_files",
    role: "user",
    type: "text",
    content: "Cambiar archivos sintéticos",
    timestamp: new Date(Date.now() - 15000).toISOString(),
  },
  {
    id: "msg_assistant_files_changes",
    role: "assistant",
    type: "text",
    content: "Perfecto. Podemos cambiar los archivos sintéticos de ejemplo antes de continuar.\n\nPor ahora seguimos en sandbox: no se cargan archivos reales ni se procesan XLSX reales.",
    timestamp: new Date(Date.now() - 10000).toISOString(),
  }
];

export const simulatedCompareMessages = (): ChatMessage[] => [
  {
    id: "msg_init",
    role: "assistant",
    type: "text",
    content: "¡Hola! Soy el asistente de importación de encuestas. Por favor, selecciona una acción rápida o sube tus archivos de datos históricos para comenzar.",
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "msg_user_compare",
    role: "user",
    type: "text",
    content: "Comparar clima 2024 vs 2025",
    timestamp: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: "msg_assistant_compare_res",
    role: "assistant",
    type: "text",
    content: "Iniciando comparativo para clima 2024 vs 2025. Los datos sintéticos anteriores han sido cargados exitosamente.",
    timestamp: new Date(Date.now() - 30000).toISOString(),
  }
];

export const simulatedFormatMessages = (): ChatMessage[] => [
  {
    id: "msg_init",
    role: "assistant",
    type: "text",
    content: "¡Hola! Soy el asistente de importación de encuestas. Por favor, selecciona una acción rápida o sube tus archivos de datos históricos para comenzar.",
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "msg_user_format",
    role: "user",
    type: "text",
    content: "Ver formato esperado",
    timestamp: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: "msg_assistant_format_res",
    role: "assistant",
    type: "text",
    content: "El formato de importación esperado requiere una estructura de columnas bien definida. Puedes ver las directrices en la pestaña 'Revisar estructura'.",
    timestamp: new Date(Date.now() - 30000).toISOString(),
  }
];

export interface QuickActionItem {
  id: string;
  label: string;
}

export const quickActionItems: QuickActionItem[] = [
  { id: "montar", label: "Montar archivos sintéticos" },
  { id: "comparar", label: "Comparar clima 2024 vs 2025" },
  { id: "revisar", label: "Revisar estructura" },
  { id: "formato", label: "Ver formato esperado" },
];
