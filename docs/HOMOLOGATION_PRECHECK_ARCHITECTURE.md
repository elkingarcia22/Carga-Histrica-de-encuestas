# Homologation Precheck Architecture

## 1. Propósito

El prechequeo de homologación debe servir para preparar la carga histórica, no para importar todavía.
Debe responder a la siguiente pregunta:

> “Con lo que detecté en el archivo, ¿qué puedo homologar contra la plataforma y qué necesita revisión humana?”

---

## 2. Inputs permitidos

Solo se usarán los siguientes datos seguros provenientes del análisis de contenido previo:

- `fileName`
- `sheetName`
- `sheetLayout`
- `rowCount`
- `columnCount`
- `sampleColumnLabels`
- `detectedSignals`
- `classificationReason`
- `confidence`
- `participantIdentificationState`

**Restricciones estrictas:**
No se debe usar: `rawRows`, `allRows`, `fullRows`, `rows`, `cells`, `workbookDump`, `worksheetDump`, `fullWorkbook`, `rawWorkbook`, `rawJson`, `emails`, `documents`, `fileBuffer`, `arrayBuffer`, `binary`, `base64`.

---

## 3. Entidades de pre-homologación

Las entidades conceptuales a manejar en esta fase son:

- `question_or_item`
- `dimension`
- `metric`
- `segment`
- `participant_identifier`
- `response_scale`
- `survey_cycle`
- `source_file_role`

---

## 4. Estados de homologación

Cada entidad podrá estar en uno de los siguientes estados:

- `matched`
- `suggested_match`
- `needs_review`
- `not_found`
- `blocked`
- `not_applicable`

---

## 5. Confidence model

El modelo de confianza se basa en cuatro niveles con reglas estrictas:

- `high`: match directo por nombre normalizado y tipo compatible.
- `medium`: match parcial con señales suficientes.
- `low`: match ambiguo.
- `blocked`: falta metadata mínima o existe riesgo de privacidad.

---

## 6. Decisiones humanas

Las decisiones que el usuario (o sistema en caso de delegación) deberá tomar o confirmar son:

- `confirm_item_mapping`
- `confirm_dimension_mapping`
- `confirm_metric_mapping`
- `confirm_segment_mapping`
- `confirm_response_scale`
- `confirm_participant_identification`
- `confirm_source_file_role`

Cada contrato de decisión debe incluir la siguiente estructura de datos:
- `id`
- `title`
- `entityType`
- `sourceLabel`
- `suggestedTarget`
- `reason`
- `confidence`
- `impact`
- `options`
- `recommendedOptionId`

---

## 7. Output conversacional futuro

En la fase H13, el output de pre-homologación deberá mostrarse exclusivamente en bullets, siguiendo el patrón conversacional actual sin tarjetas (`cards`) ni grillas (`grids`).

Ejemplo de cómo debe verse en H13:

Pre-homologación detectada

- Ítems/preguntas: detectables por filas; requieren lectura segura de ítems antes de homologar.
- Dimensiones: detectables por filas tipo “Dimension”.
- Métricas: percepción negativa, neutra, positiva y total de respuestas.
- Segmentos: archivos de gerencia tratados como cortes del grupo Clima 2025.
- Identificación de participantes: no se detectaron identificadores directos en el archivo agregado.
- Qué puedo sugerir: homologar estructura de hojas y rol de archivos.
- Qué requiere revisión: reglas de ítems, dimensiones y escala antes de preparar el borrador.

---

## 8. Out of scope

Lo siguiente queda explícitamente fuera del alcance de esta fase de arquitectura y del posterior prechequeo:

- Real import
- API integration
- Backend creation
- Storage usage
- Claude integration
- Firebase usage
- Dashboard creation
- Comparison logic
- `readyForComparison` activation
- Automatic approval
- Global catalog mutation
- Production sync

---

## 9. Fases futuras

La evolución continuará en las siguientes fases:

- **11D-H13 · Homologation Precheck Types and Mapper**: Definición técnica de tipos y el mapper funcional del prechequeo.
- **11D-H14 · Homologation Precheck Conversational UI**: Implementación de la interfaz conversacional basada en bullets (como se definió).
- **11D-H15 · Visual QA**: Revisión y aseguramiento de la calidad visual.
- **11D-H16 · Hotfix si aplica**: Resolución de problemas identificados en el QA.

---

## Marcadores

- PHASE_11D_H12_HOMOLOGATION_PRECHECK_ARCHITECTURE_COMPLETE
- HOMOLOGATION_PRECHECK_ARCHITECTURE_LOCKED
- HOMOLOGATION_PRECHECK_INPUTS_DEFINED
- HOMOLOGATION_ENTITIES_DEFINED
- HOMOLOGATION_STATES_DEFINED
- HOMOLOGATION_CONFIDENCE_MODEL_DEFINED
- HUMAN_DECISION_CONTRACT_DEFINED
- BULLETS_ONLY_OUTPUT_CONTRACT_DEFINED
- NO_RUNTIME_IMPLEMENTATION
- NO_UI_INTEGRATION
- NO_PARSER_CHANGES
- NO_ANALYZER_CHANGES
- NO_BACKEND_CREATED
- NO_STORAGE_CREATED
- NO_CLAUDE_CONNECTION_CREATED
- NO_API_CONNECTIONS
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- COMPARISON_DASHBOARD_OUT_OF_SCOPE
- VISIBLE_UI_CHECKPOINT_NO
- PHASE_11D_H13_HOMOLOGATION_PRECHECK_TYPES_MAPPER_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED
