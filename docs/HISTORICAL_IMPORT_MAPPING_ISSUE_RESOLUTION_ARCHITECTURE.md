# Fase 4J-R2 · Historical Import Mapping Issue Resolution Architecture Lock

## 1. Git Preflight Report
- **Branch:** `main`
- **HEAD:** Alineado con `origin/main`
- **Ahead:** 0
- **Behind:** 0
- **Staged files:** 0
- **Working tree:** Cambios documentales legítimos de R1 (`docs/HISTORICAL_IMPORT_MAPPING_ISSUE_RESOLUTION_INTAKE.md`, `docs/PROMPT_LOG.md`). Cero cambios en `src/**`, cero scripts/patches/rejects.

## 2. Intake Validation
Validado que R1 cerró: objetivo, usuario (Consultor de implementación), incidencia (Polaridad ambigua), patrón visual (Sheet/Drawer secundario), lifecycle, ownership preliminar, boundaries, escenarios, IA, accesibilidad y criterios de éxito sin contradicciones.
**Resultado:** `MAPPING_ISSUE_RESOLUTION_INTAKE_VALIDATED`

## 3. Current Mapping Architecture Inventory
- **Propietario actual del draft:** `useHistoricalImportReviewMappingState`.
- **Estructura Issue:** `HistoricalImportMappingIssue` (`id, code, domain, entityId, resolutionStatus...`).
- **Estructura Entity:** `HistoricalImportMappingEntity` (`id, status, issueIds...`).
- **Relación:** `issue.entityId` apunta al ID de la entidad afectada.
- **Status disponibles:** `open`, `resolved`, `deferred` para issues. `confirmed`, `needs-review`, `ambiguous`, `blocked` para entities.
- **Derivación de summaries:** `deriveDomainSummaries` calcula conteos puros desde `entities`.
- **Derivación de readiness:** `deriveReadiness` evalúa severidades de issues e incompleciones en entities.
- **Derivación de CTA:** `determineGlobalStatus` y `canContinueToConfirmation` (boolean puro).
- **Confirmation Boundary:** `buildConfirmationBoundary(effectiveDraft, source)`.
- **API actual hook:** Expone `draft` (efectivo derivado), `compatibility`, `priorityIssues`.
- **Callback actual "Revisar":** Inexistente (botón puramente visual actualmente).
- **PriorityMappingIssues:** Se alimenta vía `getPriorityIssues(effectiveDraft.issues)`.

## 4. Canonical State Ownership
**Mapping draft canónico:**
- **Propietario:** `useHistoricalImportReviewMappingState`
- **Conserva:** entities, issues, ignored columns, summaries, base status, configuration signature, mappingDraftId.

**Overlay UI state:**
- **Propietario recomendado:** Hook local exclusivo de edición dentro de `MappingIssueResolutionSheet`.
- **Contiene:** issue seleccionada, valor temporal de polaridad, dirty state, referencia del trigger.
- **No contiene:** Copia completa del draft, readiness global, CTA global.
**Resultado:** `CANONICAL_AND_TRANSIENT_STATE_OWNERSHIP_LOCKED`

## 5. Transient Editor State
El estado del editor (overlay) no se persiste en el draft. Mantiene el ciclo de vida local durante la sesión de edición y despacha la resolución final. 

## 6. Atomic Resolution Action
Acción conceptual en el Mapping hook: `resolveMappingIssue`
- **Entrada:** `mappingIssueId`, `mappingEntityId`, `resolutionType`, `selectedPolarity`, `resolutionOrigin`, `resolvedByRole`.
- **Responsabilidad:** Validar referencias, localizar issue y entity, aplicar resolución inmutablemente, actualizar issue a `resolved`, metadata de entity, no tocar otras issues, recalcular summaries/readiness/CTA, preservar identidad del draft.
**Resultado:** `ATOMIC_MAPPING_ISSUE_RESOLUTION_ACTION_LOCKED`

## 7. Draft Mutation Rules
- No mutar arrays in-place.
- No mutar issue o entity encontradas directamente.
- No cambiar `mappingDraftId` ni `configurationSignature`.
- No borrar otras issues.
- No convertir automáticamente `blocked` en `ready` (se debe re-derivar globalmente).
- No modificar `compatibility`.
- No construir un segundo `effectiveDraft` persistido.
- Se modificarán conceptualmente: `issues` (cambio a resolved), `entities` (status a confirmed + metadata), `resolvedIssueIds`.

## 8. Issue Lifecycle
- **Estado persistido (existentes):** `open`, `resolved`, `deferred`. No se requiere una nueva unión.
- **Estado temporal del editor:** `pristine`, `editing`, `valid`, `invalid`. No se persiste.
**Resultado:** `ISSUE_AND_EDITOR_LIFECYCLES_SEPARATED`

## 9. Polarity Contract
- **Valores mínimos:** `high-is-favorable`, `low-is-favorable`, `unresolved`. (`not-applicable` diferido si no aplica a polaridad).
- **Definiciones:** Valor inicial (`unresolved`), sugerencia simulada, selección manual, restauración de sugerencia, validación estricta para confirmar.

## 10. Resolution Origin
- **Orígenes:** `simulated-suggestion`, `user-confirmed-suggestion`, `user-selected`, `restored-to-suggestion`.
- Deben persistirse en el draft como evidencia de la decisión.
- No usar porcentajes de confianza.

## 11. Visual Pattern / Sheet Architecture
- Un único `Sheet` montado por pantalla (Overview), no uno por card.
- Controlado vía `open` / `onOpenChange`.
- Side: Right.
- Ancho desktop fijo o sm/md/lg de shadcn.
- Scroll interno, header fijo, footer de acciones dentro del Sheet.
- Z-index manejado por la implementación base de shadcn. No modificar componente base.
**Resultado:** `SINGLE_CONTROLLED_RESOLUTION_SHEET_LOCKED`

## 12. Overlay Nesting Gate
- Clasificación: `NESTED_SHEET_ARCHITECTURE_SAFE`. El Wizard es una vista de enrutamiento normal y el Sheet de shadcn (usando Radix Dialog/Portal bajo el capó) manejará los focus traps correctamente sobre el root del documento, bloqueando la interacción por debajo y oscureciendo el fondo con su overlay propio sin conflictos.

## 13. Sheet Content Architecture
Jerarquía única:
1. Heading
2. Badge de dominio
3. Explicación de incidencia
4. Metadata de escala origen
5. Motivo de ambigüedad
6. Sugerencia simulada
7. Selección de polaridad
8. Impacto de decisión
9. Validaciones
10. Acciones Cancelar y Confirmar
(Sin tablas grandes, chat, analytics, etc.)

## 14. Overview Integration
- **Trigger:** Botón de acción "Revisar" en la tarjeta de `PriorityMappingIssues` específica de polaridad ambigua.
- El trigger identifica la issue vía su `issueId`.
- Para issues futuras, el botón sigue deshabilitado con un tooltip.
- Comportamiento post-resolución: La issue se resuelve y desaparece de la lista de pendientes; el feedback se maneja derivando el nuevo estado global y resumiendo la confirmación.

## 15. Focus Architecture
- **Apertura:** Guardar referencia al trigger, abrir Sheet, enfocar heading o primer control. Sin timers.
- **Cancelación:** Cerrar, descartar editor, devolver foco al trigger.
- **Confirmación:** Aplicar acción, cerrar. Como la issue desaparece (y el trigger se desmonta), devolver foco explícitamente al **heading de incidencias** (PriorityMappingIssues header).
**Resultado:** `ROW_AWARE_ISSUE_RESOLUTION_FOCUS_STRATEGY_LOCKED`

## 16. Escape and Cancel
- Escape / outside click = Cancelar.
- Política de descarte: Para la primera iteración, al ser una selección de opciones simples, se permite descarte directo temporal sin `AlertDialog` para agilizar UX.

## 17. Readiness Architecture
- **Cadena:** `resolution → base Mapping draft → adapter derivations → summaries → readiness → CTA → boundary`.
- La issue resuelta deja de contar como pendiente.
- Compatibilidad y errores simulados conservan precedencia para bloquear la vista/CTA global.
- `canContinueToConfirmation` se deriva de manera centralizada en el estado efectivo.
**Resultado:** `RESOLUTION_READINESS_DERIVATION_LOCKED`

## 18. Compatibility Rules
- **Compatibility current:** Permite abrir y resolver.
- **Compatibility incompatible:** CTA bloqueado, editor read-only o no permite guardar.
- Si cambia compatibilidad mientras Sheet está abierto: cerrar editor y descartar cambios temporales.
**Resultado:** `RESOLUTION_COMPATIBILITY_RULES_LOCKED`

## 19. Preservation Architecture
- La resolución confirmada vive dentro del Mapping draft en el orquestador.
- Volver a configuración con cambios estructurales invalida `compatibility`, pero la resolución sigue existiendo conceptualmente en memoria. Restaurar la config la devolvería a `current`.
- Cancelar importación (reset) limpia la resolución por completo.
- Reload = limpia (no persistencia real).

## 20. Input Boundary
- Serializable: `mappingDraftId`, `issueId`, `entityId`, `issue.code`, `domain`, source scale metadata, suggested polarity, current resolution.

