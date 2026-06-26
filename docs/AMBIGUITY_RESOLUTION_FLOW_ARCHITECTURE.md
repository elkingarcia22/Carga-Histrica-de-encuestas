# Ambiguity Resolution Flow Architecture

## 1. Propósito

El Ambiguity Resolution Flow permite resolver conflictos o incertidumbres detectadas durante la preparación de una carga histórica.

- La resolución ocurre dentro del chat.
- El usuario responde por texto.
- El sistema puede sugerir opciones numeradas.
- No se usan botones de decisión.
- No se abre panel lateral.
- No se crea editor externo.
- No se ejecuta importación real.

## 2. Principios de diseño

- Una ambigüedad a la vez.
- Preguntas cortas y accionables.
- Opciones numeradas cuando haya alternativas cerradas.
- Confirmación explícita cuando el cambio afecte estructura, privacidad o interpretación.
- Explicación breve del porqué se pregunta.
- No exponer PII, filas crudas ni respuestas abiertas.
- No usar lenguaje técnico innecesario.
- Mantener tono UBITS B2B, claro y sobrio.

## 3. Tipos de ambigüedad

1. `MultipleSurveyScopeAmbiguity` — Cuando se detecta más de una encuesta, ciclo o carga histórica posible.
2. `SurveyNameAmbiguity` — Cuando el nombre inferido es incompleto, dudoso o conflictivo.
3. `SurveyTypeAmbiguity` — Cuando el tipo no puede inferirse con confianza entre Clima, Cultura o NPS.
4. `VisibilityAmbiguity` — Cuando la visibilidad Anónimo/Público no es clara.
5. `EndDateAmbiguity` — Cuando la fecha de finalización inferida por ciclo/nombre no es confiable.
6. `MainFileAmbiguity` — Cuando no es claro cuál archivo debe ser principal.
7. `AssociatedFilesAmbiguity` — Cuando hay archivos asociados que podrían ser segmentos, cortes o duplicados.
8. `QuestionScaleAmbiguity` — Cuando no es claro cómo interpretar preguntas, escalas o favorabilidad.
9. `DemographicMappingAmbiguity` — Cuando columnas demográficas pueden mapear a más de un concepto.
10. `DimensionMappingAmbiguity` — Cuando una pregunta puede pertenecer a varias dimensiones.
11. `SegmentCutAmbiguity` — Cuando un archivo o columna puede representar segmento, corte, gerencia o área.
12. `PrivacyThresholdAmbiguity` — Cuando hay riesgo de grupos pequeños o umbral de confidencialidad insuficiente.
13. `DuplicateOrConflictAmbiguity` — Cuando dos archivos o estructuras contienen información solapada/conflictiva.
14. `OutOfScopeRequestAmbiguity` — Cuando el usuario pide dashboard, comparativo, importación real o acción fuera de alcance.

## 4. Modelo conceptual de ambigüedad

Cada ambigüedad se compone de los siguientes atributos conceptuales:

- `Ambiguity id` — Identificador único de la ambigüedad.
- `Ambiguity type` — Tipo según la taxonomía del listado anterior.
- `Detected at step` — Paso del flujo en que se detectó.
- `Severity` — `low`, `medium`, `high` o `blocking`.
- `Confidence` — Nivel de confianza del sistema sobre la inferencia original.
- `User-facing explanation` — Texto claro para el usuario explicando la ambigüedad.
- `Options` — Lista de alternativas posibles para resolver la ambigüedad.
- `Recommended option` — Opción sugerida por el sistema, si existe.
- `Required user response` — Formato de respuesta esperada (número, texto, confirmación).
- `Resolution status` — `pending`, `resolved`, `rejected`, `overridden`.
- `Audit note` — Nota de auditoría sobre cómo se resolvió.
- `Privacy risk flag` — Indica si la ambigüedad involucra datos sensibles.

No crear tipos en `src`.

## 5. Estados del flujo

- `no_ambiguity` — No hay ambigüedades pendientes.
- `ambiguity_detected` — Se ha detectado una ambigüedad.
- `asking_resolution_question` — El asistente está formulando la pregunta.
- `waiting_for_user_resolution` — Esperando respuesta del usuario.
- `resolution_received` — Se recibió una respuesta del usuario.
- `resolution_validated` — La respuesta es válida y se acepta.
- `resolution_rejected` — La respuesta no es válida y se rechaza.
- `resolution_applied_to_draft` — La resolución se aplicó al draft conversacional.
- `needs_followup_question` — Se necesita una pregunta adicional.
- `blocked_until_user_clarifies` — El flujo está bloqueado hasta que el usuario aclare.
- `out_of_scope_redirected` — La solicitud del usuario está fuera de alcance y se redirige.

## 6. Patrón conversacional

1. Thinking sutil.
2. Explicación breve de la ambigüedad.
3. Impacto de resolverla.
4. Opciones numeradas si aplica.
5. Pregunta clara.
6. Esperar respuesta del usuario por texto.
7. Confirmar interpretación.
8. Aplicar resolución al borrador conversacional.

Ejemplo autorizado:

> Detecté dos ciclos posibles en los archivos cargados:
>
> 1. QS Clima 2025
> 2. QS Clima 2024
> 3. Carga histórica multiciclo QS Clima 2024/2025
>
> ¿Cuál quieres preparar primero? Responde 1, 2 o 3.

