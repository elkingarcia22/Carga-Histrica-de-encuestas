import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SurveyFileAnalysisContract } from "../survey-file-analysis/types";
import { mapDecisionToExplanation } from "./decisionExplanationMapper";

export interface InlineReviewPanelProps {
  contract?: SurveyFileAnalysisContract | null;
  currentDecisionIndex?: number;
  onAction?: (actionType: string) => void;
}

export function InlineReviewPanel({ contract, currentDecisionIndex = 0, onAction }: InlineReviewPanelProps) {
  const currentDecision = contract?.requiredUserDecisions && contract.requiredUserDecisions.length > currentDecisionIndex
    ? contract.requiredUserDecisions[currentDecisionIndex]
    : null;

  const mappedDecision = currentDecision ? mapDecisionToExplanation(currentDecision) : null;

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
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap mt-2 flex flex-col gap-2">
                  <p><strong>Qué detecté:</strong> {mappedDecision.detectedIssue}</p>
                  <p><strong>Por qué importa:</strong> {mappedDecision.whyItMatters}</p>
                  <p><strong>Impacto:</strong> {mappedDecision.historicalLoadImpact}</p>
                  {mappedDecision.recommendation && (
                    <p><strong>Recomendación:</strong> {mappedDecision.recommendation}</p>
                  )}
                  <p className="mt-2 font-medium text-foreground">{mappedDecision.primaryQuestion}</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {mappedDecision.actions.map((action) => (
                  <Button
                    key={action.id}
                    onClick={() => onAction?.(action.actionType)}
                    variant={action.intent === "primary" ? "default" : action.intent === "danger" ? "destructive" : "outline"}
                    className="flex flex-col items-start h-auto py-2"
                  >
                    <span>{action.label}</span>
                    {action.consequence && <span className="text-[10px] font-normal opacity-80 mt-0.5">{action.consequence}</span>}
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
