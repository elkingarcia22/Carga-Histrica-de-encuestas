import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { NormalizationPreviewModel, NormalizationStructuralFamily } from '@/lib/survey-import/normalization-preview/normalizationPreviewTypes';
import { NORMALIZATION_PREVIEW_CONFIG } from '@/config/survey-import/normalizationPreviewConfig';
import { iconRegistry, IconFallback } from '@/icons/iconRegistry';
import { PaginationShell } from '@/components/navigation/PaginationShell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NormalizationFileListProps {
  model: NormalizationPreviewModel;
}

export function NormalizationFileList({ model }: NormalizationFileListProps) {
  const { visibleFiles } = model;
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('all');

  const ChevronDown = iconRegistry.chevronDown || IconFallback;
  const ChevronUp = iconRegistry.chevronUp || IconFallback;
  const WarningIcon = iconRegistry.warning || IconFallback;
  const InfoIcon = iconRegistry.info || IconFallback;

  const familyGroups = useMemo(() => {
    const groups: Record<string, { total: number, recognized: number, confirmation: number, blocked: number }> = {};
    for (const file of visibleFiles) {
      if (!groups[file.structuralFamily]) {
        groups[file.structuralFamily] = { total: 0, recognized: 0, confirmation: 0, blocked: 0 };
      }
      groups[file.structuralFamily].total++;
      if (file.status === 'recognized') groups[file.structuralFamily].recognized++;
      if (file.status === 'confirmation-required') groups[file.structuralFamily].confirmation++;
      if (['incompatible', 'different-survey', 'different-period', 'simulated-error'].includes(file.status)) {
        groups[file.structuralFamily].blocked++;
      }
    }
    return groups;
  }, [visibleFiles]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    setExpandedRow(null);
  };

  const handleFilterChange = (val: string) => {
    setSelectedFamilyFilter(val);
    setCurrentPage(1);
    setExpandedRow(null);
  };

  const filteredFiles = useMemo(() => {
    if (selectedFamilyFilter === 'all') return visibleFiles;
    return visibleFiles.filter(f => f.structuralFamily === selectedFamilyFilter);
  }, [visibleFiles, selectedFamilyFilter]);

  const pageSize = NORMALIZATION_PREVIEW_CONFIG.normalizationPreviewFilesPageSize || 25;
  const totalItems = filteredFiles.length;
  const pageCount = Math.ceil(totalItems / pageSize);
  const validCurrentPage = Math.min(Math.max(1, currentPage), pageCount || 1);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const pageFiles = filteredFiles.slice(startIndex, startIndex + pageSize);

  const pageFamilies = Array.from(new Set(pageFiles.map(f => f.structuralFamily)));

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h3 className="text-lg font-semibold">Archivos detectados en el lote</h3>
        {Object.keys(familyGroups).length > 0 && (
          <Select value={selectedFamilyFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Todas las familias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las familias</SelectItem>
              {Object.keys(familyGroups).map(family => (
                <SelectItem key={family} value={family}>
                  {NORMALIZATION_PREVIEW_CONFIG.structuralFamilyLabels[family as NormalizationStructuralFamily]} ({familyGroups[family].total})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Nombre del archivo</TableHead>
              <TableHead>Familia</TableHead>
              <TableHead>Rol propuesto</TableHead>
              <TableHead className="text-right">Confianza</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageFamilies.map(family => {
              const globalCount = familyGroups[family];
              const filesInFamily = pageFiles.filter(f => f.structuralFamily === family);

              return (
                <React.Fragment key={family}>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={7} className="py-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-semibold text-sm">
                          {NORMALIZATION_PREVIEW_CONFIG.structuralFamilyLabels[family as NormalizationStructuralFamily]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {globalCount.total} archivos ({globalCount.recognized} reconocidos, {globalCount.confirmation} requieren confirmación, {globalCount.blocked} bloqueados)
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                  {filesInFamily.map((file) => {
                    const hasIssues = file.issueIds.length > 0;
                    const isExpanded = expandedRow === file.id;

                    return (
                      <React.Fragment key={file.id}>
                        <TableRow className={isExpanded ? "bg-muted/10 border-b-0" : ""}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleRow(file.id)}
                              aria-label={isExpanded ? "Contraer detalles" : "Expandir detalles"}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {file.sanitizedFilename}
                            <div className="text-xs text-muted-foreground mt-0.5">{file.extension.toUpperCase()}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {NORMALIZATION_PREVIEW_CONFIG.structuralFamilyLabels[file.structuralFamily]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {NORMALIZATION_PREVIEW_CONFIG.fileRoleLabels[file.proposedRole]}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {file.simulatedConfidence ? NORMALIZATION_PREVIEW_CONFIG.confidenceLabels[file.simulatedConfidence] : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={file.status === 'recognized' ? 'default' : file.status === 'confirmation-required' ? 'warning' : 'destructive'}
                            >
                              {NORMALIZATION_PREVIEW_CONFIG.fileStatusLabels[file.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {hasIssues && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <WarningIcon className="h-4 w-4 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Tiene {file.issueIds.length} incidencia(s)</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/5 hover:bg-muted/5">
                            <TableCell colSpan={7} className="p-0 border-t-0">
                              <div className="px-14 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                  <h4 className="font-medium flex items-center gap-2 mb-2">
                                    <InfoIcon className="h-4 w-4 text-primary" /> Detalles estructurales
                                  </h4>
                                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                                    {file.structuralSummary?.responseRecordCount !== undefined && (
                                      <li>Filas detectadas: <span className="font-medium text-foreground">{file.structuralSummary.responseRecordCount}</span></li>
                                    )}
                                    {file.structuralSummary?.columnCount !== undefined && (
                                      <li>Columnas detectadas: <span className="font-medium text-foreground">{file.structuralSummary.columnCount}</span></li>
                                    )}
                                    {file.structuralSummary?.demographicFieldCount !== undefined && (
                                      <li>Campos demográficos: <span className="font-medium text-foreground">{file.structuralSummary.demographicFieldCount}</span></li>
                                    )}
                                  </ul>
                                </div>
                                {file.relationIds.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Relaciones vinculadas</h4>
                                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                                      {file.relationIds.map(relId => {
                                        const relation = model.visibleRelations.find(r => r.id === relId);
                                        return relation ? (
                                          <li key={relId}>{relation.type}</li>
                                        ) : null;
                                      })}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <div className="px-4 py-2 border-t border-border bg-muted/10" aria-live="polite">
          <PaginationShell
            page={validCurrentPage}
            pageCount={pageCount}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