No usar botones para estas opciones.

## 7. Reglas de resolución

- Si el usuario responde con número válido, seleccionar la opción correspondiente.
- Si responde con texto equivalente, normalizar intención.
- Si responde con texto ambiguo, pedir aclaración.
- Si pide algo fuera de alcance, redirigir al flujo de preparación.
- Si intenta ejecutar importación real, explicar que el prototipo solo simula preparación.
- Si pide comparativo/dashboard, explicar que está fuera de alcance en esta fase.
- Si hay privacidad en riesgo, bloquear avance hasta confirmar criterio seguro.

## 8. Relación con Chat Foundation

Chat Foundation renderiza:
- mensajes;
- thinking;
- safe details;
- warnings;
- errores;
- handoff;
- avatar gradiente;
- burbujas.

Chat Foundation no decide:
- qué ambigüedad existe;
- qué opción recomendar;
- cómo aplicar resolución;
- cómo modificar el draft.

## 9. Relación con Flow Adapter

Flow Adapter traduce:
- estado de ambigüedad;
- pregunta activa;
- opciones;
- severidad;
- expected input;
- safe details;
- warning/error/handoff.

Flow Adapter no:
- ejecuta side effects;
- modifica archivos;
- importa datos;
- conecta APIs;
- expone datos crudos.

## 10. Relación con ConversationalImportWorkspace

ConversationalImportWorkspace:
- conserva estado de dominio;
- recibe input del usuario;
- valida respuesta;
- actualiza draft conversacional;
- decide siguiente paso;
- delega render a Chat Foundation.

## 11. Privacidad y seguridad

```
NO_PII_VISIBLE = YES
NO_RAW_ROWS_VISIBLE = YES
NO_OPEN_TEXT_VISIBLE = YES
NO_WORKBOOK_DUMP_VISIBLE = YES
NO_REAL_CLIENT_DATA = YES
NO_EXTERNAL_API = YES
NO_IMPORT_EXECUTION = YES
```

El flujo puede mostrar nombres de archivos sintéticos ya presentes en fixture/demo, pero no debe mostrar datos individuales.

## 12. Casos fuera de alcance

- Comparativo de encuestas.
- Dashboard de resultados.
- Cálculo real de favorabilidad.
- Importación real a backend.
- Conexión con APIs reales.
- Edición por panel lateral.
- Revisión en pestaña externa.
- Botones para aprobar/rechazar estructura.
- Datos reales de clientes.

## 13. Roadmap de implementación futura

- **H46 · Ambiguity Resolution Types** — Creación de contratos/tipos si se autoriza.
- **H47 · Ambiguity Detection Mapper** — Mapeador puro de detección de ambigüedades.
- **H48 · Ambiguity Conversation Mapper** — Mapeador conversacional de ambigüedades.
- **H49 · Ambiguity Runtime Integration** — Integración en runtime.
- **H50 · Ambiguity Visual QA** — QA visual del flujo de ambigüedades.
- **H51 · Ambiguity Hotfix** — Hotfix si aplica.

## 14. Criterios para H46

- Crear tipos de ambigüedad si se autoriza.
- No modificar UI.
- No modificar Chat Foundation core.
- No modificar rutas.
- No crear importación.
- No crear dashboard/comparativo.
- No ejecutar APIs.
- No introducir datos reales.

## 15. Límites explícitos de H45

```
NO_SRC_CHANGES_IN_H45 = YES
NO_RUNTIME_INTEGRATION_IN_H45 = YES
NO_UI_CHANGES_IN_H45 = YES
NO_FLOW_MIGRATION_IN_H45 = YES
NO_IMPORT_EXECUTION = YES
NO_SANDBOX_IMPORT_RUNTIME = YES
NO_RESULT_LINK_CREATED = YES
NO_DASHBOARD_OR_COMPARISON_CHANGES = YES
READY_FOR_COMPARISON_OUTPUT_DISABLED = YES
```

## Marcadores

- PHASE_11D_H45_AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE_COMPLETE
- AMBIGUITY_RESOLUTION_FLOW_ARCHITECTURE_LOCKED
- AMBIGUITY_TYPES_DEFINED
- AMBIGUITY_STATES_DEFINED
- AMBIGUITY_CONVERSATION_PATTERN_DEFINED
- AMBIGUITY_RESOLUTION_RULES_DEFINED
- CHAT_FOUNDATION_BOUNDARY_DEFINED
- FLOW_ADAPTER_BOUNDARY_DEFINED
- WORKSPACE_BOUNDARY_DEFINED
- PRIVACY_RULES_DEFINED
- OUT_OF_SCOPE_RULES_DEFINED
- H46_CRITERIA_DEFINED
- NO_SRC_CHANGES
- NO_RUNTIME_INTEGRATION
- NO_UI_CHANGES
- NO_FLOW_MIGRATION
- NO_IMPORT_EXECUTION
- NO_SANDBOX_IMPORT_RUNTIME
- NO_RESULT_LINK_CREATED
- NO_DASHBOARD_OR_COMPARISON_CHANGES
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- VISIBLE_UI_CHECKPOINT_NO
- PHASE_11D_H46_AMBIGUITY_RESOLUTION_TYPES_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED
