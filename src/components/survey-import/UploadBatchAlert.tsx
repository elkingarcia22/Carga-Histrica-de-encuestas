import { AlertTriangle } from 'lucide-react';
import { uploadLimits } from '@/config/survey-import/uploadLimits';

interface UploadBatchAlertProps {
  isVisible: boolean;
  variant?: 'error' | 'warning';
}

export function UploadBatchAlert({ isVisible, variant = 'error' }: UploadBatchAlertProps) {
  if (!isVisible) return null;

  if (variant === 'warning') {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-4 mb-4" role="alert">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-yellow-700">
            Cantidad alta de archivos
          </p>
          <p className="text-sm text-yellow-700/90">
            Este lote contiene una cantidad alta de archivos. La revisión puede requerir más tiempo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 mt-4 mb-4" role="alert">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-destructive">
          El lote supera el límite de {uploadLimits.labels.maxSizePerBatch}
        </p>
        <p className="text-sm text-destructive/90">
          Remueve algunos archivos para continuar. Los archivos válidos mantendrán su información.
        </p>
      </div>
    </div>
  );
}
