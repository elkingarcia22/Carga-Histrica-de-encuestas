# U3 Parser and Profiling Architecture

## 1. Propósito
Definir formalmente la arquitectura de la fase "U3 · Procesamiento inicial y profiling" del prototipo de importación asistida por IA antes de autorizar cualquier dependencia o desarrollo de código ("spike" ejecutable).

## 2. Contexto
Se completaron las fases de diseño inicial (U1) y de selección de archivos (U2). El intake de U3 (`U3_PARSER_PROFILING_INTAKE.md`) quedó en estado `READY_WITH_BLOCKING_DECISION_GATES`. Esta arquitectura bloquea las reglas de interacción, memoria, Worker, adaptador, sanitización, límites y transiciones sin implementar todavía el código funcional. 

## 3. Fuentes
- `docs/U3_PARSER_PROFILING_INTAKE.md`
- `docs/IMPORT_ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/U2_INTERACTION_ARCHITECTURE.md`
- Documentación oficial de navegadores (Workers) y bibliotecas (SheetJS CE, ExcelJS, Papa Parse).

## 4. Estado formal
Estado actual: `APPROVED_WITH_BLOCKING_SPIKE_GATES`.
La arquitectura no garantiza seguridad de memoria por sí sola.

## 5. Decisiones congeladas
- El formato de entrada principal es `.xlsx`.
- La arquitectura delega la inspección binaria a un Web Worker.
- El hilo principal no se utiliza para el parsing productivo.
- Toda sanitización debe realizarse antes de que los resultados crucen hacia la UI.
- No hay reevaluación de fórmulas, carga de macros ni URLs.
- No se instala código productivo en esta fase.

## 6. Formatos
- **.xlsx**: `PROVISIONAL_LOCKED_FOR_SPIKE`. Único formato admitido en la primera arquitectura ejecutable.
- **.xls**: `BLOCKED_PENDING_DEDICATED_SPIKE`. U2 lo permite pero U3 aún no garantiza soporte. Produce resultado seguro de "no soportado temporalmente" (no se lee, no se descarta, no se presenta como corrupto).
- **CSV**: `DEFERRED`. No entra en Worker o contrato inicial.
- **Formatos excluidos**: `.xlsm`, `.xlsb`, `.ods`, `.json`, `.zip`, `.pdf`, URLs externas, Carpetas.

## 7. Candidatos y procedencia
- **SheetJS CE**: `PRIMARY_SPIKE_CANDIDATE`. Versión oficial evaluada: `0.20.3`. Fuente oficial evaluada: tarball de la infraestructura oficial de SheetJS. Paquete público del registro npm: desactualizado en `0.18.5`. Licencia identificada: Apache 2.0. Requiere atribución. No está aprobado para instalación. Requiere dependency gate (deben fijarse: versión, fuente, integridad, licencia, vulnerabilidades, bundle, CSP, plan de actualización). No autorizar CDN en runtime. No se incluye un comando de instalación todavía.
- **ExcelJS**: `SECONDARY_SPIKE_CANDIDATE`. Versión evaluada: `4.4.0`. Licencia identificada: MIT. Alcance documentado principalmente alrededor de XLSX y CSV. No asumir soporte XLS. Dependency gate pendiente.
- **Papa Parse**: `DEFERRED`. No entra en el primer spike U3. No se instala.

## 8. Arquitectura por capas
| Capa | Conoce FileId | Puede acceder a File | Puede ver valores crudos | Puede importar parser |
| ---- | ------------- | -------------------- | ------------------------ | --------------------- |
| **U2 Interaction Layer** | Sí | Sí, como propietaria del boundary actual | No | No |
| **U3 Orchestrator** | Sí | Sí, transitoriamente al File activo mediante frontera controlada. No es propietario de todo el Map. No duplica el lote | No | No |
| **Worker Boundary** | Sí | Puede recibir File o ArrayBuffer según el spike | Sí, transitorios | Sí, a través del adapter |
| **Parser Adapter** | Solo si es necesario para trazabilidad | Entrada binaria todavía no fijada | Sí, dentro del Worker | Sí, conoce el proveedor |
| **Profiling Engine** | No, trabaja sobre abstracción normalizada | No, trabaja sobre abstracción normalizada | Sí, limitados dentro del Worker | No, no importa el proveedor |
| **Sanitizer** | No | No | Sí, recibe únicamente candidatos de muestras | No, devuelve muestras sanitizadas, no conoce UI |
| **Classifier Handoff** | No | No | No | No, recibe evidencia estructural sanitizada |

## 9. Frontera U2–U3
U2 continúa siendo propietaria del `Map<FileId, File>`.
U3 no importa directamente el hook interno de U2 para buscar binarios.
El futuro orquestador requerirá una capacidad controlada equivalente a:
- solicitar el archivo activo por FileId,
- comprobar disponibilidad,
- no enumerar ni duplicar todo el Map.
La forma exacta se decide en la fase de implementación posterior. No mover el Map a Context global sin decision gate. No modificar U2 en esta fase.

