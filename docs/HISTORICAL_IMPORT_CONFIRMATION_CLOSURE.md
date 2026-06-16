# Historical Import Confirmation Formal Closure

## Estado Formal

`HISTORICAL_IMPORT_CONFIRMATION_FORMALLY_CLOSED`

## Fecha

2026-06-16

## SHAs Publicados

* Commit funcional: `3dafbe7e1dad3158e77bbc7c982ace41395e5f22` (`feat(survey-import): add historical import confirmation prototype`)
* Commit documental: `6da3d6bf42f5ecc366c76d61e91e5f3d6fe3596f` (`docs(survey-import): record confirmation prototype publication`)

## Objetivo Cerrado

Cerrar formalmente la Fase 4H documentando qué se construyó, los contratos publicados, el flujo de confirmación, reglas de negocio simuladas, hotfixes resueltos, y resultados de QA, asegurando que la confirmación es puramente un prototipo visual e interactivo.

## Alcance Construido

Se implementó la pantalla de "Confirmar importación histórica" con un checklist interactivo que permite dar el consentimiento final antes de simular el envío. Se establecieron boundaries claros, un stepper actualizado y reglas de negocio sobre el estado preparado del draft.

## Inventario de Archivos

**Boundary Mapping → Confirmación**
* `src/lib/survey-import/review-mapping/historicalImportReviewMappingTypes.ts`
* `src/lib/survey-import/review-mapping/historicalImportReviewMappingAdapter.ts`

**Confirmación**
* `src/lib/survey-import/confirmation/historicalImportConfirmationTypes.ts`
* `src/config/survey-import/historicalImportConfirmationConfig.ts`
* `src/mocks/survey-import/confirmation/historicalImportConfirmationScenarios.ts`
* `src/lib/survey-import/confirmation/historicalImportConfirmationAdapter.ts`
* `src/hooks/survey-import/useHistoricalImportConfirmationState.ts`
* `src/components/survey-import/confirmation/ConfirmationComponents.tsx`
* `src/screens/survey-import/HistoricalImportConfirmationScreen.tsx`

**Integración**
* `src/config/survey-import/importWizardContent.ts`
* `src/screens/survey-import/HistoricalImportConfigurationScreen.tsx`
* `src/screens/survey-import/HistoricalImportReviewMappingScreen.tsx`
* `src/screens/survey-import/SurveyImportUploadScreen.tsx`

## Arquitectura

* **Tipo estricto**: Contratos sólidos R3.
* **Config central**: Textos y descripciones desacopladas.
* **Ocho escenarios**: Control de flujo predictivo en mocks.
* **Adapter puro**: Funciones libres de dependencias de react.
* **Firma determinística**: `mappingSignature` para integridad.
* **Compatibilidad**: Restricciones de versiones de intake.
* **Readiness**: Evaluación en tiempo real para habilitar confirmación.
* **CTA**: Control estricto de accesibilidad del botón.
* **Transición prepared**: Bloqueo tras confirmar.
* **Execution boundary**: No invoca endpoints reales.

## Boundaries

* `fileCount` y `mappingSignature` expuestos por Mapping e ingeridos por Confirmación.
* Source builder puro y aislado.
* Cero metadata inventada en el orquestador.

## Reglas de Negocio

* **Checkbox**: Obligatorio y explícito.
* **CTA**: Habilitado si el Mapping está listo, compatibilidad es current, no hay bloqueos, no hay error simulado, checkbox activo, y draft no preparado.
* **Deferred issues**: Visibles, no bloqueantes.
* **Required ignored columns**: Bloqueantes.
* **Prepared**: Estado `confirmation-prepared`, feedback in-place, sin navegación extra ni persistencia, boundary de ejecución local.

## Lifecycle

* Hook único con ownership en el orquestador.
* Preservación de draft.
* Mismo Mapping conserva checkbox y prepared.
* Mismo `confirmationDraftId`.
* Navegar atrás no destruye draft ni roba foco.
* Mapping nuevo crea draft nuevo.
* Mapping stale conserva evidencia pero bloquea confirmación.
* Mapping incompatible bloquea confirmación.
* Cancelación resetea Configuración, Mapping y Confirmación.

## Stepper

1. `upload`: Cargar archivos (Completado)
2. `config`: Configuración general (Completado)
3. `review`: Revisar y mapear (Completado)
4. `confirmation`: Confirmar importación (Activo)
* `ImportWizardSteps.tsx` intacto. Extensión por configuración.

## Accesibilidad

* Checkbox con label y `aria-describedby`.
* Feedback inline con `role="status"`, `aria-live="polite"`, `aria-atomic="true"`.
* Foco programático al confirmar (feedback enfocado una vez).
* No hay refoco al regresar.
* Sin timers.
* Razón de CTA disabled visible.
* Estados sin dependencia exclusiva de color.

## Escenarios

Ocho escenarios simulados:
1. `ready-for-confirmation`
2. `explicit-confirmation-required`
3. `stale-mapping`
4. `blocking-issue-present`
5. `deferred-issues-present`
6. `ignored-required-column`
7. `configuration-mismatch`
8. `simulated-error`
Sin PII, 100% sintéticos.

## Hotfixes

* **R3H1**: Alineación de roles (`implementation-consultant`, `client-administrator`).
* **R3H2**: Alineación Mapping → Confirmación (`fileCount`, `mappingSignature`, source builder).
* **R5H1**: Preservación de `confirmation-prepared`, inicialización idempotente, foco al feedback, prevención de robo de foco.
* **R5H2**: Higiene de whitespace, working-tree diff limpio, staged diff limpio.

## QA

* `npx tsc -b`: OK.
* `npm run build`: OK.
* Lint: OK.
* Diff: Limpio.
* Tests: `NOT_CONFIGURED_WITH_EVIDENCE`.

## Deployment Status

`NO_DEPLOYMENT_TRIGGERED`

## Fuera de Alcance

* Parser real.
* `FileReader`, `Blob`, `ArrayBuffer`, lectura de Excel.
* Backend, API, Supabase, persistencia.
* `localStorage`, `sessionStorage`.
* PII o datos reales.
* Ejecución real.
* Pantallas de progreso, éxito o error.
* Deployment a Production.

## Riesgos Diferidos

* Estado asíncrono real de importación y persistencia de gran escala.
* Manejo de fallos de red durante el parsing.

## Decision Gates Cerrados

* Flujo de cuatro pasos aprobado e implementado.
* Checklist de confirmación obligatorio adoptado.
* Draft local retenido sin persistencia parcial.

## Decision Gates Pendientes

* Transición desde la pantalla de progreso/confirmación hacia la lista histórica (o error).
* Implementación de la vista de monitoreo de importaciones largas.

## Siguiente Fase Recomendada

`Historical Import Mapping Issue Resolution Intake`
(El Overview de Mapping existe, pero las acciones para resolver incidencias son simuladas. Es el vacío funcional visible antes de APIs).
