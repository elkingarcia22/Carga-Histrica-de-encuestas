import { Button } from "@/components/ui/button";

export function ValidationActionPanel() {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-t bg-muted/10">
      <Button variant="default" size="sm" disabled>Aprobar bloque</Button>
      <Button variant="secondary" size="sm" disabled>Solicitar cambios</Button>
      <Button variant="outline" size="sm" disabled>Renombrar demográfico</Button>
      <Button variant="outline" size="sm" disabled>Reasignar pregunta</Button>
      <Button variant="outline" size="sm" disabled>Aceptar warning</Button>
      <Button variant="outline" size="sm" disabled>Generar contrato aprobado</Button>
    </div>
  );
}