## 21. Output Boundary
- Serializable: `issueId`, `entityId`, `resolutionType`, `selectedPolarity`, `resolutionOrigin`, `resolvedByRole`.

## 22. Mapping-to-Confirmation Boundary
- No requiere un boundary adicional; la confirmación y el adapter de boundary base (`buildConfirmationBoundary`) ya incluyen entidades confirmadas, ignoradas y issues resueltas (`resolvedIssueIds`).
**Resultado:** `RESOLUTION_BOUNDARY_ARCHITECTURE_LOCKED`

## 23. Mock Contract Planning
Escenarios para R3:
1. `polarity-ambiguous-default` (Base)
2. `high-is-favorable-suggested`
3. `low-is-favorable-suggested`
4. `manual-resolution-required`
5. `resolution-restored-to-suggestion`
6. `other-blocking-issue-remains`
7. `configuration-incompatible`
8. `simulated-error`

## 24. Future File Structure
En `src/components/survey-import/review-mapping/resolution/`:
- `MappingIssueResolutionSheet.tsx`
- `AmbiguousPolarityResolution.tsx`
- `ScaleSourceSummary.tsx`
- `ResolutionImpactSummary.tsx`
Hook, config, adapter, y mocks se extienden en los dominios existentes.

## 25. Route Decision
`NO_NEW_ROUTE`. El Sheet es un overlay dentro de `HistoricalImportReviewMappingScreen`.

## 26. AI-first Architecture
- Sugerencia sintética mockeada. Sin chat, sin API, sin modelos vivos, sin auto-resolve.
**Resultado:** `SIMULATED_AI_SUGGESTION_ARCHITECTURE_LOCKED`

## 27. Accessibility Architecture
- `SheetTitle`, `SheetDescription`, `RadioGroup` con a11y, `aria-describedby` para validaciones, `aria-live="polite"` para Overview feedback. Foco restaurado explícitamente.

## 28. Responsive Architecture
- Desktop: Sheet lateral.
- 900px: No cubrir acciones críticas sin scroll, prevenir horizontal overflow. (Full width o sheet width max-100vw).

## 29. Scalability Architecture
- Un Sheet global, una issue a la vez, lookup por ID (`O(N)` derivación pero performante por < 200 items), no batch resolution.

## 30. Error Architecture
- `issue_not_found`, `entity_not_found`, validación inconsistente, mapping incompatible, simulated error. Manejo explícito sin try/catch silencioso en UI local.

## 31. Component Decision Matrix
| Componente | Existencia validada | Uso aprobado | Restricciones |
| :--- | :---: | :---: | :--- |
| Sheet | Sí | Sí | Un solo sheet. |
| SheetHeader / Title / Description | Sí | Sí | Requeridos a11y. |
| SheetFooter | Sí | Sí | Acciones explícitas. |
| RadioGroup | Sí | Sí | **Elegido como control principal para polaridad.** |
| RadioCardGroup / CardSelection | Sí | No | Reservado para configuraciones macro. |
| Alert | Sí | Sí | - |
| Badge | Sí | Sí | - |
| Tooltip | Sí | Sí | - |
| Button | Sí | Sí | - |
| ScrollArea | Sí | Sí | - |
| Separator | Sí | Sí | - |
| UbitsIcon | Sí | Sí | - |
| Control IA lightweight | Sí | Sí | Solo insignias/sparkles estáticos. |

## 32. Risks
- Navegación asíncrona no deseada tras update de estado, Foco perdido tras resolver (mitigado por focus programático a Priority Header).

## 33. Decision Gates Closed
- Ownership canónico, estado temporal, acción atómica, lifecycle, polarity contract, origin, nesting, patrón sheet, triggers, foco, escape, readiness, compatibility, boundaries, mocks, file structure, routing, IA, a11y, component matrix.

## 34. Decision Gates Pending
- Catálogo real, transformación matemática de valores de puntaje, persistencia backend API, parser, PII real, auditoría masiva.

## 35. Files Created or Modified
- `docs/HISTORICAL_IMPORT_MAPPING_ISSUE_RESOLUTION_ARCHITECTURE.md`
- `docs/PROMPT_LOG.md`

## 36. QA Result
- Solo documentos modificados. 0 cambios en `src/**`. Cero código.

## 37. Final Status
`HISTORICAL_IMPORT_MAPPING_ISSUE_RESOLUTION_ARCHITECTURE_LOCKED`

## 38. Next Maximum Authorizable Phase
`Fase 4J-R3 · Historical Import Mapping Issue Resolution Mock Data Contract`
