import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, LayoutList } from "lucide-react";
import { qsClimaDemoFixture } from "../demo-fixture/qsClimaFixture";

const PII_GUARD_PATTERNS = [
  'email',
  'correo',
  'cedula',
  'cédula',
  'documento',
  'telefono',
  'teléfono',
  'nombre completo',
  'employee_id',
  'colaborador_id'
];

function containsPiiLikeValue(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return PII_GUARD_PATTERNS.some(pattern => lowerText.includes(pattern));
}

interface ControlledRenameReviewProps {
  initialOverlayState: Record<string, string>;
  onSave: (overlayState: Record<string, string>) => void;
  onCancel: () => void;
}

export function ControlledRenameReview({ initialOverlayState, onSave, onCancel }: ControlledRenameReviewProps) {
  const [localOverlay, setLocalOverlay] = useState<Record<string, string>>(initialOverlayState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sourceLayer = qsClimaDemoFixture.sourceLayer;

  // Only editable entities are dimensions and questions
  const dimensions = sourceLayer.dimensions;
  const mappings = sourceLayer.mappings;
  const questions = sourceLayer.questions;

  const handleLabelChange = (id: string, nextLabel: string) => {
    setLocalOverlay(prev => ({ ...prev, [id]: nextLabel }));

    // Validate
    if (!nextLabel.trim()) {
      setErrors(prev => ({ ...prev, [id]: "El label no puede estar vacío" }));
      return;
    }
    if (containsPiiLikeValue(nextLabel)) {
      setErrors(prev => ({ ...prev, [id]: "El label contiene posible PII" }));
      return;
    }
    if (/^\d+(\.\d+)?$/.test(nextLabel.trim())) {
      setErrors(prev => ({ ...prev, [id]: "El label no puede ser numérico" }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const hasChanges = Object.keys(localOverlay).length > 0;
  const pendingChangesCount = Object.keys(localOverlay).filter(k => localOverlay[k] !== undefined).length;
  const hasErrors = Object.keys(errors).length > 0;

  const handleSave = () => {
    if (hasErrors) return;
    onSave(localOverlay);
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border relative">
      <div className="p-6 border-b shrink-0 flex items-center justify-between bg-card">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Ajustar Etiquetas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Modo de edición local seguro. No muta los datos fuente.
          </p>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="font-normal text-xs">
            {pendingChangesCount} ajuste(s) local(es)
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8 pb-24">

          {dimensions.map(dim => {
            const isDimModified = !!localOverlay[dim.id];

            // Find questions mapped to this dimension
            const dimMappings = mappings.filter(m => m.detectedDimensionId === dim.id);
            const dimQuestions = dimMappings.map(m => {
              const q = questions.find(q => q.id === m.questionId);
              return q;
            }).filter(Boolean);

            return (
              <div key={dim.id} className="border rounded-xl bg-card overflow-hidden">
                <div className="bg-muted/30 p-4 border-b">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <LayoutList size={12} />
                      Dimensión
                    </label>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <Input
                          value={localOverlay[dim.id] !== undefined ? localOverlay[dim.id] : dim.displayLabel}
                          onChange={(e) => handleLabelChange(dim.id, e.target.value)}
                          className={`max-w-md ${errors[dim.id] ? "border-destructive" : ""}`}
                          placeholder="Nombre de la dimensión"
                        />
                        {errors[dim.id] && (
                          <span className="text-[11px] text-destructive flex items-center gap-1">
                            <AlertCircle size={12} /> {errors[dim.id]}
                          </span>
                        )}
                      </div>
                      {isDimModified && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mt-2 shrink-0">
                          Ajuste local
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {dimQuestions.map(q => {
                    if (!q) return null;
                    const isQModified = !!localOverlay[q.id];
                    return (
                      <div key={q.id} className="flex flex-col gap-1 pl-4 border-l-2 border-muted">
                        <label className="text-[11px] text-muted-foreground">Pregunta / Ítem</label>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 flex flex-col gap-1">
                            <Input
                              value={localOverlay[q.id] !== undefined ? localOverlay[q.id] : q.displayLabel}
                              onChange={(e) => handleLabelChange(q.id, e.target.value)}
                              className={`max-w-2xl text-sm ${errors[q.id] ? "border-destructive" : ""}`}
                              placeholder="Texto de la pregunta"
                            />
                            {errors[q.id] && (
                              <span className="text-[11px] text-destructive flex items-center gap-1">
                                <AlertCircle size={12} /> {errors[q.id]}
                              </span>
                            )}
                          </div>
                          {isQModified && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mt-2 shrink-0">
                              Ajuste local
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card flex justify-end gap-3 shrink-0">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={hasErrors || !hasChanges}>
          Guardar ajustes locales
        </Button>
      </div>
    </div>
  );
}
