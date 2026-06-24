# Structure Review Workspace Architecture

**Contexto del Producto:** Carga Histórica de Encuestas. (No es Comparativo de Encuestas. No activar `readyForComparison`. No crear dashboard. No crear backend, storage, Firebase, Claude, API ni importación real).

La fase H15/H16 dejó visible el bloque de pre-homologación, pero el QA de producto concluyó que el pre-homologador no debe quedarse en un resumen general. Necesitamos diseñar una **mesa de revisión de estructura** donde el usuario pueda ver, confirmar y eventualmente ajustar cómo se interpretan:
- dimensiones
- preguntas / ítems
- demográficos
- métricas
- segmentos / cortes
- decisiones pendientes

**Importante:** estos ajustes no deben modificar la data raíz del archivo. Deben vivir como una capa de organización/homologación.

`VISIBLE_UI_CHECKPOINT = NO`
`DEBERÍAS_VER_CAMBIO_EN_INTERFAZ = NO`

## 1. Principio central: fuente inmutable + overlay editable

El workspace se divide en dos capas conceptuales:

### Source Structure Layer
- Representa lo detectado desde los archivos.
- Es **inmutable**.
- Conserva trazabilidad.
- No se edita desde la UI.

### Review Overlay Layer
- Representa ajustes humanos.
- Permite labels visibles, agrupaciones, estados y decisiones.
- No altera resultados originales.
- Se puede descartar, revisar o aplicar al borrador futuro.

## 2. Entidades del workspace

El workspace se compone de las siguientes entidades conceptuales:
- `StructureReviewDimension`
- `StructureReviewQuestion`
- `StructureReviewDemographic`
- `StructureReviewMetric`
- `StructureReviewSegment`
- `StructureReviewDecision`
- `StructureReviewSourceTrace`
- `StructureReviewOverlayAction`
- `StructureReviewWorkspaceState`

## 3. Trazabilidad mínima

Cada entidad debe tener una trazabilidad segura con los siguientes atributos:
- `sourceFileName`
- `sourceSheetName`
- `sourceLayout`
- `sourceEntityType`
- `sourceLabel`
- `normalizedSourceLabel`
- `sourceRowReference` (opcional y seguro)
- `sourceColumnReference` (opcional y seguro)
- `confidence`
- `detectionReason`

*(No incluir datos sensibles ni valores crudos de respuestas).*

## 4. Matriz de Edición (Qué se puede editar y qué no)

**Editable:**
- label visible de dimensión
- label visible de pregunta
- agrupación pregunta -> dimensión
- si un demográfico se usa o no para segmentación
- nombre visible de demográfico
- nombre visible de segmento/corte
- estado de decisión humana
- notas de revisión

**No editable:**
- archivo original
- hoja original
- valores de respuestas
- métricas calculadas originales
- conteos originales
- IDs de participantes
- raw rows
- workbook dump
- catálogo global UBITS

## 5. Estados de revisión

- `pending_review`
- `confirmed`
- `renamed`
- `moved`
- `ignored`
- `blocked`
- `not_applicable`

## 6. Acciones de overlay (No destructivas)

- `rename_dimension_label`
- `rename_question_label`
- `move_question_to_dimension`
- `mark_demographic_as_segmentable`
- `mark_demographic_as_ignored`
- `rename_demographic_label`
- `confirm_metric_mapping`
- `confirm_segment_mapping`
- `ignore_segment`
- `resolve_decision`
- `add_review_note`

**Contrato de Acción:**
- `id`
- `actionType`
- `targetEntityId`
- `previousValue`
- `nextValue`
- `reason`
- `createdBy`
- `createdAtPolicy` (mock/static/omitted en runtime prototipo)
- `sourceTrace`

## 7. Regla crítica: mover preguntas sin romper resultados

Mover una pregunta entre dimensiones **no cambia el resultado original ni los valores de respuesta**.
Solo cambia la agrupación interpretativa usada para el borrador futuro y para visualización/homologación.
La entidad debe conservar `sourceTrace` hacia su dimensión detectada originalmente y su dimensión revisada.

## 8. Manejo de demográficos

Los demográficos son campos de segmentación potencial, no resultados. El workspace debe permitir:
- listar demográficos detectados;
- marcar como usable para segmentación;
- marcar como ignorado;
- renombrar label visible;
- preservar nombre original;
- bloquear campos sensibles si hay riesgo de identificación;
- no mostrar valores individuales;
- no exponer PII.

## 9. Manejo de métricas

Métricas esperadas para clima agregado:
- percepción negativa
- percepción neutra
- percepción positiva
- total de respuestas

El usuario podrá confirmar el mapeo, pero no editar valores.

## 10. Manejo de segmentos/cortes

Los archivos por gerencia deben tratarse como cortes del mismo ciclo cuando corresponda (Ej: Gerencia Comercial 2025, Gerencia General 2025, etc.). No tratarlos automáticamente como encuestas independientes si pertenecen al mismo grupo.

## 11. UI futura recomendada (Slices)

- **H19:** solo vista de inventario (panel/lista de dimensiones, preguntas agrupadas por dimensión, badges de estado, sin edición todavía).
- **H22:** edición controlada (renombrar label visible, mover pregunta a otra dimensión, marcar demográfico como usable/no usable, todo como overlay).
- **H24:** revisión de decisiones pendientes (lista de decisiones, confirmar / ignorar / bloquear).
- **H26:** preparar borrador de carga (usar overlay confirmado, no importar todavía).

## 12. Output esperado del primer slice visual futuro (H19)

**Revisión de estructura**

- Total de dimensiones detectadas: N
- Total de preguntas/ítems detectados: N
- Total de demográficos detectados: N
- Total de métricas detectadas: N
- Total de segmentos/cortes detectados: N

Luego listado:
```
Dimensión A
  - Pregunta 1
  - Pregunta 2
Dimensión B
  - Pregunta 3
```

Si no hay detalle suficiente todavía, mostrar fallback:
`Aún falta inventario estructural seguro para listar elementos uno por uno.`

## 13. Out of scope

UI runtime, editor visual, drag and drop, persistencia, importación real, API, backend, storage, Claude, Firebase, dashboard, comparativo, readyForComparison, aprobación automática, mutación de catálogo global, edición de datos fuente, edición de resultados.