## 10. Propiedad del binario
Entrada abstracta: `ParserBinaryInput`.
Estrategias en evaluación:
- **File al Worker**: Menor lectura previa en main. Lectura dentro del Worker. Cancelación mediante terminación. Compatibilidad y copia estructurada por comprobar.
- **ArrayBuffer transferible**: Lectura previa fuera del Worker. Transferencia con ownership. Riesgo de copia antes de transferir. UI no debe retener el buffer. Compatibilidad por comprobar.
Estado: `SPIKE_DECISION_REQUIRED`. No se elige todavía una estrategia final.

## 11. Worker
- Obligatorio para el primer spike integrado. Concurrencia inicial de un archivo.
- El Worker aísla procesamiento del hilo de UI.
- Permite terminar el contexto de ejecución.
- Reduce el impacto de CPU sobre la interfaz.
- El navegador continúa compartiendo recursos y límites de memoria.
- El Worker no elimina el riesgo de agotamiento de memoria.
- Los límites y terminación son mitigaciones, no garantías.
- El riesgo ZIP permanece como gate bloqueante.
Estado: `LOCKED_PENDING_EXECUTABLE_SPIKE`.

## 12. Protocolo de mensajes
Todo mensaje contiene: `protocolVersion`, `jobId`, `batchId` (cuando aplique), `fileId`, `type`, Payload discriminado.
- **Main → Worker**:
  - `PROFILE_FILE`
  - `CANCEL_CURRENT_JOB`
- **Worker → Main**:
  - `JOB_ACCEPTED`
  - `PHASE_CHANGED`
  - `PROFILE_COMPLETED`
  - `PROFILE_FAILED`
  - `JOB_CANCELLED`
No enviar: Stack traces, Workbook, Worksheet, Objetos del parser, Valores crudos, Fórmulas completas, Buffers de retorno, ImportSession completa. (El protocolo sigue siendo conceptual; no crear TypeScript).

## 13. Parser adapter
Su entrada debe ser abstracta y no depender de una librería concreta. Produce una representación interna limitada, nunca: Workbook completo, Worksheet completa, Objeto SheetJS, Objeto ExcelJS, Array de todas las filas, Celdas sin límite.
Responsabilidades:
- Abrir formato autorizado.
- Enumerar hojas.
- Consultar rango declarado.
- Iterar bajo presupuesto.
- Identificar fórmula cuando el proveedor lo permita.
- Obtener valor almacenado cuando exista.
- Traducir errores del proveedor.
- Cerrar referencias internas.
No debe: Sanitizar para UI si esa responsabilidad pertenece al sanitizer, Clasificar raw/agregado, Crear matches, Crear entidades canónicas.

## 14. Profiling engine
Identifica dimensiones, hojas, celdas inspeccionadas, inferencia de tipos por columna, empty ratio, valores distintos, muestras sanitizadas, presencia de fórmulas, candidatos a header y tablas. Responde según los presupuestos preestablecidos. Emite `ProfilingIssue`s. 

## 15. Sanitizer
Sanitización heurística. Aplicada únicamente a muestras candidatas que se conservarán o cruzarán al hilo principal. Los valores crudos pueden existir transitoriamente dentro del Worker durante la inspección. Ningún valor crudo debe emitirse mediante `postMessage`. La sanitización puede producir falsos positivos y falsos negativos. No constituye anonimización. No autoriza persistencia ni envío a IA.
Estado: `PROVISIONAL_HEURISTIC_PENDING_QA`.

## 16. Contrato conceptual
Define estructuras mínimas serializables (ProfileRequest, ProfileFileResult, ProfileSheetResult, ProfileColumnResult, ProfileIssue, ProfileBatchResult). Totalmente agnóstico de `File`, libre de objetos de parser, y exento de valores no sanitizados.

## 17. Presupuestos
**Presupuesto blando**
- Valor provisional: `15 segundos`.
- Acción: Registrar que el proceso es prolongado. Emitir una fase o warning seguro. No terminar automáticamente el Worker. No marcar por sí solo el archivo como corrupto.

**Presupuesto duro**
- Estado: `SPIKE_REQUIRED`.
- Acción futura: Terminar el Worker. Marcar el job como fallido por presupuesto. Descartar resultados incompletos. No iniciar el siguiente archivo hasta estabilizar el orquestador. (No declarar un valor duro todavía).

## 18. Estrategia de inspección
Iterar hojas visibles y vacías -> rango declarado -> truncar a ventana de celdas según presupuesto -> buscar cabeceras -> inferir tipos -> sanitizar muestras -> registrar issues -> devolver resultado. No crear estructuras canónicas de dominio.

## 19. Fórmulas y contenido activo
No ejecutar fórmulas, no evaluar fórmulas, no resolver referencias externas, no ejecutar macros, no abrir enlaces, no renderizar HTML de celdas. Cuando el proveedor entregue un valor almacenado o cacheado: Puede inspeccionarse de forma limitada, No se considera necesariamente actual o confiable, Se sanitiza antes de conservarlo, La fórmula completa no debe cruzar a UI, Puede registrarse `hasFormula`, Puede registrarse conteo aproximado.

