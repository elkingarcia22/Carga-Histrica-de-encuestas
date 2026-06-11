# U3_SIMULATED_PROCESSING_ARCHITECTURE

## 1. Propósito
Definir y bloquear la arquitectura de la vista de "Procesamiento inicial simulado" (U3-SIM), permitiendo demostrar la experiencia de usuario y las transiciones de estado de la fase de análisis de archivos sin depender de un parser funcional ni lectura real de binarios.

## 2. Contexto
El prototipo de importación asistida por IA ha alcanzado una etapa en la que la carga y validación superficial de archivos (U1 y U2) están implementadas. Sin embargo, el procesamiento profundo (parsing, profiling y clasificación) se encuentra bloqueado por la resolución de la herramienta técnica (SheetJS y Web Workers). Para avanzar en la validación del flujo de usuario, se habilita una vía paralela de simulación (U3-SIM).

## 3. Estado formal
`U3_SIM_ARCHITECTURE_LOCKED`

## 4. Alcance
- Simulación determinística del análisis de archivos seleccionados.
- Transiciones visuales a través de las fases de validación, perfilado, detección y construcción de resultados.
- Uso exclusivo de resultados sintéticos preaprobados (Fixtures M0-M6).
- Implementación de un adapter orquestador para consumir los fixtures.
- Una única pantalla visual que abarque el estado desde el inicio de la simulación hasta su completitud.

## 5. No alcance
- Lectura real o extracción de datos desde los objetos `File`.
- Uso de `FileReader`, `File.arrayBuffer()`, o parsers (SheetJS, ExcelJS).
- Uso de Web Workers.
- Llamadas a APIs externas reales.
- Construcción o navegación hacia el preview histórico simulado (solo conceptual).

## 6. Usuario
El usuario final es el administrador o cliente que realiza el proceso de importación masiva de encuestas, quien necesita retroalimentación clara sobre el estado del procesamiento de su lote de archivos y visibilidad del progreso y errores potenciales.

## 7. Frontera U2–U3-SIM
**Evento conceptual:** `START_SIMULATED_PROCESSING`
Condiciones futuras obligatorias:
- Lote no vacío.
- `batch.isValid === true`.
- Cero estados blocking.
- Cantidad dentro del límite.
- Peso total dentro del límite.
- Binarios requeridos presentes bajo sus IDs.
- Simulación inactiva.
- Ausencia de transición duplicada.

El botón futuro reutiliza `Continuar`, el cual permanece deshabilitado en el código actual (se habilitará solo durante la fase de construcción aprobada). No tendrá modal adicional inicialmente, tendrá un copy visible que explique la simulación y transicionará inmediatamente a `queued`. No habilitar en esta fase.

## 8. Ownership del estado
**Estado:** `LOCKED`

**U2 (`useLocalUploadState`)**:
Responsable de los archivos seleccionados, metadata, validaciones superficiales y el estado del lote. No debe recibir fases de simulación, timers, resultado sintético o microestados U3-SIM.

**U3-SIM (`useSimulatedProcessingState`)**:
Nuevo reducer separado. Responsable del estado de simulación, archivo activo, fase activa, fases completadas, cancelación, finalización y referencia de resultado. No debe recibir el objeto `File`, `Blob`, `ArrayBuffer`, contenido de celda ni el fixture canónico completo. (No crear el hook todavía).

## 9. Ciclo de vida binario
El `Map<FileId, File>` en U2 no se lee, ni clona, ni se transmite al adapter. Su única finalidad es conservar las referencias binarias en caso de que el usuario decida volver a la pantalla anterior. Si el proceso completo es cancelado o finaliza y se abandona el wizard, el Map se limpia.

## 10. Contratos conceptuales
- `SimulatedProcessingStatus`: `idle` | `queued` | `running` | `completed` | `cancelled` | `failed`
- `SimulatedProcessingPhase`: `validating-metadata` | `profiling-structure` | `detecting-survey-type` | `building-historical-result`
- `SimulatedFileProgress`: Omitirá el binario `File`, incluyendo propiedades de UI como `fileId`, `displayName`, `status`, `activePhase`, `issueCount`.
- `SimulatedProcessingResult`: Devolverá identificadores y resúmenes (`scenarioId`, `requiresReview`), sin incluir el fixture completo directamente en el estado central.

