import { Button } from "@/components/ui/button";
import type { DraftReadinessInput } from "../draft-preparation/draftReadinessMapper";
import type { HistoricalLoadDraftReadiness } from "../draft-preparation/types";

interface DraftReadinessPreviewProps {
  input: DraftReadinessInput;
  readiness: HistoricalLoadDraftReadiness;
  onCancel: () => void;
}

export function DraftReadinessPreview({ input, readiness, onCancel }: DraftReadinessPreviewProps) {
  const statusColor = readiness.status === 'ready'
    ? 'text-green-600 dark:text-green-400'
    : readiness.status === 'not_ready'
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-600 dark:text-red-400';

  const statusLabel = readiness.status === 'ready'
    ? 'Listo para preparar'
    : readiness.status === 'not_ready'
      ? 'Requiere revisión'
      : 'Bloqueado';

  const localAdjustmentsCount = input.overlayActions?.length || 0;

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="px-6 py-4 border-b shrink-0 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>📝</span> Preview del borrador de carga histórica
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cerrar preview
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="p-4 bg-muted/30 rounded-xl border border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">Estado de Readiness</h3>
            <p className={`text-sm font-semibold ${statusColor}`}>
              {statusLabel}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {readiness.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">Resumen</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Ciclos incluidos: {input.sourceCycles.length}</li>
                <li>Archivos referenciados: {new Set(input.sourceSegments.flatMap(s => s.sourceFileIds)).size}</li>
                <li>Dimensiones incluidas: {input.sourceDimensions.length}</li>
                <li>Preguntas incluidas: {input.sourceQuestions.length}</li>
                <li>Métricas incluidas: {input.sourceMetrics.length}</li>
                <li>Demográficos incluidos: {input.sourceDemographics.length}</li>
                <li>Segmentos incluidos: {input.sourceSegments.length}</li>
                <li>Ajustes locales aplicados: {localAdjustmentsCount}</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">Bloqueos y Advertencias</h3>
              {readiness.blockers.length === 0 && readiness.warnings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin bloqueos críticos ni advertencias.</p>
              ) : (
                <ul className="text-sm text-muted-foreground space-y-2">
                  {readiness.blockers.length === 0 ? (
                    <li>Sin bloqueos críticos</li>
                  ) : (
                    readiness.blockers.map((b, i) => (
                      <li key={`b_${i}`} className="text-red-600 dark:text-red-400 font-medium">• Bloqueo: {b}</li>
                    ))
                  )}

                  {readiness.warnings.length === 0 ? (
                    <li>Advertencias pendientes: 0</li>
                  ) : (
                    readiness.warnings.map((w, i) => (
                      <li key={`w_${i}`} className="text-yellow-600 dark:text-yellow-400">• Advertencia: {w}</li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Privacidad</h3>
            <p className="text-sm text-muted-foreground">
              Este preview no incluye respuestas individuales, comentarios abiertos, PII, raw rows ni dumps del workbook.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
              <li>• No incluye respuestas individuales</li>
              <li>• No incluye PII</li>
              <li>• No incluye raw rows</li>
              <li>• No incluye dumps de workbook</li>
              <li>• No conecta API, storage ni Claude</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t bg-muted/10 shrink-0 flex items-center justify-between">
        <p className="text-xs text-muted-foreground max-w-md">
          Disponible en una fase posterior. Este preview no ejecuta importación ni guarda datos.
        </p>
        <Button disabled variant="default">
          Preparar borrador
        </Button>
      </div>
    </div>
  );
}
