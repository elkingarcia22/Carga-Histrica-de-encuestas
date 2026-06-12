import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { NormalizationPreviewModel } from '@/lib/survey-import/normalization-preview/normalizationPreviewTypes';
import { NORMALIZATION_PREVIEW_CONFIG } from '@/config/survey-import/normalizationPreviewConfig';
import { iconRegistry, IconFallback } from '@/icons/iconRegistry';

interface NormalizationMappingPreviewProps {
  model: NormalizationPreviewModel;
}

export function NormalizationMappingPreview({ model }: NormalizationMappingPreviewProps) {
  const { visibleMappings, visibleFiles } = model;
  
  if (visibleMappings.length === 0) {
    return null;
  }

  const LayersIcon = iconRegistry.layers || IconFallback;
  const ArrowRightIcon = iconRegistry.arrowRight || IconFallback;

  const getFileName = (id: string) => {
    return visibleFiles.find(f => f.id === id)?.sanitizedFilename || 'Archivo desconocido';
  };

  return (
    <div className="rounded-md border border-border bg-card mt-6">
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
        <LayersIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Mapeo inferido hacia el Modelo UBITS</h3>
      </div>
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo Origen</TableHead>
              <TableHead>Columna / Identificador</TableHead>
              <TableHead></TableHead>
              <TableHead>Entidad UBITS</TableHead>
              <TableHead>Campo UBITS</TableHead>
              <TableHead className="text-right">Confianza</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleMappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {getFileName(mapping.sourceFileId)}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded border border-border">
                    {mapping.sourceLabel}
                  </code>
                </TableCell>
                <TableCell>
                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">{mapping.sourceCategory}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {mapping.proposedTarget || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {mapping.simulatedConfidence ? NORMALIZATION_PREVIEW_CONFIG.confidenceLabels[mapping.simulatedConfidence] : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
