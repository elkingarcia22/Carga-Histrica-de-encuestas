import * as React from "react"
import { ChartCard } from "../charts/ChartCard"
import type { EChartsOption } from "../charts/types"
import type { TrendMetricLineChartProps } from "./surveyAnalyticsTypes"

/**
 * TrendMetricLineChart
 * 
 * Specialized component for visualizing temporal trends of survey metrics.
 * Built on top of the ECharts infrastructure.
 */
export function TrendMetricLineChart({
  title,
  description,
  series,
  height = 300,
  showLegend = true,
  showComparison = true,
  loading = false,
  empty = false,
  error,
  actions,
  footer,
  ariaLabel,
  summary,
  className,
}: TrendMetricLineChartProps) {
  
  // Build ECharts option
  const option: EChartsOption = React.useMemo(() => {
    if (!series || series.length === 0) return {}

    // Extract all unique labels (X axis)
    const labels = Array.from(
      new Set(series.flatMap(s => s.data.map(p => p.label)))
    ).sort()

    interface EChartsSeriesOption {
      name: string
      type: "line"
      data: (number | null)[]
      smooth: boolean
      symbol: string
      symbolSize: number
      showSymbol?: boolean
      lineStyle?: {
        width: number
        type?: "solid" | "dashed" | "dotted"
        opacity?: number
      }
      areaStyle?: {
        opacity: number
      }
      itemStyle?: {
        opacity: number
      }
    }

    const echartsSeries: EChartsSeriesOption[] = []

    series.forEach(s => {
      // Main series
      const dataValues = labels.map(label => {
        const point = s.data.find(p => p.label === label)
        return point ? point.value : null
      })

      echartsSeries.push({
        name: s.label,
        type: "line",
        data: dataValues,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: s.data.length === 1,
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          opacity: 0.05,
        },
      })

      // Comparison series (if enabled and data exists)
      if (showComparison) {
        const comparisonValues = labels.map(label => {
          const point = s.data.find(p => p.label === label)
          return point && point.comparisonValue !== undefined ? point.comparisonValue : null
        })

        // Only add if there's at least one comparison value
        if (comparisonValues.some(v => v !== null)) {
          echartsSeries.push({
            name: `${s.label} (Comparativo)`,
            type: "line",
            data: comparisonValues,
            smooth: true,
            symbol: "circle",
            symbolSize: 4,
            lineStyle: {
              width: 2,
              type: "dashed",
              opacity: 0.5,
            },
            itemStyle: {
              opacity: 0.5,
            },
            areaStyle: {
              opacity: 0,
            }
          })
        }
      }
    })

    return {
      legend: {
        show: showLegend,
        bottom: 0,
        icon: "circle",
      },
      grid: {
        top: title ? 60 : 20,
        bottom: showLegend ? 40 : 20,
        left: 40,
        right: 20,
      },
      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
          },
        },
      },
      series: echartsSeries,
      tooltip: {
        trigger: "axis",
        // The theme handles the visual style of the tooltip container
      }
    }
  }, [series, showLegend, showComparison, title])

  return (
    <ChartCard
      title={title ?? ""}
      description={description}
      option={option}
      height={height}
      loading={loading}
      empty={empty || series.length === 0}
      error={error}
      ariaLabel={ariaLabel ?? title}
      summary={summary}
      actions={actions}
      footer={footer}
      className={className}
    />
  )
}
