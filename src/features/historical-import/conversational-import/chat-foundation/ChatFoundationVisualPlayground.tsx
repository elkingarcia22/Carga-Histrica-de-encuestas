import React, { useState } from "react";
import { ChatFoundationMessageRenderer } from "./ChatFoundationMessageRenderer";
import { chatFoundationPlaygroundMessages } from "./chatFoundationPlaygroundMessages";
import { historicalImportFlowAdapterPlaygroundScenarios } from "../flow-adapter/historicalImportFlowAdapterPlaygroundFixture";

export const ChatFoundationVisualPlayground: React.FC = () => {
  const defaultScenario = historicalImportFlowAdapterPlaygroundScenarios.find(
    (s) => s.step === "awaiting_survey_scope_selection"
  );

  const [selectedScenarioId, setSelectedScenarioId] = useState(
    defaultScenario?.id || historicalImportFlowAdapterPlaygroundScenarios[0]?.id || ""
  );

  const selectedScenario = historicalImportFlowAdapterPlaygroundScenarios.find(
    (s) => s.id === selectedScenarioId
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 text-foreground font-sans p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Header, Checklist and Adapter Selector */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h1 className="text-2xl font-bold mb-2">Chat Foundation Playground</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Playground interno · No conectado al flujo de importación
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sandbox para la revisión y validación visual aislada del componente base de chat y sus comportamientos.
            </p>

            <div className="mt-6 border-t border-border pt-6">
              <h2 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                Checklist Visual
              </h2>
              <ul className="space-y-2 text-sm text-foreground/90">
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Avatar del asistente (solo gradiente)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Sin icono interno en el avatar
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Iconos semánticos en mensajes coherentes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Sin iconos decorativos redundantes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Thinking visible (sutil)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Warning visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Error visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Safe details con icono visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Respuesta PII segura
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Respuesta fuera de alcance segura
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Sin flujo de importación conectado
                </li>
              </ul>
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h2 className="text-md font-bold mb-1">Historical Import Flow Adapter · Fixture</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Playground interno · Adapter mock · No conectado al flujo real
            </p>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {historicalImportFlowAdapterPlaygroundScenarios.map((scen) => {
                const isActive = scen.id === selectedScenarioId;
                return (
                  <button
                    key={scen.id}
                    onClick={() => setSelectedScenarioId(scen.id)}
                    className={`text-left text-xs p-2.5 rounded-lg border transition-all ${
                      isActive
                        ? "bg-accent border-accent text-accent-foreground font-semibold"
                        : "bg-background/50 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="font-semibold">{scen.title}</div>
                    <div className="text-[10px] opacity-80 truncate">{scen.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Output columns */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Adapter Scenario Messages Section (Primary) */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col gap-6">
            <div className="border-b border-border pb-3 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  Historical Import Flow Adapter · Fixture
                </h2>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium border border-amber-500/20">
                  Mock
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Playground interno · Adapter mock · No conectado al flujo real
              </p>
            </div>

            {selectedScenario && (
              <div className="flex flex-col gap-6">
                <div className="bg-muted/50 p-4 rounded-xl border border-border text-xs flex flex-col gap-1">
                  <span className="font-bold text-foreground">
                    Escenario Activo: {selectedScenario.title}
                  </span>
                  <span className="text-muted-foreground">
                    {selectedScenario.description}
                  </span>
                  <span className="font-mono text-[10px] mt-1 bg-background px-2 py-0.5 rounded border border-border/50 self-start">
                    Step: {selectedScenario.step}
                  </span>
                </div>

                {selectedScenario.messages.map((message) => (
                  <ChatFoundationMessageRenderer
                    key={message.id}
                    message={message}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Base Messages Section (Secondary & Collapsible) */}
          <details className="group bg-card rounded-2xl shadow-sm border border-border p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex justify-between items-center font-bold text-md cursor-pointer select-none">
              <span className="text-muted-foreground group-open:text-foreground transition-colors">
                Chat Foundation · Mensajes de Referencia (Base)
              </span>
              <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded transition-transform group-open:rotate-180">
                Ver mensajes base
              </span>
            </summary>
            <div className="flex flex-col gap-6 mt-6 border-t border-border pt-6">
              {chatFoundationPlaygroundMessages.map((message) => (
                <ChatFoundationMessageRenderer
                  key={message.id}
                  message={message}
                />
              ))}
            </div>
          </details>

        </div>

      </div>
    </div>
  );
};
