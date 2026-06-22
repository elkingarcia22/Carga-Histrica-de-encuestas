import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SurveyFileAnalysisContract } from "../survey-file-analysis/types";
import { mapDecisionToChatActions } from "./decisionReviewMapper";

export interface InlineReviewPanelProps {
  contract?: SurveyFileAnalysisContract | null;
  currentDecisionIndex?: number;
  onAction?: (actionType: string) => void;
}

export function InlineReviewPanel({ contract, currentDecisionIndex = 0, onAction }: InlineReviewPanelProps) {
  const currentDecision = contract?.requiredUserDecisions && contract.requiredUserDecisions.length > currentDecisionIndex
    ? contract.requiredUserDecisions[currentDecisionIndex]
    : null;

  const mappedDecision = currentDecision ? mapDecisionToChatActions(currentDecision) : null;

  return (
    <ScrollArea className="h-full bg-background">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Revisión de Estructura</h2>
          <p className="text-muted-foreground">
            Revisa, edita y aprueba los componentes detectados antes de finalizar la importación.
          </p>
        </div>

        {/* Compact Structural Summary */}
        <section className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen Estructural Compacto</CardTitle>
              <CardDescription>
                {contract
                  ? `Análisis generado con ${contract.demographics.length} demográficos, ${contract.dimensions.length} dimensiones y ${contract.questions.length} preguntas.`
                  : "No hay un contrato generado aún."
                }
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Current Decision */}
        {mappedDecision && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Decisión Actual ({currentDecisionIndex + 1} de {contract?.requiredUserDecisions?.length || 0})</h3>
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-md flex items-center justify-between">
                  <span>{mappedDecision.title}</span>
                  {mappedDecision.riskLevel === "high" && <Badge variant="destructive">Alto Riesgo</Badge>}
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap">
                  {mappedDecision.description}
                  {mappedDecision.helperText && (
                    <span className="block mt-2 italic">{mappedDecision.helperText}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  onClick={() => onAction?.(mappedDecision.primaryAction.actionType)}
                  variant="default"
                >
                  {mappedDecision.primaryAction.label}
                </Button>
                {mappedDecision.secondaryActions.map((action) => (
                  <Button
                    key={action.id}
                    onClick={() => onAction?.(action.actionType)}
                    variant="outline"
                  >
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {!mappedDecision && contract && contract.requiredUserDecisions && contract.requiredUserDecisions.length > 0 && (
          <section className="space-y-4">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>Todas las decisiones de estructura han sido revisadas.</p>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </ScrollArea>
  );
}
