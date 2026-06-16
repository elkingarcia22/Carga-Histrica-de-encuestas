# Historical Import Configuration Architecture

## 1. Contexto
La Fase 4F-R2 define la arquitectura conceptual y técnica de la pantalla de "Configurar encuesta histórica". Esta fase es puramente documental, sin crear componentes, UI, tipos, o modificar el código fuente actual, garantizando que el diseño técnico cumpla con el Intake aprobado antes de la construcción.

## 2. Estado de entrada
El flujo actual (`main`) se encuentra cerrado tras la fase de "Vista previa de normalización" (U4-SIM). No hay cambios en `src/**`. La base está lista para recibir el bloqueo arquitectónico.

## 3. Objetivo arquitectónico
Definir y bloquear la arquitectura de la pantalla `Configurar encuesta histórica` que transforma la metadata de U4-SIM en un borrador de configuración en memoria, manejando su estado, validaciones y boundaries hacia la futura pantalla de Mapeo, manteniendo aislamiento de la lógica analítica.

## 4. Principios
- **Aislamiento B2B:** Sin analíticas, sin favorabilidad, solo configuración de carga.
- **Eficiencia de memoria:** Cero manipulación de binarios o PII.
- **Determinismo:** Basado en estado simulado para QA predictivo.
- **Reutilización:** Uso intensivo del `ImportWizardShell` y componentes base existentes.

## 5. Inventario del flujo actual
- El orquestador es `SurveyImportUploadScreen.tsx`.
- Maneja un estado local `useLocalUploadState` para archivos y vistas.
- `ImportWizardShell`, `Header`, `Steps`, y `Footer` son reutilizables y estables.
- U4-SIM (`NormalizationPreviewScreen`) actualmente se muestra condicionalmente.
- Metadata de archivos en memoria sin persistir entre recargas.

## 6. Ownership de pantalla
- **Pantalla conceptual:** `HistoricalImportConfigurationScreen` (dentro de `survey-import`).
- **Props:** Recibirá funciones de navegación (`onCancelImportFlow`, `onBackToPreview`, `onContinueToMapping`).
- **Dependencia:** Dependerá de un borrador local iniciado por los datos de U4-SIM.
- **Responsabilidad:** Gestionar el formulario de configuración, no ejecuta peticiones de red reales.

## 7. Boundary U4-SIM → Configuración
- **Opción seleccionada:** **Opción A** (Identificador `scenarioId`/`batchId` que consulta un adapter determinístico).
- **Justificación:** Mantiene bajo acoplamiento y evita enviar objetos gigantes por props, coherente con el patrón ya usado en U4-SIM. No se pasan `File` o `Blob`.

## 8. Modelo conceptual del borrador
- `HistoricalImportConfigurationDraft`:
  - *Heredados:* `sourceBatchId`, `sourceScenarioId`, `inheritedIssueIds`.
  - *Sugeridos/Editables:* `surveyName`, `surveyType`, `periodYear`.
  - *Derivados/Confirmables:* `surveyTypeConfirmation`, `identifiedModeConfirmation`.
  - *Seleccionables:* `privacyMode`, `minimumThreshold`, `visibilityMode`.
  - *Estado:* `draftStatus`, `canContinueToMapping`.

## 9. Estrategia de estado
- **Opción seleccionada:** **Opción B** (`Hook local del dominio: useHistoricalImportConfigurationState`).
- **Justificación:** Encapsula la lógica compleja del formulario, validaciones cruzadas (privacidad vs umbral) y derivaciones sin contaminar globalmente la app ni la pantalla visual.

## 10. Preservación temporal
- El borrador se mantendrá en memoria levantado al nivel del orquestador (`SurveyImportUploadScreen`) o en un contexto local si se navega entre U4-SIM y Configuración, permitiendo volver atrás sin perder los datos editados.
- Se reinicia si se cancela la importación. No sobrevive a `refresh`.

## 11. Reglas de validación
- **Nombre:** Obligatorio.
- **Tipo:** Obligatorio, exige confirmación si la IA sugerida es ambigua.
- **Periodo:** Obligatorio, coherente.
- **Privacidad:** Obligatoria.
- **Umbral:** Rango 3–10 (default 5). Obligatorio si Privacidad es `Confidencial`.
- **Derivación:** `canContinueToMapping` solo será `true` si no hay incidencias bloqueantes y todo lo requerido es válido.

## 12. Incidencias heredadas
- **Blocking before configuration:** Mezcla de periodos, falta de fuente (se atajan en U4-SIM).
- **Confirmation allowed in configuration:** Nombres ambiguos o tipos no seguros (se resuelven en esta pantalla).
- **Deferred to Review & Mapping:** Errores de escala o demográficos (se muestran como informativos, no bloquean este paso).

## 13. Boundary Configuración → Review & Mapping
- **Opción seleccionada:** **Opción A** (`configurationDraftId` + adapter mock).
- **Justificación:** Replicar el patrón escalable donde la siguiente pantalla consulta los detalles desde el id del escenario/borrador, facilitando la creación de fixtures mock para Review & Mapping.

## 14. Stepper
- Configuración corresponde al **Paso 2: Configurar importación**.
- Paso 1 (Cargar archivos) queda completado.
- Paso 3 será Review & Mapping.
- Paso 4 confirmación. (Se ajustarán los labels del componente existente).

## 15. Arquitectura visual
- Drawer full-screen existente.
- Flujo vertical (desktop-first adaptativo) con secciones:
  1. Disclosure de simulación.
  2. Resumen heredado.
  3. Identidad (Nombre, Tipo).
  4. Periodo.
  5. Privacidad y Umbral.
  6. Visibilidad.
  7. Incidencias heredadas.
- Footer persistente.

## 16. Componentización
- `HistoricalConfigurationDisclosure` (Stateless)
- `SurveyIdentitySection` (Maneja inputs de nombre y tipo)
- `HistoricalPeriodSection` (Selector de año)
- `PrivacyAndThresholdSection` (RadioGroup y validación cruzada)
- `VisibilitySelectionSection`
- `InheritedIssuesSection` (Resumen informativo)

## 17. Componentes reutilizables
- **CONFIRMED_REUSABLE:** `ImportWizardShell`, `ImportWizardHeader`, `ImportWizardSteps`, `ImportWizardFooter`, `Select`, `Input`, `Cards`, `Alerts`, `RadioGroup`.
- **REQUIRES_DECISION_GATE:** Selectores complejos de rangos de fechas (se difieren por ahora a un año estático).

## 18. Periodo
- **Opción seleccionada:** **Opción A** (Selector de año como control principal para la V1 del prototipo, priorizando `Clima 2026`). Las extensiones (Mes/Rango) quedan modeladas pero visualmente diferidas para no sobrecargar el MVP.

## 19. Privacidad y umbral
- Anónima: Umbral desactivado/no aplica.
- Confidencial: Umbral requerido (default 5, rango 3-10).
- Identificada: Umbral no aplica, requiere confirmación explícita (alerta visual).

## 20. Visibilidad
- Patrón de selección basado en RadioGroup (o `Visual Selection` si está disponible) con dos opciones fijas: Solo administradores vs Administradores y consultores.

## 21. IA simulada
- **IN_SCOPE_SIMULATED:** Sugerir nombre, tipo y periodo. Explicar confirmaciones.
- **DEFERRED_AFTER_REAL_PARSING:** Resumen detallado generativo de incidencias.

## 22. Escenarios mock futuros
1. `ready-for-mapping`
2. `incomplete-name`
3. `ambiguous-survey-type`
4. `missing-period`
5. `privacy-confirmation-required`
6. `invalid-threshold`
7. `inherited-blocking-issue`
8. `simulated-error`

## 23. Capas técnicas
- Types: Definición de interfaces para el borrador.
- Config/Mocks/Adapter: Base de simulación.
- Hook: `useHistoricalImportConfigurationState`.
- Components: Bloques UI puros.
- Screen: `HistoricalImportConfigurationScreen`.

## 24. Estructura futura de archivos
- `src/lib/survey-import/configuration/configurationTypes.ts`
- `src/config/survey-import/historicalImportConfigurationConfig.ts`
- `src/mocks/survey-import/configuration/configurationScenarios.ts`
- `src/hooks/survey-import/useHistoricalImportConfigurationState.ts`
- `src/components/survey-import/configuration/*`
- `src/screens/survey-import/HistoricalImportConfigurationScreen.tsx`

## 25. Integración sin ruta
- Decisión cerrada: `NO_NEW_ROUTE`.
- Se integrará como un estado condicional en `SurveyImportUploadScreen.tsx` (view = `configuration`).

## 26. Accesibilidad
- Soporte para focus states en formularios.
- Etiquetas `aria` en selectores.
- Mensajes de validación vinculados con `aria-describedby` a los inputs.

## 27. Riesgos
- **Pérdida de estado al volver:** Mitigación: Elevar el estado del borrador o usar cache de React si el componente se desmonta (Responsabilidad: Hook local).
- **Validación duplicada en JSX:** Mitigación: Centralizar en una función pura `validateConfigurationDraft()`.
- **UI Sobrecargada:** Mitigación: Separación en secciones colapsables o espaciado generoso.

## 28. Decision gates cerrados
- Ownership.
- Boundaries de entrada y salida (vía IDs y adapters mock).
- Estado local (Hook de dominio).
- Preservación temporal.
- Reglas de privacidad/umbral.
- Periodo (Año como pivot inicial).
- Stepper.
- Integración sin ruta.

## 29. Decision gates pendientes
- Ninguno crítico que bloquee el inicio del Mock Data Contract. (El diseño interno del Review & Mapping queda para su propia fase).

## 30. Áreas prohibidas
- Modificar `src/`.
- Crear código funcional o mocks reales en esta fase.

## 31. QA
El repositorio fue evaluado y no tiene fugas de PII, archivos binarios ni analíticas no autorizadas (favorabilidad, tendencias).

## 32. Estado final
`HISTORICAL_IMPORT_CONFIGURATION_ARCHITECTURE_LOCKED`

## 33. Siguiente fase máxima autorizable
`Fase 4F-R3 · Historical Import Configuration Mock Data Contract`
