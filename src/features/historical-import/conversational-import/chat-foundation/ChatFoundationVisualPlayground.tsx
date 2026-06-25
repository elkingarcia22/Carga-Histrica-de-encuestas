import React from "react";
import { ChatFoundationMessageRenderer } from "./ChatFoundationMessageRenderer";
import { chatFoundationPlaygroundMessages } from "./chatFoundationPlaygroundMessages";

export const ChatFoundationVisualPlayground: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-muted/30 text-foreground font-sans p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Header and Checklist */}
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
        </div>

        {/* Chat Output */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col gap-6 min-h-[600px]">
            {chatFoundationPlaygroundMessages.map((message) => (
              <ChatFoundationMessageRenderer
                key={message.id}
                message={message}
              />
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};
