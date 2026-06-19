import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ChevronRight, Edit2, AlertTriangle, FileCheck } from "lucide-react";
import {
  mockDemographics,
  mockDimensions,
  mockUnmappedQuestions,
  mockApprovalBlocks,
  mockMappings,
  mockIssues
} from "./conversationalImportMock";

export function InlineReviewPanel() {
  return (
    <ScrollArea className="h-full bg-background">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Revisión de Estructura</h2>
          <p className="text-muted-foreground">
            Revisa, edita y aprueba los componentes detectados antes de finalizar la importación.
          </p>
        </div>

        {/* Demographics Review */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded">1</span>
              Demográficos
            </h3>
            <Badge variant="positive">Aprobado</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockDemographics.map((demo) => (
              <Card key={demo} className="relative group overflow-hidden border-muted-foreground/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-medium">{demo}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Dimensions Review */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded">2</span>
              Dimensiones
            </h3>
            <Badge variant="warning">Pendiente</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mockDimensions.map((dim) => (
              <Card key={dim} className="relative group border-muted-foreground/20">
                <CardContent className="p-3 text-center">
                  <span className="font-medium text-sm">{dim}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Questions & Mappings Review */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded">3</span>
              Preguntas y Mapeos
            </h3>
          </div>
          <Card>
            <CardContent className="p-0 divide-y">
              {mockMappings.map((map, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium">{map.question}</p>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{map.dimension}</Badge>
                  </div>
                </div>
              ))}
              {mockUnmappedQuestions.map((q, i) => (
                <div key={`unmapped-${i}`} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium">{q}</p>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="destructive">Sin asignar</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Issues & Warnings Review */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Alertas de Validación</h3>
          <div className="space-y-2">
            {mockIssues.map((issue, i) => (
              <Alert key={i} variant={issue.type === 'error' ? 'destructive' : 'warning'}>
                {issue.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>{issue.type === 'error' ? 'Error' : 'Advertencia'}</AlertTitle>
                <AlertDescription>{issue.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </section>

        {/* Approval Blocks */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Estado de Aprobación</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockApprovalBlocks.map((block) => (
              <Card key={block.id} className={block.status === 'approved' ? 'border-primary/50 bg-primary/5' : ''}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{block.name}</CardTitle>
                    {block.status === 'approved' ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{block.approvedItems} / {block.totalItems} elementos</span>
                    <span className="capitalize">{block.status === 'approved' ? 'Aprobado' : 'Pendiente'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Approved Contract Preview */}
        <section className="space-y-4 pt-4 border-t border-dashed">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Vista Previa del Contrato
              </CardTitle>
              <CardDescription>
                Este es el formato final que será enviado al sistema para generar el comparativo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-black/80 text-white p-4 rounded-md overflow-x-auto">
                {JSON.stringify({
                  version: "1.0",
                  metadata: { files: 2, timestamp: new Date().toISOString() },
                  structure: {
                    demographics: mockDemographics,
                    dimensions: mockDimensions,
                    totalQuestions: 42,
                    mappings: mockMappings.length
                  }
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </section>
      </div>
    </ScrollArea>
  );
}
