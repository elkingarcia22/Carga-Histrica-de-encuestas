# Inline Structure Review Architecture · Comparativo de Encuestas UBITS

## 1. Architecture Decision
INLINE_STRUCTURE_REVIEW_ARCHITECTURE_LOCKED = YES
INLINE_REVIEW_SCOPE = DEMOGRAPHICS_DIMENSIONS_QUESTIONS_MAPPINGS
FIRST_SCREEN = CONVERSATIONAL_IMPORT_WORKSPACE
DASHBOARD_FLOW = DOWNSTREAM_RESULT

## 2. Product Goal
El usuario debe poder revisar y corregir la estructura detectada antes de aprobar el contrato de importación. Las correcciones serán mock/sintéticas y no deben ejecutar parser, upload, APIs, storage ni IA real.

## 3. Review Scope
Incluir entidades revisables:
- Synthetic files
- Detected demographics
- Detected dimensions
- Detected questions
- Question-dimension mappings
- Issues
- Warnings
- Approval blocks
- Approved import contract

Fuera de alcance:
- real XLSX
- real upload
- parser runtime
- dashboard connection
- AI suggestions
- persistent edits
- multi-user collaboration

## 4. User Roles and Permissions
Mantener usuario principal: Analista interno UBITS / Customer Success / equipo de implementación

Permisos conceptuales:
- review detected structure
- rename labels
- approve blocks
- request changes
- exclude questions
- include questions
- resolve warnings
- generate mock approved contract

No definir permisos de cliente final todavía.

## 5. Review Surface Model
- Chat timeline: explica hallazgos y confirma cambios.
- Right side panel: lista estructura detectada.
- Inline cards: muestran entidades revisables.
- Action area: contiene acciones mock de aprobar, corregir o solicitar cambios.
- Approval tracker: muestra avance por bloques.

## 6. Editable Entity Model
Demographic:
- approvedLabel
- status
- included
- acceptedWarnings

Dimension:
- approvedLabel
- status
- included
- questionCount

Question:
- approvedLabel
- approvedDimensionId
- included
- status
- acceptedWarnings

Mapping:
- approvedDimensionId
- status
- userEdited
- acceptedWarnings

Campos no editables:
- sourceColumn
- originalLabel
- fileId
- workbookId
- raw detected values
- syntheticOnly

## 7. Demographic Review Rules
- El usuario puede renombrar un demográfico.
- El usuario puede excluir un demográfico sintético si no es obligatorio.
- El usuario no puede cambiar sourceColumn.
- El usuario no puede crear datos reales.
- Un demográfico con conflicto de nombre queda needs_review.
- Un demográfico aprobado actualiza approvedDemographics en el contrato mock.

## 8. Dimension Review Rules
- El usuario puede renombrar dimensiones.
- El usuario puede excluir dimensiones solo si sus preguntas quedan reasignadas o excluidas.
- No se permite dimensión vacía aprobada salvo que esté marcada como intentionally_empty.
- Las dimensiones con baja confianza quedan needs_review.

## 9. Question Review Rules
- El usuario puede excluir o incluir preguntas.
- El usuario puede corregir el label aprobado.
- El usuario puede cambiar la dimensión aprobada.
- No se edita la respuesta real ni valores de encuestas.
- Preguntas unmapped deben resolverse antes de aprobar el contrato final.
- Preguntas base_only o comparison_only pueden quedar como no comparables si el usuario las acepta.

## 10. Question-Dimension Mapping Rules
Estados:
- auto_mapped
- needs_review
- user_reassigned
- approved
- excluded

Reglas:
- Un mapping needs_review requiere acción antes del contrato final.
- Una reasignación registra userEdited = true.
- Un mapping aprobado actualiza questionDimensionMappings.
- No se permite aprobar finalContract si existen mappings blocking sin resolver.

## 11. Issue and Warning Resolution Rules
Clasificar:
- blocking
- warning
- info

Reglas:
- blocking debe resolverse antes del contrato final.
- warning puede aceptarse explícitamente.
- info no bloquea.
- acceptWarning registra warningsAccepted.
- resolveDuplicateColumn requiere seleccionar columna mock ganadora o excluir duplicada.
- UNMAPPED_QUESTION requiere reassignment o exclusion.

## 12. Approval Block Rules
Bloques:
- files
- demographics
- dimensions
- questions
- questionDimensionMappings
- finalContract

Estados:
- pending
- in_review
- approved
- changes_requested
- blocked

Reglas:
- finalContract solo puede aprobarse si todos los bloques obligatorios están approved.
- changes_requested devuelve el flujo al bloque correspondiente.
- blocked aparece si hay issues blocking sin resolver.

## 13. Conversation Interaction Rules
Comandos o acciones mock:
- "Aprobar demográficos"
- "Renombrar Área a Gerencia"
- "Reasignar pregunta Q-012 a Liderazgo"
- "Excluir pregunta Q-NEW-001"
- "Aceptar advertencias"
- "Generar contrato aprobado"

Cada acción debe producir:
- assistant confirmation message
- updated review state
- updated approval block
- optional issue/warning resolution

No ejecutar LLM real.

## 14. State Machine Extension
Extender estados aprobados con subestados de revisión:
- REVIEWING_FILES
- REVIEWING_DEMOGRAPHICS
- REVIEWING_DIMENSIONS
- REVIEWING_QUESTIONS
- REVIEWING_MAPPINGS
- RESOLVING_WARNINGS
- RESOLVING_BLOCKERS
- READY_TO_APPROVE_CONTRACT
- CONTRACT_APPROVED

Transiciones:
- STRUCTURE_PROPOSED → REVIEWING_DEMOGRAPHICS
- REVIEWING_DEMOGRAPHICS → REVIEWING_DIMENSIONS
- REVIEWING_DIMENSIONS → REVIEWING_QUESTIONS
- REVIEWING_QUESTIONS → REVIEWING_MAPPINGS
- REVIEWING_MAPPINGS → RESOLVING_WARNINGS or READY_TO_APPROVE_CONTRACT
- READY_TO_APPROVE_CONTRACT → CONTRACT_APPROVED

## 15. Approved Contract Update Rules
Cada corrección mock puede actualizar conceptualmente:
- approvedDemographics
- approvedDimensions
- approvedQuestions
- questionDimensionMappings
- excludedColumns
- excludedQuestions
- warningsAccepted
- approvalStatus
- readyForComparison

Pero en esta fase no se implementa esa actualización.

## 16. UX Layout Concept
- El chat conserva contexto narrativo.
- El panel derecho muestra estructura revisable.
- Las entidades editables se agrupan por bloque.
- Cada bloque muestra estado, warnings y acciones.
- La aprobación final aparece como resumen visual del contrato mock.

## 17. Component Candidates
Candidatos sin asumir existencia:
- Card
- Button
- Badge
- Alert
- Separator
- ScrollArea
- Textarea
- Input
- Table
- Tabs
- Accordion
- Dialog
- Popover
- Select
- Checkbox
- Progress
- Skeleton
- UbitsIcon

Antes de construir, Antigravity deberá revisar componentes existentes.

## 18. Accessibility Expectations
- Entidades revisables con headings claros.
- Acciones con labels visibles.
- Warnings no dependen solo de color.
- Ediciones mock deben ser navegables por teclado.
- Cambios de estado deben tener texto explícito.
- No controles sin propósito.

## 19. Data Boundary
NO_REAL_CLIENT_DATA
NO_PRODUCTIVE_FILE_PROCESSING
NO_API_CONNECTIONS
NO_STORAGE
NO_PARSER_RUNTIME_IN_UI_YET

## 20. AI Boundary
NO_INSIGHTS_AI_YET
No LLM API.
No clasificación real.
No inferencia sobre datos reales.
Las sugerencias son mock/reglas sintéticas.

## 21. Upload / File Boundary
NO_REAL_UPLOAD_CREATED
NO_FILE_INPUT_CREATED
No FileReader.
No dropzone funcional.
No procesamiento de XLSX.

## 22. QA Criteria
- No source changes in architecture phase.
- No upload real.
- No API/storage.
- No real data.
- No parser runtime in UI.
- No hardcoded HEX.
- No text-white.
- No any/as any.
- No Tailwind arbitrary values.
- No literal blue/green/red/amber/slate classes.
- Docs markers complete.
- Diff hygiene clean.

## 23. Forbidden Work
- No modificar código.
- No construir UI.
- No crear rutas.
- No crear formularios funcionales.
- No crear edición inline real.
- No modificar mock data en código.
- No modificar parser.
- No modificar dashboard.
- No modificar drilldown.
- No crear upload real.
- No crear input type=file.
- No usar FileReader.
- No procesar archivos reales.
- No conectar APIs.
- No usar storage.
- No usar datos reales.
- No implementar IA real.
- No instalar dependencias.
- No modificar shadcn/ui base.

## 24. Open Questions
- ¿Las correcciones serán por botones, inline fields o comandos de chat?
- ¿Se permitirá edición textual directa en el primer build?
- ¿Las acciones mock actualizan estado local o solo muestran estados preparados?
- ¿El usuario puede saltar bloques?
- ¿Qué bloque es obligatorio para generar contrato aprobado?
- ¿Q-LEGACY-001 y Q-NEW-001 se aceptan como no comparables o se excluyen por defecto?

## 25. Next Authorized Phase
CHAT9_INLINE_STRUCTURE_REVIEW_BUILD_PROMPT_READY

## 26. Final Status Markers
PHASE_4K_CHAT8_COMPLETE
INLINE_STRUCTURE_REVIEW_ARCHITECTURE_LOCKED
INLINE_REVIEW_SCOPE_DEMOGRAPHICS_DIMENSIONS_QUESTIONS_MAPPINGS
EDITABLE_ENTITY_MODEL_DEFINED
DEMOGRAPHIC_REVIEW_RULES_DEFINED
DIMENSION_REVIEW_RULES_DEFINED
QUESTION_REVIEW_RULES_DEFINED
QUESTION_DIMENSION_MAPPING_RULES_DEFINED
APPROVAL_BLOCK_RULES_DEFINED
APPROVED_CONTRACT_UPDATE_RULES_DEFINED
CONVERSATIONAL_IMPORT_WORKSPACE_REMAINS_FORMALLY_CLOSED
DASHBOARD_FLOW_MARKED_AS_DOWNSTREAM_RESULT
NO_REAL_UPLOAD_CREATED
NO_FILE_INPUT_CREATED
NO_PRODUCTIVE_FILE_PROCESSING
NO_REAL_CLIENT_DATA
NO_INSIGHTS_AI_YET
NO_API_CONNECTIONS
NO_STORAGE
CHAT9_INLINE_STRUCTURE_REVIEW_BUILD_PROMPT_READY
R1H5_DEFINED_BUT_NOT_TRIGGERED
