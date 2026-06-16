import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { HistoricalImportMappingDomainSummary } from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';
import { HISTORICAL_MAPPING_DOMAIN_LABELS, HISTORICAL_MAPPING_ENTITY_STATUS_LABELS } from '../../../config/survey-import/historicalImportReviewMappingConfig';
import { ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  summary: HistoricalImportMappingDomainSummary;
}

export function MappingDomainStatusCard({ summary }: Props) {
  const isReady = summary.status === 'confirmed' || summary.status === 'ignored';
  const isBlocked = summary.status === 'blocked';
  
  const progressValue = summary.total > 0 ? (summary.confirmed / summary.total) * 100 : 100;
  
  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-semibold">{HISTORICAL_MAPPING_DOMAIN_LABELS[summary.domain]}</CardTitle>
          <Badge variant={isBlocked ? 'destructive' : isReady ? 'secondary' : 'default'}
            className={isReady ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-normal' : 'font-normal'}
          >
            {HISTORICAL_MAPPING_ENTITY_STATUS_LABELS[summary.status]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 pt-4">
        {summary.total > 0 ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progreso de mapeo</span>
              <span className="font-medium text-foreground">{summary.confirmed} / {summary.total}</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">Dominio sin datos detectados</div>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs mt-auto">
          {summary.needsReview > 0 && (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-100/50">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{summary.needsReview} revisión</span>
            </div>
          )}
          {summary.ambiguous > 0 && (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-100/50">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{summary.ambiguous} ambiguos</span>
            </div>
          )}
          {summary.unmapped > 0 && (
            <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2 py-1.5 rounded-md border border-red-100/50">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{summary.unmapped} sin mapa</span>
            </div>
          )}
          {summary.blocked > 0 && (
            <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2 py-1.5 rounded-md border border-red-100/50">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{summary.blocked} bloqueos</span>
            </div>
          )}
        </div>
        
        {summary.reviewAvailability !== 'hidden' && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-between group text-sm h-8" 
                    disabled={summary.reviewAvailability === 'disabled'}
                    onClick={() => toast.info('La revisión detallada de este dominio todavía no está conectada en el prototipo.')}
                  >
                    Revisar detalle
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>La revisión detallada de este dominio todavía no está conectada en el prototipo.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
