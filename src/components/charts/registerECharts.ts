import * as echarts from 'echarts/core';
import {
  BarChart,
  LineChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

/**
 * registerECharts
 *
 * Modular registration of Apache ECharts components to minimize bundle size.
 * Only components required for the current base wrapper are included.
 *
 * Add new chart types and components here as future phases require them
 * (e.g. PieChart for Fase 7C.5, HeatmapChart for Fase 7C.6).
 * Do not pre-register components that are not yet in use.
 */
echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

export default echarts;
