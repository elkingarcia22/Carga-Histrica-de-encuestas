import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function ApprovedContractSummary() {
  return (
    <Card className="border-border bg-muted">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-foreground">
          <CheckCircle2 size={16} />
          Contrato de Importación Aprobado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Estado:</strong> Listo para comparación</p>
          <p><strong>Origen:</strong> Sandbox sintético</p>
          <p><strong>Demográficos:</strong> 6 mapeados</p>
          <p><strong>Dimensiones:</strong> 8 mapeadas</p>
          <p><strong>Preguntas:</strong> 42 validadas</p>
        </div>
      </CardContent>
    </Card>
  );
}
