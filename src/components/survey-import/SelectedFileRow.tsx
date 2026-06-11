import { X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LocalFileMetadata } from '@/hooks/survey-import/useLocalUploadState';
import { formatFileSize } from '@/components/upload/uploadUtils';

interface SelectedFileRowProps {
  file: LocalFileMetadata;
  onRemove: (id: string) => void;
}

export function SelectedFileRow({ file, onRemove }: SelectedFileRowProps) {
  const isInvalid = ['invalid', 'unsupported', 'too-large'].includes(file.status);
  const isDuplicate = file.status === 'duplicate';
  const isWarning = file.status === 'warning';
  const isValid = file.status === 'valid';

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-1">
            {isValid && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {isWarning && <AlertCircle className="h-5 w-5 text-yellow-500" />}
            {isDuplicate && <Clock className="h-5 w-5 text-orange-500" />}
            {isInvalid && <AlertCircle className="h-5 w-5 text-destructive" />}
          </div>
          
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate" title={file.displayName}>
                {file.displayName}
              </span>
              <Badge variant="secondary" className="text-[10px] h-5 uppercase">
                {file.extension.replace('.', '') || 'UNKNOWN'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.sizeBytes)}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className={`text-xs font-medium ${
                isValid ? 'text-green-600 dark:text-green-400' :
                isWarning ? 'text-yellow-600 dark:text-yellow-400' :
                isDuplicate ? 'text-orange-600 dark:text-orange-400' :
                'text-destructive'
              }`}>
                {isValid && 'Válido'}
                {isWarning && 'Advertencia'}
                {isDuplicate && 'Duplicado'}
                {isInvalid && 'No válido'}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => onRemove(file.id)}
          aria-label={`Remover ${file.displayName}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {file.issues && file.issues.length > 0 && (
        <div className="ml-8 mt-1 space-y-1">
          {file.issues.map((issue, i) => (
            <p key={i} className={`text-xs ${isInvalid ? 'text-destructive/90' : 'text-muted-foreground'}`}>
              {issue}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
