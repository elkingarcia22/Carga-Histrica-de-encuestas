# Fase 4D3.1 · U3-SIM Build Plan Documentation Checkpoint Report

## 1. Resumen ejecutivo
El propósito de este documento es definir el plan técnico exacto y la arquitectura de componentes para construir la fase **U3-SIM · Procesamiento inicial simulado**. El enfoque está restringido a la simulación visual interactiva del procesamiento de encuestas, sin lectura real de archivos, análisis ni envío a servidores, definiendo contratos locales, hooks, adapter y componentes puros.

## 2. Estado inicial de Git
- Rama actual: `main`
- Hash completo de `HEAD`: `fbdb7b82e6193589ee0858e8c56983b97d5268e5`
- Hash completo de `origin/main`: `fbdb7b82e6193589ee0858e8c56983b97d5268e5`
- `HEAD === origin/main`: Sí.
- Tracking: `origin/main`
- Ahead: `0`
- Behind: `0`
- Staging vacío: Sí.
- Worktree técnico del lockfile separado y no trackeado.

## 3. Correcciones realizadas
- Eliminación de la "derivación híbrida" y unificación bajo `SurveyImportView`.
- Refinamiento de la estrategia de selección de vista (`upload-idle`, `files-selected`, `simulated-processing`).
- Supresión de lenguajes engañosos sobre la "IA" y adopción de "Simulación de prototipo".
- Cierre definitivo del inventario de archivos a crear/modificar.
- Formulación de la expresión conceptual `canStartSimulation`.
- Especificación del adapter determinístico puro, separando fixtures de la UI.

## 4. Estado formal
`U3_SIM_BUILD_PLAN_APPROVED`
- Arquitectura: aprobada.
- Plan de construcción: aprobado.
- Implementación: no iniciada.
- Preview histórico: fuera de alcance.

## 5. Componentes auditados
| Componente | Ruta real | Props relevantes | Estado interno | Reutilizable sin cambios | Observación |
| ---------- | --------- | ---------------- | -------------- | :-----------------------: | ----------- |
| `ImportWizardFooter` | `src/components/survey-import/ImportWizardFooter.tsx` | `continueDisabled`, `onContinue`, `continueLabel` | No | No | Requiere recibir acciones por props |
| `ImportWizardShell` | `src/components/survey-import/ImportWizardShell.tsx` | `children`, `step` | No | Sí | Layout de envoltura |
| `ImportWizardHeader` | `src/components/survey-import/ImportWizardHeader.tsx` | `title`, `description` | No | Sí | Cabecera estándar |
| `ImportWizardSteps` | `src/components/survey-import/ImportWizardSteps.tsx` | `currentStep` | No | Sí | Indicador visual |
| `ImportSummaryCard` | `src/components/survey-import/ImportSummaryCard.tsx` | `batchSummary` | No | Sí | Resumen base |
| `UploadLiveRegion` | `src/components/survey-import/UploadLiveRegion.tsx` | `message` | No | Sí | Live region a11y |
| `Card` | `src/components/ui/card.tsx` | Base | No | Sí | Base UI |
| `Alert` | `src/components/ui/alert.tsx` | `variant` | No | Sí | Base UI |
| `Badge` | `src/components/ui/badge.tsx` | `variant` | No | Sí | Base UI |
| `Progress` | `src/components/ui/progress.tsx` | `value` | No | Sí | Base UI |
| `Separator` | `src/components/ui/separator.tsx` | `orientation` | No | Sí | Base UI |
| `Tooltip` | `src/components/ui/tooltip.tsx` | `content` | No | Sí | Base UI |
| `Skeleton` | `src/components/ui/skeleton.tsx` | - | No | Sí | UI de carga (si aporta valor) |
| Sistema de iconos | `src/icons/` | `name`, `size` | No | Sí | Reusable sin instalar nuevos |

## 6. Estrategia de vista
Concepto: `SurveyImportView`
Valores: `upload-idle`, `files-selected`, `simulated-processing`
Ownership:
- Vive exclusivamente en `SurveyImportUploadScreen`.
- Decide cuál vista interna renderizar.
- No se persiste. No forma parte de `ImportSession`. No vive en hooks.

Regla:
- `useLocalUploadState` conserva datos/validaciones U1/U2.
- `useSimulatedProcessingState` conserva microestados U3-SIM.
- `SurveyImportView` selecciona la pantalla visible.

Transiciones:
- `upload-idle → files-selected` (selección válida)
- `files-selected → upload-idle` (remoción del último archivo)
- `files-selected → simulated-processing` (inicio)
- `simulated-processing → files-selected` (cancelar simulación)
- `simulated-processing → upload-idle` (cancelar flujo total)
- Permanencia en `simulated-processing` mostrando `completed` (finalización). Preview diferido.

Estado: `LOCKED`

## 7. Integración futura con U2
**Modificación mínima del footer (`ImportWizardFooter`)**
Props a añadir/aprobar: `continueDisabled`, `onContinue`, `continueLabel`.
Reglas:
- `onContinue` opcional solo si el patrón lo requiere.
- Cuando `continueDisabled === true`, no se ejecuta callback.
- Sin conocimiento de U3-SIM ni fixtures ni timers. No decide si el lote es válido. Solo acciones recibidas.

**Condición futura de Continuar (`canStartSimulation`)**
Requisitos:
- Vista actual `files-selected`.
- Al menos un archivo y `batch.isValid === true`.
- 0 archivos blocking. Cantidad y tamaño dentro del límite.
- Cada archivo retenible con `hasBinary === true`.
- Todos los IDs presentes en boundary.
- Simulación en `idle`, transición no iniciada.
(No lee contenido, no reabre archivos, no valida MIME, no ejecuta parser).

## 8. Contratos, configuración y adapter
**Contratos locales:** `src/lib/survey-import/simulation/simulationTypes.ts`
- Tipos mínimos: `SimulationStatus` (`idle`, `queued`, `running`, `completed`, `failed`, `cancelled`), `SimulationPhaseId`, `SimulationFileStatus`, `SimulationFileProgress`, `SimulationPlan`, `SimulationResultSummary`, `SimulationEvent`.
- No incluir `File`, `Blob`, fixture completo ni datos canónicos.

**Mapping de fixtures**
- `files-selected-valid`: Referencia visual inicial (no reemplaza el lote real).
- `aggregated-happy-path`: Modo detectado, capacidades, resumen (dominio).
- `result-completed`: Estado terminal sintético, handoff.
Los componentes no importan fixtures, solo el adapter.

**Adapter determinístico (`simulatedImportAdapter.ts`)**
- Entrada: Metadata segura y mínima, escenario configurado explícitamente.
- Salida: `SimulationPlan` (scenarioId, fases, warnings, resumen terminal).
- No muta, no aleatoriedad, no red, no fechas actuales. Estado: `LOCKED`.

**Configuración central (`simulationConfig.ts`)**
- Orden de fases, labels, tiempos provisionales, disclosure, copy. (No timers activos ni métricas de negocio).
- Tiempos: `PROVISIONAL_LOCKED_PENDING_VISUAL_QA`.

## 9. Hook y timers
`src/hooks/survey-import/useSimulatedProcessingState.ts`
- Entrada: `SimulationPlan`. Salida: `state`, `start`, `cancelSimulation`, `reset`.
- Reducer puro, maneja la secuencia y timer único.
- Previene doble inicio, garantiza cleanup, no conoce boundary, no importa fixtures. Invariantes estrictos (1 timer activo máximo).

## 10. Componentes visuales
| Componente | Responsabilidad | Props conceptuales | Estado interno | Imports de fixtures |
| ---------- | --------------- | -------------------------- | -------------- | ------------------: |
| `SimulatedProcessingScreen` | Componer UI, accesibilidad, layout | `plan`, `state`, callbacks, `summary` | No | 0 |
| `SimulationDisclosure` | Aclaración visual de prototipo | - | No | 0 |
| `SimulatedProcessingPanel` | Mostrar fase activa | `state.activePhase`, `progress` | No | 0 |
| `SimulatedProcessingFileList` | Progreso por archivo (sin binarios) | `files`, `fileProgress` | No | 0 |
| `SimulatedProcessingSummary` | Mostrar resultado de la simulación | `summary` | No | 0 |

## 11. Copy y disclosure
**SimulationDisclosure**
- Principal: "Simulación de prototipo"
- Apoyo: > Esta experiencia representa visualmente cómo funcionará la revisión. Los archivos seleccionados no se están leyendo y los resultados mostrados usan datos sintéticos.
- Transparente, sin "badge de IA" exagerado.

