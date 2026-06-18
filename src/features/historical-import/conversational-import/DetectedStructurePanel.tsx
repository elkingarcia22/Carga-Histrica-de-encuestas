import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockDemographics, mockDimensions, mockUnmappedQuestions } from "./conversationalImportMock";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, LayoutList, Users } from "lucide-react";

export function DetectedStructurePanel() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 flex flex-col gap-4">
        <h3 className="font-semibold text-lg mb-2">Estructura Detectada</h3>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users size={16} />
              Demográficos ({mockDemographics.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockDemographics.map(d => (
                <Badge key={d} variant="secondary">{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <LayoutList size={16} />
              Dimensiones ({mockDimensions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockDimensions.map(d => (
                <Badge key={d} variant="outline">{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle size={16} />
              Preguntas sin dimensión ({mockUnmappedQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 list-disc pl-4 text-yellow-700 dark:text-yellow-300">
              {mockUnmappedQuestions.map(q => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText size={16} />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>Archivos: 2</p>
              <p>Hojas: 2</p>
              <p>Preguntas: 42</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
