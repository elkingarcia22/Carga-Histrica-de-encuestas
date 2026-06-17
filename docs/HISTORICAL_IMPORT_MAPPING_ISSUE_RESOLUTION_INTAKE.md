# Fase 4J-R1 · Historical Import Mapping Issue Resolution Intake

## 1. Git Preflight Report
- Branch: `main`
- Ahead: 0
- Behind: 0
- Staged files: 0
- Working tree: Limpio

## 2. Current Mapping Issue Flow Inventory
- **Cómo se representa una incidencia:** A través de objetos de tipo `HistoricalImportMappingIssue` visualizados mediante el componente `PriorityMappingIssues` con tarjetas y badges (severity/domain).
- **Dónde se muestran:** En la sección "Incidencias prioritarias" de la pantalla `HistoricalImportReviewMappingScreen` (Overview).
- **Callback actual "Revisar":** Inexistente de manera funcional; el botón de acción es meramente visual e incluye un Tooltip indicando que la resolución detallada todavía no está conectada.
- **Cómo se deriva readiness:** A partir de `draft.canContinueToConfirmation` y `draft.globalStatus` derivados en `useHistoricalImportReviewMappingState`.
- **Cómo se bloquea el CTA:** `canContinueToConfirmation === false` o bloqueos detectados en `compatibility` o `effectiveDraft`.
- **Boundary hacia Confirmación:** Construido a través de la función `buildConfirmationBoundary(effectiveDraft, source)`.
- **Ownership del Mapping draft:** El hook central `useHistoricalImportReviewMappingState` mantiene la única fuente de la verdad para el `draft`.
- **Comportamiento al volver a Configuración:** Se recalcula la compatibilidad; el draft persiste si todo sigue compatible, en caso contrario bloquea (o marca stale/incompatible).
- **Comportamiento al cancelar:** No aplica persistencia; regresar al Overview simplemente no altera el draft.
- **Resultado:** `CURRENT_MAPPING_ISSUE_FLOW_INVENTORIED`

## 3. Exact Objective
Permitir que el consultor resuelva una escala incompatible o una polaridad ambigua mediante una decisión explícita y reversible, actualizando el Mapping draft simulado y el readiness global sin ejecutar parser, API ni persistencia real.
- **Clasificación:** `OBJECTIVE_APPROVED`

## 4. Primary User
- **Principal:** Consultor de implementación UBITS.
- **Secundario:** Administrador cliente con acceso de consulta.
- El usuario principal debe comprender la escala, identificar rango, revisar polaridad, seleccionar equivalencia, confirmar, y cancelar sin perder draft.
- **Resultado:** `PRIMARY_USER_VALIDATED`

## 5. First Issue Decision
- **Opción elegida:** Opción A · Polaridad ambigua.
- **Motivo:** Decisión estructural concreta y clara, bajo riesgo conceptual, no requiere transformación matemática y permite probar preservación de estado e interacciones de accesibilidad.
- **Resultado:** `FIRST_MAPPING_ISSUE_LOCKED`

## 6. Alternatives Evaluated
- **Opción A:** Polaridad ambigua (Recomendada y bloqueada).
- **Opción B:** Rango incompatible.
- **Opción C:** Target de escala ambiguo.

## 7. Visual Pattern Decision
- **Opción elegida:** Opción A · Drawer secundario.
- **Justificación:** Componente `Sheet` existente en `shadcn/ui` y utilizado previamente. Permite mantener el contexto sin navegación destructiva.
- **Resultados:**
  - `SECONDARY_DRAWER_PATTERN_LOCKED`
  - `MODAL_PATTERN_LOCKED` (Evaluado como contingencia)
  - `INTERNAL_PANEL_PATTERN_LOCKED` (Evaluado y descartado)

