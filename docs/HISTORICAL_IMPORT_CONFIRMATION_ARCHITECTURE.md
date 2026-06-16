# Historical Import Confirmation Architecture Lock

## 1. Contexto
Fase 4H-R2 · Historical Import Confirmation Architecture Lock.
Este documento define y bloquea la arquitectura de la pantalla `Confirmar importación histórica`. Es estrictamente documental; no incluye código, componentes ni contratos.

## 2. Fase 0 · Git Preflight
Reporte de validación inicial:
- Branch actual: `main`
- HEAD alineado con `origin/main`
- 0 staged files.
- Cambios legítimos encontrados solo en documentación.
- Cero cambios en `src/**`.

## 3. Paso 1 · Validación del intake
El intake define de forma suficiente y validada:
- Objetivo
- Usuario
- Primera pantalla
- Input/Output conceptuales
- Módulos requeridos
- CTA (Confirmar importación)
- Checkbox de confirmación explícita
- Incidencias y estados
- Mock principal
- Ocho escenarios propuestos
- Referente visual y stack técnico
- Accesibilidad, riesgos y criterios de éxito.

## 4. Paso 2 · Inventario del flujo existente
- **Orquestador actual:** `SurveyImportUploadScreen`.
- **Modelo de vistas condicionales:** El orquestador maneja vistas (`currentView`) para transicionar sin alterar el enrutamiento.
- **Ownership de drafts:** El orquestador es dueño de `useHistoricalImportConfigurationState` y `useHistoricalImportReviewMappingState`.
- **Boundary actual hacia Confirmación:** El orquestador inyecta un boundary cuando Mapping es válido y delega al siguiente estado.
- **Volver:** Restaurará la vista a `review-mapping` manteniendo los drafts en memoria del orquestador.
- **Cancelar:** Invoca `handleCancelImportFlow` que limpia todo el estado.
- **Stepper/Shell:** Se utiliza `ImportWizardShell`, `ImportWizardHeader`, `ImportWizardSteps`, `ImportWizardFooter`.
- **Forma actual del CTA de Mapping:** "Continuar a confirmar importación".
- **Feedback mock existente:** Se utilizan toasts u overlays in-place.
- **Ruta:** No se necesita una nueva ruta.

## 5. Paso 3 · Screen Ownership
- **Pantalla conceptual:** `HistoricalImportConfirmationScreen`
- **Clasificación requerida:** `CONTROLLED_CONFIRMATION_SCREEN`
- **Responsabilidades permitidas:** Presentar el consolidado final, mostrar estados derivados, mostrar el checkbox explícito, emitir eventos de UI (volver, cancelar, confirmar) y mostrar feedback de confirmación preparada.
- **Prohibiciones:** La screen no debe instanciar el hook, resolver escenarios, construir boundaries, calcular compatibilidad o readiness, almacenar un draft propio, ejecutar red, leer archivos o persistir.

## 6. Paso 4 · Ownership del confirmation draft
**Decisión bloqueada:** `SINGLE_ORCHESTRATOR_OWNED_CONFIRMATION_STATE`
El futuro hook `useHistoricalImportConfirmationState` debe vivir exclusivamente en `SurveyImportUploadScreen`.
- Conserva el draft al volver a Mapping.
- Evita reinicialización al desmontar la screen de confirmación.
- Permite un reset conjunto desde un solo lugar.
- Mantiene una sola fuente de verdad (cero Context, cero módulo externo, cero local/session storage).
- Solo habrá exactamente una futura instancia en el orquestador.

## 7. Paso 5 · Input Boundary Mapping → Confirmación
**Decisión bloqueada:** `MAPPING_DRAFT_ID_PLUS_DETERMINISTIC_ADAPTER`
La entrada debe ser estrictamente el boundary válido serializable de Review & Mapping.
- **Incluye:** `mappingDraftId`, `configurationDraftId`, `sourceBatchId`, `sourceScenarioId`, identidad, configuración confirmada, conteos de archivos, domain summaries, ignored column references, resolved/deferred issue references, readiness, configuration signature, mapping signature, `canContinueToConfirmation`.
- **No incluye:** Files, Blobs, ArrayBuffers, respuestas de encuestas, PII, callbacks, nodos React, ni estado visual.

## 8. Paso 6 · Modelo conceptual del confirmation draft
Se define un único objeto inmutable conceptual:
`HistoricalImportConfirmationDraft`
- `confirmationDraftId`, `mappingDraftId`, `configurationDraftId`, `sourceBatchId`, `inputSignature`.
- `explicitConfirmationAccepted` (boolean).
- `confirmedByRole` (ej. Consultor).
- `blockingIssueIds`, `deferredIssueIds`, `ignoredColumnIds`.
- `confirmationStatus`.
- `compatibility`.
- `finalReadiness`.
- `canPrepareSimulatedExecution`.
- No usa timestamps ni aleatoriedad para la identidad.

## 9. Paso 7 · Estrategia de inicialización
- **Reglas bloqueadas:**
  - La primera entrada válida inicializa el draft.
  - El mismo `mappingDraftId` reutiliza el draft de confirmación existente.
  - Volver a Mapping y regresar a Confirmación conserva el checkbox y el estado local.
  - Un mapping nuevo inicializa un draft nuevo.
  - Un mapping stale *no* reinicializa silenciosamente; se muestra la advertencia.
  - Un mapping incompatible bloquea y requiere regresar.
  - Cancelar el orquestador resetea el draft.
  - El refresh de la página puede perder el draft.
- No se usan timers o effects para sincronizaciones artificiales.

## 10. Paso 8 · Preservación del draft
**Resultado arquitectónico:** `CONFIRMATION_DRAFT_PRESERVATION_LOCKED`

| Evento | Draft preservado | Reset | Resultado |
| :--- | :---: | :---: | :--- |
| Mapping → Confirmación | N/A | No | Inicializa |
| Confirmación → Mapping | Sí | No | Conserva |
| Mapping → Confirmación nuevamente | Sí | No | Recupera |
| Cancelar importación | No | Sí | Limpia |
| Nueva ejecución | No | Sí | Draft nuevo |
| Refresh | No garantizado | N/A | Estado local perdido |

## 11. Paso 9 · Compatibilidad con Mapping
La compatibilidad depende estrictamente de una firma determinística del mapping vigente. No depende de `Date.now`, orden de objetos, o interacciones visuales.
- **Current:** Puede evaluarse el CTA.
- **Stale:** Conserva el draft, muestra advertencia de que la fuente cambió, bloquea hasta reevaluación.
- **Incompatible:** Conserva evidencia mínima, bloquea irreversiblemente y requiere volver a Mapping explícitamente. No elimina el draft silenciosamente.

## 12. Paso 10 · Estados globales
Precedencia determinística requerida:
1. `simulated-error` (Falla técnica o de sistema simulada).
2. `incompatible` (Modelo fuente completamente roto).
3. `stale` (Modelo fuente modificado, requiere recalcular).
4. `blocked` (Existen incidencias bloqueantes en el draft).
5. `incomplete` (Configuración no inicializada correctamente).
6. `confirmation-required` (Requiere revisión de incidencias o marcación explícita).
7. `ready-for-confirmation` (Todo en orden, pendiente solo confirmar).
8. `confirmation-prepared` (Checkbox activo y botón pulsado).

## 13. Paso 11 · Semántica de confirmation-prepared
`confirmation-prepared` significa:
- Boundary de entrada fue válido y compatible.
- Checkbox de confirmación fue aceptado explícitamente.
- Confirmación local registrada en el draft en memoria.
- Feedback mock visible in-place (ej. toast y banner).
- Preparación conceptual lista para una futura ejecución simulada.
**No significa:** importación iniciada, backend contactado, datos guardados, o proceso completado.
El CTA principal se deshabilita para evitar doble confirmación accidental. La pantalla no navega automáticamente.

## 14. Paso 12 · Derivación del CTA
Función conceptual: `determineCanPrepareSimulatedExecution`.
Deriva calculando sobre el draft completo y su entrada:
- Boundary de entrada válido.
- Mapping en estado `ready-for-confirmation`.
- Compatibilidad en estado `current`.
- 0 incidencias `blocking`, `confirmation-required` y `simulated-error`.
- 0 columnas ignoradas requeridas.
- `explicitConfirmationAccepted === true`.
- Status distinto a `confirmation-prepared`.
No se deben duplicar estas lógicas en los componentes o el footer.

