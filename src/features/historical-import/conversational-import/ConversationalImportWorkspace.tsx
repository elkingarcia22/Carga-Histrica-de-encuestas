import { useState, useEffect, useRef } from "react";
import "./ai-theme.css";
import { parseWorkbookPreview } from "../local-parser/localParser";
import { assembleDraftSurveyFileAnalysisContract } from "../contract-assembler";
import { mockUbitsCatalogs } from "../mock-ubits-catalogs/mockUbitsCatalogs";
import { mapContentAnalysisToChatSummary } from "./contentAnalysisChatMapper";
import { mapWorkbookInspectionInputToAnalysis } from "../xlsx-content-analyzer";
import { runMatchingEngineIntegration } from "./matchingIntegrationMapper";
import { detectSurveyGroupsWithSegments } from "./surveyGroupingPolicy";
import { getConfidenceExplanation } from "./analysisConfidenceMapper";
import { MessageComposer } from "./MessageComposer";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { ChatTimeline } from "./ChatTimeline";
import { ApprovalProgressTracker } from "./ApprovalProgressTracker";
import { InlineReviewPanel } from "./InlineReviewPanel";
import { DetectedStructurePanel } from "./DetectedStructurePanel";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "./conversationalImportTypes";
import type { SurveyFileAnalysisContract } from "../survey-file-analysis/types";
import { mapDecisionToExplanation } from "./decisionExplanationMapper";
import { useMessageSequenceGate } from "./messageSequenceGate";
import { mapHomologationPrecheck } from "../homologation-precheck";

import { mapStructureInventory } from "../structure-inventory";
import { mapStructureInventoryToChat } from "./structureInventoryChatMapper";
import { qsClimaDemoFixture, qsClimaDemoMetadata } from "../demo-fixture/qsClimaFixture";
import { isQsClimaDemoFixture } from "./demoFixtureAutoDetectionMapper";
import { mapDemoFixtureToStructureReviewMessage } from "./demoFixtureStructureReviewMapper";
import { mapDemoFixtureToReadinessInput } from "./draftPreviewMapper";
import { evaluateDraftReadiness } from "../draft-preparation/draftReadinessMapper";
import { DraftReadinessPreview } from "./DraftReadinessPreview";
import { handleConversationalEdit, type ConversationalEditState, type ConversationalEditContext } from "./conversationalEditingFlow";
import { detectIntent } from "./conversationalIntentMapper";
import {
  getGeneralConfigSummaryMessage,
  validateConfidentialityThreshold,
  validateSurveyName,
  validateSurveyEndDate,
  inferSurveyEndDate,
  getSurveyNameSuggestion,
  getSurveyTypeSuggestion,
  getSurveyTypeLabel,
  getVisibilitySuggestion,
  getMainFileSuggestion,
  getAssociatedFilesList
} from "./conversationalGeneralConfigMapper";
import { getDimensionsList } from "./conversationalEditingMapper";
import { getMatchReviewSectionMessage } from "./conversationalMatchReviewMapper";
import {
  mapQuestionReviewToConversationalOverview,
  mapQuestionReviewToDimensionGroups,
  mapQuestionReviewToNeedsReviewList,
  mapQuestionReviewToQuestionDetail,
  mapQuestionReviewToSectionConfirmationState,
  mapQuestionReviewOverviewToConversation,
  mapQuestionReviewNeedsReviewToConversation,
  mapQuestionReviewQuestionDetailToConversation,
  mapQuestionReviewConfirmationStateToConversation,
  mapQuestionReviewUserTextToEditingIntent,
  questionScaleDimensionReviewMockData37,
  QUESTION_TYPE_LABELS,
  type QuestionReviewItem,
  type QuestionReviewStepSummary,
  type QuestionReviewConversationResponse,
  type CriticalIssue,
  type DimensionSummary,
  type ScaleTypeSummary,
  type ScaleType,
  type ScaleDetail,
} from "./question-scale-dimension-review";
import type { ConversationalGeneralConfiguration, ConversationalImportWizardStateId, ConversationalSurveyScope } from "./conversationalWizardTypes";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Database, ArrowRight, AlertCircle } from "lucide-react";
import { SyntheticAttachmentStaging } from "./SyntheticAttachmentStaging";
import { SyntheticMountedFilesPanel } from "./SyntheticMountedFilesPanel";
import { SandboxUploadPanel } from "./SandboxUploadPanel";
import { ApprovedContractSummary } from "./ApprovedContractSummary";
import { ChatFoundationMessageRenderer } from "./chat-foundation";
import type { ChatFoundationMessage } from "./chat-foundation";
import { mapRuntimeMessageToChatFoundation } from "./flow-adapter";

import {
  mapWorkspaceToAmbiguityDetectionInput,
  detectHistoricalImportAmbiguities,
  mapAmbiguityResolutionToChatMessages,
  mapTextToAmbiguityResolutionApplicationResult,
} from "./ambiguity-resolution";
import type { WorkspaceAmbiguityContext } from "./ambiguity-resolution";
import type { ActiveAmbiguity } from "./ambiguity-resolution";

const HISTORICAL_IMPORT_CHAT_FOUNDATION_RUNTIME_ENABLED = true;

import {
  initialMessages,
  simulatedFormatMessages,
  quickActionItems,
  simulatedGuidedReviewStartMessages,
  simulatedFilesApprovedMessages,
  simulatedFilesChangesMessages,
  simulatedDemographicsReviewStartMessages,
  simulatedDemographicsApprovedMessages,
  simulatedDemographicsChangesMessages,
  simulatedDimensionsReviewStartMessages,
  simulatedDimensionsApprovedMessages,
  simulatedDimensionsChangesMessages,
  simulatedQuestionsReviewStartMessages,
  simulatedQuestionsComparableReviewMessages,
  simulatedQuestionsNewReviewMessages,
  simulatedQuestionsHistoricalReviewMessages,
  simulatedQuestionsApprovedMessages,
  simulatedQuestionsChangesMessages,
  simulatedMappingsReviewStartMessages,
  simulatedMappingsPendingReviewMessages,
  simulatedMappingsAutomaticApprovedMessages,
  simulatedMappingsApprovedMessages,
  simulatedMappingsChangesMessages,
  simulatedContractReviewStartMessages,
  simulatedContractApprovedMessages,
  simulatedContractReviewSummaryMessages,
  simulatedContractReturnToMappingsMessages
} from "./conversationalImportMock";

let sharedAudioCtx: AudioContext | null = null;
let globalIdCounter = 0;
const generateId = () => {
  globalIdCounter++;
  return `sim_msg_${globalIdCounter}`;
};
const initAudioSync = () => {
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }
  } catch (e) {
    console.log("AudioContext init failed", e);
  }
};

const playNotificationSound = () => {
  try {
    if (!sharedAudioCtx) return;
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }
    const oscillator = sharedAudioCtx.createOscillator();
    const gainNode = sharedAudioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(sharedAudioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, sharedAudioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, sharedAudioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, sharedAudioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, sharedAudioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, sharedAudioCtx.currentTime + 0.2);

    oscillator.start(sharedAudioCtx.currentTime);
    oscillator.stop(sharedAudioCtx.currentTime + 0.2);
  } catch (e) {
    console.log("Audio play failed", e);
  }
};

function mapChatFoundationToRuntimeMessage(
  cfMsg: ChatFoundationMessage,
): ChatMessage {
  let msgType: ChatMessage["type"];
  switch (cfMsg.kind) {
    case "thinking":
      msgType = "analysis_progress";
      break;
    case "warning":
    case "error":
      msgType = "warning";
      break;
    default:
      msgType = "text";
  }
  return {
    id: cfMsg.id,
    role: cfMsg.role,
    type: msgType,
    content: cfMsg.content,
    timestamp: "2025-01-01T12:00:00.000Z",
  };
}

