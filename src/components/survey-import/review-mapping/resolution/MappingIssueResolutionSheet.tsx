import type { 
  HistoricalImportMappingEntity, 
  HistoricalImportMappingIssue,
  HistoricalConfigurationCompatibilityCheck,
  HistoricalMappingScalePolarity,
  HistoricalMappingResolutionOrigin,
  HistoricalMappingIssueResolutionInput
} from '@/lib/survey-import/review-mapping/historicalImportReviewMappingTypes';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UbitsIcon } from '@/icons';

import { ScaleSourceSummary } from './ScaleSourceSummary';
import { AmbiguousPolarityResolution } from './AmbiguousPolarityResolution';
import { ResolutionImpactSummary } from './ResolutionImpactSummary';

interface Props {
  open: boolean;
  issue: HistoricalImportMappingIssue;
  entity: HistoricalImportMappingEntity;
  compatibility: HistoricalConfigurationCompatibilityCheck;
  selectedPolarity?: HistoricalMappingScalePolarity;
  resolutionOrigin?: HistoricalMappingResolutionOrigin;
  localError: string | null;
  onSelectionChange: (polarity: HistoricalMappingScalePolarity, origin: HistoricalMappingResolutionOrigin) => void;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: (input: HistoricalMappingIssueResolutionInput) => { ok: boolean; messageKey?: string };
}

export function MappingIssueResolutionSheet({
  open,
  issue,
  entity,
  compatibility,
  selectedPolarity,
  resolutionOrigin,
  localError,
  onSelectionChange,
  onOpenChange,
  onCancel,
  onConfirm
}: Props) {
  const isCompatible = compatibility.status === 'current';
  const scaleMetadata = entity.scaleMetadata;

  const handleSelectionChange = (polarity: HistoricalMappingScalePolarity, origin: HistoricalMappingResolutionOrigin) => {
    // If there is a previously confirmed resolution and they restore it
    if (
      origin === 'user-confirmed-suggestion' && 
      scaleMetadata?.resolutionOrigin === 'user-confirmed-suggestion' &&
      polarity === scaleMetadata.suggestedPolarity
    ) {
      onSelectionChange(polarity, 'restored-to-suggestion');
    } else {
      onSelectionChange(polarity, origin);
    }
  };

  const handleConfirm = () => {
    if (!selectedPolarity || selectedPolarity === 'unresolved' || !isCompatible) {
      return;
    }

    const input: HistoricalMappingIssueResolutionInput = {
      mappingIssueId: issue.id,
      mappingEntityId: entity.id,
      resolutionType: 'confirm-polarity',
      selectedPolarity,
      resolutionOrigin: resolutionOrigin || 'user-selected',
      resolvedByRole: 'admin' // Arbitrary role for the prototype
    };

    onConfirm(input);
  };

  if (!scaleMetadata) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onCancel();
      else onOpenChange(isOpen);
    }}>
      <SheetContent 
        className="w-full sm:max-w-lg overflow-y-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
          onCancel();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
      >
        <SheetHeader>
          <SheetTitle>Resolver incidencia de mapeo</SheetTitle>
          <SheetDescription>
            {issue.title}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {issue.domain}
            </Badge>
          </div>

          <Alert variant="info" className="bg-slate-50 border-slate-200 text-slate-600">
            <UbitsIcon name="info" className="h-4 w-4" />
            <AlertDescription>
              La simulación detectó una escala cuyo significado (polaridad) no se pudo inferir automáticamente.
            </AlertDescription>
          </Alert>

          <ScaleSourceSummary metadata={scaleMetadata} />

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">Motivo de ambigüedad</h4>
            <p className="text-sm text-slate-600">
              {issue.description}
            </p>
          </div>

          <AmbiguousPolarityResolution 
            suggestedPolarity={scaleMetadata.suggestedPolarity}
            selectedPolarity={selectedPolarity}
            onSelectionChange={handleSelectionChange}
            disabled={!isCompatible}
          />

          <ResolutionImpactSummary />

          {localError && (
            <Alert variant="destructive">
              <UbitsIcon name="error" className="h-4 w-4" />
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          {!isCompatible && (
            <Alert variant="warning">
              <UbitsIcon name="warning" className="h-4 w-4" />
              <AlertDescription>
                La configuración origen ha sido modificada. Regresa al paso anterior para recomputar el mapeo antes de resolver incidencias.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <SheetFooter className="mt-auto">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedPolarity || selectedPolarity === 'unresolved' || !isCompatible}
          >
            Confirmar resolución
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
