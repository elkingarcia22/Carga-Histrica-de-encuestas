# Historical Import Review & Mapping Architecture Lock

## 1. Contexto
Fase 4G-R2 · Historical Import Review & Mapping Architecture Lock.
Este documento define y bloquea la arquitectura conceptual y técnica de la primera pantalla "Revisar y mapear información" de la etapa de Mapping, basándose en el Intake funcional (4G-R1). No incluye código real, rutas, o APIs.

## 2. Estado de entrada
`HISTORICAL_IMPORT_REVIEW_MAPPING_INTAKE_READY`. La etapa previa de Configuración está formalmente cerrada y consolidada en `main`. Cero cambios en `src/**` antes de comenzar.

## 3. Objetivo arquitectónico
Definir y bloquear la arquitectura de la primera pantalla `Resumen general de mapeo`. Permitir comprender los dominios detectados, los mapeos confirmados, los que requieren revisión, los elementos bloqueados y la preparación (readiness) para confirmar la importación, sin construir aún las acciones profundas de resolución.

## 4. Principios
- **Overview First:** La pantalla funciona como un índice del estado global.
- **Single Source of Truth:** Un único estado conceptual inmutable (draft) para toda la fase.
- **Determinismo:** El adaptador no posee estado.
- **Integridad UI:** No se altera el layout base (stepper, headers) ni se asumen IA reales.

## 5. Inventario del flujo actual
- Orquestador: `SurveyImportUploadScreen`.
- Hook de Configuración: `useHistoricalImportConfigurationState`.
- Modelo de Vistas: Condicional (`currentView` maneja la transición sin alterar ruta de React Router).
- Shell: `ImportWizardShell`, `ImportWizardHeader`, `ImportWizardSteps`, `ImportWizardFooter`.
- Estado del stepper conservado en memoria, permitiendo retornar sin pérdida.

## 6. Ownership de pantalla
- **Pantalla conceptual:** `HistoricalImportReviewMappingScreen`
- **Dominio:** `survey-import`
- **Responsabilidad:** Renderizar el índice del estado global de mapping y coordinar la delegación a vistas profundas (futuras).
- **Propietario del componente:** Orquestador principal (`SurveyImportUploadScreen`) inyectará el estado necesario.

## 7. Alcance de la primera pantalla
`MAPPING_OVERVIEW_FIRST`.
Exclusivamente un resumen global de dominios.
**No se incluyen:** tablas completas de preguntas, editores profundos, modales de resolución.
Las acciones profundas (ej. "Revisar preguntas") se mostrarán visibles pero **deshabilitadas con explicación**, o con un comportamiento simulado temporal, hasta que se construyan las pantallas de resolución en incrementos futuros.

## 8. Boundary Configuración → Mapping
**Decisión bloqueada:** **Opción A · `configurationDraftId` + adapter determinístico**
Se inyecta un identificador ligero y metadata base que el adapter de Mapping usará para inicializar su draft. Esto reduce el acoplamiento y facilita la preservación de estado si el usuario navega entre pasos.
- *Inputs:* `configurationDraftId`, `sourceBatchId`, `sourceScenarioId`, identidad de encuesta, incidencias diferidas.
- *No transmite:* Files, estado visual de React, respuestas reales.

## 9. Modelo conceptual del mapping draft
`HistoricalImportMappingDraft`
Un objeto puro inmutable que contiene:
- `mappingDraftId`, referencias al batch/scenario y configurationDraft.
- `domains`: Sub-estados para preguntas, escalas, demográficos, participantes, jerarquías.
- Listas de incidencias categorizadas: heredadas, resueltas, diferidas, bloqueantes.
- Columnas ignoradas.
- `globalStatus`: estado derivado general.
- `canContinueToConfirmation`: booleano puro que evalúa si hay 0 incidencias bloqueantes y todo lo requerido está mapeado.

## 10. Estrategia de estado
**Decisión bloqueada:** **Opción A · Hook local del dominio en el orquestador**
Ejemplo conceptual: `useHistoricalImportMappingState`.
- Una única instancia viva en el orquestador `SurveyImportUploadScreen`.
- Screens reciben props (son "controladas").
- Adapters puros que derivan el estado visual.

## 11. Preservación
- **Volver a configuración:** Conserva el mapping draft en el orquestador.
- **Regresar a Mapping:** El hook recupera el draft existente sin reiniciarlo.
- **Cambios en Configuración:** Un cambio mayor en la configuración (ej. cambiar el nombre/tipo de encuesta) no destruye el draft inmediatamente pero lo marca como `stale` para obligar re-evaluación en el adapter, o se descarta solo si el cambio es destructivo de modelo (ej. pasar de encuesta anónima a identificada obligatoria).
- **Cancelar:** Reinicia completamente ambos drafts.
- **Refresh:** Pierde el draft (no hay persistencia en esta fase de prototipo local).

## 12. Dominios
Clasificados:
- **Preguntas:** `OVERVIEW_VISIBLE`, `DEFERRED_RESOLUTION`.
- **Escalas:** `OVERVIEW_VISIBLE`, `DEFERRED_RESOLUTION`.
- **Participantes / Jerarquías / Demográficos:** `OVERVIEW_VISIBLE` (separados conceptualmente pero mostrados juntos si es lógico).
- **Identificadores técnicos / Relaciones:** `SUMMARY_ONLY`.
- **Columnas ignoradas:** `OVERVIEW_VISIBLE`.

## 13. Preguntas
- Modelo resume: Total, Confirmadas, Ambiguas, Sin mapping, Bloqueantes, Ignoradas.
- Target conceptual es una string mock (ej. "Familia X").

## 14. Escalas
- Rango, polaridad, estado.
- Escalas ambiguas o polaridad sin resolver = Bloqueante de la confirmación global.

## 15. Participantes, Jerarquías y Demográficos
- **Participantes:** Resumen de si los IDs están detectados.
- **Jerarquías:** Consistencia de árbol (áreas, sedes).
- **Demográficos:** Resumen de los sugeridos vs ambiguos.
- Se presentarán como tarjetas o secciones separadas en el overview para mantener claridad mental.

## 16. Identificadores y Relaciones
- Llaves de cruce entre archivos (ej. Email vs UserID) se resumen aquí.
- Relaciones bloqueantes ya deberían estar mitigadas en Normalización, pero problemas lógicos diferidos se enuncian.

## 17. Columnas ignoradas
- Ignoradas por el sistema (technical) o por el usuario.
- No bloquean el progreso global, a menos que una columna ignorada fuese requerida por la configuración (en cuyo caso se eleva como incidencia bloqueante).

## 18. Incidencias
- Modelo inmutable puro: `{ id, code, domain, title, description, severity, status }`.
- Severidades: `blocking`, `needs-review`, `confirmation-required`, `deferred`, `informational`, `simulated-error`.
- Cero duplicación: si una incidencia pertenece a preguntas, se suma al dominio y a la lista general sin contarse dos veces.

## 19. Estados
- Estados globales: `incomplete`, `needs-review`, `blocked`, `ready-for-confirmation`, `simulated-error`.
- Múltiples entidades pueden tener `needs-review` individual, derivando el global.

## 20. Readiness
- `canContinueToConfirmation` evalúa el `HistoricalImportMappingDraft` *completo*, no la UI visible.
- Requisitos: 0 `blocking`, todos los targets obligatorios confirmados, escalas requeridas resueltas, 0 `simulated-error`.

## 21. Boundary Mapping → Confirmación
**Decisión bloqueada:** **Opción A · `mappingDraftId` + adapter determinístico**
La pantalla de Confirmación recibirá solo el ID y extraerá el estado inmutable desde el store del orquestador. El output no transporta React nodes ni binarios.

## 22. Arquitectura visual
- Drawer full-screen. Header compartido, stepper a la izquierda.
- **Orden de vista principal:**
  1. Disclosure de simulación.
  2. Resumen heredado de Configuración (muy compacto).
  3. Alertas/Incidencias Prioritarias (PriorityMappingIssues).
  4. Estado Global del Mapping (DomainStatusGrid).
  5. Readiness y Footer.

## 23. Patrón principal
`DOMAIN_STATUS_CARDS_WITH_PRIORITY_ISSUES` validado y aprobado.
Las Cards por dominio proveen lectura general clara. La tabla global mezcla dominios (escalas con jerarquías) causando fricción cognitiva.

## 24. Acciones
Acciones limitadas al overview:
- Volver a Configuración (funcional).
- Cancelar importación (funcional).
- Continuar a confirmación (funcional, bloqueada si no ready).
- Revisar dominio (visible pero `disabled` temporalmente con tooltip).

## 25. Footer
- Acción Secundaria: "Volver a configuración".
- Acción Primaria: "Continuar a confirmar importación" (depende estrictamente de `canContinueToConfirmation`). Si está disabled, mostrar helper text indicando por qué.

## 26. Componentización
- `MappingSimulationDisclosure` (stateless).
- `InheritedConfigurationSummary` (stateless).
- `PriorityMappingIssues` (stateless, recibe incidencias).
- `MappingDomainStatusGrid` (stateless, layout).
- `MappingDomainStatusCard` (stateless, recibe métricas y estado).
- `MappingReadinessSummary` (stateless, CTA wrapper si es necesario).

## 27. Componentes existentes
- `CONFIRMED_REUSABLE`: Card, Badge, Alert, Tooltip, IconSystem.
- `CONFIRMED_NOT_APPROPRIATE`: Survey Analytics widgets.
- Se cerrará el uso de Callouts custom e IA lightweight delegando a Alert y Badge visualmente.

## 28. Combobox
- **Diferido:** El componente interactivo de Combobox con búsqueda virtualizada no es necesario para la primera pantalla, que solo expone resúmenes.

## 29. Virtualización
- `NO_VIRTUALIZATION_DEPENDENCY_FOR_OVERVIEW` confirmada. La primera pantalla es un resumen agregado y no requiere listar miles de nodos.

## 30. Escalabilidad
- Maximum 200 archivos en mente.
- Conteos derivados del draft en tiempo `O(N)` al inicializar el hook o `O(1)` en renders subsecuentes.
- Las incidencias fuera de vista siguen bloqueando el global CTA (comportamiento por diseño).

## 31. IA simulada
- La pantalla mostrará sugerencias indicadas con el distintivo de IA, pero resueltas de forma determinística vía mocks.
- No se incluirá chat ni prompts interactivos.

## 32. Escenarios mock futuros
1. `ready-for-confirmation`
2. `ambiguous-question-target`
3. `incompatible-scale`
4. `unmapped-required-field`
5. `ignored-technical-column`
6. `demographic-review-required`
7. `inherited-blocking-issue`
8. `simulated-error`

## 33. Capas técnicas
- `types`: Estrictamente inmutables.
- `config`: Reglas duras y umbrales.
- `mocks`: `historicalImportReviewMappingScenarios.ts`.
- `adapter`: Funciones puras (sin React) que mutan/recrean el draft.
- `hook`: Mantiene la referencia y expone callbacks de react.
- `components`: Presentacionales 100% puros.
- `screen`: Integra hook y componentes, sin lógica de negocio.

## 34. Estructura futura de archivos
(A ser creados en fases de build):
- `src/lib/survey-import/review-mapping/historicalImportReviewMappingTypes.ts`
- `src/config/survey-import/historicalImportReviewMappingConfig.ts`
- `src/mocks/survey-import/review-mapping/historicalImportReviewMappingScenarios.ts`
- `src/hooks/survey-import/useHistoricalImportReviewMappingState.ts`
- `src/components/survey-import/review-mapping/MappingDomainStatusCard.tsx` (etc.)
- `src/screens/survey-import/HistoricalImportReviewMappingScreen.tsx`

## 35. Integración sin ruta
`NO_NEW_ROUTE`.
`SurveyImportUploadScreen` controlará el renderizado inyectando el estado local y determinando `currentView === 'review-mapping'`.

## 36. Stepper
- Paso 2: Configuración (completado).
- Paso 3: Revisión y mapeo (activo).
- Paso 4: Confirmación (futuro).

## 37. Accesibilidad
- Tarjetas navegables por `Tab`.
- Badges de estado con texto para lectores ("Estado: Requiere revisión", no solo un ícono amarillo).
- Botones disabled deben tener un mecanismo (tooltip o texto adyacente) para explicar el bloqueo a `aria-describedby`.

## 38. Riesgos
- **Riesgo:** Overview demasiado superficial. **Mitigación:** Asegurar métricas precisas (X de Y confirmados) en cada tarjeta. **Propietario:** Design/Architecture.
- **Riesgo:** Mappings stale tras volver a Configuración. **Mitigación:** El adapter invalidará inteligentemente los mappings si la fuente cambia drásticamente. **Propietario:** Adapter logic (futura).
- **Riesgo:** CTA calculado por subset. **Mitigación:** Regla inquebrantable de calcular sobre el draft completo.

## 39. Decision gates cerrados
- Ownership de pantalla.
- Primera pantalla y su alcance (Overview).
- Boundaries (in/out).
- Modelo conceptual de mapping draft y estrategia de preservación de estado.
- Arquitectura visual, patrón principal (Cards), componentización.
- Combobox y virtualización diferidas.
- Integración sin ruta, Stepper, Accesibilidad y Escalabilidad.

## 40. Decision gates pendientes
- UI exacta para las pantallas de resolución profunda (drawers/modales de mapeo detallado).
- Catálogo real UBITS y parser real.
- Pantalla de confirmación y arquitectura final de base de datos.

## 41. Áreas prohibidas
- Modificar `src/**` en esta fase.
- Crear componentes o hooks de código.
- Usar rutas reales o librerías de virtualización.

## 42. QA
- Archivo verificado contra checklist de requisitos. Git intacto.

## 43. Estado final
`HISTORICAL_IMPORT_REVIEW_MAPPING_ARCHITECTURE_LOCKED`

## 44. Siguiente fase máxima
`Fase 4G-R3 · Historical Import Review & Mapping Mock Data Contract`
