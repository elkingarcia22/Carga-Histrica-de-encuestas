import { useState } from "react";
import { parseWorkbookPreview } from "../local-parser/localParser";
import { assembleDraftSurveyFileAnalysisContract } from "../contract-assembler";
import { mockUbitsCatalogs } from "../mock-ubits-catalogs/mockUbitsCatalogs";
import { mapContractToSummaryBlock } from "./parserContractChatMapper";
import { runMatchingEngineIntegration } from "./matchingIntegrationMapper";
import { detectSurveyGroups } from "./surveyGroupingMapper";
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

export function ConversationalImportWorkspace() {
  const [chatStarted, setChatStarted] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "review">("chat");
  const [activeSessionId, setActiveSessionId] = useState("sess_1");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [draftContract, setDraftContract] = useState<SurveyFileAnalysisContract | null>(null);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [resolvedDecisionIds, setResolvedDecisionIds] = useState<string[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const handleNewChat = () => {
    setChatStarted(false);
    setViewMode("chat");
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
          timestamp: new Date().toISOString(),
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
    const ts = crypto.randomUUID();
    const isoString = new Date().toISOString();
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
        id: `msg_assistant_upload_prompt_${crypto.randomUUID()}`,
        role: "assistant",
        type: "text",
        content: "Por favor utiliza el botón de adjuntar (clip) en el cuadro de texto inferior para subir tu archivo (.xlsx, .xls o .csv).",
        timestamp: isoString,
      }
    ]);
  };

  const handleComposerSend = (text: string, files: File[]) => {
    const ts = crypto.randomUUID();
    const isoString = new Date().toISOString();

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
      const groups = detectSurveyGroups(files);

      const sandboxMetadataFiles = files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type || f.name.split('.').pop() || "unknown",
        lastModified: f.lastModified,
        rawFile: f
      }));

      setMessages(prev => {
        const fileCardsMessage: import("./conversationalImportTypes").ChatMessage = {
          id: `msg_assistant_files_selected_${crypto.randomUUID()}`,
          role: "assistant",
          type: "sandbox_files_selected",
          content: "Recibí los archivos en modo sandbox.",
          sandboxFiles: sandboxMetadataFiles,
          timestamp: new Date().toISOString(),
        };

        const noticeMsg: import("./conversationalImportTypes").ChatMessage = {
          id: `msg_assistant_notice_${crypto.randomUUID()}`,
          role: "assistant",
          type: "text",
          content: "Analizaré estos archivos localmente en tu navegador. No se subirán a servidores ni se enviarán a Claude.",
          timestamp: new Date().toISOString(),
        };

        const baseMessages = [...prev, fileCardsMessage, noticeMsg];

        if (groups.length > 1) {
          const decisionMsg: import("./conversationalImportTypes").ChatMessage = {
            id: `msg_assistant_group_decision_${crypto.randomUUID()}`,
            role: "assistant",
            type: "guided_review_step",
            content: "Encontré más de una encuesta en los archivos cargados.\n\n**Qué detecté:**\nDetecté grupos que parecen corresponder a encuestas distintas, por ejemplo " + groups.map(g => g.name).join(", ") + ".\n\n**Impacto en la carga histórica:**\nLa carga histórica se procesa una encuesta a la vez. Si mezclamos ciclos o estructuras distintas, las preguntas, demográficos y participantes pueden quedar mal clasificados.\n\n**Recomendación:**\nTe recomiendo procesar primero el grupo con mayor consistencia estructural.\n\n**¿Cuál encuesta quieres procesar primero?**",
            nextActions: [
              ...groups.map(g => ({
                id: `process_${g.id}`,
                label: `Procesar ${g.name}`,
                actionType: `start_local_analysis`
              })),
              { id: "view_groups", label: "Ver detalle de grupos", actionType: "detail_groups" },
              { id: "cancel", label: "Cancelar", actionType: "cancel_analysis" }
            ],
            timestamp: new Date().toISOString(),
          };
          return [...baseMessages, decisionMsg];
        }

        return baseMessages;
      });

      if (groups.length <= 1) {
        setTimeout(() => handleLocalAnalysisStart(files), 500);
      }
    } else if (text.trim()) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_assistant_generic_${crypto.randomUUID()}`,
          role: "assistant",
          type: "text",
          content: "Por favor adjunta el archivo de la encuesta si deseas procesarla, o descríbela para que te guíe.",
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  };

  const handleSandboxFilesSelected = (files: import("./SandboxUploadPanel").SandboxFileMetadata[]) => {
    const ts = crypto.randomUUID();
    const isoString = new Date().toISOString();

    const rawFiles = files.map(f => f.rawFile).filter(Boolean) as File[];
    if (rawFiles.length > 0) {
      setStagedFiles(rawFiles);
    }
    const groups = detectSurveyGroups(rawFiles);

    setMessages((prev) => {
      // Remove the upload panel
      const withoutPanel = prev.filter(m => m.type !== "sandbox_upload_panel");

      const fileCardsMessage: import("./conversationalImportTypes").ChatMessage = {
        id: `msg_assistant_files_selected_${ts}`,
        role: "assistant",
        type: "sandbox_files_selected",
        content: "Recibí los archivos en modo sandbox.",
        sandboxFiles: files,
        timestamp: isoString,
      };

      const noticeMsg: import("./conversationalImportTypes").ChatMessage = {
        id: `msg_assistant_notice_${crypto.randomUUID()}`,
        role: "assistant",
        type: "text",
        content: "Analizaré estos archivos localmente en tu navegador. No se subirán a servidores ni se enviarán a Claude.",
        timestamp: new Date().toISOString(),
      };

      const baseMessages = [...withoutPanel, fileCardsMessage, noticeMsg];

      if (groups.length > 1) {
        const decisionMsg: import("./conversationalImportTypes").ChatMessage = {
          id: `msg_assistant_group_decision_${crypto.randomUUID()}`,
          role: "assistant",
          type: "guided_review_step",
          content: "Encontré más de una encuesta en los archivos cargados.\n\n**Qué detecté:**\nDetecté grupos que parecen corresponder a encuestas distintas, por ejemplo " + groups.map(g => g.name).join(", ") + ".\n\n**Impacto en la carga histórica:**\nLa carga histórica se procesa una encuesta a la vez. Si mezclamos ciclos o estructuras distintas, las preguntas, demográficos y participantes pueden quedar mal clasificados.\n\n**Recomendación:**\nTe recomiendo procesar primero el grupo con mayor consistencia estructural.\n\n**¿Cuál encuesta quieres procesar primero?**",
          nextActions: [
            ...groups.map(g => ({
              id: `process_${g.id}`,
              label: `Procesar ${g.name}`,
              actionType: `start_local_analysis`
            })),
            { id: "view_groups", label: "Ver detalle de grupos", actionType: "detail_groups" },
            { id: "cancel", label: "Cancelar", actionType: "cancel_analysis" }
          ],
          timestamp: new Date().toISOString(),
        };
        return [...baseMessages, decisionMsg];
      }

      return baseMessages;
    });

    if (groups.length <= 1 && rawFiles.length > 0) {
      setTimeout(() => handleLocalAnalysisStart(rawFiles), 500);
    }
  };

  const handleReviewStructure = () => {
    setChatStarted(true);
    setViewMode("review");
  };

  const handleExpectedFormat = () => {
    setMessages(simulatedFormatMessages());
    setChatStarted(true);
    setViewMode("chat");
  };

  const handleAction = (actionType: string) => {
    if (actionType === "start_local_analysis") {
      void handleLocalAnalysisStart();
      return;
    }
    if (actionType === "cancel_analysis") {
      setMessages((prev) => [...prev, { id: `msg_cancel_${Date.now()}`, role: "assistant", type: "text", content: "Análisis cancelado.", timestamp: new Date().toISOString() }]);
      return;
    }

    if (actionType.startsWith("decision_action_")) {
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
        const ts = crypto.randomUUID();
        const isoString = new Date().toISOString();

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
            timestamp: new Date().toISOString(),
          });
        } else {
          newMessages.push({
            id: `msg_assistant_confirm_${ts}`,
            role: "assistant",
            type: "text",
            content: "Listo, dejé registrada esta decisión para esta importación.",
            timestamp: new Date().toISOString(),
          });
        }

        if (nextIndex < draftContract.requiredUserDecisions.length) {
          const nextDecision = draftContract.requiredUserDecisions[nextIndex];
          const nextMapped = mapDecisionToExplanation(nextDecision);
          const totalRemaining = draftContract.requiredUserDecisions.length - nextIndex;

          newMessages.push({
            id: `msg_assistant_next_decision_${crypto.randomUUID()}`,
            role: "assistant",
            type: "guided_review_step",
            content: `Quedan ${totalRemaining} decisiones pendientes.\n\n**${nextMapped.title}**\n\n**Qué detecté:**\n${nextMapped.detectedIssue}\n\n**Por qué importa:**\n${nextMapped.whyItMatters}\n\n**Impacto en la carga histórica:**\n${nextMapped.historicalLoadImpact}\n${nextMapped.recommendation ? `\n**Recomendación:**\n${nextMapped.recommendation}\n` : ""}\n**${nextMapped.primaryQuestion}**`,
            nextActions: nextMapped.actions,
            timestamp: new Date().toISOString(),
          });
        } else {
          newMessages.push({
            id: `msg_assistant_all_done_${crypto.randomUUID()}`,
            role: "assistant",
            type: "text",
            content: "Ya revisamos las decisiones iniciales de estructura. La carga histórica está lista para procesarse una vez apruebes el contrato final.",
            timestamp: new Date().toISOString(),
          });
        }

        return newMessages;
      });
      return;
    }

    if (actionType === "start_guided_review") {
      setMessages((prev) => [...prev, ...simulatedGuidedReviewStartMessages()]);
    } else if (actionType === "approve_files") {
      setMessages((prev) => [...prev, ...simulatedFilesApprovedMessages(), ...simulatedDemographicsReviewStartMessages()]);
    } else if (actionType === "change_files") {
      setMessages((prev) => [...prev, ...simulatedFilesChangesMessages()]);
    } else if (actionType === "detail_files") {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_detail_${Date.now()}`,
          role: "assistant",
          type: "text",
          content: "Detalle de archivos: Se detectaron 2 archivos XLSX con estructura estándar. Total filas: ~2.7k.",
          timestamp: new Date().toISOString(),
        }
      ]);
    } else if (actionType === "approve_demographics") {
      setMessages((prev) => [...prev, ...simulatedDemographicsApprovedMessages()]);
    } else if (actionType === "correct_demographics") {
      setMessages((prev) => [...prev, ...simulatedDemographicsChangesMessages()]);
    } else if (actionType === "detail_demographics") {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_detail_demo_${Date.now()}`,
          role: "assistant",
          type: "text",
          content: "Detalle de demográficos: Los campos Gerencia y Área parecen jerárquicos. Antigüedad y Cargo son categóricos simples.",
          timestamp: new Date().toISOString(),
        }
      ]);
    } else if (actionType === "start_dimensions_review") {
      setMessages((prev) => [...prev, ...simulatedDimensionsReviewStartMessages()]);
    } else if (actionType === "approve_dimensions") {
      setMessages((prev) => [...prev, ...simulatedDimensionsApprovedMessages()]);
    } else if (actionType === "correct_dimensions") {
      setMessages((prev) => [...prev, ...simulatedDimensionsChangesMessages()]);
    } else if (actionType === "detail_dimensions") {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_detail_dim_${Date.now()}`,
          role: "assistant",
          type: "text",
          content: "Detalle de dimensiones: Se encontraron 4 dimensiones principales que agrupan las preguntas evaluadas.",
          timestamp: new Date().toISOString(),
        }
      ]);
    } else if (actionType === "start_questions_review") {
      setMessages((prev) => [...prev, ...simulatedQuestionsReviewStartMessages()]);
    } else if (actionType === "review_comparable_questions") {
      setMessages((prev) => [...prev, ...simulatedQuestionsComparableReviewMessages()]);
    } else if (actionType === "review_new_questions") {
      setMessages((prev) => [...prev, ...simulatedQuestionsNewReviewMessages()]);
    } else if (actionType === "review_historical_questions") {
      setMessages((prev) => [...prev, ...simulatedQuestionsHistoricalReviewMessages()]);
    } else if (actionType === "approve_questions") {
      setMessages((prev) => [...prev, ...simulatedQuestionsApprovedMessages()]);
    } else if (actionType === "correct_questions") {
      setMessages((prev) => [...prev, ...simulatedQuestionsChangesMessages()]);
    } else if (actionType === "start_mappings_review") {
      setMessages((prev) => [...prev, ...simulatedMappingsReviewStartMessages()]);
    } else if (actionType === "review_pending_mappings") {
      setMessages((prev) => [...prev, ...simulatedMappingsPendingReviewMessages()]);
    } else if (actionType === "approve_automatic_mappings") {
      setMessages((prev) => [...prev, ...simulatedMappingsAutomaticApprovedMessages()]);
    } else if (actionType === "approve_mappings") {
      setMessages((prev) => [...prev, ...simulatedMappingsApprovedMessages()]);
    } else if (actionType === "correct_mappings") {
      setMessages((prev) => [...prev, ...simulatedMappingsChangesMessages()]);
    } else if (actionType === "detail_mappings") {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_detail_map_${Date.now()}`,
          role: "assistant",
          type: "text",
          content: "Detalle de mapeos: 21 automáticos y 3 pendientes de revisión.",
          timestamp: new Date().toISOString(),
        }
      ]);
    } else if (actionType === "start_contract_review") {
      setMessages((prev) => [...prev, ...simulatedContractReviewStartMessages()]);
    } else if (actionType === "approve_contract") {
      setMessages((prev) => [...prev, ...simulatedContractApprovedMessages()]);
    } else if (actionType === "review_contract_summary") {
      setMessages((prev) => [...prev, ...simulatedContractReviewSummaryMessages()]);
    } else if (actionType === "return_to_mappings") {
      setMessages((prev) => [...prev, ...simulatedContractReturnToMappingsMessages()]);
    } else if (actionType === "review_structure") {
      handleReviewStructure();
    }
  };

  const handleLocalAnalysisStart = async (filesToAnalyze?: File[]) => {
    const files = filesToAnalyze || stagedFiles;
    if (files.length === 0) {
      setMessages((prev) => [...prev, { id: `msg_err_${Date.now()}`, role: "assistant", type: "warning", content: "No hay archivo cargado en memoria local.", timestamp: new Date().toISOString() }]);
      return;
    }

    const file = files[0];
    const ts = crypto.randomUUID();
    const isoString = new Date().toISOString();

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
            id: `msg_assistant_parse_error_${crypto.randomUUID()}`,
            role: "assistant",
            type: "warning",
            content: `No pude analizar la estructura del archivo.\nRazón: ${preview.errors[0]?.message || "Error desconocido"}`,
            timestamp: new Date().toISOString(),
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

      setMessages((prev) => [
        ...prev.filter(m => m.type !== "analysis_progress"),
        {
          id: `msg_assistant_matching_${crypto.randomUUID()}`,
          role: "assistant",
          type: "analysis_progress",
          content: "Estoy revisando si los demográficos, preguntas y escalas ya existen en la plataforma…\nEstoy preparando posibles homologaciones para esta carga histórica…",
          timestamp: new Date().toISOString(),
        }
      ]);

      const matchingEngineOutput = runMatchingEngineIntegration(contract.draftContract!);
      const finalContract = matchingEngineOutput.draftContract;

      const summaryBlock = mapContractToSummaryBlock({ ...contract, draftContract: finalContract });

      setDraftContract(finalContract);
      setCurrentDecisionIndex(0);
      setResolvedDecisionIds([]);

      setMessages((prev) => [
        ...prev.filter(m => m.type !== "analysis_progress"),
        {
          id: `msg_assistant_summary_${crypto.randomUUID()}`,
          role: "assistant",
          type: "analysis_summary_blocks",
          content: summaryBlock.content,
          visualBlocks: summaryBlock.visualBlocks,
          timestamp: new Date().toISOString(),
        }
      ]);

      if (finalContract.requiredUserDecisions && finalContract.requiredUserDecisions.length > 0) {
        // One decision at a time
        const decision = finalContract.requiredUserDecisions[0];
        const mapped = mapDecisionToExplanation(decision);

        setMessages((prev) => [
          ...prev,
          {
            id: `msg_assistant_decision_${crypto.randomUUID()}`,
            role: "assistant",
            type: "guided_review_step",
            content: `Quedan ${finalContract.requiredUserDecisions!.length} decisiones pendientes.\n\n**${mapped.title}**\n\n**Qué detecté:**\n${mapped.detectedIssue}\n\n**Por qué importa:**\n${mapped.whyItMatters}\n\n**Impacto en la carga histórica:**\n${mapped.historicalLoadImpact}\n${mapped.recommendation ? `\n**Recomendación:**\n${mapped.recommendation}\n` : ""}\n**${mapped.primaryQuestion}**`,
            nextActions: mapped.actions,
            timestamp: new Date().toISOString(),
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_assistant_info_${crypto.randomUUID()}`,
            role: "assistant",
            type: "text",
            content: "Todavía hay decisiones pendientes antes de procesar.",
            timestamp: new Date().toISOString(),
          }
        ]);
      }

    } catch {
      setMessages((prev) => [
        ...prev.filter(m => m.type !== "analysis_progress"),
        {
          id: `msg_assistant_parse_fatal_${crypto.randomUUID()}`,
          role: "assistant",
          type: "warning",
          content: "No pude analizar la estructura del archivo.\nRazón: parser_failed",
          timestamp: new Date().toISOString(),
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
              <Button
                variant={viewMode === "chat" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => setViewMode("chat")}
              >
                Chat
              </Button>
              <Button
                variant={viewMode === "review" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => setViewMode("review")}
              >
                Revisar estructura
              </Button>
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
                      else if (item.id === "revisar") handleReviewStructure();
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
                  <ApprovalProgressTracker />
                  <InlineReviewPanel
                    contract={draftContract}
                    currentDecisionIndex={currentDecisionIndex}
                    onAction={handleAction}
                  />
                </div>
                <div className="w-80 flex-none bg-muted/10 border-l border-border hidden lg:block overflow-y-auto">
                  <DetectedStructurePanel />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