## 15. Paso 13 · Output Boundary
**Decisión bloqueada:** `CONFIRMATION_DRAFT_ID_PLUS_DETERMINISTIC_ADAPTER`
El output conceptual hacia la futura ejecución incluirá:
- `confirmationDraftId`, `mappingDraftId`, `configurationDraftId`, `sourceBatchId`.
- Firmas finales (signatures).
- Confirmación explícita (booleano) y `role`.
- IDs de incidencias (blocking, deferred) y columnas ignoradas.
- Status, final readiness y `canPrepareSimulatedExecution`.
No se incluirá contenido binario, payloads directos de red ni PII.

## 16. Paso 14 · Arquitectura visual
Patrón: `FINAL_CONFIRMATION_SUMMARY_WITH_EXPLICIT_ACKNOWLEDGEMENT`.
Se mantendrá el shell de la aplicación (`ImportWizardShell`).
Estructura secuencial (sin modales, charts, o vistas anidadas):
1. Disclosure de simulación.
2. Identidad de encuesta.
3. Resumen de lote.
4. Configuración confirmada.
5. Resumen de mappings por dominio.
6. Columnas ignoradas.
7. Incidencias resueltas y diferidas.
8. Validaciones finales.
9. Confirmación explícita (Checkbox).
10. Readiness final.
11. Footer.

## 17. Paso 15 · Arquitectura de componentes
Componentes conceptuales puros presentacionales a ser creados:
- `ConfirmationSimulationDisclosure`
- `ConfirmationSurveyIdentitySummary`
- `ConfirmationBatchSummary`
- `ConfirmedConfigurationSummary`
- `ConfirmedMappingSummary`
- `IgnoredColumnsConfirmationSummary`
- `DeferredIssuesConfirmationSummary`
- `FinalValidationSummary`
- `ExplicitConfirmationControl`
- `ConfirmationReadinessSummary`
Ninguno de ellos instanciará el hook, leerá adaptadores, o calculará reglas de negocio.

## 18. Paso 16 · Componentes existentes
- `CONFIRMED_REUSABLE`: ImportWizardShell, ImportWizardHeader, ImportWizardSteps, ImportWizardFooter, Alert, Badge, Checkbox, Tooltip, Separator, Button, toast, UbitsIcon, Card.
- `CONFIRMED_NOT_APPROPRIATE`: (Ninguno detectado como problemático actualmente).
- `NOT_FOUND`: (No se asumen componentes que no estén en la base).
- `REQUIRES_DECISION_GATE`: Ninguno para componentes base por el momento.

## 19. Paso 17 · Stepper Architecture Decision
**Fuente de verdad:** `STEPS_DEFINED_IN_LOCAL_CONFIG` (`src/config/survey-import/importWizardContent.ts`).
**Capacidad del componente:** `FOURTH_STEP_SUPPORTED_BY_EXISTING_API`. El componente procesa dinámicamente un array de configuración.
**Identificador bloqueado:** `confirmation`.
**Label:** `Confirmar importación`.
**Orden:** Cuarto y último paso.

**Component Gate:** `SAFE_LOCAL_STEPPER_EXTENSION`.
El componente compartido `ImportWizardSteps.tsx` **no** requiere modificaciones.

### Matriz de estados real

| Vista                 | Paso 1                                  | Paso 2                        | Paso 3     | Paso 4    |
| --------------------- | --------------------------------------- | ----------------------------- | ---------- | --------- |
| U1 · Carga            | Activo                                  | Pendiente                     | Pendiente  | Pendiente |
| U2 · Selección        | Activo                                  | Pendiente                     | Pendiente  | Pendiente |
| U3/U4 · Normalización | Activo                                  | Pendiente                     | Pendiente  | Pendiente |
| Configuración         | Completado                              | Activo                        | Pendiente  | Pendiente |
| Review & Mapping      | Completado                              | Completado                    | Activo     | Pendiente |
| Confirmación          | Completado                              | Completado                    | Completado | Activo    |

### Integración futura en el orquestador
- **View ID futuro:** `confirmation`
- **activeStepId futuro:** `confirmation`
- **Transición Mapping → Confirmación:** A través del continue handler.
- **Transición Confirmación → Mapping:** A través del back handler.
- **Reset al cancelar:** Conserva el limpiado centralizado.
- **Nueva ruta:** `NO_NEW_ROUTE`.

### Responsive y accesibilidad
El componente existente soporta el cuarto paso:
- Cabe fluidamente en layouts desktop y a 900 px sin overflow horizontal.
- Mantiene el modo colapsado para resoluciones menores.
- Conserva el orden lógico de lectura (`<ol>`, `<li>`).
- Expone el estado de forma estructural y no depende exclusivamente de color (uso de íconos Check y Lock).

### Alcance futuro de archivos

| Archivo futuro | Cambio conceptual | Necesidad | Riesgo |
| -------------- | ----------------- | --------- | ------ |
| `src/config/survey-import/importWizardContent.ts` | Modificar paso 4 existente (`import` a `confirmation`), actualizar label | Configurar stepper | Bajo |
| `src/screens/survey-import/SurveyImportUploadScreen.tsx` | Orquestar `currentView === 'confirmation'` | Integración | Medio |
| `src/screens/survey-import/HistoricalImportConfirmationScreen.tsx` | Creación del componente principal de confirmación | Construir UI | Medio |

## 20. Paso 18 · Footer Architecture
Footer oficial: `ImportWizardFooter`.
- Acción secundaria: "Volver a revisar mapeo" (`onBack`).
- Acción primaria: "Confirmar importación" (`onContinue`).
- Props: Recibe `continueDisabled`, `helperText`, etc.
Tras entrar en estado `confirmation-prepared`, el botón de continuar se deshabilita para evitar dobles envíos y no simula progreso de red ni altera rutas.

## 21. Paso 19 · Reset Architecture
Cancelar invoca el limpiado coordinado en el orquestador (`SurveyImportUploadScreen`) afectando a:
- Upload state.
- Simulated processing y normalization preview.
- Hooks de configuración y mapping.
- Hook futuro de confirmación.
- Flags visuales.
Se delega el reset a las APIs explícitas de cada hook, evitando encadenar effects oscuros.

## 22. Paso 20 · Ocho escenarios R3 futuros
1. `ready-for-confirmation` (Normal, CTA disponible si se marca checkbox).
2. `explicit-confirmation-required` (Checkbox sin marcar, impide CTA).
3. `stale-mapping` (El mapping cambió desde fuera, CTA bloqueado).
4. `blocking-issue-present` (Existen errores no resueltos, CTA bloqueado).
5. `deferred-issues-present` (Avisos mostrados, CTA disponible si se marca checkbox).
6. `ignored-required-column` (Columna crítica omitida, CTA bloqueado).
7. `configuration-mismatch` (Identidad/Configuración difiere severamente).
8. `simulated-error` (Falla técnica en la preparación de confirmación).

## 23. Paso 21 · Escalabilidad
La pantalla operará exclusivamente con *summaries* (conteos globales, muestras limitadas, IDs de referencia, readiness global) provenientes del output de mapping.
- No renderizará 200 archivos en el DOM.
- No listará miles de mappings.
- No requiere librerías de virtualización.
El CTA seguirá computándose sobre el draft completo en memoria `O(1)`.

## 24. Paso 22 · Accesibilidad
- Checkbox con `label` visible y semántico, complementado con descripciones mediante `aria-describedby` para aclarar consecuencias.
- Motivos de deshabilitación (`disabled reasons`) explicados.
- El CTA no usará el color como única vía para denotar estado.
- Foco visible, flujo de tabulación lógico y natural de arriba hacia abajo.
- Región aria-live (`polite`) para notificar la transición a `confirmation-prepared`.
- Checkbox será 100% operable por teclado.

## 25. Paso 23 · IA-first
Clasificación: `LIMITED_VALUE_IN_SIMULATION`.
- Se permite un resumen sintético generado sobre qué implicaciones tienen las incidencias diferidas o columnas ignoradas.
- Prohibido utilizar IA real, chat, ejecución autónoma de acciones, autocompletado del checkbox de confirmación, scoring de éxito.

## 26. Paso 24 · Riesgos arquitectónicos
- **Falsa percepción de persistencia:** Mitigado explícitamente mediante el Disclosure y estados claros.
- **Doble confirmación:** Mitigado deshabilitando el CTA y cambiando el estado a `confirmation-prepared`.
- **Mapping stale/incompatible:** Mitigado por el cálculo de firma (signature) en la etapa de inicialización del adapter.
- **Pérdida de estado en refresh:** Aceptado para la fase actual sin persistencia.
- **Backend/Parser Inexistente:** Se garantiza limitando el flujo a boundaries puros conceptuales y bloqueando la salida real.

## 27. Paso 25 · Capas técnicas futuras
- **Types:** Modelos inmutables.
- **Config:** Textos, límites, etiquetas.
- **Scenarios:** Fixtures sintéticos que cubran los 8 casos.
- **Adapter:** Funciones puras para procesar límites, derivar CTA y evaluar compatibilidad.
- **Hook:** Estado reactivo de React para sostener el draft localmente en el orquestador.
- **Components:** Piezas pletamente presentacionales.
- **Screen:** Composición y paso de propiedades.
- **Orchestrator:** Mantiene los hooks y gestiona reset y navegación.

## 28. Paso 26 · Estructura futura de archivos
- `src/lib/survey-import/confirmation/historicalImportConfirmationTypes.ts`
- `src/config/survey-import/historicalImportConfirmationConfig.ts`
- `src/mocks/survey-import/confirmation/historicalImportConfirmationScenarios.ts`
- `src/lib/survey-import/confirmation/historicalImportConfirmationAdapter.ts`
- `src/hooks/survey-import/useHistoricalImportConfirmationState.ts`
- `src/components/survey-import/confirmation/` (componentes presentacionales)
- `src/screens/survey-import/HistoricalImportConfirmationScreen.tsx`
- Integración en: `src/screens/survey-import/SurveyImportUploadScreen.tsx`

## 29. Paso 27 · Route Decision
**Decisión bloqueada:** `NO_NEW_ROUTE`.
No se alterará la configuración de enrutamiento web. La pantalla vivirá bajo el ciclo de vida del orquestador.

## 30. Paso 28 · Decision Gates Closed
- Screen ownership (HistoricalImportConfirmationScreen)
- State ownership (Orquestador único)
- Input boundary (Mapping Draft ID + Adapter)
- Output boundary (Confirmation Draft ID + Adapter)
- Preservation lifecycle (En Orquestador)
- Reset coordination
- Compatibility definitions (Current, Stale, Incompatible)
- Global states hierarchy
- CTA pure derivation
- Confirmation-prepared semantics
- Visual pattern (Summary list)
- Component architecture (Granular presentational)
- No new route
- No actual persistence/parser/backend
- 8 defined mock scenarios
- Scalability by summaries only
- AI-first boundary limited
- Stepper architecture (`STEPS_DEFINED_IN_LOCAL_CONFIG`, `confirmation` ID, `SAFE_LOCAL_STEPPER_EXTENSION`)

## 31. Paso 29 · Decision Gates Pending
Pendientes exclusivamente para fases posteriores post-prototipo:
- Contrato exacto de la API real.
- Idempotency key real y modelo de transacciones.
- Identidad real del usuario confirmador (Auth module).
- Estrategia de persistencia en base de datos de los drafts.
- Parser real (Excel/CSV) y controles antivirus.
- Limpieza y tratamiento de PII.
- Pantalla de ejecución real.
- Pantallas finales de éxito o error real.
- Reintentos y DLQs.
- Auditoría técnica, instrumentación y logs reales.

## 32. Estado final
`HISTORICAL_IMPORT_CONFIRMATION_ARCHITECTURE_LOCKED`

## 33. Siguiente fase máxima autorizable
`Fase 4H-R3 · Historical Import Confirmation Mock Data Contract`