## 8. Happy Path
1. El usuario pulsa `Revisar`.
2. Se abre el Drawer/Sheet de la resolución.
3. El usuario revisa la incidencia (escala, polaridad, ambigüedad detectada).
4. Selecciona equivalencia (puntuación alta/baja = favorable) o marca como pendiente.
5. Confirma.
6. El Mapping draft local se actualiza.
7. La incidencia transiciona de `needs-review` a `resolved`.
8. El readiness global se recalcula.
9. El overlay se cierra y el foco regresa al trigger en el Overview.

## 9. Resolution Actions
- **Revisar:** Gatilla la experiencia de resolución.
- **Seleccionar equivalencia / Editar / Resolver:** Acciones simuladas locales mediante RadioCards/Visual Selection.
- **Confirmar:** Aplica decisión al draft.
- **Cancelar:** Cierra overlay sin aplicar cambios.

## 10. Save, Cancel and Close Behavior
- **Guardar resolución:** Actualiza el draft local, cierra overlay, recalcula readiness. No persiste fuera del navegador.
- **Cancelar edición:** Cierra overlay. Foco al trigger. Draft inalterado.
- **Cerrar con Escape:** Mismo comportamiento que cancelar.
- **Volver a Configuración:** Conserva la resolución siempre que la configuración siga compatible; una incompatibilidad bloquea el Mapping pero no destruye evidencia de resolución local en memoria.
- **Resultado:** `RESOLUTION_LIFECYCLE_DEFINED`

## 11. Conceptual Model
- **Issue resolution draft:** `resolutionDraftId`, `mappingDraftId`, `mappingIssueId`, `mappingEntityId`, `domain`, `originalStatus`, `resolutionType`, `selectedPolarity`, `suggestedPolarity`, `resolutionOrigin`, `resolvedByRole`, `resolutionStatus`, `createdFromScenarioId`.
- **Resolution status:** `untouched`, `editing`, `resolved`, `deferred`, `cancelled`, `simulated-error`.
- **Polarity:** `high-is-favorable`, `low-is-favorable`, `not-applicable`, `unresolved`.

## 12. State Ownership
- Estado de Mapping canónico gestionado centralmente en `useHistoricalImportReviewMappingState`.
- El overlay manejará un estado efímero/draft y despachará la confirmación final al hook padre.
- **Resultado:** `RESOLUTION_STATE_OWNERSHIP_LOCKED`

## 13. Input Boundary
- `mappingDraftId`, `issueId`, `entityId`, status actual, metadata sintética de escala, sugerencia simulada.

## 14. Output Boundary
Resolución serializable:
- `issueId`, `entityId`, `resolutionType`, `selectedPolarity`, `resolved`, `resolvedByRole`.
- Ningún objeto complejo como files o funciones.
- **Resultado:** `ISSUE_RESOLUTION_BOUNDARY_DEFINED`

## 15. Business Rules
- Resolver polaridad elimina una incidencia `needs-review`.
- No elimina incidencias de otros dominios.
- No convierte un Mapping blocked por otra causa a ready (solo por su propia causa).
- `canContinueToConfirmation` se deriva globalmente del draft completo.
- Marcar pendiente mantiene CTA bloqueado.
- Cancelar no cambia el draft.
- Restaurar sugerencia devuelve el valor a la resolución simulada base.
- Resolución manual debe registrar su origen.
- Cero transformaciones de valores o parser.

## 16. Mock Scenarios
1. `polarity-ambiguous-default`
2. `high-is-favorable-suggested`
3. `low-is-favorable-suggested`
4. `manual-resolution-required`
5. `resolution-restored-to-suggestion`
6. `other-blocking-issue-remains`
7. `configuration-incompatible`
8. `simulated-error`

## 17. AI-first Scope
- **Permitido:** Explicar por qué es ambigua, sugerir polaridad, explicar impacto de decisión.
- **Prohibido:** Decidir automáticamente, inferir de PII real, mostrar porcentajes falsos o abrir un chat.
- **Resultado:** `AI_ASSISTANCE_LIMITED_TO_EXPLANATION_AND_SUGGESTION`

