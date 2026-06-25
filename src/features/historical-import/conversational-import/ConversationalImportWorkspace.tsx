import { useState, useEffect } from "react";
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
  getSurveyNameSuggestion,
  getSurveyTypeSuggestion,
  getSurveyTypeLabel,
  getVisibilitySuggestion,
  getMainFileSuggestion,
  getAssociatedFilesList
} from "./conversationalGeneralConfigMapper";
import type { ConversationalGeneralConfiguration, ConversationalImportWizardStateId, ConversationalSurveyScope } from "./conversationalWizardTypes";
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

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const { wait, waitTypewriter, isMounted } = useMessageSequenceGate();

  const simulateChatFlow = async (newMessages: ChatMessage[]) => {
    initAudioSync();

    for (const msg of newMessages) {
      if (msg.role === "user") {
        setMessages(prev => [...prev, msg]);
      } else {
        const typingId = `typing_${generateId()}`;
        setMessages(prev => [...prev, {
          id: typingId,
          role: "assistant",
          type: "analysis_progress",
          content: "Pensando...",
          timestamp: "2025-01-01T12:00:00.000Z"
        }]);

        const proceedThinking = await wait(1500);
        if (!proceedThinking) return;

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== typingId);
          return [...filtered, msg];
        });

        if (msg.content) {
          const proceedTyping = await waitTypewriter(msg.content.length, 300);
          if (!proceedTyping) return;
        } else {
          const proceedWait = await wait(800);
          if (!proceedWait) return;
        }
      }
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
      }
    ]);

    setTimeout(() => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        try {
          fileInput.click();
        } catch {
          const btn = fileInput.parentElement?.querySelector('button') as HTMLButtonElement;
          if (btn) btn.focus();
        }
      }
    }, 100);
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
        setConversationalEditState("awaiting_survey_scope_selection");
        newMsgs.push({
          id: `msg_assistant_scope_selection_${generateId()}`,
          role: "assistant",
          type: "guided_review_step",
          content: "Detecté más de una encuesta o ciclo en los archivos cargados.\n\n1. QS Clima 2025\n2. QS Clima 2024\n3. Carga histórica multicíclo QS Clima 2024/2025\n\n¿Qué quieres procesar primero? Responde 1, 2 o 3.",
          timestamp: "2025-01-01T12:00:00.000Z",
        });

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

      void simulateChatFlow(newMsgs).then(() => {
        if (groups.length <= 1) {
          setTimeout(() => handleLocalAnalysisStart(files), 500);
        }
      });
    } else if (text.trim()) {
      const intent = detectIntent(text);

      if (conversationalEditState === "awaiting_survey_scope_selection") {
        let selectedScope: ConversationalSurveyScope | null = null;

        const normalizedInput = text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
        const scope1Keywords = ["1", "01", "opcion 1", "uno", "primera", "primer opcion", "primera opcion", "2025", "clima 2025", "qs clima 2025"];
        const scope2Keywords = ["2", "02", "opcion 2", "dos", "segunda", "segunda opcion", "2024", "clima 2024", "qs clima 2024"];
        const scope3Keywords = ["3", "03", "opcion 3", "tres", "tercera", "todo", "ambas", "ambos", "multiciclo", "procesar todo", "todo junto", "carga historica"];

        if (scope1Keywords.includes(normalizedInput) || intent === "select_scope_1") selectedScope = "qs_clima_2025";
        else if (scope2Keywords.includes(normalizedInput) || intent === "select_scope_2") selectedScope = "qs_clima_2024";
        else if (scope3Keywords.includes(normalizedInput) || intent === "select_scope_3") selectedScope = "qs_clima_multicycle_2024_2025";

        if (selectedScope) {
          setSelectedSurveyScope(selectedScope);
          setConversationalEditState("confirming_survey_name");
          const scopeLabel = selectedScope === "qs_clima_2025" ? "QS Clima 2025" : selectedScope === "qs_clima_2024" ? "QS Clima 2024" : "QS Clima Histórico 2024/2025";
          const suggestion = getSurveyNameSuggestion(selectedScope);
          void simulateChatFlow([{
            id: `msg_assistant_scope_selected_${generateId()}`,
            role: "assistant",
            type: "text",
            content: `Perfecto. Procesaré ${scopeLabel} como encuesta seleccionada.\n\nAntes de revisar la estructura, validaré la configuración general de la encuesta.\n\n1/6 · Nombre de la encuesta\n\nNombre sugerido: ${suggestion}.\n¿Quieres usar este nombre o escribir otro?`,
            timestamp: "2025-01-01T12:00:00.000Z",
          }]);
        } else {
          void simulateChatFlow([{
            id: `msg_assistant_scope_invalid_${generateId()}`,
            role: "assistant",
            type: "text",
            content: "Para continuar, responde 1, 2 o 3:\n1. QS Clima 2025\n2. QS Clima 2024\n3. Carga histórica multicíclo QS Clima 2024/2025",
            timestamp: "2025-01-01T12:00:00.000Z",
          }]);
        }
        return;
      }

      if (conversationalEditState === "confirming_survey_name" || conversationalEditState === "confirming_survey_type" || conversationalEditState === "confirming_visibility" || conversationalEditState === "confirming_confidentiality_threshold" || conversationalEditState === "confirming_main_file" || conversationalEditState === "confirming_associated_files") {
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
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `2/6 · Tipo de encuesta\n\nTipo sugerido: ${typeSuggestion}.\n¿Confirmas este tipo o quieres elegir otro?\n\nOpciones:\n1. Clima\n2. Engagement\n3. eNPS\n4. Mixta`, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "confirming_survey_type") {
            const suggestion = getSurveyTypeSuggestion(scope);
            const finalType = text.trim().toLowerCase();
            let resolvedType = suggestion;
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation" || finalType === "1" || finalType === "clima") {
              resolvedType = "climate";
            } else if (finalType === "2" || finalType === "engagement") {
              resolvedType = "engagement";
            } else if (finalType === "3" || finalType === "enps") {
              resolvedType = "enps";
            } else if (finalType === "4" || finalType === "mixta" || finalType === "mixto") {
              resolvedType = "mixed";
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor elige una opción válida (1, 2, 3, 4 o el nombre del tipo).", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
            setGeneralConfiguration(prev => ({ ...prev, surveyType: resolvedType }));
            setConversationalEditState("confirming_visibility");
            const visSuggestion = getVisibilitySuggestion() === 'anonymous' ? 'Anónima' : 'Privada';
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `3/6 · Visibilidad\n\nVisibilidad sugerida: ${visSuggestion}.\nEsto evita mostrar respuestas individuales o identificar personas.\n\nOpciones:\n1. Anónima\n2. Privada\n3. Pública`, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "confirming_visibility") {
            const suggestion = getVisibilitySuggestion();
            const finalVis = text.trim().toLowerCase();
            let resolvedVis = suggestion;
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation" || finalVis === "1" || finalVis === "anónima" || finalVis === "anonima") {
              resolvedVis = "anonymous";
            } else if (finalVis === "2" || finalVis === "privada") {
              resolvedVis = "private";
            } else if (finalVis === "3" || finalVis === "pública" || finalVis === "publica") {
              resolvedVis = "public";
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Por favor elige una opción válida (1, 2, 3 o el nombre de la visibilidad).", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
            setGeneralConfiguration(prev => ({ ...prev, visibility: resolvedVis }));
            setConversationalEditState("confirming_confidentiality_threshold");
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `4/6 · Umbral de confidencialidad\n\nUmbral sugerido: 5 respuestas por grupo.\nEsto evita mostrar cortes con muy pocas respuestas.\n\n¿Confirmas este umbral o quieres escribir otro número?`, timestamp: "2025-01-01T12:00:00.000Z" }]);
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
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: `5/6 · Archivo principal\n\nArchivo principal detectado:\n${fileSuggestion}\n\nLo usaré como referencia de estructura y resultados agregados.\n¿Confirmas este archivo principal?`, timestamp: "2025-01-01T12:00:00.000Z" }]);
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
              msgContent = `6/6 · Archivos asociados\n\nDetecté estos cortes por gerencia:\n${filesList.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\n¿Confirmas estos archivos asociados?`;
            } else {
              msgContent = `6/6 · Archivos asociados\n\nNo detecté archivos adicionales.\n\n¿Confirmas esta configuración?`;
            }
            void simulateChatFlow([{ id: `msg_assistant_next_${generateId()}`, role: "assistant", type: "text", content: msgContent, timestamp: "2025-01-01T12:00:00.000Z" }]);
            return;
          }

          if (conversationalEditState === "confirming_associated_files") {
            const normalizedText = text.trim().toLowerCase();
            if (intent === "confirm_general_config" || intent === "ambiguous_confirmation" || ["usar estos", "estan bien", "están bien"].some(w => normalizedText.includes(w))) {
              const updatedConfig = { ...generalConfiguration, associatedFileIds: getAssociatedFilesList(scope) };
              setGeneralConfiguration(updatedConfig);
              setConversationalEditState("awaiting_structure_approval");

              const summaryMsg = getGeneralConfigSummaryMessage(updatedConfig, scope);
              const reviewMsg = mapDemoFixtureToStructureReviewMessage(qsClimaDemoFixture, globalOverlayState, scope);

              void simulateChatFlow([
                { id: `msg_assistant_summary_${generateId()}`, role: "assistant", type: "text", content: summaryMsg, timestamp: "2025-01-01T12:00:00.000Z" },
                { id: `msg_assistant_review_${generateId()}`, role: "assistant", type: "guided_review_step", content: reviewMsg, timestamp: "2025-01-01T12:00:00.000Z" }
              ]);
              return;
            } else {
              void simulateChatFlow([{ id: `msg_assistant_err_${generateId()}`, role: "assistant", type: "text", content: "Esta fase solo permite confirmar o cancelar, el ajuste avanzado de archivos queda para una fase posterior. Por favor responde 'sí', 'confirmar', 'usar estos', etc. o escribe 'cancelar importación'.", timestamp: "2025-01-01T12:00:00.000Z" }]);
              return;
            }
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
      setConversationalEditState("awaiting_survey_scope_selection");
      newMsgs.push({
        id: `msg_assistant_scope_selection_${generateId()}`,
        role: "assistant",
        type: "guided_review_step",
        content: "Detecté más de una encuesta o ciclo en los archivos cargados.\n\n1. QS Clima 2025\n2. QS Clima 2024\n3. Carga histórica multicíclo QS Clima 2024/2025\n\n¿Qué quieres procesar primero? Responde 1, 2 o 3.",
        timestamp: "2025-01-01T12:00:00.000Z",
      });

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

    void simulateChatFlow(newMsgs).then(() => {
      if (groups.length <= 1 && rawFiles.length > 0) {
        setTimeout(() => handleLocalAnalysisStart(rawFiles), 500);
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
      setMessages((prev) => [...prev, { id: `msg_cancel_${generateId()}`, role: "assistant", type: "text", content: "Análisis cancelado.", timestamp: "2025-01-01T12:00:00.000Z" }]);
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
          },
          {
            id: `msg_assistant_ack_${generateId()}`,
            role: "assistant",
            type: "text",
            content: "Entendido. (Mock: Aplicando configuración al grupo...)",
            timestamp: "2025-01-01T12:00:00.000Z",
          }
        ]);
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
        setMessages((prev) => [
          ...prev.filter(m => m.type !== "analysis_progress"),
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
    }
  };


  return (
    <div className="flex h-screen w-screen bg-muted/30 p-6 gap-6 font-sans overflow-hidden">
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
                <ChatTimeline
                  messages={messages}
                  onAction={handleAction}
                  onSandboxFilesSelected={handleSandboxFilesSelected}
                />
                <div className="p-4 mx-auto w-full max-w-4xl shrink-0">
                  <MessageComposer onSend={handleComposerSend} />
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
