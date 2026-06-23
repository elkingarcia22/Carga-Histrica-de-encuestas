# Historical Load Review UX Hotfix Architecture

## 1. Contexto

La revisión conversacional del Historical Load Draft detectó problemas de UX/product accuracy. Esta arquitectura define las directrices para corregir estos problemas sin alterar la infraestructura subyacente.

## 2. Decisiones de Arquitectura

### 1. Upload Behavior
- El usuario debe ser llevado al chat al hacer clic en "Cargar encuesta".
- El adjuntador de archivos debe abrirse inmediatamente si el navegador lo permite dentro del mismo gesto de usuario.
- Si el navegador bloquea el file picker, el chat debe mostrar una instrucción clara y foco visual en el control de adjuntar.
- **Restricción:** No crear ruta nueva.
- **Restricción:** No crear pantalla nueva.

### 2. Survey Grouping Rule
- La agrupación debe realizarse por ciclo y estructura, no solo por nombre de archivo.
- Los archivos por gerencia, área o detalle no son encuestas independientes, son segmentos o soportes del mismo ciclo de encuesta.
- Regla de negocio: "Los archivos por gerencia, área o detalle no son encuestas independientes. Son vistas, cortes, segmentos o soportes del mismo ciclo de encuesta."
- El detector debe agrupar por:
  - tipo de encuesta
  - año / ciclo
  - patrón de nombre
  - estructura de columnas
  - hoja principal
  - presencia de resultados generales vs segmentados

### 3. Bullet-first Presentation Policy
- Las respuestas del asistente del prototipo deben usar bullets con iconos, no cards para todo.
- Usar cards solo para: resumen compacto de estado, bloques de revisión final de alto nivel, métricas o secciones realmente resumibles.
- Usar bullets con iconos para: hallazgos, riesgos, recomendaciones, decisiones pendientes, acciones bloqueadas, explicación de archivos detectados, explicación de agrupación.

### 4. Auto-scroll Policy
- El chat debe hacer auto-scroll cuando:
  - se agrega un mensaje del sistema
  - se agregan acciones rápidas
  - se agrega el resultado de análisis
  - se agrega una decisión pendiente
  - se agrega la revisión final
- No debe romper input manual ni focus del usuario.

### 5. Decision Specificity
- Una decisión pendiente debe mostrar:
  - título específico de la decisión
  - archivo o grupo afectado
  - qué se detectó
  - por qué importa
  - recomendación concreta
  - opción sugerida
  - opciones alternativas
  - consecuencia de cada opción
  - campo para escribir una interpretación alternativa
- Prohibido: “Múltiples opciones posibles” sin contexto real.
- Prohibido: “Resolver según sugerencia” sin mostrar sugerencia.
- Prohibido: Decisiones genéricas que no expliquen el archivo, columna, hoja o grupo afectado.

### 6. Parser / Analysis Accuracy Policy
- Si el sistema encuentra numerosas columnas (ej. 718), no debe concluir automáticamente "0 preguntas, 0 demográficos" sin explicar por qué.
- Debe diferenciar: columnas de metadata, posibles preguntas, posibles dimensiones, posibles demográficos, identificadores o señales PII, columnas segmentadas por área/gerencia, hojas de resultados vs hojas de datos crudos.
- Si no puede clasificar, debe decir: “No pude clasificar estas columnas con suficiente confianza” y mostrar ejemplos de columnas o patrones, sin raw dump.

### 7. Copy and Serialization Policy
- Prohibido mostrar `[object Object]`.
- Prohibido copy técnico como primary copy.
- Prohibido copy en inglés. Todo copy visible debe estar en español.
- Los IDs internos no deben verse como texto principal.

### 8. Out of Scope
- Importación real, persistencia, backend, APIs, Claude, creación de catálogo global, dashboard comparativo, rutas nuevas, pantallas nuevas, aprobación automática, cambios a shadcn/ui base, nuevas dependencias.

## Marcadores
- UPLOAD_ENTRY_OPENS_CHAT
- UPLOAD_ATTACH_PICKER_AUTO_OPEN_POLICY_DEFINED
- NO_NEW_SCREEN_CREATED
- NO_NEW_ROUTE_CREATED
- SURVEY_GROUPING_BY_CYCLE_AND_STRUCTURE_DEFINED
- GERENCIA_FILES_ARE_SEGMENTS_NOT_SURVEYS
- EXPECTED_GROUPS_CLIMA_2025_AND_CLIMA_2024
- BULLET_FIRST_CHAT_PRESENTATION_DEFINED
- CARDS_RESERVED_FOR_SUMMARY_ONLY
- CHAT_AUTO_SCROLL_POLICY_DEFINED
- SPECIFIC_DECISION_COPY_DEFINED
- DECISION_SUGGESTION_MUST_BE_VISIBLE
- DECISION_CUSTOM_OVERRIDE_DEFINED
- ANALYSIS_ACCURACY_POLICY_DEFINED
- ZERO_DEMOGRAPHICS_REQUIRES_EXPLANATION
- ZERO_QUESTIONS_REQUIRES_EXPLANATION
- NO_OBJECT_OBJECT_COPY_POLICY_DEFINED
- SPANISH_ONLY_VISIBLE_COPY_DEFINED
- NO_TECHNICAL_IDS_AS_PRIMARY_COPY_DEFINED
- NO_STORAGE_CREATED
- NO_BACKEND_CREATED
- NO_CLAUDE_CONNECTION_CREATED
- NO_FINAL_IMPORT_IN_THIS_SCOPE
- NO_AUTOMATIC_APPROVAL
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- COMPARISON_DASHBOARD_OUT_OF_SCOPE
- NO_UI_INTEGRATION_IN_THIS_PHASE
- NO_RUNTIME_IMPLEMENTATION_IN_THIS_PHASE
- VISIBLE_UI_CHECKPOINT_NO
- PHASE_11D_H2_REVIEW_UX_FILE_GROUPING_ARCHITECTURE_COMPLETE
- REVIEW_UX_HOTFIX_ARCHITECTURE_LOCKED
- PHASE_11D_H3_REVIEW_UX_FILE_GROUPING_BUILD_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED
