# Historical Import Mapping Compatibility Closure

## Fase
Fase 4I-H6 · Historical Import Mapping Compatibility Formal Closure

## Fecha
2026-06-16

## SHAs Publicados
- **Commit Funcional:** `4128d0711fd77a3495145e1f604c5fd8a96b8dbe`
- **Commit Documental:** `0c01aea307d7135e93b99773fa6a9db5c43d3c1e`

## Síntoma
La pantalla mostraba readiness positivo (`Listo para confirmar`) y compatibility incompatible (`No vigente (incompatible)`) simultáneamente, con el CTA deshabilitado.

## Evidencia
La interfaz de usuario exhibía una contradicción visual al derivar la compatibilidad de una firma distinta a la del `draft` actual, lo que ocasionaba bloqueos lógicos.

## Causa Raíz
El Mapping draft utilizaba una firma fija del fixture en vez de la firma runtime provista por la Configuración, lo que causaba el fallo `MAPPING_INITIALIZATION_IGNORES_SOURCE_SIGNATURE`.

## Primer Intento
Se adoptó la firma runtime, pero el modelo efectivo resultante se persistió de manera destructiva en el estado base con un equivalente a `setDraft(effectiveDraft)`.

## Hallazgo de Corrupción
`EFFECTIVE_MAPPING_DRAFT_STATE_MUTATION_AND_CORRUPTION`
La persistencia destructiva sobrescribió el `globalStatus` base y la información original, impidiendo recuperar la validez de los datos al revertir cambios en configuración.

## Arquitectura Antes
El draft base persistido actuaba como receptor de la derivación de compatibilidad. Esto creaba una segunda fuente de verdad persistida y sobrescribía el estado base original de forma irremediable.

## Arquitectura Después
Existe una separación estricta:
- Draft base persistido canónico.
- `compatibility`, `effective globalStatus`, `effective CTA` y disponibilidad de boundary derivados.
- El modelo efectivo se construye dinámicamente (`useMemo`) y no se persiste, preservando la precedencia de errores.

## Draft Base
Permanece canónico y recuperable. Contiene `mappingDraftId`, `configurationSignature` inicial, `entities`, `issues`, `ignored columns`, `domain summaries`, `base globalStatus`, `base readiness`, y `base CTA contractual`.

## Estado Derivado
Se computan en tiempo de ejecución:
- `compatibility`
- `effective globalStatus`
- `effective CTA`
- Disponibilidad del boundary
- Señales visuales.

## Firma Runtime
Se adopta estricta y puramente la firma de runtime durante la inicialización, la cual contiene `surveyType`, `privacyMode`, y `periodYear`.

## Precedencia
1. `simulated-error`
2. `incompatible`
3. `stale` (reservado)
4. `blocked`
5. `needs-review`
6. `ready-for-confirmation`

## Reversibilidad
El estado original se recupera completamente si se restablece la configuración, demostrando reversibilidad total.

## CTA
`current` + `ready` habilita. `incompatible`, `simulated-error`, `blocked`, o `needs-review` bloquean.

## Boundary
El boundary solo existe y habilita Confirmación con un estado efectivo válido (`current` + `ready`).

## Ocho Escenarios
Los 8 escenarios se mantienen intactos: `ready-for-confirmation`, `ambiguous-question-target`, `incompatible-scale`, `unmapped-required-field`, `ignored-technical-column`, `demographic-review-required`, `inherited-blocking-issue`, `simulated-error`. Mismatch efectivo no destruye el draft.

## Gobernanza de Stale
`STALE_RESERVED_NOT_REACHABLE_IN_CURRENT_CONTRACT`. La firma actual de configuración contiene únicamente campos estructurales, por ende, diferencias estructurales generan `incompatible`. Cambios no estructurales no afectan la firma. El literal `stale` se mantiene como reservado para el futuro sin ser alcanzable.

## Runtime QA
- Cero loops.
- Cero maximum update depth.
- Cero effects circulares.
- Cero updates after unmount.
- Cero mutaciones accidentales.

## Visual QA
- Cero rediseño.
- Cards, badges, alertas, footer, desktop y 900 px estables e intactos.

## Accessibility QA
- Estados textuales, alertas semánticas, helper visible, disabled reason visible, teclado intacto, stepper semántico.
- Focus hotfix de Confirmación intacto.

## QA Técnico
- Typecheck, ESLint, Build pasaron exitosamente sobre los archivos modificados.
- Tests: `NOT_CONFIGURED_WITH_EVIDENCE`.

## Deployment Status
`NO_DEPLOYMENT_TRIGGERED`.

## Fuera de Alcance
No se integraron APIs reales, persistencia real, parser, FileReader, backends, localStorage, datos reales, rutas nuevas ni dependencias nuevas.

## Riesgos Diferidos
Volumen de datos masivos, persistencia del backend, procesamiento real.

## Decision Gates Cerrados
Arquitectura derivativa estricta sin persistencia destructiva; reversibilidad total garantizada.

## Decision Gates Pendientes
Depuración de literales obsoletos `stale` si no se expande la firma con campos no estructurales.

## Siguiente Fase Recomendada
`Historical Import Mapping Issue Resolution Intake`

## Estado Final
`HISTORICAL_IMPORT_MAPPING_COMPATIBILITY_FORMALLY_CLOSED`
