import { cn } from '@/lib/utils'
import { InlineLegend } from './InlineLegend'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  TooltipProvider 
} from "@/components/ui/tooltip"
import type { ResponseStackedBarProps, LegendTone } from './surveyAnalyticsTypes'

/**
 * ResponseStackedBar - Visual distribution of survey responses using a 100% stacked bar.
 * Uses HTML/CSS for high control and accessibility.
 * Now includes ECharts-style rich tooltips on hover.
 */
export function ResponseStackedBar({
  segments,
  label,
  description,
  total,
  showLabels = false,
  showPercentages = true,
  showLegend = false,
  size = "md",
  className,
}: ResponseStackedBarProps) {
  
  // Calculate total if not provided
  const resolvedTotal = total || segments.reduce((sum, s) => sum + s.value, 0)
  
  // Prepare segments with calculated percentages
  const processedSegments = segments.map(s => ({
    ...s,
    resolvedPercentage: s.percentage !== undefined 
      ? s.percentage 
      : (resolvedTotal > 0 ? (s.value / resolvedTotal) * 100 : 0)
  })).filter(s => s.resolvedPercentage > 0)

  const barSizeClasses = {
    sm: "h-3",
    md: "h-6",
  }[size]

  const toneToBg = (tone?: LegendTone) => {
    switch (tone) {
      case "primary": return "bg-primary"
      case "positive": return "bg-success"
      case "negative": return "bg-destructive"
      case "warning": return "bg-warning"
      case "info": return "bg-info"
      case "neutral": return "bg-muted-foreground/60"
      default: return "bg-muted-foreground/40"
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("space-y-3", className)}>
        {/* Header */}
        {(label || description) && (
          <div className="space-y-1">
            {label && <h4 className="text-sm font-bold leading-tight">{label}</h4>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        )}

        {/* Bar Container */}
        <div className={cn(
          "w-full rounded-full overflow-hidden flex bg-muted/30 border border-border/40",
          barSizeClasses
        )}>
          {processedSegments.length > 0 ? (
            processedSegments.map((segment) => (
              <Tooltip key={segment.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full relative group cursor-default outline-none",
                      toneToBg(segment.tone)
                    )}
                    style={{ width: `${segment.resolvedPercentage}%` }}
                    role="img"
                    aria-label={`${segment.label}: ${segment.percentage ?? Math.round(segment.resolvedPercentage)}%`}
                  >
                    {/* Inline label (optional) */}
                    {showLabels && segment.resolvedPercentage > 8 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground truncate px-1 pointer-events-none">
                        {showPercentages ? `${Math.round(segment.resolvedPercentage)}%` : segment.value}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={8}
                  className="bg-background/95 text-foreground border border-border/80 shadow-md p-2.5 min-w-[140px] rounded-sm pointer-events-none z-[100]"
                >
                  <div className="flex flex-col gap-2">
                    {label && (
                      <div className="text-[11px] font-bold text-muted-foreground border-b border-border/40 pb-1.5 mb-0.5">
                        {label}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full ring-1 ring-black/5", toneToBg(segment.tone))} />
                        <span className="text-[12px] font-medium text-foreground/90">{segment.label}</span>
                      </div>
                      <span className="text-[12px] font-bold text-foreground font-mono">
                        {showPercentages ? `${Math.round(segment.resolvedPercentage)}%` : segment.value}
                      </span>
                    </div>
                    {segment.description && (
                      <div className="text-[10px] text-muted-foreground/80 leading-snug border-t border-border/30 pt-1.5 mt-0.5 max-w-[200px]">
                        {segment.description}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-medium italic">
              Sin datos de respuesta
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && processedSegments.length > 0 && (
          <InlineLegend 
            size="sm"
            items={processedSegments.map(s => ({
              label: s.label,
              value: showPercentages ? `${Math.round(s.resolvedPercentage)}%` : s.value,
              tone: s.tone,
              description: s.description
            }))}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
