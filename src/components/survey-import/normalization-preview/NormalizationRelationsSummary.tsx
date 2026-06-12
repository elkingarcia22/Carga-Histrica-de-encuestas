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
import { iconRegistry, IconFallback } from '@/icons/iconRegistry';

interface NormalizationRelationsSummaryProps {
  model: NormalizationPreviewModel;
}

export function NormalizationRelationsSummary({ model }: NormalizationRelationsSummaryProps) {
  const { visibleRelations, visibleFiles } = model;
  
  if (visibleRelations.length === 0) {
    return null;
  }

  const NetworkIcon = iconRegistry.templates || IconFallback;
  const ArrowRightIcon = iconRegistry.arrowRight || IconFallback;

  const getFileName = (id: string) => {
    return visibleFiles.find(f => f.id === id)?.sanitizedFilename || 'Archivo desconocido';
  };

  return (
    <div className="rounded-md border border-border bg-card mt-6">
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
        <NetworkIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Relaciones inferidas</h3>
      </div>
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origen</TableHead>
              <TableHead></TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Tipo de Relación</TableHead>
              <TableHead className="text-right">Confianza</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRelations.map((relation) => (
              <TableRow key={relation.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {getFileName(relation.sourceFileId)}
                </TableCell>
                <TableCell>
                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell className="font-medium">
                  {getFileName(relation.targetFileId)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {relation.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {relation.explanation}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