export function ConversationalImportWorkspace() {
  const [chatStarted, setChatStarted] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "draft_preview">("chat");
  const [activeSessionId, setActiveSessionId] = useState("sess_1");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [globalOverlayState, setGlobalOverlayState] = useState<Record<string, string>>({});
  const [draftContract, setDraftContract] = useState<SurveyFileAnalysisContract | null>(null);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [resolvedDecisionIds, setResolvedDecisionIds] = useState<string[]>([]);
  const [conversationalEditState, setConversationalEditState] = useState<ConversationalEditState | ConversationalImportWizardStateId>("idle");
  const [conversationalEditContext, setConversationalEditContext] = useState<ConversationalEditContext>({});
  const [selectedSurveyScope, setSelectedSurveyScope] = useState<ConversationalSurveyScope | null>(null);
  const [generalConfiguration, setGeneralConfiguration] = useState<Partial<ConversationalGeneralConfiguration>>({});
  const [activeAmbiguity, setActiveAmbiguity] = useState<ActiveAmbiguity | null>(null);
  const [isProcessingNextStep, setIsProcessingNextStep] = useState(false);
  const sandboxFileInputRef = useRef<HTMLInputElement>(null);

  const [questionReviewData, setQuestionReviewData] = useState<QuestionReviewItem[]>(() => {
    const rawQuestions = [...questionScaleDimensionReviewMockData37.questions];
    // Modify some questions to trigger needs_review status dynamically
    rawQuestions[2] = { ...rawQuestions[2], status: 'needs_review', reviewNotes: 'Verificar si corresponde a Liderazgo o Comunicación.' }; // q_3
    rawQuestions[4] = { ...rawQuestions[4], status: 'needs_review', scaleType: 'unknown', reviewNotes: 'Escala no determinada automáticamente.' }; // q_5
    rawQuestions[7] = { ...rawQuestions[7], status: 'needs_review', reviewNotes: 'Revisión manual requerida.' }; // q_8
    return rawQuestions;
  });

  const [currentQuestionBlockPage, setCurrentQuestionBlockPage] = useState(1);

  const getScaleDetailByScaleType = (scaleType: ScaleType): ScaleDetail => {
    switch (scaleType) {
      case 'likert_5':
        return {
          scaleLabel: 'Likert 5 puntos',
          scaleValueRange: '1–5',
          scaleAnchors: ['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo'],
          scoreDirection: 'positive_up',
          favorableValues: [4, 5],
          neutralValues: [3],
          unfavorableValues: [1, 2],
        };
      case 'likert_7':
        return {
          scaleLabel: 'Likert 7 puntos',
          scaleValueRange: '1–7',
          scaleAnchors: [
            'Totalmente en desacuerdo',
            'En desacuerdo',
            'Parcialmente en desacuerdo',
            'Neutral',
            'Parcialmente de acuerdo',
            'De acuerdo',
            'Totalmente de acuerdo',
          ],
          scoreDirection: 'positive_up',
          favorableValues: [6, 7],
          neutralValues: [4],
          unfavorableValues: [1, 2, 3],
        };
      case 'nps_0_10':
        return {
          scaleLabel: 'NPS 0–10',
          scaleValueRange: '0–10',
          scaleAnchors: ['0 a 10 · Detractores 0–6 · Pasivos 7–8 · Promotores 9–10'],
          scoreDirection: 'positive_up',
          favorableValues: [9, 10],
          neutralValues: [7, 8],
          unfavorableValues: [0, 1, 2, 3, 4, 5, 6],
        };
      case 'binary_yes_no':
        return {
          scaleLabel: 'Binaria Sí/No',
          scaleValueRange: '0–1',
          scaleAnchors: ['No', 'Sí'],
          scoreDirection: 'positive_up',
          favorableValues: [1],
          neutralValues: [],
          unfavorableValues: [0],
        };
      case 'frequency':
        return {
          scaleLabel: 'Frecuencia',
          scaleValueRange: '1–5',
          scaleAnchors: ['Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'],
          scoreDirection: 'positive_up',
          favorableValues: [4, 5],
          neutralValues: [3],
          unfavorableValues: [1, 2],
        };
      case 'not_applicable':
        return {
          scaleLabel: 'No aplica',
          scaleValueRange: 'N/A',
          scaleAnchors: [],
          scoreDirection: 'positive_up',
          favorableValues: [],
          neutralValues: [],
          unfavorableValues: [],
        };
      default:
        return {
          scaleLabel: 'No determinado',
          scaleValueRange: 'unknown',
          scaleAnchors: [],
          scoreDirection: 'positive_up',
          favorableValues: [],
          neutralValues: [],
          unfavorableValues: [],
        };
    }
  };

  const recalculateSummary = (questions: QuestionReviewItem[]): QuestionReviewStepSummary => {
    const totalQuestions = questions.length;
    const alignedQuestions = questions.filter(q => q.status === 'aligned').length;
    const needsReviewQuestions = questions.filter(q => q.status === 'needs_review').length;
    const newQuestions = questions.filter(q => q.status === 'new_question').length;
    const uninterpretableQuestions = questions.filter(q => q.status === 'uninterpretable').length;

    const dimMap = new Map<string, { name: string; count: number; scale: ScaleType }>();
    const scaleMap = new Map<ScaleType, number>();
    const criticalIssues: CriticalIssue[] = [];

    questions.forEach(q => {
      const dimKey = q.dimensionAssignment.dimensionId;
      if (dimMap.has(dimKey)) {
        const entry = dimMap.get(dimKey)!;
        entry.count++;
      } else {
        dimMap.set(dimKey, {
          name: q.dimensionAssignment.dimensionName,
          count: 1,
          scale: q.scaleType,
        });
      }

      const scaleKey = q.scaleType;
      scaleMap.set(scaleKey, (scaleMap.get(scaleKey) || 0) + 1);

      if (q.questionType === 'unknown') {
        criticalIssues.push({
          questionId: q.questionId,
          displayIndex: q.displayIndex,
          issueType: 'missing_question_type',
          description: `Pregunta #${q.displayIndex}: tipo de pregunta no definido`,
        });
      }
      if (q.scaleType === 'unknown' && q.questionType !== 'open_text') {
        criticalIssues.push({
          questionId: q.questionId,
          displayIndex: q.displayIndex,
          issueType: 'missing_scale_type',
          description: `Pregunta #${q.displayIndex}: escala no asignada`,
        });
      }
      if (q.dimensionAssignment.source === 'not_assigned') {
        criticalIssues.push({
          questionId: q.questionId,
          displayIndex: q.displayIndex,
          issueType: 'missing_dimension',
          description: `Pregunta #${q.displayIndex}: dimensión no asignada`,
        });
      }
      if (q.status === 'uninterpretable') {
        criticalIssues.push({
          questionId: q.questionId,
          displayIndex: q.displayIndex,
          issueType: 'uninterpretable',
          description: `Pregunta #${q.displayIndex}: no interpretable`,
        });
      }
      if (q.status === 'needs_review') {
        criticalIssues.push({
          questionId: q.questionId,
          displayIndex: q.displayIndex,
          issueType: 'needs_review',
          description: `Pregunta #${q.displayIndex}: requiere revisión`,
        });
      }
    });

    const questionsByDimension: DimensionSummary[] = Array.from(dimMap.entries()).map(
      ([dimensionId, entry]) => ({
        dimensionId,
        dimensionName: entry.name,
        questionCount: entry.count,
        scaleType: entry.scale,
      }),
    );

    const questionsByScaleType: ScaleTypeSummary[] = Array.from(scaleMap.entries()).map(
      ([scaleType, questionCount]) => ({
        scaleType,
        questionCount,
      }),
    );

    const canConfirmSection =
      criticalIssues.length === 0 &&
      questions.every(q => q.questionType !== 'unknown') &&
      questions
        .filter(q => q.questionType !== 'open_text')
        .every(q => q.scaleType !== 'unknown' && q.scaleType !== 'not_applicable');

    return {
      totalQuestions,
      alignedQuestions,
      needsReviewQuestions,
      newQuestions,
      uninterpretableQuestions,
      questionsByDimension,
      questionsByScaleType,
      criticalIssues,
      canConfirmSection,
    };
  };

  const formatConversationResponse = (resp: QuestionReviewConversationResponse): string => {
    const parts: string[] = [];
    if (resp.title) {
      parts.push(resp.title);
    }
    if (resp.intro) {
      parts.push(resp.intro);
    }
    resp.sections.forEach(sec => {
      parts.push(sec.content);
    });
    if (resp.suggestedTextCommands && resp.suggestedTextCommands.length > 0) {
      parts.push(`Puedes responder:\n${resp.suggestedTextCommands.join('\n')}`);
    }
    return parts.join('\n\n');
  };

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const { wait, waitTypewriter, isMounted } = useMessageSequenceGate();

  const simulateChatFlow = async (newMessages: ChatMessage[], options?: { keepThinkingAfter?: boolean }) => {
    setIsProcessingNextStep(true);
    initAudioSync();

    for (const msg of newMessages) {
      if (msg.role === "user") {
        setMessages(prev => [...prev, msg]);
      } else {
        const typingId = `typing_${generateId()}`;
        setMessages(prev => {
          const cleaned = prev.filter(m => !(m.role === "assistant" && m.type === "analysis_progress" && m.content === "Pensando..."));
          return [...cleaned, {
            id: typingId,
            role: "assistant",
            type: "analysis_progress",
            content: "Pensando...",
            timestamp: "2025-01-01T12:00:00.000Z"
          }];
        });

        const proceedThinking = await wait(1500);

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== typingId);
          if (!proceedThinking) return filtered;
          return [...filtered, msg];
        });
        if (!proceedThinking) return;

        if (msg.content) {
          const proceedTyping = await waitTypewriter(msg.content.length, 300);
          if (!proceedTyping) return;
        } else {
          const proceedWait = await wait(800);
          if (!proceedWait) return;
        }
      }
    }
    if (!options?.keepThinkingAfter) {
      setIsProcessingNextStep(false);
    }
    if (isMounted.current) {
      playNotificationSound();
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    if (chatStarted && viewMode === "chat") {
      const timeout = setTimeout(() => {
        const lastMsg = document.querySelectorAll('[id^="msg_"]');
        if (lastMsg.length > 0) {
          lastMsg[lastMsg.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages, chatStarted, viewMode]);

  const handleNewChat = () => {
    setChatStarted(false);
    setViewMode("chat");
    setSelectedSurveyScope(null);
    setConversationalEditState("idle");
    setConversationalEditContext({});
    setActiveAmbiguity(null);
    setMessages(initialMessages);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    if (id === "sess_1") {
      handleMountSynthetic();
    } else {
      setMessages([
        {
          id: `msg_session_${id}`,
          role: "assistant",
          type: "text",
          content: "Abriendo historial de chat... Este sandbox simula un registro histórico.",
          timestamp: "2025-01-01T12:00:00.000Z",
        }
      ]);
      setChatStarted(true);
      setViewMode("chat");
    }
  };

  const handleMountSynthetic = () => {
    // Legacy support for mock session click
    handleSandboxUploadStart();
  };

  const handleSandboxUploadStart = () => {
    const ts = generateId();
    const isoString = "2025-01-01T12:00:00.000Z";
    setChatStarted(true);
    setViewMode("chat");
    setMessages([
      initialMessages[0],
      {
        id: `msg_user_upload_${ts}`,
        role: "user",
        type: "text",
        content: "Cargar encuesta",
        timestamp: isoString,
      },
      {
        id: `msg_assistant_upload_prompt_${generateId()}`,
        role: "assistant",
        type: "text",
        content: "Adjunta aquí los archivos de resultados históricos para analizarlos.",
        timestamp: isoString,
      },
    ]);

    setTimeout(() => {
      sandboxFileInputRef.current?.click();
    }, 100);
  };

  const handleSandboxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const metadata: import("./SandboxUploadPanel").SandboxFileMetadata[] = Array.from(files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop() || "unknown",
      lastModified: file.lastModified,
      rawFile: file,
    }));
    e.target.value = "";
    handleSandboxFilesSelected(metadata);
  };

  const handleComposerSend = (text: string, files: File[]) => {
    const ts = generateId();
    const isoString = "2025-01-01T12:00:00.000Z";

    if (!chatStarted) {
      setChatStarted(true);
      setViewMode("chat");
    }

    const userMessageContent = files.length > 0
      ? text.trim() ? `${text}\n\n[Archivo(s) adjunto(s): ${files.map(f => f.name).join(", ")}]` : `[Archivo(s) adjunto(s): ${files.map(f => f.name).join(", ")}]`
      : text;

    setMessages(prev => {
      const baseMessages = prev.length === 0 || !chatStarted ? [initialMessages[0]] : prev;
      return [
        ...baseMessages,
        {
          id: `msg_user_${ts}`,
          role: "user",
          type: "text",
          content: userMessageContent,
          timestamp: isoString,
        }
      ];
    });

    if (files.length > 0) {
      setStagedFiles(files);

      const sandboxMetadataFiles = files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type || f.name.split('.').pop() || "unknown",
        lastModified: f.lastModified,
        rawFile: f
      }));

      const newMsgs: import("./conversationalImportTypes").ChatMessage[] = [];

      newMsgs.push({
        id: `msg_assistant_files_selected_${generateId()}`,
        role: "assistant",
        type: "sandbox_files_selected",
        content: "Recibí los archivos en modo sandbox.",
        sandboxFiles: sandboxMetadataFiles,
        timestamp: "2025-01-01T12:00:00.000Z",
      });

      if (isQsClimaDemoFixture(files)) {
        const ambiguityContext: WorkspaceAmbiguityContext = {
          stagedFileNames: files.map(f => f.name),
          selectedSurveyScope: null,
          currentWizardState: "awaiting_survey_scope_selection",
          userLastText: text.trim(),
          surveyName: "",
          surveyTypeConfirmed: false,
          inferredSurveyType: "",
          visibilityConfirmed: false,
          inferredVisibility: "",
          surveyEndDate: null,
          confidentialityThreshold: null,
          hasPrivacyRisk: false,
        };

        const detectionInput = mapWorkspaceToAmbiguityDetectionInput(ambiguityContext);
        const snapshot = detectHistoricalImportAmbiguities(detectionInput);
        const ambiguity = snapshot.activeAmbiguity;

        setConversationalEditState("awaiting_survey_scope_selection");
        setActiveAmbiguity(ambiguity ?? null);

        if (ambiguity?.type === "MultipleSurveyScopeAmbiguity") {
          const cfMessages = mapAmbiguityResolutionToChatMessages(snapshot);
          const runtimeMessages = cfMessages
            .filter(m => m.kind !== "thinking")
            .map(mapChatFoundationToRuntimeMessage);
          newMsgs.push(...runtimeMessages);
        } else {
          newMsgs.push({
            id: `msg_assistant_scope_selection_${generateId()}`,
            role: "assistant",
            type: "guided_review_step",
            content: "Detecté más de una encuesta o ciclo en los archivos cargados.\n\n1. QS Clima 2025\n2. QS Clima 2024\n3. Carga histórica multicíclo QS Clima 2024/2025\n\n¿Qué quieres procesar primero? Responde 1, 2 o 3.",
            timestamp: "2025-01-01T12:00:00.000Z",
          });
        }

        void simulateChatFlow(newMsgs);
        return;
      }

      const groups = detectSurveyGroupsWithSegments(files);

      if (groups.length > 1) {
        newMsgs.push({
          id: `msg_assistant_group_decision_${generateId()}`,
          role: "assistant",
          type: "guided_review_step",
          content: "🎯 Encontré más de una encuesta en los archivos cargados.\n\n🔎 **Qué detecté:**\nDetecté grupos que parecen corresponder a encuestas distintas, por ejemplo " + groups.map(g => g.name).join(", ") + ".\n\n⚠️ **Impacto en la carga histórica:**\nLa carga histórica se procesa una encuesta a la vez. Si mezclamos ciclos o estructuras distintas, las preguntas, demográficos y participantes pueden quedar mal clasificados.\n\n✅ **Recomendación:**\nTe recomiendo procesar primero el grupo con mayor consistencia estructural.\n\n➡️ **¿Cuál encuesta quieres procesar primero?**",
          nextActions: [
            ...groups.map(g => ({
              id: `process_${g.id}`,
              label: `Procesar ${g.name}`,
              actionType: `start_local_analysis_${g.id}`
            })),
            { id: "view_groups", label: "Ver detalle de grupos", actionType: "detail_groups" },
            { id: "cancel", label: "Cancelar", actionType: "cancel_analysis" }
          ],
          timestamp: "2025-01-01T12:00:00.000Z",
        });
      }

      void simulateChatFlow(newMsgs, { keepThinkingAfter: true }).then(() => {
        if (groups.length <= 1) {
          setTimeout(() => handleLocalAnalysisStart(files).finally(() => {
            setIsProcessingNextStep(false);
          }), 500);
        } else {
          setIsProcessingNextStep(false);
        }
      });
    } else if (text.trim()) {
      const intent = detectIntent(text);

      if (conversationalEditState === "awaiting_survey_scope_selection") {
        if (activeAmbiguity) {
          const result = mapTextToAmbiguityResolutionApplicationResult({
            activeAmbiguity,
            userTextSanitized: text.trim(),
            workspaceSnapshot: {
              selectedSurveyScopeId: selectedSurveyScope,
              currentStep: conversationalEditState,
              hasSelectedScope: selectedSurveyScope !== null,
              hasConfiguredGeneralSettings: generalConfiguration.surveyName !== undefined,
              safeFileLabels: stagedFiles.map(f => f.name),
              safeCycleLabels: activeAmbiguity.options.map(o => o.label),
            },
            availableOptions: activeAmbiguity.options,
            currentWizardStep: conversationalEditState,
            privacyFlags: activeAmbiguity.privacyFlags,
          });

          if (result.status === 'applied' && result.statePatch?.patch.selectedSurveyScopeId) {
            const selectedScope = result.statePatch.patch.selectedSurveyScopeId;
            if (selectedScope === 'qs_clima_2025' || selectedScope === 'qs_clima_2024' || selectedScope === 'qs_clima_multicycle_2024_2025') {
              setSelectedSurveyScope(selectedScope);
              setConversationalEditState("confirming_survey_name");
              const scopeLabel = result.statePatch.patch.safeScopeLabel;
              const suggestion = getSurveyNameSuggestion(selectedScope);
              void simulateChatFlow([{
                id: `msg_assistant_scope_selected_${generateId()}`,
                role: "assistant",
                type: "text",
                content: `Perfecto. Procesaré ${scopeLabel} como encuesta seleccionada.\n\nAntes de revisar la estructura, validaré la configuración general de la encuesta.\n\n1/7 · Nombre de la encuesta\n\nNombre sugerido: ${suggestion}.\n¿Quieres usar este nombre o escribir otro?`,
                timestamp: "2025-01-01T12:00:00.000Z",
              }]);
              return;
            }
          }

          void simulateChatFlow([{
            id: `msg_assistant_scope_invalid_${generateId()}`,
            role: "assistant",
            type: "text",
            content: result.validationMessage || "Por favor responde 1, 2 o 3.",
            timestamp: "2025-01-01T12:00:00.000Z",
          }]);
        } else {
          void simulateChatFlow([{
            id: `msg_assistant_scope_invalid_${generateId()}`,
            role: "assistant",
            type: "text",
            content: "Para continuar, responde 1, 2 o 3:\n1. QS Clima 2025\n2. QS Clima 2024\n3. QS Clima 2024/2025 (multiciclo)",
            timestamp: "2025-01-01T12:00:00.000Z",
          }]);
        }
        return;
      }

      if (conversationalEditState === "confirming_survey_name" || conversationalEditState === "confirming_survey_type" || conversationalEditState === "confirming_visibility" || conversationalEditState === "confirming_survey_end_date" || conversationalEditState === "confirming_confidentiality_threshold" || conversationalEditState === "confirming_main_file" || conversationalEditState === "confirming_associated_files") {
        if (intent === "cancel_import") {
          // Handled generically below, but we can let it fall through or handle it here
        } else {
          const scope = selectedSurveyScope || "qs_clima_multicycle_2024_2025";

          if (conversationalEditState === "confirming_survey_name") {
            const suggestion = getSurveyNameSuggestion(scope);
            let finalName = text.trim();
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation") {
              finalName = suggestion;
            }
            const validation = validateSurveyName(finalName);
            if (!validation.valid) {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: validation.error || "Nombre no válido.", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
            const newConfig = { ...generalConfiguration, surveyName: validation.value };
            setGeneralConfiguration(newConfig);
            setConversationalEditState("confirming_survey_type");
            const typeSuggestion = getSurveyTypeLabel(getSurveyTypeSuggestion(scope));
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `2/7 · Tipo de encuesta\n\nTipo sugerido: ${typeSuggestion}.\n¿Confirmas este tipo o quieres elegir otro?\n\nOpciones:\n1. Clima\n2. Cultura\n3. NPS`, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "confirming_survey_type") {
            const suggestion = getSurveyTypeSuggestion(scope);
            const finalType = text.trim().toLowerCase();
            let resolvedType = suggestion;
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation" || finalType === "1" || finalType === "clima") {
              resolvedType = "climate";
            } else if (finalType === "2" || finalType === "cultura") {
              resolvedType = "culture";
            } else if (finalType === "3" || finalType === "nps" || finalType === "enps") {
              resolvedType = "nps";
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor elige una opción válida (1, 2, 3 o el nombre del tipo).", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
            setGeneralConfiguration(prev => ({ ...prev, surveyType: resolvedType }));
            const piiDetected = scope !== "qs_clima_2024";
            if (!piiDetected) {
              const inferredDate = inferSurveyEndDate(generalConfiguration.surveyName || getSurveyNameSuggestion(scope), scope);
              setGeneralConfiguration(prev => ({ ...prev, visibility: "anonymous", surveyEndDate: inferredDate }));
              setConversationalEditState("confirming_confidentiality_threshold");
              void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `3/7 · Tipo de visibilidad\n\nDetecté que los archivos no contienen datos personales directos (nombres, correos, etc.), por lo que la visibilidad será **Anónima**.\n\n4/7 · Fecha de finalización\n\nAsigné automáticamente la fecha inferida: ${inferredDate}.\n\n5/7 · Umbral de confidencialidad\n\nUmbral sugerido: 5 respuestas por grupo.\nEsto evita mostrar cortes con muy pocas respuestas.\n\n¿Confirmas este umbral o quieres escribir otro número?`, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else {
              setConversationalEditState("confirming_visibility");
              void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `3/7 · Tipo de visibilidad\n\nDetecté datos personales en los archivos (nombres, correos). ¿Quieres que la visibilidad sea Anónima (para proteger identidades en los resultados) o Pública?\n\nOpciones:\n1. Anónimo\n2. Público\n\n¿Qué visibilidad prefieres?`, timestamp: "2025-01-01T12:00:00.000Z" }]);
            }
            return;
          }

          if (conversationalEditState === "confirming_visibility") {
            const suggestion = getVisibilitySuggestion(scope);
            const finalVis = text.trim().toLowerCase();
            let resolvedVis = suggestion;
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation" || finalVis === "1" || finalVis === "anónimo" || finalVis === "anonimo") {
              resolvedVis = "anonymous";
            } else if (finalVis === "2" || finalVis === "público" || finalVis === "publico") {
              resolvedVis = "public";
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor elige una opción válida (1, 2 o el nombre de la visibilidad).", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
            setGeneralConfiguration(prev => ({ ...prev, visibility: resolvedVis }));
            setConversationalEditState("confirming_survey_end_date");
            const dateSuggestion = inferSurveyEndDate(generalConfiguration.surveyName || getSurveyNameSuggestion(scope), scope);
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `4/7 · Fecha de finalización\n\nFecha sugerida: ${dateSuggestion}.\nInferí esta fecha a partir del nombre de la encuesta.\n\n¿Confirmas esta fecha o quieres escribir otra?`, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "confirming_survey_end_date") {
            let finalDate = text.trim();
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation") {
              finalDate = inferSurveyEndDate(generalConfiguration.surveyName || getSurveyNameSuggestion(scope), scope);
            }
            const validation = validateSurveyEndDate(finalDate);
            if (!validation.valid) {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: validation.error || "No pude interpretar la fecha.", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
            setGeneralConfiguration(prev => ({ ...prev, surveyEndDate: validation.value }));
            setConversationalEditState("confirming_confidentiality_threshold");
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `5/7 · Umbral de confidencialidad\n\nUmbral sugerido: 5 respuestas por grupo.\nEsto evita mostrar cortes con muy pocas respuestas.\n\n¿Confirmas este umbral o quieres escribir otro número?`, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "confirming_confidentiality_threshold") {
            let thresholdInput = text.trim();
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation") {
              thresholdInput = "5";
            }
            const validation = validateConfidentialityThreshold(thresholdInput);
            if (!validation.valid) {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: validation.error || "Umbral inválido.", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
            const newConfig = { ...generalConfiguration, confidentialityThreshold: validation.value };
            setGeneralConfiguration(newConfig);
            setConversationalEditState("confirming_main_file");
            const fileSuggestion = getMainFileSuggestion(scope);
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `6/7 · Archivo principal\n\nArchivo principal detectado:\n${fileSuggestion}\n\nLo usaré como referencia de estructura y resultados agregados.\n¿Confirmas este archivo principal?`, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "confirming_main_file") {
            if (intent !== "confirm_general_config" && intent !== "ambiguous_confirmation") {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Para esta fase, solo puedes confirmar el archivo sugerido. Responde 'sí' o 'confirmar'.", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
            const newConfig = { ...generalConfiguration, mainFileId: getMainFileSuggestion(scope) };
            setGeneralConfiguration(newConfig);
            setConversationalEditState("confirming_associated_files");
            const filesList = getAssociatedFilesList(scope);
            let msgContent: string;
            if (filesList.length > 0) {
              msgContent = `7/7 · Archivos asociados\n\nDetecté estos cortes por gerencia:\n${filesList.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\n¿Confirmas estos archivos asociados?`;
            } else {
              msgContent = `7/7 · Archivos asociados\n\nNo detecté archivos adicionales.\n\n¿Confirmas esta configuración?`;
            }
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: msgContent, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "confirming_associated_files") {
            const normalizedText = text.trim().toLowerCase();
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation" || ["usar estos", "estan bien", "están bien"].some(w => normalizedText.includes(w))) {
              const updatedConfig = { ...generalConfiguration, associatedFileIds: getAssociatedFilesList(scope) };
              setGeneralConfiguration(updatedConfig);
              setConversationalEditState("reviewing_structure_match");

              const summaryMsg = getGeneralConfigSummaryMessage(updatedConfig, scope);
              const startMsg = getMatchReviewSectionMessage("start", scope, false);

              void simulateChatFlow([
                { id: `msg_assistant_summary_${generateId()}`, role: "assistant", type: "text", content: summaryMsg, timestamp: "2025-01-01T12:00:00.000Z" },
                { id: `msg_assistant_review_${generateId()}`, role: "assistant", type: "text", content: startMsg, timestamp: "2025-01-01T12:00:00.000Z" }
              ], { keepThinkingAfter: true }).then(() => {
                setTimeout(() => {
                  setConversationalEditState("reviewing_questions_and_scales");
                  const currentSummary = recalculateSummary(questionReviewData);
                  const overviewObj = mapQuestionReviewToConversationalOverview(questionReviewData, currentSummary);
                  const convResponse = mapQuestionReviewOverviewToConversation(overviewObj);
                  const qsMsg = formatConversationResponse(convResponse);
                  void simulateChatFlow([
                    { id: `msg_assistant_qs_${generateId()}`, role: "assistant", type: "text", content: qsMsg, timestamp: "2025-01-01T12:00:00.000Z" }
                  ]);
                }, 1500);
              });
              return;
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Esta fase solo permite confirmar o cancelar, el ajuste avanzado de archivos queda para una fase posterior. Por favor responde 'sí', 'confirmar', 'usar estos', etc. o escribe 'cancelar importación'.", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
          }
        }
      }

      if (
        conversationalEditState === "reviewing_questions_and_scales" ||
        conversationalEditState === "reviewing_demographics" ||
        conversationalEditState === "reviewing_participants_or_responses" ||
        conversationalEditState === "reviewing_dimensions" ||
        conversationalEditState === "reviewing_question_dimension_mapping" ||
        conversationalEditState === "reviewing_segments" ||
        conversationalEditState === "reviewing_privacy" ||
        conversationalEditState === "reviewing_structure_match"
      ) {
        if (intent === "cancel_import") {
          // Fall through to general cancel
        } else {
          const scope = selectedSurveyScope || "qs_clima_multicycle_2024_2025";
          const normalizedInput = text.trim().toLowerCase();

          // Handle "ver detalles"
          if (normalizedInput === "ver detalles" || normalizedInput.includes("detalles")) {
            let detailSection: import("./conversationalMatchReviewMapper").MatchReviewSectionType | null = null;
            if (conversationalEditState === "reviewing_questions_and_scales") detailSection = "questions_and_scales";
            if (conversationalEditState === "reviewing_demographics") detailSection = "demographics";
            if (conversationalEditState === "reviewing_participants_or_responses") detailSection = "participants_or_responses";
            if (conversationalEditState === "reviewing_dimensions") detailSection = "dimensions";
            if (conversationalEditState === "reviewing_question_dimension_mapping") detailSection = "question_dimension_mapping";
            if (conversationalEditState === "reviewing_segments") detailSection = "segments";
            if (conversationalEditState === "reviewing_privacy") detailSection = "privacy";

            if (detailSection) {
              const detailMsg = getMatchReviewSectionMessage(detailSection, scope, true);
              void simulateChatFlow([{ id: `msg_assistant_detail_${generateId()}`, role: "assistant", type: "text", content: detailMsg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            }
            return;
          }

          if (conversationalEditState === "reviewing_questions_and_scales") {
            const summaryObj = recalculateSummary(questionReviewData);
            const intentObj = mapQuestionReviewUserTextToEditingIntent(text, summaryObj.canConfirmSection);

            if (intentObj.intent === "view_all_questions_in_blocks" || intentObj.intent === "view_next_block" || intentObj.intent === "view_prev_block") {
              let page = currentQuestionBlockPage;
              const pageSize = 10;
              const totalPages = Math.ceil(questionReviewData.length / pageSize);

              if (intentObj.intent === "view_next_block") {
                page = Math.min(page + 1, totalPages);
              } else if (intentObj.intent === "view_prev_block") {
                page = Math.max(page - 1, 1);
              } else {
                page = 1;
              }
              setCurrentQuestionBlockPage(page);

              const startIndex = (page - 1) * pageSize;
              const endIndex = Math.min(startIndex + pageSize, questionReviewData.length);
              const pageQuestions = questionReviewData.slice(startIndex, endIndex);

              const content = pageQuestions.map(q => {
                const qType = QUESTION_TYPE_LABELS[q.questionType] || q.questionType;
                return `${q.displayIndex}. "${q.questionText}" [${qType}]`;
              }).join('\n');

              const intro = `Vista en bloques (Bloque ${page} de ${totalPages}):\nMostrando preguntas ${startIndex + 1} a ${endIndex} de ${questionReviewData.length}.`;

              const suggestedTextCommands = [];
              let menuIdx = 1;
              if (page < totalPages) {
                suggestedTextCommands.push(`${menuIdx++}. Ver siguiente bloque`);
              }
              if (page > 1) {
                suggestedTextCommands.push(`${menuIdx++}. Ver bloque anterior`);
              }
              suggestedTextCommands.push(`${menuIdx}. Ver resumen`);

              const convResponse: QuestionReviewConversationResponse = {
                responseId: `all-questions-blocks-p${page}`,
                intro,
                sections: [
                  {
                    type: 'summary',
                    content
                  }
                ],
                suggestedTextCommands,
                status: 'info'
              };

              const msg = formatConversationResponse(convResponse);
              void simulateChatFlow([{ id: `msg_assistant_qs_blocks_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }

            if (intentObj.intent === "view_overview") {
              const overviewObj = mapQuestionReviewToConversationalOverview(questionReviewData, summaryObj);
              const convResponse = mapQuestionReviewOverviewToConversation(overviewObj);
              const msg = formatConversationResponse(convResponse);
              void simulateChatFlow([{ id: `msg_assistant_qs_overview_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }

            if (intentObj.intent === "view_by_dimension") {
              const groups = mapQuestionReviewToDimensionGroups(questionReviewData);
              const sections = groups.map(g => {
                const scaleLabels = g.scaleTypes.map(st => st === 'likert_5' ? 'Likert 5 puntos' : st === 'nps_0_10' ? 'NPS 0–10' : st).join(', ');
                return {
                  type: 'dimension_group' as const,
                  content: `Dimensión: ${g.dimensionName}\nPreguntas: ${g.questionCount}\nEscalas: ${scaleLabels}\nPor revisar: ${g.needsReviewCount}`
                };
              });
              const convResponse: QuestionReviewConversationResponse = {
                responseId: `dimension-groups-overview`,
                intro: `Aquí están las preguntas agrupadas por dimensión:`,
                sections,
                suggestedTextCommands: [
                  "1. Ver preguntas que requieren revisión",
                  "2. Ver resumen",
                  "3. Confirmar esta sección"
                ],
                status: 'info'
              };
              const msg = formatConversationResponse(convResponse);
              void simulateChatFlow([{ id: `msg_assistant_qs_dims_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }

            if (intentObj.intent === "view_needs_review") {
              const needsReviewList = mapQuestionReviewToNeedsReviewList(questionReviewData);
              const convResponse = mapQuestionReviewNeedsReviewToConversation(needsReviewList);
              const msg = formatConversationResponse(convResponse);
              void simulateChatFlow([{ id: `msg_assistant_qs_needs_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }

            if (intentObj.intent === "view_question_detail") {
              const index = intentObj.targetQuestionDisplayIndex;
              if (index === undefined) {
                void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor especifica el número de pregunta (ej: ver pregunta 3).", timestamp: "2025-01-01T12:00:00.000Z" }]);
                return;
              }
              const detail = mapQuestionReviewToQuestionDetail(questionReviewData, String(index));
              if (!detail) {
                void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: `No encontré la pregunta #${index}.`, timestamp: "2025-01-01T12:00:00.000Z" }]);
                return;
              }
              const convResponse = mapQuestionReviewQuestionDetailToConversation(detail);
              const msg = formatConversationResponse(convResponse);
              void simulateChatFlow([{ id: `msg_assistant_qs_detail_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }

            if (intentObj.intent === "change_question_dimension") {
              const index = intentObj.targetQuestionDisplayIndex;
              const dimName = intentObj.targetDimensionName;
              if (index === undefined || !dimName) {
                void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor especifica la pregunta y la dimensión.", timestamp: "2025-01-01T12:00:00.000Z" }]);
                return;
              }

              let updatedQuestion: QuestionReviewItem | null = null;
              setQuestionReviewData(prev => {
                const next = [...prev];
                const qIdx = next.findIndex(q => q.displayIndex === index);
                if (qIdx !== -1) {
                  next[qIdx] = {
                    ...next[qIdx],
                    dimensionAssignment: {
                      dimensionId: `dim_${dimName.toLowerCase().replace(/\s+/g, '_')}`,
                      dimensionName: dimName,
                      source: 'user_corrected',
                      confidence: 'high'
                    },
                    status: 'edited'
                  };
                  updatedQuestion = next[qIdx];
                }
                return next;
              });

              setTimeout(() => {
                if (!updatedQuestion) {
                  void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: `No encontré la pregunta #${index}.`, timestamp: "2025-01-01T12:00:00.000Z" }]);
                  return;
                }
                const detail = mapQuestionReviewToQuestionDetail(questionReviewData, String(index));
                if (detail) {
                  detail.dimensionName = dimName;
                  detail.status = 'edited';
                  detail.statusLabel = 'Editada';
                }
                const msg = `Listo. Actualicé la pregunta ${index} en esta revisión.\n\nPregunta ${index}\nTipo de pregunta: ${detail?.questionTypeLabel || 'Escala de valoración'}\nTipo de escala: ${detail?.scaleTypeLabel || 'Likert 5 puntos'}\nDimensión: ${dimName}\nEstado: Editada\n\nPuedes responder:\n1. Ver preguntas que requieren revisión\n2. Ver otra pregunta\n3. Confirmar esta sección`;
                void simulateChatFlow([{ id: `msg_assistant_qs_edit_dim_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              }, 50);
              return;
            }

            if (intentObj.intent === "change_question_type") {
              const index = intentObj.targetQuestionDisplayIndex;
              const qType = intentObj.targetQuestionType;
              if (index === undefined || !qType) {
                void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor especifica la pregunta y el tipo de pregunta.", timestamp: "2025-01-01T12:00:00.000Z" }]);
                return;
              }

              let updatedQuestion: QuestionReviewItem | null = null;
              setQuestionReviewData(prev => {
                const next = [...prev];
                const qIdx = next.findIndex(q => q.displayIndex === index);
                if (qIdx !== -1) {
                  next[qIdx] = {
                    ...next[qIdx],
                    questionType: qType,
                    status: 'edited'
                  };
                  updatedQuestion = next[qIdx];
                }
                return next;
              });

              setTimeout(() => {
                if (!updatedQuestion) {
                  void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: `No encontré la pregunta #${index}.`, timestamp: "2025-01-01T12:00:00.000Z" }]);
                  return;
                }
                const detail = mapQuestionReviewToQuestionDetail(questionReviewData, String(index));
                if (detail) {
                  detail.questionType = qType;
                  detail.questionTypeLabel = qType === 'nps' ? 'NPS' : qType === 'enps' ? 'eNPS' : qType === 'open_text' ? 'Texto abierto' : qType;
                  detail.status = 'edited';
                  detail.statusLabel = 'Editada';
                }
                const msg = `Listo. Actualicé la pregunta ${index} en esta revisión.\n\nPregunta ${index}\nTipo de pregunta: ${detail?.questionTypeLabel}\nTipo de escala: ${detail?.scaleTypeLabel}\nDimensión: ${detail?.dimensionName}\nEstado: Editada\n\nPuedes responder:\n1. Ver preguntas que requieren revisión\n2. Ver otra pregunta\n3. Confirmar esta sección`;
                void simulateChatFlow([{ id: `msg_assistant_qs_edit_type_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              }, 50);
              return;
            }

            if (intentObj.intent === "change_scale_type") {
              const index = intentObj.targetQuestionDisplayIndex;
              const sType = intentObj.targetScaleType;
              if (index === undefined || !sType) {
                void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor especifica la pregunta y el tipo de escala.", timestamp: "2025-01-01T12:00:00.000Z" }]);
                return;
              }

              let updatedQuestion: QuestionReviewItem | null = null;
              setQuestionReviewData(prev => {
                const next = [...prev];
                const qIdx = next.findIndex(q => q.displayIndex === index);
                if (qIdx !== -1) {
                  next[qIdx] = {
                    ...next[qIdx],
                    scaleType: sType,
                    scaleDetail: getScaleDetailByScaleType(sType),
                    status: 'edited'
                  };
                  updatedQuestion = next[qIdx];
                }
                return next;
              });

              setTimeout(() => {
                if (!updatedQuestion) {
                  void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: `No encontré la pregunta #${index}.`, timestamp: "2025-01-01T12:00:00.000Z" }]);
                  return;
                }
                const detail = mapQuestionReviewToQuestionDetail(questionReviewData, String(index));
                if (detail) {
                  detail.scaleType = sType;
                  detail.scaleTypeLabel = sType === 'likert_5' ? 'Likert 5 puntos' : sType === 'nps_0_10' ? 'NPS 0–10' : sType;
                  detail.status = 'edited';
                  detail.statusLabel = 'Editada';
                }
                const msg = `Listo. Actualicé la pregunta ${index} en esta revisión.\n\nPregunta ${index}\nTipo de pregunta: ${detail?.questionTypeLabel}\nTipo de escala: ${detail?.scaleTypeLabel}\nDimensión: ${detail?.dimensionName}\nEstado: Editada\n\nPuedes responder:\n1. Ver preguntas que requieren revisión\n2. Ver otra pregunta\n3. Confirmar esta sección`;
                void simulateChatFlow([{ id: `msg_assistant_qs_edit_scale_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              }, 50);
              return;
            }

            if (intentObj.intent === "confirm_question") {
              const index = intentObj.targetQuestionDisplayIndex;
              if (index === undefined) {
                void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor especifica el número de pregunta (ej: confirma la pregunta 4).", timestamp: "2025-01-01T12:00:00.000Z" }]);
                return;
              }

              let updatedQuestion: QuestionReviewItem | null = null;
              setQuestionReviewData(prev => {
                const next = [...prev];
                const qIdx = next.findIndex(q => q.displayIndex === index);
                if (qIdx !== -1) {
                  next[qIdx] = {
                    ...next[qIdx],
                    status: 'confirmed'
                  };
                  updatedQuestion = next[qIdx];
                }
                return next;
              });

              setTimeout(() => {
                if (!updatedQuestion) {
                  void simulateChatFlow([{ id: `msg_assistant_qs_err_${generateId()}`, role: "assistant", type: "text", content: `No encontré la pregunta #${index}.`, timestamp: "2025-01-01T12:00:00.000Z" }]);
                  return;
                }
                const detail = mapQuestionReviewToQuestionDetail(questionReviewData, String(index));
                if (detail) {
                  detail.status = 'confirmed';
                  detail.statusLabel = 'Confirmada';
                }
                const msg = `Confirmé la pregunta ${index}.\n\nPregunta ${index}\nTipo de pregunta: ${detail?.questionTypeLabel}\nTipo de escala: ${detail?.scaleTypeLabel}\nDimensión: ${detail?.dimensionName}\nEstado: Confirmada\n\nPuedes responder:\n1. Ver preguntas que requieren revisión\n2. Ver otra pregunta\n3. Confirmar esta sección`;
                void simulateChatFlow([{ id: `msg_assistant_qs_confirm_q_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              }, 50);
              return;
            }

            if (intentObj.intent === "confirm_section") {
              const currentSummary = recalculateSummary(questionReviewData);
              if (!currentSummary.canConfirmSection) {
                const stateObj = mapQuestionReviewToSectionConfirmationState(questionReviewData);
                const convResponse = mapQuestionReviewConfirmationStateToConversation(stateObj);
                const msg = formatConversationResponse(convResponse);
                void simulateChatFlow([{ id: `msg_assistant_qs_blocked_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              } else {
                setConversationalEditState("reviewing_demographics");
                const msg = `Sección 1/7 · Preguntas y escalas confirmada.\n\nResumen final:\n• ${currentSummary.totalQuestions} preguntas revisadas\n• ${currentSummary.totalQuestions} preguntas con tipo asignado\n• ${currentSummary.totalQuestions - currentSummary.questionsByScaleType.filter(s => s.scaleType === 'not_applicable').reduce((acc, curr) => acc + curr.questionCount, 0)} preguntas con escala asignada\n• ${currentSummary.questionsByScaleType.filter(s => s.scaleType === 'not_applicable').reduce((acc, curr) => acc + curr.questionCount, 0)} pregunta abierta sin escala\n• ${currentSummary.totalQuestions} preguntas con dimensión\n• 0 preguntas no interpretables\n\nAvanzando a 2/7 · Demográficos...\n\n` + getMatchReviewSectionMessage("demographics", scope, false);
                void simulateChatFlow([{ id: `msg_assistant_sec_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              }
              return;
            }

            if (intentObj.intent === "ambiguous_input" || intentObj.intent === "invalid_input") {
              const msg = intentObj.clarificationPrompt || `Necesito un poco más de precisión. Puedes decir, por ejemplo:\n“cambia la escala de la pregunta 5 a Likert 5”\no\n“cambia la dimensión de la pregunta 3 a Liderazgo”.`;
              void simulateChatFlow([{ id: `msg_assistant_qs_amb_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }

            const msg = intentObj.clarificationPrompt || `Necesito un poco más de precisión. Puedes decir, por ejemplo:\n“cambia la escala de la pregunta 5 a Likert 5”\no\n“cambia la dimensión de la pregunta 3 a Liderazgo”.`;
            void simulateChatFlow([{ id: `msg_assistant_qs_inv_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "reviewing_demographics") {
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation") {
              setConversationalEditState("reviewing_participants_or_responses");
              const msg = getMatchReviewSectionMessage("participants_or_responses", scope, false);
              void simulateChatFlow([{ id: `msg_assistant_sec_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor responde 'confirmar' o 'ver detalles'.", timestamp: "2025-01-01T12:00:00.000Z" }]);
            }
            return;
          }

          if (conversationalEditState === "reviewing_participants_or_responses") {
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation") {
              setConversationalEditState("reviewing_dimensions");
              const msg = getMatchReviewSectionMessage("dimensions", scope, false);
              void simulateChatFlow([{ id: `msg_assistant_sec_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor responde 'confirmar' o 'ver detalles'.", timestamp: "2025-01-01T12:00:00.000Z" }]);
            }
            return;
          }

          if (conversationalEditState === "reviewing_dimensions") {
            // For dimensions, we have "1. Confirmar dimensiones", "2. Renombrar una dimensión por chat", "3. Ver lista"
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation" || normalizedInput === "1" || normalizedInput.includes("confirmar")) {
              setConversationalEditState("reviewing_question_dimension_mapping");
              const msg = getMatchReviewSectionMessage("question_dimension_mapping", scope, false);
              void simulateChatFlow([{ id: `msg_assistant_sec_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else if (normalizedInput === "2" || normalizedInput.includes("renombrar")) {
              setConversationalEditState("asking_dimension");
              setConversationalEditContext({ area: "dimensiones" });
              const msg = `Estas son las dimensiones detectadas:\n${getDimensionsList(globalOverlayState)}\n\n¿Cuál quieres renombrar? (Responde con el número)`;
              void simulateChatFlow([{ id: `msg_assistant_edit_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else if (normalizedInput === "3" || normalizedInput.includes("lista")) {
              const msg = `Dimensiones:\n${getDimensionsList(globalOverlayState)}\n\n¿Confirmas esta sección?`;
              void simulateChatFlow([{ id: `msg_assistant_list_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor responde 1, 2 o 3.", timestamp: "2025-01-01T12:00:00.000Z" }]);
            }
            return;
          }

          if (conversationalEditState === "reviewing_question_dimension_mapping") {
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation") {
              setConversationalEditState("reviewing_segments");
              const msg = getMatchReviewSectionMessage("segments", scope, false);
              void simulateChatFlow([{ id: `msg_assistant_sec_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor responde 'confirmar' o 'ver detalles'.", timestamp: "2025-01-01T12:00:00.000Z" }]);
            }
            return;
          }

          if (conversationalEditState === "reviewing_segments") {
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation") {
              setConversationalEditState("reviewing_privacy");
              const msg = getMatchReviewSectionMessage("privacy", scope, false);
              void simulateChatFlow([{ id: `msg_assistant_sec_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor responde 'confirmar' o 'ver detalles'.", timestamp: "2025-01-01T12:00:00.000Z" }]);
            }
            return;
          }

          if (conversationalEditState === "reviewing_privacy") {
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation") {
              setConversationalEditState("awaiting_structure_approval");
              const msg = getMatchReviewSectionMessage("complete", scope, false);
              void simulateChatFlow([{ id: `msg_assistant_sec_${generateId()}`, role: "assistant", type: "text", content: msg, timestamp: "2025-01-01T12:00:00.000Z" }]);
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor responde 'confirmar' o 'ver detalles'.", timestamp: "2025-01-01T12:00:00.000Z" }]);
            }
            return;
          }
        }
      }

      if (intent === "cancel_import") {
        setChatStarted(false);
        setStagedFiles([]);
        setGlobalOverlayState({});
        setConversationalEditState("idle");
        setSelectedSurveyScope(null);
        setConversationalEditContext({});
        setMessages([
          initialMessages[0],
          {
            id: `msg_assistant_cancel_${generateId()}`,
            role: "assistant",
            type: "text",
            content: "Importación cancelada. Puedes volver a subir los archivos para iniciar una nueva carga histórica.",
            timestamp: "2025-01-01T12:00:00.000Z",
          }
        ]);
        return;
      }

      if (intent === "open_draft_preview") {
        void simulateChatFlow([{
          id: `msg_user_preview_${generateId()}`,
          role: "user",
          type: "text",
          content: text.trim(),
          timestamp: "2025-01-01T12:00:00.000Z",
        }]);
        setTimeout(() => {
          setViewMode("draft_preview");
        }, 300);
        return;
      }

      if (conversationalEditState === "awaiting_structure_approval" as ConversationalEditState) {
        if (intent === "approve_structure_and_review_results" || intent === "skip_current_section") {
          setConversationalEditState("showing_results_review" as ConversationalEditState);
          let resultsMsg = `Estructura aprobada localmente.\nNo se ejecutó importación ni se guardaron datos.\n\nAhora revisemos los resultados detectados para ${selectedSurveyScope === "qs_clima_2025" ? "QS Clima 2025" : selectedSurveyScope === "qs_clima_2024" ? "QS Clima 2024" : "QS Clima multicíclo"}.\n\n`;
          resultsMsg += `📊 Resultados detectados\n`;
          resultsMsg += `- Métricas agregadas disponibles: Percepción Negativa, Percepción Neutra, Percepción Positiva, Total de respuestas, Favorabilidad, Participación, eNPS Score.\n`;
          resultsMsg += `- Participación / respuestas agregadas: ${qsClimaDemoMetadata?.aggregatedParticipationCount || 'pendiente de confirmación'}.\n`;
          resultsMsg += `- Segmentos disponibles: Total compañía + cortes por gerencia.\n`;
          resultsMsg += `- Privacidad: no se muestran respuestas individuales, personas, IDs, correos ni comentarios abiertos.\n\n`;
          resultsMsg += `¿Qué quieres revisar de los resultados?\n\n1. Métricas detectadas\n2. Participación / respuestas\n3. Segmentos por gerencia\n4. Preview del borrador\n5. Cancelar importación`;

          void simulateChatFlow([{
            id: `msg_assistant_approve_${generateId()}`,
            role: "assistant",
            type: "text",
            content: resultsMsg,
            timestamp: "2025-01-01T12:00:00.000Z",
          }]);
          return;
        } else if (intent === "start_structure_name_adjustment") {
          setConversationalEditState("asking_edit_area");
          void simulateChatFlow([{
            id: `msg_assistant_adjust_${generateId()}`,
            role: "assistant",
            type: "text",
            content: "¿Qué quieres revisar o ajustar primero?\n\nPuedes responder:\n- dimensiones\n- preguntas",
            timestamp: "2025-01-01T12:00:00.000Z",
          }]);
          return;
        } else if (intent === "show_selected_scope_files") {
          if (selectedSurveyScope === "qs_clima_2025") {
            let filesMsg = `🗂️ Archivos 2025 asociados\n`;
            filesMsg += `- Resultdos Clima total QS 2025.xlsx — archivo principal\n`;
            filesMsg += `- Resultado Gerencia Agropecuario 2025.xlsx — corte por gerencia\n`;
            filesMsg += `- Resultados Administracion y finanzas 2025.xlsx — corte por gerencia\n`;
            filesMsg += `- Resultados Gerencia Comercial 2025.xlsx — corte por gerencia\n`;
            filesMsg += `- Resultados Gerencia General 2025.xlsx — corte por gerencia\n`;
            filesMsg += `- Resultados Gerencia Industrial 2025.xlsx — corte por gerencia\n`;
            filesMsg += `- Resultados Gerencia Marketing 2025.xlsx — corte por gerencia\n`;
            filesMsg += `- Resultados Gerencia Personas y Organizacion 2025.xlsx — corte por gerencia\n`;
            filesMsg += `- Resultados Gerencia Supply Chain 2025.xlsx — corte por gerencia\n`;
            void simulateChatFlow([{
              id: `msg_assistant_files_${generateId()}`,
              role: "assistant",
              type: "text",
              content: filesMsg + "\n¿Qué quieres hacer ahora?\n1. Aprobar esta estructura y revisar los resultados detectados\n2. Ajustar nombres de dimensiones o preguntas\n3. Cancelar importación",
              timestamp: "2025-01-01T12:00:00.000Z",
            }]);
          } else {
            void simulateChatFlow([{
              id: `msg_assistant_files_${generateId()}`,
              role: "assistant",
              type: "text",
              content: "🗂️ Archivos asociados:\n- Resultados Encuesta de Clima 2024.xlsx\n\n¿Qué quieres hacer ahora?\n1. Aprobar esta estructura\n2. Cancelar",
              timestamp: "2025-01-01T12:00:00.000Z",
            }]);
          }
          return;
        }
      }

      if (conversationalEditState === "showing_results_review" as ConversationalEditState) {
        if (["preview", "ver preview", "4"].includes(text.trim().toLowerCase())) {
          setViewMode("draft_preview");
          return;
        } else {
          void simulateChatFlow([{
            id: `msg_assistant_results_generic_${generateId()}`,
            role: "assistant",
            type: "text",
            content: "Para ver el borrador, escribe '4' o 'preview'.",
            timestamp: "2025-01-01T12:00:00.000Z",
          }]);
          return;
        }
      }

      const normalizedText = text.trim().toLowerCase();
      if (conversationalEditState !== "idle" || /preguntas|dimensiones|demográficos|demograficos|métricas|metricas|segmentos|decisiones|menu|menú|volver/i.test(normalizedText) || intent === "show_review_menu") {
        const response = handleConversationalEdit(text, conversationalEditState as ConversationalEditState, conversationalEditContext, globalOverlayState);
        setConversationalEditState(response.newState);
        setConversationalEditContext(response.newContext);

        if (response.applyOverlay) {
          const finalOverlay = {
            ...globalOverlayState,
            [response.applyOverlay.id]: response.applyOverlay.label
          };
          setGlobalOverlayState(finalOverlay);

          // Optionally update previous message showing structure
          setMessages(prev => prev.map(m => {
            if (m.type === "guided_review_step" && m.id.startsWith("msg_assistant_qs_clima_review")) {
              return {
                ...m,
                content: mapDemoFixtureToStructureReviewMessage(qsClimaDemoFixture, finalOverlay, selectedSurveyScope || "qs_clima_multicycle_2024_2025")
              };
            }
            return m;
          }));
        }

        void simulateChatFlow([{
          id: `msg_assistant_edit_${generateId()}`,
          role: "assistant",
          type: "text",
          content: response.message,
          timestamp: "2025-01-01T12:00:00.000Z",
        }]);
        return;
      }

      void simulateChatFlow([{
        id: `msg_assistant_generic_${generateId()}`,
        role: "assistant",
        type: "text",
        content: "Por favor adjunta el archivo de la encuesta si deseas procesarla, o descríbela para que te guíe.",
        timestamp: "2025-01-01T12:00:00.000Z",
      }]);
    }
  };

  const handleSandboxFilesSelected = (files: import("./SandboxUploadPanel").SandboxFileMetadata[]) => {
    const ts = generateId();
    const isoString = "2025-01-01T12:00:00.000Z";

    const rawFiles = files.map(f => f.rawFile).filter(Boolean) as File[];
    if (rawFiles.length > 0) {
      setStagedFiles(rawFiles);
    }

    setMessages((prev) => prev.filter(m => m.type !== "sandbox_upload_panel"));

    const newMsgs: import("./conversationalImportTypes").ChatMessage[] = [];

    newMsgs.push({
      id: `msg_assistant_files_selected_${ts}`,
      role: "assistant",
      type: "sandbox_files_selected",
      content: "Recibí los archivos en modo sandbox.",
      sandboxFiles: files,
      timestamp: isoString,
    });

    if (rawFiles.length > 0 && isQsClimaDemoFixture(rawFiles)) {
      const ambiguityContext: WorkspaceAmbiguityContext = {
        stagedFileNames: rawFiles.map(f => f.name),
        selectedSurveyScope: null,
        currentWizardState: "awaiting_survey_scope_selection",
        userLastText: "",
        surveyName: "",
        surveyTypeConfirmed: false,
        inferredSurveyType: "",
        visibilityConfirmed: false,
        inferredVisibility: "",
        surveyEndDate: null,
        confidentialityThreshold: null,
        hasPrivacyRisk: false,
      };

      const detectionInput = mapWorkspaceToAmbiguityDetectionInput(ambiguityContext);
      const snapshot = detectHistoricalImportAmbiguities(detectionInput);
      const ambiguity = snapshot.activeAmbiguity;

      setConversationalEditState("awaiting_survey_scope_selection");
      setActiveAmbiguity(ambiguity ?? null);

      if (ambiguity?.type === "MultipleSurveyScopeAmbiguity") {
        const cfMessages = mapAmbiguityResolutionToChatMessages(snapshot);
        const runtimeMessages = cfMessages
          .filter(m => m.kind !== "thinking")
          .map(mapChatFoundationToRuntimeMessage);
        newMsgs.push(...runtimeMessages);
      } else {
        newMsgs.push({
          id: `msg_assistant_scope_selection_${generateId()}`,
          role: "assistant",
          type: "guided_review_step",
          content: "Detecté más de una encuesta o ciclo en los archivos cargados.\n\n1. QS Clima 2025\n2. QS Clima 2024\n3. Carga histórica multicíclo QS Clima 2024/2025\n\n¿Qué quieres procesar primero? Responde 1, 2 o 3.",
          timestamp: "2025-01-01T12:00:00.000Z",
        });
      }

      void simulateChatFlow(newMsgs);
      return;
    }

    const groups = detectSurveyGroupsWithSegments(rawFiles);

    if (groups.length > 1) {
      newMsgs.push({
        id: `msg_assistant_group_decision_${generateId()}`,
        role: "assistant",
        type: "guided_review_step",
        content: "🎯 Encontré más de una encuesta en los archivos cargados.\n\n🔎 **Qué detecté:**\nDetecté grupos que parecen corresponder a encuestas distintas, por ejemplo " + groups.map(g => g.name).join(", ") + ".\n\n⚠️ **Impacto en la carga histórica:**\nLa carga histórica se procesa una encuesta a la vez. Si mezclamos ciclos o estructuras distintas, las preguntas, demográficos y participantes pueden quedar mal clasificados.\n\n✅ **Recomendación:**\nTe recomiendo procesar primero el grupo con mayor consistencia estructural.\n\n➡️ **¿Cuál encuesta quieres procesar primero?**",
        nextActions: [
          ...groups.map(g => ({
            id: `process_${g.id}`,
            label: `Procesar ${g.name}`,
            actionType: `start_local_analysis_${g.id}`
          })),
          { id: "view_groups", label: "Ver detalle de grupos", actionType: "detail_groups" },
          { id: "cancel", label: "Cancelar", actionType: "cancel_analysis" }
        ],
        timestamp: "2025-01-01T12:00:00.000Z",
      });
    }

    void simulateChatFlow(newMsgs, { keepThinkingAfter: true }).then(() => {
      if (groups.length <= 1 && rawFiles.length > 0) {
        setTimeout(() => handleLocalAnalysisStart(rawFiles).finally(() => {
          setIsProcessingNextStep(false);
        }), 500);
      } else {
        setIsProcessingNextStep(false);
      }
    });
  };

  const handleExpectedFormat = () => {
    setMessages([]);
    setChatStarted(true);
    setViewMode("chat");
    void simulateChatFlow(simulatedFormatMessages());
  };

  const handleAction = (actionType: string) => {
    initAudioSync();
    if (actionType.startsWith("start_local_analysis")) {
      const groupId = actionType.replace("start_local_analysis_", "");
      if (groupId && groupId !== "start_local_analysis") {
        const groups = detectSurveyGroupsWithSegments(stagedFiles);
        const selectedGroup = groups.find(g => g.id === groupId);
        if (selectedGroup) {
          void handleLocalAnalysisStart(selectedGroup.files, selectedGroup);
          return;
        }
      }
      void handleLocalAnalysisStart();
      return;
    }
    if (actionType === "cancel_analysis") {
      void simulateChatFlow([{ id: `msg_cancel_${generateId()}`, role: "assistant", type: "text", content: "Análisis cancelado.", timestamp: "2025-01-01T12:00:00.000Z" }]);
      return;
    }

    if (actionType.startsWith("decision_action_")) {
      if (["decision_action_accept_group_suggestion", "decision_action_choose_main_file", "decision_action_mark_separate", "decision_action_custom_group"].includes(actionType)) {
        let label = "Decisión tomada";
        if (actionType === "decision_action_accept_group_suggestion") label = "Aceptar sugerencia";
        else if (actionType === "decision_action_choose_main_file") label = "Elegir otro archivo principal";
        else if (actionType === "decision_action_mark_separate") label = "Marcar gerencias como archivos separados";
        else if (actionType === "decision_action_custom_group") label = "Escribir otra interpretación";

        setMessages((prev) => [
          ...prev,
          {
            id: `msg_user_decision_${generateId()}`,
            role: "user",
            type: "text",
            content: label,
            timestamp: "2025-01-01T12:00:00.000Z",
          }
        ]);
        void simulateChatFlow([{
          id: `msg_assistant_ack_${generateId()}`,
          role: "assistant",
          type: "text",
          content: "Entendido. (Mock: Aplicando configuración al grupo...)",
          timestamp: "2025-01-01T12:00:00.000Z",
        }]);
        return;
      }

      if (!draftContract || !draftContract.requiredUserDecisions) return;

      const currentDecision = draftContract.requiredUserDecisions[currentDecisionIndex];
      if (!currentDecision) return;

      const mapped = mapDecisionToExplanation(currentDecision);
      const clickedAction = mapped.actions.find(a => a.actionType === actionType);

      const userMessageText = clickedAction ? clickedAction.label : "Decisión tomada";

      // Mark as resolved
      const newResolvedIds = [...resolvedDecisionIds, currentDecision.id];
      setResolvedDecisionIds(newResolvedIds);
      const nextIndex = currentDecisionIndex + 1;
      setCurrentDecisionIndex(nextIndex);

      setMessages((prev) => {
        const newMessages = [...prev];
        const ts = generateId();
        const isoString = "2025-01-01T12:00:00.000Z";

        newMessages.push({
          id: `msg_user_decision_${ts}`,
          role: "user",
          type: "text",
          content: userMessageText,
          timestamp: isoString,
        });

        if (clickedAction && clickedAction.consequence) {
          newMessages.push({
            id: `msg_assistant_confirm_${ts}`,
            role: "assistant",
            type: "text",
            content: `Entendido. ${clickedAction.consequence}`,
            timestamp: "2025-01-01T12:00:00.000Z",
          });
        } else {
          newMessages.push({
            id: `msg_assistant_confirm_${ts}`,
            role: "assistant",
            type: "text",
            content: "Listo, dejé registrada esta decisión para esta importación.",
            timestamp: "2025-01-01T12:00:00.000Z",
          });
        }

        if (nextIndex < draftContract.requiredUserDecisions.length) {
          const nextDecision = draftContract.requiredUserDecisions[nextIndex];
          const nextMapped = mapDecisionToExplanation(nextDecision);
          const totalRemaining = draftContract.requiredUserDecisions.length - nextIndex;

          newMessages.push({
            id: `msg_assistant_next_decision_${generateId()}`,
            role: "assistant",
            type: "guided_review_step",
            content: `🎯 Quedan ${totalRemaining} decisiones pendientes.\n\n**${nextMapped.title}**\n\n🔎 **Qué detecté:**\n${nextMapped.detectedIssue}\n\n💡 **Por qué importa:**\n${nextMapped.whyItMatters}\n\n⚠️ **Impacto en la carga histórica:**\n${nextMapped.historicalLoadImpact}\n${nextMapped.recommendation ? `\n✅ **Recomendación:**\n${nextMapped.recommendation}\n` : ""}\n➡️ **${nextMapped.primaryQuestion}**`,
            nextActions: nextMapped.actions,
            timestamp: "2025-01-01T12:00:00.000Z",
          });
          return newMessages;
        } else {
          newMessages.push({
            id: `msg_assistant_drafting_${ts}`,
            role: "assistant",
            type: "text",
            content: "Todas las decisiones iniciales han sido resueltas. El borrador está listo para revisión final cuando lo solicites.",
            timestamp: isoString,
          });

          return newMessages;
        }
      });
      return;
    }

    if (actionType === "start_guided_review") {
      void simulateChatFlow(simulatedGuidedReviewStartMessages());
    } else if (actionType === "approve_files") {
      void simulateChatFlow([...simulatedFilesApprovedMessages(), ...simulatedDemographicsReviewStartMessages()]);
    } else if (actionType === "change_files") {
      void simulateChatFlow(simulatedFilesChangesMessages());
    } else if (actionType === "detail_files") {
      void simulateChatFlow([{
          id: `msg_detail_${generateId()}`,
          role: "assistant",
          type: "text",
          content: "Detalle de archivos: Se detectaron 2 archivos XLSX con estructura estándar. Total filas: ~2.7k.",
          timestamp: "2025-01-01T12:00:00.000Z",
      }]);
    } else if (actionType === "approve_demographics") {
      void simulateChatFlow(simulatedDemographicsApprovedMessages());
    } else if (actionType === "correct_demographics") {
      void simulateChatFlow(simulatedDemographicsChangesMessages());
    } else if (actionType === "detail_demographics") {
      void simulateChatFlow([{
          id: `msg_detail_demo_${generateId()}`,
          role: "assistant",
          type: "text",
          content: "Detalle de demográficos: Los campos Gerencia y Área parecen jerárquicos. Antigüedad y Cargo son categóricos simples.",
          timestamp: "2025-01-01T12:00:00.000Z",
      }]);
    } else if (actionType === "start_dimensions_review") {
      void simulateChatFlow(simulatedDimensionsReviewStartMessages());
    } else if (actionType === "approve_dimensions") {
      void simulateChatFlow(simulatedDimensionsApprovedMessages());
    } else if (actionType === "correct_dimensions") {
      void simulateChatFlow(simulatedDimensionsChangesMessages());
    } else if (actionType === "detail_dimensions") {
      void simulateChatFlow([{
          id: `msg_detail_dim_${generateId()}`,
          role: "assistant",
          type: "text",
          content: "Detalle de dimensiones: Se encontraron 4 dimensiones principales que agrupan las preguntas evaluadas.",
          timestamp: "2025-01-01T12:00:00.000Z",
      }]);
    } else if (actionType === "start_questions_review") {
      void simulateChatFlow(simulatedQuestionsReviewStartMessages());
    } else if (actionType === "review_comparable_questions") {
      void simulateChatFlow(simulatedQuestionsComparableReviewMessages());
    } else if (actionType === "review_new_questions") {
      void simulateChatFlow(simulatedQuestionsNewReviewMessages());
    } else if (actionType === "review_historical_questions") {
      void simulateChatFlow(simulatedQuestionsHistoricalReviewMessages());
    } else if (actionType === "approve_questions") {
      void simulateChatFlow(simulatedQuestionsApprovedMessages());
    } else if (actionType === "correct_questions") {
      void simulateChatFlow(simulatedQuestionsChangesMessages());
    } else if (actionType === "start_mappings_review") {
      void simulateChatFlow(simulatedMappingsReviewStartMessages());
    } else if (actionType === "review_pending_mappings") {
      void simulateChatFlow(simulatedMappingsPendingReviewMessages());
    } else if (actionType === "approve_automatic_mappings") {
      void simulateChatFlow(simulatedMappingsAutomaticApprovedMessages());
    } else if (actionType === "approve_mappings") {
      void simulateChatFlow(simulatedMappingsApprovedMessages());
    } else if (actionType === "correct_mappings") {
      void simulateChatFlow(simulatedMappingsChangesMessages());
    } else if (actionType === "detail_mappings") {
      void simulateChatFlow([{
          id: `msg_detail_map_${generateId()}`,
          role: "assistant",
          type: "text",
          content: "Detalle de mapeos: 21 automáticos y 3 pendientes de revisión.",
          timestamp: "2025-01-01T12:00:00.000Z",
      }]);
    } else if (actionType === "start_contract_review") {
      void simulateChatFlow(simulatedContractReviewStartMessages());
    } else if (actionType === "approve_contract") {
      void simulateChatFlow(simulatedContractApprovedMessages());
    } else if (actionType === "review_contract_summary") {
      void simulateChatFlow(simulatedContractReviewSummaryMessages());
    } else if (actionType === "return_to_mappings") {
      void simulateChatFlow(simulatedContractReturnToMappingsMessages());
    } else if (actionType === "review_structure") {
      // Ignored
    } else if (actionType === "adjust_by_chat") {
      setConversationalEditState("asking_edit_area");
      void simulateChatFlow([
        {
          id: `msg_user_adjust_${generateId()}`,
          role: "user",
          type: "text",
          content: "Ajustar por chat",
          timestamp: "2025-01-01T12:00:00.000Z",
        },
        {
          id: `msg_assistant_adjust_${generateId()}`,
          role: "assistant",
          type: "text",
          content: "¿Qué quieres revisar o ajustar primero?\n\nPuedes responder:\n- dimensiones\n- preguntas\n- demográficos\n- métricas\n- segmentos\n- decisiones pendientes",
          timestamp: "2025-01-01T12:00:00.000Z",
        }
      ]);
    } else if (actionType === "preview_draft") {
      setViewMode("draft_preview");
    }
  };

  const handleLocalAnalysisStart = async (filesToProcess: File[] = stagedFiles, selectedGroup?: import("./surveyGroupingPolicy").SurveyGroup) => {
    initAudioSync();
    const files = filesToProcess.length > 0 ? filesToProcess : stagedFiles;
    if (files.length === 0) {
      setMessages((prev) => [...prev, { id: `msg_err_${generateId()}`, role: "assistant", type: "warning", content: "No hay archivo cargado en memoria local.", timestamp: "2025-01-01T12:00:00.000Z" }]);
      return;
    }

    const file = files[0];
    const ts = generateId();
    const isoString = "2025-01-01T12:00:00.000Z";

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_assistant_parsing_${ts}`,
        role: "assistant",
        type: "analysis_progress",
        content: "Estoy analizando la estructura del archivo…",
        timestamp: isoString,
      }
    ]);

    try {
      const preview = await parseWorkbookPreview(file);

      if (preview.errors && preview.errors.length > 0) {
        setMessages((prev) => prev.filter(m => m.type !== "analysis_progress"));
        void simulateChatFlow([
          {
            id: `msg_assistant_parse_error_${generateId()}`,
            role: "assistant",
            type: "warning",
            content: `No pude analizar la estructura del archivo.\nRazón: ${preview.errors[0]?.message || "Error desconocido"}`,
            timestamp: "2025-01-01T12:00:00.000Z",
          }
        ]);
        return;
      }

      const contract = assembleDraftSurveyFileAnalysisContract({
        parsedPreview: preview,
        mockCatalogs: mockUbitsCatalogs,
        mode: "INTERACTIVE",
        options: {}
      });

      const safeInput = {
        fileName: file.name,
        sheets: preview.sheets.map(s => ({
          sheetName: s.sheetName,
          rowCount: s.rowCount,
          columnCount: s.columnCount,
          nonEmptyCellCount: s.rowCount * s.columnCount,
          sampleColumnLabels: s.headerDetection?.headerValues || [],
          sampleCellPatterns: [],
          detectedTextSignals: [],
          detectedNumericSignals: []
        }))
      };

      const analysisResult = mapWorkbookInspectionInputToAnalysis(safeInput);

      const matchingEngineOutput = runMatchingEngineIntegration(contract.draftContract!);
      const finalContract = matchingEngineOutput.draftContract;

      setDraftContract(finalContract);
      setCurrentDecisionIndex(0);
      setResolvedDecisionIds([]);

      // Filter out redundant group/ambiguity decisions if group was already selected
      const actionableDecisions = (finalContract.requiredUserDecisions || []).filter(d => {
        if (selectedGroup && (d.type === 'resolve_ambiguity' || d.promptDescription?.includes('group'))) {
          return false;
        }
        return true;
      });

      const confidenceMsg = getConfidenceExplanation(contract.draftContract!, selectedGroup, stagedFiles);


      const chatSummary = mapContentAnalysisToChatSummary(analysisResult, files.map(f => f.name));



      // 1. Mostrar primero el bloque de análisis (chatSummary)
      setMessages((prev) => [
        ...prev.filter(m => m.type !== "analysis_progress"),
        {
          id: `msg_assistant_content_analysis_${generateId()}`,
          role: "assistant",
          type: "text",
          content: chatSummary,
          timestamp: "2025-01-01T12:00:00.000Z",
        }
      ]);

      // 2. Esperar al fin visual del typewriter real, más una pausa visual constante.
      const proceed = await waitTypewriter(chatSummary.length, 600);
      if (!proceed) return;



      const firstSheet = analysisResult.analysis.sheets[0];
      const precheckInput = {
        fileName: file.name,
        sheetName: String(firstSheet?.sheetName || 'unknown'),
        sheetLayout: firstSheet?.layout || 'unknown',
        rowCount: Number(firstSheet?.rowCount || 0),
        columnCount: Number(firstSheet?.columnCount || 0),
        sampleColumnLabels: (firstSheet?.headerDetection?.sampleColumnLabels || []).map(String),
        detectedSignals: firstSheet?.headerDetection?.detectedSignals || [],
        classificationReason: analysisResult.capabilities.classificationReason || 'N/A',
        confidence: analysisResult.capabilities.canProfileColumns ? 'high' : 'low',
        participantIdentificationState: 'unknown',
        sourceFileRole: firstSheet?.suggestedRole || 'unknown',
      };

      const precheckResult = mapHomologationPrecheck(precheckInput);

      const safePrecheckResult = {
        isHomologationPossible: precheckResult.capabilities.canHomologate,
        reason: precheckResult.capabilities.classificationReason
      };

      const inventoryInput = {
        ...precheckInput,
        homologationPrecheckResult: safePrecheckResult
      };

      const inventoryResult = mapStructureInventory(inventoryInput);
      const inventoryMessage = mapStructureInventoryToChat(inventoryResult);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_assistant_inventory_${generateId()}`,
          role: "assistant",
          type: "text",
          content: inventoryMessage,
          timestamp: "2025-01-01T12:00:00.000Z",
        }
      ]);

      const proceedInventory = await waitTypewriter(inventoryMessage.length, 600);
      if (!proceedInventory) return;

      // 4. Decisiones pendientes en secuencia
      setMessages((prev) => {
        const newMessages: ChatMessage[] = [...prev];

        if (confidenceMsg) {
          if (typeof confidenceMsg === "string") {
            newMessages.push({
              id: `msg_assistant_confidence_${generateId()}`,
              role: "assistant",
              type: "warning",
              content: confidenceMsg,
              timestamp: "2025-01-01T12:00:00.000Z",
            });
          } else if (confidenceMsg.type === "actionable_decision") {
            newMessages.push({
              id: `msg_assistant_confidence_${generateId()}`,
              role: "assistant",
              type: "guided_review_step",
              content: `**${confidenceMsg.title}**\n\n${confidenceMsg.content}`,
              nextActions: confidenceMsg.nextActions,
              timestamp: "2025-01-01T12:00:00.000Z",
            });
          }
        } else if (actionableDecisions.length > 0) {
          const decision = actionableDecisions[0];
          const mapped = mapDecisionToExplanation(decision);
          newMessages.push({
            id: `msg_assistant_decision_${generateId()}`,
            role: "assistant",
            type: "guided_review_step",
            content: `🎯 Quedan ${actionableDecisions.length} decisiones pendientes.\n\n**${mapped.title}**\n\n🔎 **Qué detecté:**\n${mapped.detectedIssue}\n\n💡 **Por qué importa:**\n${mapped.whyItMatters}\n\n⚠️ **Impacto en la carga histórica:**\n${mapped.historicalLoadImpact}\n${mapped.recommendation ? `\n✅ **Recomendación:**\n${mapped.recommendation}\n` : ""}\n➡️ **${mapped.primaryQuestion}**`,
            nextActions: mapped.actions,
            timestamp: "2025-01-01T12:00:00.000Z",
          });
        }

        return newMessages;
      });

    } catch {
      setMessages((prev) => [
        ...prev.filter(m => m.type !== "analysis_progress"),
        {
          id: `msg_assistant_parse_fatal_${generateId()}`,
          role: "assistant",
          type: "warning",
          content: "No pude analizar la estructura del archivo.\nRazón: parser_failed",
          timestamp: "2025-01-01T12:00:00.000Z",
        }
      ]);
    } finally {
      setIsProcessingNextStep(false);
    }
  };


  return (
    <div className="flex h-screen w-screen bg-muted/30 p-6 gap-6 font-sans overflow-hidden">
      <input
        ref={sandboxFileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        multiple
        className="hidden"
        onChange={handleSandboxFileChange}
      />
      {/* Left Sidebar */}
      <ChatHistorySidebar
        onNewChat={handleNewChat}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
      />

      {/* Main Workspace Card */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-full">
        {/* Header Superior Discreto */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-card">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground">Importación de encuestas</h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Sandbox sintético
            </span>
          </div>
          {chatStarted && (
            <div className="flex gap-2">
            </div>
          )}
        </div>

        {/* Outer Workspace Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {!chatStarted ? (
            /* Estado Inicial Centrado */
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
              <h2 className="text-3xl font-bold tracking-tight text-center mb-2 text-foreground">
                Hola, ¿qué encuesta quieres <span className="text-ai-gradient font-bold">procesar</span>?
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Sube tu archivo para iniciar el proceso de carga histórica.
              </p>

              <div className="w-full mb-8 max-w-2xl mx-auto px-4">
                <MessageComposer onSend={handleComposerSend} />
              </div>

              {/* Quick Actions pills/botones sobrios en fila */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {quickActionItems.map((item) => (
                  item.id === "comparar" ? null :
                  <Button
                    key={item.id}
                    variant="outline"
                    onClick={() => {
                      if (item.id === "cargar") handleSandboxUploadStart();
                      else if (item.id === "formato") handleExpectedFormat();
                    }}
                    className="px-4 py-2 h-auto text-sm font-medium border border-border rounded-xl bg-card hover:bg-muted transition-colors text-foreground shadow-sm"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            /* Estado Activo */
            viewMode === "chat" ? (
              <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                {HISTORICAL_IMPORT_CHAT_FOUNDATION_RUNTIME_ENABLED ? (
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto w-full">
                      {messages.map((msg) => {
                        const mappedMsg = mapRuntimeMessageToChatFoundation(msg);
                        const isUser = msg.role === "user";
                        return (
                          <div key={msg.id} id={msg.id} className="w-full flex flex-col gap-2">
                            <ChatFoundationMessageRenderer message={mappedMsg} />
                            {!isUser && (
                              <div className="ml-11 flex flex-col gap-2 max-w-2xl">
                                {msg.type === "file_staging" && (
                                  <SyntheticAttachmentStaging />
                                )}

                                {msg.type === "synthetic_file_mount_summary" && (
                                  <SyntheticMountedFilesPanel
                                    files={msg.files || []}
                                    boundaryNote={msg.boundaryNote}
                                    nextActions={msg.nextActions}
                                    onAction={handleAction}
                                  />
                                )}

                                {msg.type === "guided_review_step" && msg.nextActions && msg.nextActions.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {msg.nextActions.map((action) => (
                                      <Button
                                        key={action.id}
                                        variant={
                                          action.actionType === "approve_files" ||
                                          action.actionType === "approve_demographics" ||
                                          action.actionType === "approve_dimensions" ||
                                          action.actionType === "approve_questions" ||
                                          action.actionType === "approve_mappings" ||
                                          action.actionType === "approve_automatic_mappings" ||
                                          action.actionType === "approve_contract"
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => handleAction(action.actionType)}
                                      >
                                        {action.label}
                                      </Button>
                                    ))}
                                  </div>
                                )}

                                {msg.type === "contract_summary" && (
                                  <ApprovedContractSummary />
                                )}

                                {msg.type === "sandbox_upload_panel" && (
                                  <SandboxUploadPanel onFilesSelected={handleSandboxFilesSelected} />
                                )}

                                {msg.type === "sandbox_files_selected" && msg.sandboxFiles && msg.sandboxFiles.length > 0 && (
                                  <div className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2 max-w-sm">
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span className="truncate min-w-0">
                                      {msg.sandboxFiles.slice(0, 3).map(f => f.name).join(", ")}
                                      {msg.sandboxFiles.length > 3 ? ` +${msg.sandboxFiles.length - 3} archivos más` : ""}
                                    </span>
                                  </div>
                                )}

                                {msg.type === "analysis_summary_blocks" && (
                                  <>
                                    {msg.visualBlocks && msg.visualBlocks.length > 0 && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {msg.visualBlocks.map((block, idx) => {
                                          const Icon = block.icon === "file" ? FileText :
                                                       block.icon === "users" ? Users :
                                                       block.icon === "database" ? Database :
                                                       block.icon === "alert" || block.icon === "warning" ? AlertCircle :
                                                       block.icon === "arrow_right" ? ArrowRight : FileText;
                                          return (
                                            <Card key={idx} className="bg-card border-border shadow-sm">
                                              <CardContent className="p-3 flex items-start gap-3">
                                                <div className="mt-0.5 shrink-0 text-primary bg-primary/10 p-1.5 rounded-md">
                                                  <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                  <span className="font-medium text-sm text-foreground">{block.title}</span>
                                                  <span className="text-xs text-muted-foreground leading-snug">{block.description}</span>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {msg.nextActions && msg.nextActions.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.nextActions.map((action) => (
                                          <Button
                                            key={action.id}
                                            variant={action.actionType === "start_local_analysis" ? "default" : "outline"}
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => handleAction(action.actionType)}
                                          >
                                            {action.label}
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}

                                {msg.type === "demographics_guided_review" && (
                                  <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {[
                                        { name: "Gerencia", status: "Alineado", action: "Mantener" },
                                        { name: "Área", status: "Requiere creación", action: "Crear en encuesta" },
                                        { name: "Cargo", status: "Requiere creación", action: "Crear en encuesta" },
                                        { name: "Antigüedad", status: "Alineado", action: "Mantener" }
                                      ].map(demo => (
                                        <Card key={demo.name} className="bg-card border-border shadow-sm">
                                          <CardContent className="p-3 flex items-center justify-between">
                                             <div>
                                               <p className="font-medium text-sm text-foreground">{demo.name}</p>
                                               <p className="text-xs text-muted-foreground">{demo.status}</p>
                                             </div>
                                             <Badge variant={demo.status === "Alineado" ? "secondary" : "outline"} className="text-[10px]">
                                               {demo.action}
                                             </Badge>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                    {msg.nextActions && msg.nextActions.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {msg.nextActions.map((action) => (
                                          <Button
                                            key={action.id}
                                            variant={action.actionType === "approve_demographics" ? "default" : "outline"}
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => handleAction(action.actionType)}
                                          >
                                            {action.label}
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {isProcessingNextStep && (() => {
                        const lastMsg = messages[messages.length - 1];
                        const isLastMsgThinking = lastMsg?.type === "analysis_progress";
                        if (isLastMsgThinking) return null;
                        return (
                          <ChatFoundationMessageRenderer
                            message={{
                              id: 'thinking_continuity',
                              role: 'assistant',
                              kind: 'thinking',
                              status: 'thinking',
                              tone: 'neutral',
                              content: '',
                              metadata: {
                                showAvatar: true,
                                showTimestamp: false,
                              }
                            }}
                          />
                        );
                      })()}
                    </div>
                  </ScrollArea>
                ) : (
                  <ChatTimeline
                    messages={messages}
                    onAction={handleAction}
                    onSandboxFilesSelected={handleSandboxFilesSelected}
                  />
                )}
                <div className="p-4 mx-auto w-full max-w-4xl shrink-0">
                  <MessageComposer
                    onSend={handleComposerSend}
                    placeholder={conversationalEditState === "reviewing_questions_and_scales" ? "Escribe una instrucción sobre preguntas y escalas" : undefined}
                  />
                </div>
              </div>
            ) : (
              /* Vista secundaria de revisión inline y detected structure panel */
              <div className="flex-1 flex min-h-0 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto">
                  {viewMode === "draft_preview" ? (
                    (() => {
                      const input = mapDemoFixtureToReadinessInput(qsClimaDemoFixture, globalOverlayState, selectedSurveyScope || "qs_clima_multicycle_2024_2025");
                      const readiness = evaluateDraftReadiness(input);
                      return (
                        <div className="flex flex-col h-full bg-card">
                          <div className="px-6 py-3 bg-muted/20 border-b shrink-0">
                            <p className="text-sm text-foreground">
                              <strong>Participación / respuestas incluidas:</strong> {qsClimaDemoMetadata?.aggregatedParticipationCount || 'pendiente de confirmación'} (Como dato agregado seguro)
                            </p>
                          </div>
                          <div className="flex-1 overflow-hidden relative">
                            <DraftReadinessPreview
                              input={input}
                              readiness={readiness}
                              onCancel={() => setViewMode("chat")}
                            />
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <>
                      <ApprovalProgressTracker />
                      <InlineReviewPanel
                        contract={draftContract}
                        currentDecisionIndex={currentDecisionIndex}
                        onAction={handleAction}
                      />
                    </>
                  )}
                </div>
                {viewMode !== "draft_preview" && (
                  <div className="w-80 flex-none bg-muted/10 border-l border-border hidden lg:block overflow-y-auto">
                    <DetectedStructurePanel />
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
