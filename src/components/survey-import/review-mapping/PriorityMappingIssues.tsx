import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HistoricalImportMappingIssue } from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';

import { HISTORICAL_MAPPING_ISSUE_SEVERITY_LABELS, HISTORICAL_MAPPING_DOMAIN_LABELS } from '../../../config/survey-import/historicalImportReviewMappingConfig';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  issues: HistoricalImportMappingIssue[];
}

export function PriorityMappingIssues({ issues }: Props) {
  if (issues.length === 0) {
    return (
      <Card className="shadow-sm bg-emerald-50/50 border-emerald-100">
        <CardContent className="p-4 flex items-center justify-between text-emerald-800">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            No hay incidencias prioritarias pendientes.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-amber-200">
      <CardHeader className="pb-3 bg-amber-50/50 rounded-t-xl border-b border-amber-100">
        <CardTitle className="text-base font-semibold text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Incidencias prioritarias
          <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100 font-medium">
            {issues.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {issues.map((issue) => (
            <div key={issue.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={issue.severity === 'blocking' || issue.severity === 'simulated-error' ? 'destructive' : 'secondary'} className="font-normal text-xs">
                    {HISTORICAL_MAPPING_ISSUE_SEVERITY_LABELS[issue.severity]}
                  </Badge>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {issue.domain !== 'global' ? HISTORICAL_MAPPING_DOMAIN_LABELS[issue.domain] : 'Global'}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </div>
              
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0 group">
                      {issue.actionConcept}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>La resolución detallada de incidencias todavía no está conectada en el prototipo.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
