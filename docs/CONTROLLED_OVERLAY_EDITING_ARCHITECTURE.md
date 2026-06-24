# Controlled Overlay Editing Architecture

## 1. Propósito
Controlled Overlay Editing permite hacer ajustes humanos sobre labels, agrupaciones y decisiones de revisión usando una capa no destructiva encima del fixture o fuente detectada.

## 2. Capas del modelo
1. **Source Fixture Layer**
   - dataset curado o estructura detectada;
   - inmutable;
   - representa evidencia/base.

2. **Review Overlay Layer**
   - acciones humanas futuras;
   - no destructiva;
   - puede renombrar, mover o confirmar elementos.

3. **Resolved View Layer**
   - vista calculada;
   - combina source + overlay;
   - usada por UI y futuro borrador.

## 3. Acciones permitidas
Las acciones futuras permitidas son:
- `rename_dimension_label`
- `rename_question_label`
- `move_question_to_dimension`
- `mark_demographic_as_segmentable`
- `mark_demographic_as_ignored`
- `confirm_metric_mapping`
- `confirm_segment_mapping`
- `confirm_question_dimension_mapping`
- `resolve_review_decision`
- `add_review_note`

## 4. Acciones prohibidas
Queda explícitamente prohibido:
- `delete_source_dimension`
- `delete_source_question`
- `delete_source_metric`
- `delete_source_demographic`
- `delete_source_segment`
- `edit_original_file`
- `edit_original_sheet`
- `edit_original_row`
- `edit_original_response_value`
- `edit_participant_value`
- `edit_open_text_response`
- `merge_real_workbooks`
- `persist_to_backend`
- `send_to_claude`
- `enable_comparison_dashboard`

## 5. Entidades afectables
Las entidades que pueden recibir overlay son:
- `dimension`
- `question`
- `question_dimension_mapping`
- `metric`
- `demographic`
- `segment`
- `review_decision`
- `dataset_note`

## 6. Contrato conceptual de OverlayAction
El contrato conceptual, sin implementar tipos aún, es:
- `id`
- `actionType`
- `targetEntityType`
- `targetEntityId`
- `previousValue`
- `nextValue`
- `reason`
- `reviewState`
- `sourceTrace`
- `createdBy` = `demo_user/system_review`, no usuario real
- `createdAt` = `static_fixture_timestamp` o no usar fecha todavía

Regla: No usar fechas dinámicas ni IDs aleatorios en prototipo.

## 7. Vista resuelta
La vista final se calcula de la siguiente manera:
- `resolvedDimensionLabel` = overlay rename si existe, si no source displayLabel
- `resolvedQuestionLabel` = overlay rename si existe, si no source displayLabel
- `resolvedQuestionDimension` = overlay move si existe, si no source mapping
- `resolvedDemographicState` = overlay segmentable/ignored si existe, si no source state
- `resolvedDecisionState` = overlay resolve si existe, si no pending

## 8. Reglas de conflicto
En caso de conflictos:
- Dos renombres sobre la misma dimensión: gana la última acción válida dentro del overlay local.
- Mover una pregunta varias veces: gana el último destino válido.
- Mover pregunta a dimensión inexistente: acción inválida.
- Renombrar label vacío: acción inválida.
- Marcar demográfico como segmentable e ignorado al mismo tiempo: requiere resolución.

## 9. Validaciones mínimas futuras
Validaciones requeridas antes de aceptar una acción overlay:
- `targetEntityId` existe en source layer o resolved layer.
- `actionType` es permitido.
- `nextValue` no está vacío cuando aplica.
- no apunta a PII.
- no introduce raw rows.
- no incluye respuestas individuales.
- no introduce valores reales de resultados.
- no activa comparación.

## 10. UX futura esperada
Esta fase no construye esta UI, pero se espera:
- botón “Ajustar estructura” solo después de revisión read-only;
- panel lateral o modo edición controlado;
- acciones reversibles;
- etiqueta “Ajuste local”;
- contador de cambios pendientes;
- botón futuro “Aplicar al borrador” aún no autorizado.

## 11. Límites de privacidad
Se debe mantener:
- No mostrar respuestas individuales.
- No mostrar comentarios abiertos.
- No mostrar PII.
- No mostrar raw rows.
- No mostrar workbook dumps.
- No enviar nada a servicios externos.

## 12. Relación con fases futuras
Fases futuras definidas:
- 11D-H30 · Overlay Editing Types / Reducer Architecture Lock o Types
- 11D-H31 · Read-only to Edit Mode Decision Gate
- 11D-H32 · Controlled Rename UI
- 11D-H33 · Move Question UI
- 11D-H34 · Overlay Visual QA
- 11D-H35 · Hotfix si aplica
- 11D-H36 · Draft Preparation Architecture
