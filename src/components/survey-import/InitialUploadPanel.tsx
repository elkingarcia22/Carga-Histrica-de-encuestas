import { UploadZone } from '@/components/upload/UploadZone';
import { importWizardContent } from '@/config/survey-import/importWizardContent';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface InitialUploadPanelProps {
  onAddFiles?: (files: File[]) => void;
  summaryNode?: React.ReactNode;
  className?: string;
}

export function InitialUploadPanel({ onAddFiles, summaryNode, className }: InitialUploadPanelProps) {
  const { uploadZone } = importWizardContent;

  return (
    <div className={className}>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Archivos de la encuesta</h2>
          <p className="text-sm text-muted-foreground">Agrega todos los archivos correspondientes a una misma encuesta y periodo.</p>
        </div>

        <div>
          <UploadZone
            accept={uploadZone.supportedFormats}
            multiple
            onChange={onAddFiles}
            idleText="Seleccionar archivos"
            description="Arrastra y suelta aquí todos los archivos correspondientes a una misma encuesta y periodo. Formatos admitidos: .xlsx. Los archivos .csv están sujetos a validación técnica."
          />
        </div>

        {/* Assisted Import Callout */}
        <Card className="bg-muted/30 border-muted">
          <CardContent className="p-5 flex gap-4">
            <div className="mt-0.5 flex-shrink-0 text-muted-foreground">
              <Sparkles className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">
                ¿Qué hará este prototipo?
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside mb-4">
                <li>Validará la metadata básica de los archivos.</li>
                <li>Simulará la identificación de sus funciones dentro del lote.</li>
                <li>Preparará una vista previa de normalización para tu revisión.</li>
              </ul>
              <p className="text-xs text-muted-foreground border-t pt-3 mt-3">
                En esta versión no se lee ni analiza el contenido real de los archivos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