## 20. Archivos protegidos
- Cifrado / password: `Blocking`. No solicitar password.
- Formato ilegible/extensión mala: `Blocking` / `Review Required`.
- Hoja/workbook protegido legible: `Review Required`.
- Hoja vacía: `Informational`.

## 21. Estados
Estados internos del flujo (visibles: esperando, inspeccionando, completado, requiere revisión, fallido, cancelado). Un job a la vez.

## 22. Progreso
Basado en fases (e.g. "Inspeccionando estructura", "Archivo 1 de 3"). Sin porcentajes inventados.

## 23. Cancelación
Transiciona a `profiling-cancelling`. Termina el Worker activo. Descarta resultados parciales. El estado del lote vuelve a ser seguro (puede volver a U2 asumiendo la inmutabilidad de los `File` originales).

## 24. Lotes parciales
Una falla de archivo solo permite continuar cuando es: Local al archivo, Recuperable, No indicativa de riesgo de memoria o corrupción sistémica.
Detener el lote cuando exista: OOM o riesgo de memoria, Worker no controlable, Violación del protocolo, Presupuesto de seguridad crítico, Estado interno inconsistente, Falla repetida del parser que sugiera defecto sistémico.
No marcar automáticamente todo error como `partial`.

## 25. Errores
Sin stacktraces expuestos. Clasificados en Safe technical categories para la UI y logs locales.

## 26. Handoff al classifier
El handoff debe entregar únicamente: Evidencia estructural, Hojas, Dimensiones, Tipos inferidos, Headers candidatos, Patrones de tabla, Ratios aproximados, Señales de participantes, Señales agregadas, Issues, Flags de truncamiento, Política de sanitización aplicada. El classifier futuro podrá ser: Determinístico, Heurístico, Asistido por IA posteriormente. U3 no decide el modo final.

## 27. Acción Continuar
El botón existe en U2. Está realmente deshabilitado. No tiene transición funcional a U3.
Solo podrá habilitarse después de: dependency gate, parser spike, Worker spike, contrato, QA, aprobación formal. No modificar U2.

## 28. Dependency gate
Antes de cualquier `npm install`, debe autorizarse: Paquete y versión exactas, fuente oficial o registro verificado (e.g., https://cdn.sheetjs.com o npm explícito con hash), revisión de licencia (Apache 2.0 / MIT) y dependencias, bundle size e impacto en Worker. Se prohíben flotantes.

## 29. Diseño del spike
**P1**: `.xlsx` mínimo en Worker. Parser carga en Worker, devuelve estructura sin corromper memoria, cancelable, bundle medido.
**P2**: Límites. Validación técnica de 10 hojas, 100k filas, timeout y truncado.
**P3**: Seguridad. Corrupto, ZIP bomb (controlado), rango exagerado.
**P4**: `.xls`. Documentar soporte aislado posterior.

## 30. Riesgos
- Dependencia incorrecta / Fuente no confiable (Alta, mitigado con Dependency Gate explícito).
- Bundle excesivo (Alta, mitigado con carga aislada en Worker).
- ZIP Bomb / OOM (Media, mitigado con timeouts duros y terminación de Worker).
- Fórmulas / Enlaces remotos (Baja, parser mitigará ejecución, lectura local únicamente).
- PII sin filtrar cruzando al UI (Alta, mitigado con sanitizador en Worker antes de serialización a `postMessage`).
- `.xls` sin soporte real provocando error catastrófico (Media, bloqueado por ahora).

## 31. Decision gates abiertos
1. Parser exacto, versión y fuente.
2. Licencia y Atribución formal.
3. Seguridad de la dependencia.
4. Estrategia ArrayBuffer vs File.
5. Mediciones de Memoria, Bundle y Presupuestos duros.
6. Capacidad real para expandir ZIP.
7. Soporte para .xls.
8. Interfaces de TypeScript y contratos locales definitivos.
9. UI para U3 y Handoff de UI.
10. Clasificador IA y conexión API.

## 32. Archivos futuros autorizables
Contracts locales, Runtime schemas locales, Adapter, Worker, Orchestrator, Sanitizer, Profiling engine, Fixtures, Harness.

## 33. Archivos futuros prohibidos
Alteraciones a U1, U2, contratos canónicos (Fase 3), configurations globales, shadcn/ui.

## 34. Criterios de aceptación para el spike
No genera UI. Un archivo aislado en Worker se comunica mediante un contrato serializable a main. Termina correctamente. Pasa linters y builds.

## 35. Autorización o bloqueo para Fase 4C2B
**AUTORIZADO PARA FASE 4C2B (Parser Dependency and Worker Spike Plan).**
(NO autorizado para ejecución o instalación de código, sino planificación detallada de la arquitectura técnica real del spike).

## 36. Fecha
2026-06-10

## 37. Commit base
`9d394136e66b26a4b251d806c9aacdb404ebe0c8`
