import React from "react";
import { ChatFoundationMessageRenderer } from "./ChatFoundationMessageRenderer";
import { chatFoundationPlaygroundMessages } from "./chatFoundationPlaygroundMessages";

export const ChatFoundationVisualPlayground: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Header and Checklist */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h1 className="text-2xl font-semibold mb-2">Chat Foundation Playground</h1>
            <p className="text-sm text-slate-500 mb-4">
              Playground interno · No conectado al flujo de importación.
              Revisión visual aislada del componente base de chat.
            </p>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">
                Checklist Visual
              </h2>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Avatar del asistente visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Icono del asistente consistente
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Thinking visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Warning visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Error visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Safe details visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Respuesta PII segura
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Respuesta fuera de alcance segura
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Sin flujo de importación conectado
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Chat Output */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 min-h-[600px] overflow-y-auto">
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