## 18. Existing Component Inventory
- **Drawer/Sheet:** Existe (`src/components/ui/sheet.tsx`). Reutilizable.
- **Dialog:** Existe (`src/components/ui/dialog.tsx`, `alert-dialog.tsx`).
- **RadioGroup:** Existe (`src/components/ui/radio-group.tsx`).
- **Visual Selection:** Existe (`src/components/selection/RadioCardGroup.tsx`, etc).
- **Alert/Badge/Tooltip/Button:** Todos existen y son reutilizables.
- **AI lightweight controls:** Existe (`src/components/ai/`).
- **UbitsIcon:** Utilizado vía componentes internos y lucide.

## 19. Stack and Tokens
React, TypeScript, Tailwind CSS, shadcn/ui. Colores semánticos definidos. Desktop-first B2B. Cero dependencias adicionales requeridas.
- **Resultado:** `STACK_AND_UBITS_TOKENS_VALIDATED`

## 20. Visual References
- Review & Mapping Overview actual.
- Componentes Visual Selection (`CardSelection`, `RadioCardGroup`).
- Shell base / Sheet implementation.
- Shadcn UI guidelines pre-instaladas.

## 21. Accessibility Requirements
- Overlay con heading y roles WAI-ARIA (garantizados por Radix/shadcn).
- Navegación operable por teclado.
- Foco atrapado en overlay y retorno predecible.
- `aria-live="polite"` para feedback de actualización de readiness.
- Tooltips y motives claros para estados disabled.

## 22. Scalability
- Modificación atómica local.
- Un solo overlay activo a la vez.
- Evita virtualización prematura de respuestas.

## 23. Success Criteria
1. El usuario comprende la incidencia.
2. Puede seleccionar polaridad.
3. Puede cancelar sin cambios.
4. Puede confirmar una resolución.
5. La incidencia cambia de estado.
6. El readiness se recalcula globalmente.
7. El CTA solo cambia si no quedan otros bloqueos.
8. El foco retorna correctamente.
9. La resolución se preserva al volver.
10. No hay parser, API ni persistencia.
11. No hay datos reales.
12. Desktop y 900 px son estables.
- **Resultado:** `SUCCESS_CRITERIA_LOCKED`

## 24. Risks
- Overlay anidado: Posibles conflictos de focus trap en `ImportWizardShell`.
- Estado: Duplicación entre hook central y panel efímero.
- Navegación: Modificar readiness engañosamente provocando navegación prematura.
- Compatibilidad futura con un catálogo real de demográficos y dimensiones.

## 25. Decision Gates Closed
Objetivo, usuario, primera incidencia, patrón visual, ownership, lifecycle, boundary, reglas, mocks, IA, accesibilidad, escalabilidad, criterios de éxito, riesgos.

## 26. Decision Gates Pending
Catálogo real, parser funcional, API backend, persistencia remota, resolución de otras incidencias, batch actions, y Production.

## 27. Repository Documentation Check
- `docs/DESIGN.md`: Verificado (Existe).
- `docs/ANTIGRAVITY.md`: Verificado (Existe).
- `docs/ARCHITECTURE.md`: Verificado (Existe).
- `docs/QA_CHECKLIST.md`: Verificado (Existe).

## 28. Files Created or Modified
- `docs/HISTORICAL_IMPORT_MAPPING_ISSUE_RESOLUTION_INTAKE.md`
- `docs/PROMPT_LOG.md`

## 29. QA Result
- 2 archivos documentales afectados.
- 0 cambios en `src/**`.
- 0 scripts ajenos, 0 dump files.
- White-space verificado localmente en el documento generado.

## 30. Final Status
`HISTORICAL_IMPORT_MAPPING_ISSUE_RESOLUTION_INTAKE_READY`

## 31. Next Maximum Authorizable Phase
`Fase 4J-R2 · Historical Import Mapping Issue Resolution Architecture Lock`
