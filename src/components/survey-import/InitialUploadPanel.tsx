import { UploadZone } from '@/components/upload/UploadZone';
import { importWizardContent } from '@/config/survey-import/importWizardContent';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface InitialUploadPanelProps {
  onAddFiles?: (files: File[]) => void;
  className?: string;
}

export function InitialUploadPanel({ onAddFiles, className }: InitialUploadPanelProps) {
  const { uploadZone, processInfo } = importWizardContent;

  return (
    <div className={className}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">{uploadZone.label}</h2>
          <p className="text-sm text-muted-foreground">{uploadZone.description}</p>
        </div>

        {/* Zona pasiva de carga, habilitada para seleccionar archivos */}
        <UploadZone
          accept={uploadZone.supportedFormats}
          multiple
          onChange={onAddFiles}
          idleText={uploadZone.idleText}
        />

        <Card className="bg-muted/30 border-muted">
          <CardContent className="p-4 flex gap-3">
            <div className="mt-1 flex-shrink-0 text-muted-foreground">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-2">
                {processInfo.title}
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {processInfo.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
