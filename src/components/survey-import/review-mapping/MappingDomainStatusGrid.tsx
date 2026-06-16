import { HISTORICAL_MAPPING_DOMAIN_DISPLAY_ORDER } from '../../../config/survey-import/historicalImportReviewMappingConfig';
import type { HistoricalImportMappingDomainSummary, HistoricalMappingDomain } from '../../../lib/survey-import/review-mapping/historicalImportReviewMappingTypes';
import { MappingDomainStatusCard } from './MappingDomainStatusCard';

interface Props {
  summaries: Record<HistoricalMappingDomain, HistoricalImportMappingDomainSummary>;
}

export function MappingDomainStatusGrid({ summaries }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Dominios de mapeo</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {HISTORICAL_MAPPING_DOMAIN_DISPLAY_ORDER.map((domain) => {
          const summary = summaries[domain];
          if (!summary) return null;
          return <MappingDomainStatusCard key={domain} summary={summary} />;
        })}
      </div>
    </div>
  );
}