## 11. Adapter de simulación
`SimulatedImportAdapter`: Capa conceptual que recibe metadata segura del lote y devuelve un plan de simulación usando escenarios predefinidos y determinísticos. Su objetivo es desacoplar completamente la lógica de selección de fixture de la UI.

## 12. Fixtures
Recorrido predeterminado aprobado:
1. `files-selected-valid` (U2)
2. `aggregated-happy-path` (Dominio)
3. `result-completed` (Resultado)
La UI interactuará solo con las representaciones del adapter, no importará los archivos de fixture de forma directa.

## 13. Política de timers
Estado: `PROVISIONAL_LOCKED_PENDING_VISUAL_QA`
Los valores numéricos actuales son ejemplos ilustrativos sujetos a QA visual y no decisiones definitivas:
- Cola: 400–700 ms.
- Validación: 600–900 ms.
- Perfilado: 900–1300 ms.
- Detección: 700–1000 ms.
- Construcción: 800–1200 ms.

Reglas congeladas:
- Los tiempos vivirán en configuración central.
- No vivirán dentro de componentes.
- Los componentes no llamarán `setTimeout`.
- El controller o hook futuro administrará la secuencia.
- Solo existirá un timer activo.
- Cancelar limpiará el timer.
- Unmount limpiará el timer.
- Strict Mode no duplicará la ejecución.
- No se mostrarán porcentajes inventados.
- El progreso se expresará mediante fases discretas.

## 14. Máquina de estados
Transiciones principales:
- `idle` → `queued` → `running` → `completed`
Transiciones de salida/error:
- `queued` → `cancelled`
- `running` → `cancelled` / `failed`
Reglas: Cancelación limpia, un timer activo a la vez, no mutar fixture canónico, no se pueden saltar fases para llegar a `completed`.

## 15. Arquitectura de componentes
- Orquestador: Componente U3-SIM específico extraído de `SurveyImportUploadScreen`.
- Componentes puros propuestos: `SimulatedProcessingPanel`, `SimulatedProcessingPhaseList`, `SimulatedProcessingSummary`.

## 16. Alcance visual
Una única vista estructurada:
- **Header**: Título, descripción y **badge visible indicando "Simulación de prototipo"**.
- **Stepper**: Las cuatro macroetapas oficiales se mantienen intactas:
  1. **Cargar**: Permanece Activa.
  2. **Configurar**: Permanece Pendiente.
  3. **Revisar**: Permanece Pendiente.
  4. **Importar**: Permanece Pendiente.
  *Las fases internas (validar metadata, perfilar estructura, detectar tipo, construir resultado) son subfases visuales exclusivas de U3-SIM y no alteran la arquitectura del stepper oficial ni crean una quinta macroetapa. No se debe renombrar Configurar como Procesar.*
- **Panel Principal**: Archivos, progreso por fases discretas, issues.
- **Footer**: Cancelar, Volver, Continuar (deshabilitado en código actual, posteriormente apuntará a preview simulado).

## 17. Accesibilidad
- Uso de `aria-live="polite"` para los cambios de fase, evitando anuncios ruidosos por micro-timers.
- Foco automático al ingresar y finalizar.
- Anuncio claro de cancelación.
- Botones bloqueados visual y funcionalmente cuando sea necesario.

## 18. Seguridad
Total aislamiento de datos reales.
- Cero lectura binaria.
- Cero persistencia.
- Cero uso de APIs. No existe fetch, axios, backend, IA conectada ni parser. Todo "fallo" debe presentarse como un "fallo simulado de procesamiento" o "interrupción controlada de simulación".
- Transparencia total de que es una simulación visual.

## 19. Handoff
Estado: `DEFERRED_TO_SEPARATE_SCREEN_INTAKE`
El resultado final entregará la base conceptual (`scenarioId`, `mode`, `status`, `surveyCount`, `periodCount`, `requiresReview`, `issueCount`, `capabilitySummary`) apuntando hacia la vista futura conceptual `historical-preview-simulated` pero sin construirla. No transportará fixture completo, objetos `File`, binarios, workbook, valores reales ni respuestas individuales.

## 20. Matriz de decisiones

