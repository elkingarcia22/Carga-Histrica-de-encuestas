# Read-only to Edit Mode Decision Gate

## 1. Decisión
El primer paso hacia edición controlada será renombrar labels visibles de dimensiones y preguntas mediante overlay local.

## 2. Justificación
Renombrar labels visibles es la acción de menor riesgo porque no cambia resultados, no mueve preguntas, no altera source data, no toca respuestas y permite validar valor del overlay.

## 3. Alcance aprobado
- `rename_dimension_label`
- `rename_question_label`

## 4. Alcance bloqueado
- `move_question_to_dimension`
- `drag_and_drop`
- `confirm_review_decision`
- `edit_metric`
- `edit_demographic`
- `delete_source_entity`
- `persist_overlay`
- `prepare_draft`
- `comparison_dashboard`

## 5. UX futura aprobada
- La revisión inicia read-only.
- Aparece una acción secundaria “Ajustar etiquetas”.
- Al activarla, solo se habilitan inputs controlados para labels visibles.
- Cada cambio se marca como “Ajuste local”.
- Se muestra contador de cambios pendientes.
- El usuario puede cancelar cambios locales.

## 6. Reglas de validación
- `nextLabel` no puede estar vacío.
- `nextLabel` no puede contener PII obvia.
- no puede contener raw rows.
- no puede contener respuestas individuales.
- no puede usar valores numéricos de resultados como label.
- no puede mutar source fixture.

## 7. Estado de overlay
- overlay local en memoria.
- no persistencia real.
- no backend.
- no storage.
- no API.
- no Claude.

## 8. Criterios para la próxima fase
La próxima fase autorizada será: **11D-H32 · Controlled Rename UI**

Debe construir solo:
- modo edición local para renombrar dimensión/pregunta;
- sin mover preguntas;
- sin drag and drop;
- sin persistencia;
- sin preparar borrador.
