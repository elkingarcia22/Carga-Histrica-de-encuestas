# Historical Preview Simulated Local Contract and Adapter Build Planning

## 1. Objetivo y Alcance
Este documento detalla la planificación técnica para la Fase 4E4. Define la estructura de tipos, la firma del adaptador, y las interfaces locales que permitirán renderizar la pantalla *Historical Preview Simulated* de manera unívoca y determinística, basada estrictamente en el `HISTORICAL_PREVIEW_SIMULATED_MOCK_DATA_CONTRACT.md`.

**Nota Restrictiva:** Este documento es exclusivamente de planificación. No se debe codificar en `src/` hasta que la fase 4E5 sea autorizada.

## 2. Tipos de Dominio (Local Contracts)
Se definirá una estructura de tipos en `src/lib/survey-import/historical-preview/simulation/types.ts` que reflejará fielmente el contrato mock, separando claramente los datos derivados del fixture base y los datos sintéticos (deltas, insights).

```typescript
// src/lib/survey-import/historical-preview/simulation/types.ts

export type ScenarioState =
  | 'VALID_COMPARISON'
  | 'LIMITED_DATA'
  | 'EMPTY_STATE'
  | 'SIMULATED_ERROR';

export interface HistoricalPeriod {
  periodId: string;
  name: string;
  favorabilityPercentage: number;
  participationRate: number;
  responsesCount: number;
  distribution: {
    favorable: number;
    neutral: number;
    unfavorable: number;
  };
}

export interface HistoricalPreviewSimulatedContract {
  contractId: 'historical-preview-simulated';
  contractVersion: '1.0';
  isSynthetic: true;
  scenario: ScenarioState;
  
  // Datos del escenario (solo presentes si no hay error/empty state total)
  data?: {
    basePeriod: HistoricalPeriod;
    comparativePeriod: HistoricalPeriod;
    
    // Deltas sintéticos
    delta: {
      favorabilityPoints: number; // Ej: +6
      trend: 'positive' | 'negative' | 'neutral';
    };
    
    // Insights generados
    insights: string[]; // Ej: ["Variación positiva de favorabilidad", "Participación estable"]
    
    // Datos heredados del fixture (Resumen pasivo)
    capabilitiesCount: number;
    segmentsCount: number;
  };

  // Disclaimer mandatario
  disclaimer: {
    message: string;
    isMandatory: true;
  };
}
```

## 3. Firma del Adaptador (Adapter)
El adaptador residirá en `src/lib/survey-import/historical-preview/simulation/adapter.ts`. Su responsabilidad será tomar el fixture base procesado por U3-SIM y transformarlo en el `HistoricalPreviewSimulatedContract` inyectando los deltas sintéticos según las reglas matemáticas del contrato mock.

```typescript
// src/lib/survey-import/historical-preview/simulation/adapter.ts

import { ProcessedSurveyFixture } from '@/lib/survey-import/simulationTypes'; // Ejemplo de import
import { HistoricalPreviewSimulatedContract, ScenarioState } from './types';

/**
 * Genera el contrato mock para el Historical Preview.
 * NO evalúa dominio real, NO tiene estado.
 */
export const createHistoricalPreviewSimulatedContract = (
  baseFixture: ProcessedSurveyFixture,
  forcedScenario: ScenarioState = 'VALID_COMPARISON'
): HistoricalPreviewSimulatedContract => {
  // 1. Manejo temprano de escenarios EMPTY_STATE y SIMULATED_ERROR
  // 2. Extracción pasiva de capacidades y segmentos del baseFixture
  // 3. Generación determinística del periodo comparativo (sintético)
  // 4. Cálculo matemático exacto de la distribución según el Mock Data Contract (ej: 89/19/12 para 120 respuestas)
  // 5. Retorno del contrato inmutable
  // ...
};
```

## 4. Interfaces de UI Locales
La pantalla y sus componentes presentacionales residirán en `src/components/survey-import/historical-preview/`. Sus props se definirán en función del contrato local.

```typescript
// src/components/survey-import/historical-preview/HistoricalPreviewSimulatedScreen.tsx

import { HistoricalPreviewSimulatedContract } from '@/lib/survey-import/historical-preview/simulation/types';

export interface HistoricalPreviewSimulatedScreenProps {
  contract: HistoricalPreviewSimulatedContract;
  onAccept: () => void;
  onCancel: () => void;
}
```

## 5. Ubicación de Archivos (Future Imports)

La estructura de carpetas futura será la siguiente:

```text
src/
  lib/
    survey-import/
      historical-preview/
        simulation/
          types.ts             // Tipos locales
          adapter.ts           // Función createHistoricalPreviewSimulatedContract
          constants.ts         // Constantes de distribución y literales
  components/
    survey-import/
      historical-preview/
        HistoricalPreviewSimulatedScreen.tsx
        components/
          PeriodComparisonCard.tsx
          InsightsList.tsx
          HistoricalDisclaimer.tsx
```

## 6. Siguientes Pasos (Bloqueados)
- **Fase 4E5:** Implementación real de los archivos detallados en el punto 5, sin modificar U1, U2 o U3-SIM.
- Auditoría técnica del compilador y linter sobre el nuevo código.
