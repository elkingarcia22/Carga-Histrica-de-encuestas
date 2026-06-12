import { UploadZone } from '@/components/upload/UploadZone';
import { importWizardContent } from '@/config/survey-import/importWizardContent';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, CheckCircle2, AlertCircle, X, FileText } from 'lucide-react';
import { formatFileSize } from '@/components/upload/uploadUtils';
import type { LocalFileMetadata } from '@/hooks/survey-import/useLocalUploadState';

interface InitialUploadPanelProps {
  onAddFiles?: (files: File[]) => void;
  files?: LocalFileMetadata[];
  onRemoveFile?: (id: string) => void;
  className?: string;
}

export function InitialUploadPanel({ 
  onAddFiles, 
  files = [], 
  onRemoveFile,
  className 
}: InitialUploadPanelProps) {
  const { uploadZone } = importWizardContent;
  const hasFiles = files.length > 0;

  const validCount = files.filter(f => f.status === 'valid' || f.status === 'warning').length;
  const blockedCount = files.filter(f => ['invalid', 'too-large', 'unsupported', 'duplicate'].includes(f.status)).length;
  const totalSize = files.reduce((acc, f) => acc + f.sizeBytes, 0);

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {hasFiles ? 'Archivos seleccionados' : 'Archivos de la encuesta'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasFiles 
              ? 'Revisa el lote antes de iniciar el análisis simulado.'
              : 'Agrega los archivos correspondientes a una misma encuesta y periodo.'
            }
          </p>
        </div>

        {/* Upload Zone */}
        <UploadZone
          accept={uploadZone.supportedFormats}
          multiple
          onChange={onAddFiles}
          idleText="Seleccionar archivos"
          description="Arrastra y suelta aquí los archivos. Formatos admitidos: .xlsx, .csv."
          compact={hasFiles}
        />

        {/* File list - when files exist */}
        {hasFiles && (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-muted/50 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4" />
                {files.length} archivos
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">{formatFileSize(totalSize)}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {validCount} válidos
              </span>
              {blockedCount > 0 && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="flex items-center gap-1.5 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {blockedCount} con errores
                  </span>
                </>
              )}
            </div>

            {/* Files */}
            <div className="flex flex-col gap-2" role="list" aria-label="Archivos seleccionados">
              {files.map((file) => (
                <FileRow key={file.id} file={file} onRemove={onRemoveFile!} />
              ))}
            </div>
          </>
        )}

        {/* Callout */}
        <Card className="bg-muted/30 border-muted">
          <CardContent className="p-4 flex gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">¿Qué hará este prototipo?</p>
              <p>Validará la metadata, simulará la identificación de funciones y preparará una vista previa de normalización.</p>
              <p className="text-xs text-muted-foreground/70 pt-1">En esta versión no se analiza el contenido real de los archivos.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FileRow({ file, onRemove }: { file: LocalFileMetadata; onRemove: (id: string) => void }) {
  const isInvalid = ['invalid', 'unsupported', 'too-large'].includes(file.status);
  const isDuplicate = file.status === 'duplicate';
  const isWarning = file.status === 'warning';
  const isValid = file.status === 'valid';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <div className="shrink-0">
        {isValid && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        {isWarning && <AlertCircle className="h-5 w-5 text-yellow-500" />}
        {isDuplicate && <AlertCircle className="h-5 w-5 text-orange-500" />}
        {isInvalid && <AlertCircle className="h-5 w-5 text-destructive" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate" title={file.displayName}>
            {file.displayName}
          </span>
          <span className="text-[10px] h-5 px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground uppercase font-medium shrink-0">
            {file.extension.replace('.', '') || 'FILE'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatFileSize(file.sizeBytes)}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className={`text-xs font-medium ${
            isValid ? 'text-green-600' :
            isWarning ? 'text-yellow-600' :
            isDuplicate ? 'text-orange-600' :
            'text-destructive'
          }`}>
            {isValid && 'Válido'}
            {isWarning && 'Advertencia'}
            {isDuplicate && 'Duplicado'}
            {isInvalid && 'No válido'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        aria-label={`Remover ${file.displayName}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
