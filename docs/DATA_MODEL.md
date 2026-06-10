# DATA_MODEL

## 1. Propósito

Este documento define el modelo canónico de datos (Canonical Data Model) para el proceso de importación asistida por IA de encuestas en UBITS. Su objetivo es garantizar un contrato fuerte y agnóstico entre la capa de origen (archivos parseados), la capa de detección (IA o heurísticas), la capa de dominio (entidades canónicas) y la capa de presentación (UI).

## 2. Alcance

El modelo define:
- Contratos para representar archivos, hojas y campos originales.
- Tipos de datos para clasificar preguntas, escalas, demográficos y participantes.
- Uniones discriminadas para manejar modos de importación excluyentes (`raw-individual` y `aggregated-comparison`).
- Mecanismos para representar niveles de confianza, evidencias y estados de revisión humana.
- Contratos para manejar errores y warnings (`ImportIssue`).
- Estructuras para el resultado y el preview del impacto de la importación.

El modelo **no define**:
- La implementación en React (Context, Hooks, Reducers).
- La implementación de parsers de Excel o CSV.
- Schemas de validación runtime (Zod).

## 3. Principios del Modelo

1. **Agnóstico al origen**: Los tipos de datos no dependen de SheetJS, PapaParse, o de la estructura interna del archivo que envía el usuario.
2. **Separación de capas**: Distinción clara entre Origen (Raw), Interpretación (Detección), Dominio Canónico (Encuesta) y Resultados (Preview).
3. **Privacidad by-design**: Evitar la propagación de PII en excepciones, logs técnicos o telemetría.
4. **Tipado fuerte**: Ausencia de `any`, usando uniones literales y tipos discriminados para modelar estados finitos y exclusivos.

## 4. Capas del Dato

- **Capa de origen**: Referencia a qué se subió (`ImportSourceFile`, `ImportSourceSheet`, `ImportSourceField`).
- **Capa de interpretación**: Cómo la IA o heurística clasifica el origen (`ImportDetection`).
- **Capa canónica**: La traducción a conceptos UBITS (`CanonicalQuestion`, `CanonicalDemographic`, `CanonicalParticipant`, `CanonicalSegment`).
- **Capa de resultado**: Evaluaciones y reportes (`ImportPreview`, `ImportIssue`, `ImportResult`).

## 5. Diagrama Textual de Entidades

```text
ImportSession
├─ SourceBatch
│  └─ ImportSourceFile
│     └─ ImportSourceSheet
│        └─ ImportSourceField
├─ ImportDetection
├─ SurveyConfiguration
├─ ImportModeData
│  ├─ RawImportData
│  │  ├─ CanonicalQuestion
│  │  ├─ CanonicalDemographic
│  │  ├─ CanonicalParticipant
│  │  └─ RawResponse
│  ├─ AggregatedImportData
│  │  ├─ CanonicalQuestion
│  │  ├─ CanonicalDemographic
│  │  ├─ CanonicalSegment
│  │  └─ AggregatedResult
│  └─ UnknownImportData
├─ ReviewProgress
├─ ImportIssue
├─ ImportPreview
└─ ImportResult
```

## 6. Entidad Raíz: `ImportSession`

La entidad principal que agrupa todo el proceso de importación en memoria para un lote de archivos. Maneja el estado de la máquina, progreso de revisión y aloja el bloque `data` discriminado por el modo de importación.

## 7. Contratos de Origen

Se definieron los contratos:
- `ImportSourceFile`
- `ImportSourceSheet`
- `ImportSourceField`

Estos contratos abstraen el objeto nativo `File` e implementan sugerencias iniciales de rol para cada nivel.

## 8. Contratos de Detección

El contrato `ImportDetection` consolida la sugerencia del modo de importación, las evidencias usadas (ej. `sheet-name` o `column-pattern`) y el nivel de confianza general.

## 9. Configuración

`SurveyConfiguration` modela aspectos generales de la encuesta que será importada: tipo (ej. `climate`, `enps`), umbrales de confidencialidad y visibilidad esperada.

## 10. Modelo Raw Individual

Aplica al modo `raw-individual`. Modela participantes individuales (`CanonicalParticipant`) y sus respuestas granulares (`RawResponse`).

## 11. Modelo Agregado Comparativo

Aplica al modo `aggregated-comparison`. Usa segmentos (`CanonicalSegment`) en lugar de participantes individuales. Agrupa resultados en `AggregatedResult` con distribuciones estadísticas de favorabilidad.

## 12. Matching y Revisión Humana

La mayoría de las entidades de dominio incluyen:
- `matchStatus`: alineado, nuevo, conflicto, ignorado.
- `reviewStatus`: no revisado, sugerido, confirmado, modificado.
- `matchConfidence` y `evidences` para justificar sugerencias.

## 13. Issues

`ImportIssue` estandariza el manejo de advertencias y errores bloqueantes. Usa un esquema que clasifica la severidad, incluye referencias seguras (sin PII) a la fuente, mensajes para UI y detalles técnicos limpios.

## 14. Capacidades Analíticas

`AnalyticCapability` representa qué módulos o tableros de UBITS se activarán si la importación tiene éxito (ej. Heatmap, Participación, eNPS), informando si el soporte es total o parcial.

## 15. Preview

`ImportPreview` contabiliza los impactos de la importación (ej. cuántas preguntas nuevas, participantes actualizados). También emite bandera de `isReady` para determinar si es seguro confirmar.

## 16. Resultado

`ImportResult` resume la ejecución final de la importación. No define un ID real de backend aún, sino un ID simulado.

## 17. Seguridad y Privacidad

El modelo requiere desvincular PII en `ImportIssue`. Los detalles técnicos deben omitir correos electrónicos y nombres completos, los cuales solo pueden residir en el dominio de memoria de `CanonicalParticipant`.

## 18. Campos Prohibidos en UI y Logs

- `ImportIssue.technicalDetail` no puede contener PII.
- `RawResponse` no debe ser persistido en logs de error.
- Objetos nativos del navegador (`File`) no deben estar dentro de la `ImportSession`.

## 19. Relaciones e Invariantes

- Un segmento no puede actuar como participante individual.
- Modo agregado no puede tener respuestas raw.
- No se puede pasar a estado `completed` sin una confirmación previa (`isCommitStarted`).

## 20. Decision Gates

Quedan abiertos para Fase 3B:
- Librerías específicas para leer Excel y CSV.
- Paginación y manejo de memoria (Web Workers) para respuestas raw masivas.
- Límites productivos de filas/columnas.
- Umbrales definitivos para anonimato de encuestas.
- Schemas Zod definitivos para los contratos.

## 21. Archivos TypeScript Creados

Ubicados en `src/types/survey-import/`:
- `common.ts`
- `issues.ts`
- `source.ts`
- `detection.ts`
- `configuration.ts`
- `questions.ts`
- `demographics.ts`
- `participants.ts`
- `segments.ts`
- `responses.ts`
- `analytics.ts`
- `data.ts`
- `preview.ts`
- `result.ts`
- `session.ts`
- `index.ts`

## 22. Pendientes para Fase 3B

1. Implementar Mocks Sintéticos (Fixtures) basados en este modelo canónico.
2. Definir Zod schemas para validación de runtime.
3. Definir adaptadores para traducir desde mock-sources hacia las interfaces canónicas.