| Decisión | Opciones | Recomendación | Justificación | Estado |
| -------- | -------- | ------------- | ------------- | ------ |
| Ownership del estado | Hook U2, Nuevo Reducer, Context | Nuevo Reducer local (`useSimulatedProcessingState`) | Evita contaminar U2 y facilita el posterior intercambio con el estado de procesamiento real. | `LOCKED` |
| Arquitectura UI | Modificar U2 Screen, Componente U3-SIM | Componente U3-SIM independiente orquestado internamente | Previene monolitos en el Screen principal y permite montar/desmontar limpieza limpiamente. | `LOCKED` |
| Orquestación Simulación | setTimeout UI, Adapter Async, Effect+Reducer | Reducer + Effect con token | Determinismo en React Strict Mode y fácil cancelación/cleanup. | `LOCKED` |
| Ciclo de vida Binario | Leer, Descartar, Mantener aislado | Mantener aislado en `Map<FileId, File>` | Permite regresar a U2 sin volver a seleccionar archivos, sin exponer contenido a la simulación. | `LOCKED` |
| Disclosure | Oculto, Modal, Badge | Badge visible permanente | Transparencia con el usuario de que el prototipo es sintético en esta etapa. | `LOCKED` |

## 21. Casos de QA
**Inicio:**
- Lote válido.
- Lote inválido.
- Doble clic.
- Simulación ya activa.

**Secuencia:**
- Fases en orden.
- Un archivo activo.
- Un timer activo.
- Resultado determinístico.

**Cancelación:**
Se definen dos acciones separadas:
1. `CANCEL_SIMULATION`: Ocurre en `queued` o `running`. Detiene timers, limpia el estado de U3-SIM, conserva metadata de U2 y su `Map<FileId, File>`, y vuelve a U2 sin obligar a reseleccionar archivos. Es idempotente.
2. `CANCEL_IMPORT_FLOW`: Detiene timers, limpia el reducer U3-SIM, limpia el reducer U2, vacía el `Map<FileId, File>`, elimina resultados sintéticos y vuelve a U1. Es idempotente.
*Nota: Volver a U2 no equivale a cancelar todo el flujo. Finalizar la simulación no limpia automáticamente el lote.*
Casos a probar: cancelar en `queued`, cancelar en cada fase, cancelar dos veces, volver a U2, cancelar flujo completo.

**Ciclo de vida:**
- Unmount.
- Strict Mode.
- Cleanup.
- Reinicio.
- Resultado previo.

**Integridad:**
- Fixture no mutado.
- Componentes sin fixture imports.
- Adapter sin binarios.
- Reducer sin `File`.
- Cero lectura binaria.
- Cero red (ej. manejar 'fallo simulado de procesamiento', sin hacer llamados reales).

**Accesibilidad:**
- Live region.
- Foco inicial.
- Foco al completar.
- Estados por texto.
- Botones disabled.
- Disclosure permanente.

**Regresión:**
- U1.
- U2.
- Duplicados D1–D4.
- Límites de archivo.
- Límite de lote.
- Retorno a U2.
- Limpieza total.
- 1440 × 900; 1280 × 800; 900 × 800.

## 22. Riesgos
- Que el usuario interprete el progreso sintético como validación real de sus archivos. Mitigado mediante etiquetas visibles claras.
- Fugas de memoria si los timers no tienen cleanups robustos.

## 23. Archivos futuros autorizables
- `src/screens/survey-import/SurveyImportUploadScreen.tsx`
- Vistas/componentes en `src/screens/survey-import/` y `src/components/survey-import/`
- `src/hooks/survey-import/useSimulatedProcessingState.ts`
- `src/config/survey-import/simulationConfig.ts`
- `src/lib/survey-import/simulation/**`

## 24. Archivos futuros prohibidos
- Modificar componentes de UI genéricos (`src/components/ui/**`, `src/components/upload/**`).
- Cambios en los schemas y fixtures canónicos de datos reales (`src/types/`, `src/mocks/`, `src/lib/survey-import/schemas/`).
- `package.json`, `package-lock.json`, configuraciones de Vite o TS.

## 25. Decision gates abiertos
- Autorización para pasar a la Fase de Codificación (UI build) de U3-SIM.

## 26. Autorización o bloqueo para construcción
**Estado actual:** Fase Documental finalizada y aprobada.
**Acción:** Autorizada la transición a la fase documental de arquitectura. Queda **bloqueada** la construcción de la interfaz y la lógica hasta autorización explícita posterior a esta fase.

## 27. Fecha
2026-06-11