**Copy orientado al usuario**
Fases:
1. Verificando archivos seleccionados.
2. Revisando la estructura esperada.
3. Identificando el tipo de encuesta.
4. Preparando el resultado histórico.
Textos: "La simulación terminó y preparó un resultado histórico de ejemplo.", "Detener simulación.", "Volver a archivos.", "Cancelar importación."

## 12. Inventario cerrado
Modificar:
1. `src/screens/survey-import/SurveyImportUploadScreen.tsx`
2. `src/components/survey-import/ImportWizardFooter.tsx`
3. `docs/QA_CHECKLIST.md`
4. `docs/PROMPT_LOG.md`

Crear:
1. `src/screens/survey-import/SimulatedProcessingScreen.tsx`
2. `src/hooks/survey-import/useSimulatedProcessingState.ts`
3. `src/config/survey-import/simulationConfig.ts`
4. `src/lib/survey-import/simulation/simulationTypes.ts`
5. `src/lib/survey-import/simulation/simulatedImportAdapter.ts`
6. `src/components/survey-import/SimulationDisclosure.tsx`
7. `src/components/survey-import/SimulatedProcessingPanel.tsx`
8. `src/components/survey-import/SimulatedProcessingFileList.tsx`
9. `src/components/survey-import/SimulatedProcessingSummary.tsx`

## 13. División Flash 3.0
1. Tarea 1: Contratos locales y configuración (`simulationTypes.ts`, `simulationConfig.ts`).
2. Tarea 2: Adapter determinístico (`simulatedImportAdapter.ts`).
3. Tarea 3: Reducer y controller (`useSimulatedProcessingState.ts`).
4. Tarea 4: Componentes presentacionales (visuales puros).
5. Tarea 5: Screen U3-SIM (`SimulatedProcessingScreen.tsx`).
6. Tarea 6: Integración U2–U3-SIM (`SurveyImportUploadScreen.tsx`, footer).
7. Tarea 7: QA independiente.

## 14. QA futuro
- Técnico: `npx tsc --noEmit`, `npm run build`, lint en dominio. 0 `any`, `as any`, `@ts-ignore`, `FileReader`, `fetch`, `axios`. 0 imports de xlsx o mocks en hooks/componentes.
- Funcional: CTA deshabilitado/habilitado correctamente. Doble inicio bloqueado. Flujo queued->completed. Cancelación efectiva.
- Visual: Resoluciones (1440/1280/900), disclosure permanente.
- Accesibilidad: Foco, teclado, live region, disabled real.
- Regresión: U1/U2 intactos, remoción limpia.

## 15. Riesgos
1. Doble fuente de navegación (Mitigado por `SurveyImportView`).
2. Timers duplicados (Mitigado por token, timer único, cleanup).
3. Acoplamiento a fixtures (Mitigado por adapter exclusivo).
4. Falsa expectativa (Mitigada por disclosure).
5. Monolito del orquestador (Mitigado por screen y componentes puros).
6. Pérdida accidental (Mitigada separando CANCEL_SIMULATION y CANCEL_IMPORT_FLOW).
7. Scope creep al preview (Mitigado manteniendo handoff diferido).

## 16. Revisión de seguridad
No se encuentran secretos, tokens, URLs autenticadas, PII ni nombres reales en los documentos o logs.

## 17. Inventario incluido
- `docs/U3_SIMULATED_PROCESSING_BUILD_PLAN.md`
- `docs/PROMPT_LOG.md`

## 18. Archivos excluidos
No se modificarán componentes `src/**`, contratos, hooks, package.json, vite, typescript, CI.

## 19. Staging
Se stagearán únicamente `docs/U3_SIMULATED_PROCESSING_BUILD_PLAN.md` y `docs/PROMPT_LOG.md`.

## 20. Commit
`docs(survey-import): approve simulated U3 build plan`

## 21. Push
A `origin/main` de forma regular.

## 22. Estado final
`U3_SIM_BUILD_PLAN_APPROVED`

## 23. Confirmación de integridad
- Cero código alterado.
- Botón Continuar sin habilitar.
- Sin instalación de dependencias.
- Single commit con 2 archivos.

## 24. Autorización o bloqueo para Fase 4D4A
Autorizada **Fase 4D4A · U3-SIM Task 1 — Local Contracts and Simulation Configuration**.
Archivos permitidos para esa fase: `simulationTypes.ts`, `simulationConfig.ts`, documentación. (Prohibido adapter, hook, UI, U2, Continuar).

## 25. Estado
Aprobada.
