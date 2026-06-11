# U3 Parser Dependency and Worker Spike Plan

## 1. Propósito
Definir formalmente la secuencia metodológica, los gates de decisión, la separación estructural y las evidencias necesarias para evaluar e incorporar una dependencia de parsing de hojas de cálculo (.xlsx, .xls) en un Web Worker aislado para la fase "U3 · Procesamiento inicial y profiling" del prototipo de importación asistida por IA de encuestas.

## 2. Contexto
Se encuentran aprobadas y publicadas:
- Fase 4C1 · U3 Parser and Profiling Intake
- Fase 4C1.1 · Intake Documentation Checkpoint
- Fase 4C2A · U3 Parser and Profiling Architecture Lock
- Fase 4C2A.1 · Architecture Documentation Checkpoint

Decisiones vigentes:
- `.xlsx`: `PROVISIONAL_LOCKED_FOR_SPIKE`
- `.xls`: `BLOCKED_PENDING_DEDICATED_SPIKE`
- CSV: `DEFERRED`
- SheetJS CE: `PRIMARY_SPIKE_CANDIDATE`
- ExcelJS: `SECONDARY_SPIKE_CANDIDATE`
- Worker: `LOCKED_PENDING_EXECUTABLE_SPIKE`
- Concurrencia inicial: `1`
- Parsing en Main Thread: `BLOCKED`
- Entrada `File` vs `ArrayBuffer`: `SPIKE_DECISION_REQUIRED`
- ZIP bomb mitigation: abierta y bloqueante
- Presupuesto duro: pendiente
- Sanitización: heurística y pendiente de QA
- `Continuar` en U2: renderizado y deshabilitado
- Construcción de U3: bloqueada

## 3. Estado formal
`READY_FOR_DEPENDENCY_GATE`

## 4. Prerrequisitos
- Rama `main`.
- Hash completo de HEAD validado.
- El hash inicia por `0e1f630`.
- `HEAD === origin/main`.
- Tracking `origin/main`.
- Ahead `0`, Behind `0`.
- Working tree limpio, Staging vacío, Untracked `0`.
- No existe parser instalado.
- No existe Worker de survey-import.
- No existe código U3, contratos de profiling en `src/`, ni fixtures spreadsheet sintéticos.
- `Continuar` deshabilitado.
- U1 y U2 congeladas.

## 5. Dependency gate
Define el inventario obligatorio antes de instalar cualquier parser.

### Identidad
- Nombre exacto del paquete.
- Versión exacta.
- Fuente exacta.
- URL o ubicación de procedencia registrada.
- Fecha de verificación.
- Responsable de aprobación.

### Integridad
- Checksum o mecanismo de integridad disponible.
- Lockfile esperado.
- Ausencia de versión flotante.
- Ausencia de scripts remotos y CDN en runtime.
- Revisión de scripts de instalación y dependencias transitivas.

### Gobernanza
- Licencia y atribución.
- Avisos requeridos.
- Revisión legal y de seguridad completadas.
- Política de actualización y rollback.

### Compatibilidad
- Browser, Vite Worker, TypeScript, CSP, ESM, Bundle.
- Soporte `.xlsx`, manejo de fórmulas, archivos corruptos y cancelación (terminación).

| Categoría | Evidencia requerida | Criterio de aprobación | Criterio de rechazo |
| --------- | ------------------- | ---------------------- | ------------------- |
| Identidad | Nombre y versión en npm/github | Procedencia rastreable y oficial | Fuente no oficial, versión flotante |
| Integridad | SHA u otro hash en lockfile | Checksum constante comprobado | Instalación descarga código dinámico |
| Gobernanza | Licencia identificada | Revisión legal/atribución definida | Licencia copyleft potencialmente incompatible tras revisión |
| Compatibilidad | Test en Worker y Main Thread | Funciona 100% en Worker, build ok | Falla en ESM, CSP, o no compila en Worker |

## 6. Candidatos

### SheetJS CE
**Candidato primario.**
Información por verificar: Versión exacta, fuente oficial, integridad, licencia y atribución, instalación reproducible, compatibilidad ESM/Worker, bundle, dependencias, soporte `.xlsx`, inspección limitada, archivos corruptos, fórmulas, métricas ZIP.

### ExcelJS
**Candidato secundario.**
Condiciones de evaluación: SheetJS rechazado por procedencia, seguridad o bundle; alcance reducido exclusivamente a `.xlsx`; necesidad de alternativa de licencia/API.

### Papa Parse
**Fuera de secuencia.** CSV diferido.

## 7. Secuencia P0–P4

### P0 · Dependency Evidence Review
Sin instalación. Produce recomendación: `DEPENDENCY_SPIKE_APPROVED` o `DEPENDENCY_SPIKE_BLOCKED`. Bloquea P1.

### P1 · Worker Bootstrap and Minimal XLSX Open
Requiere P0. Valida: Worker compila con Vite, parser aislado, `.xlsx` mínimo abrible, devuelve resultado serializable mediante structured clone, TypeScript/build correctos, bundle medido. Sin U3 real. Bloquea P2.

### P2 · Binary Ownership and Cancellation
Requiere P1. Decisión obligatoria:
- **P2A (File)**: Evalúa compatibilidad real, envío vía structured clone, tiempo de envío, lectura dentro del Worker, cancelación mediante terminación, retención de referencias y ausencia de acceso desde el reducer.
- **P2B (ArrayBuffer)**: Evalúa lectura única, transfer list, ownership transferido, estado detached, riesgo de copia previa, momento de liberación, cancelación y fallos pre/post transferencia.

Produce decisión: `FILE_TO_WORKER`, `TRANSFERABLE_ARRAY_BUFFER` o `INSUFFICIENT_EVIDENCE`. Bloquea P3.

### P3 · Profiling Budgets and Sanitization
Requiere P2. Demuestra presupuestos evaluados en casos controlados (hojas, rango, columnas, celdas), sanitización heurística verificada, ignorar fórmulas y hojas ocultas/vacías, terminación experimental.

### P4 · Legacy XLS
Separado y posterior. Solo tras P1-P3 para `.xlsx`. Evalúa apertura, encoding, celdas, fechas, fórmulas, memoria, bundle. No condiciona `.xlsx`.

## 8. Separación spike y producción
- **Harness versionado y aislado**: Ubicación futura dedicada bajo `spikes/survey-import/`. No importado por `src/`. No conectado a rutas. No conectado a U1/U2. Inventariado en cada commit y excluido del build productivo normal.
- `/tmp` solo para experimentos descartables.
- **Código productivo**: Prohibido en esta fase. UI U3 y `Continuar` excluidos.

## 9. Mecanismo de transporte y Protocolo Worker

`Worker.postMessage` utiliza structured clone. El protocolo puede transportar objetos planos de control, arrays, primitivos, `File` (si P2 lo aprueba), o `ArrayBuffer` (con transfer list, si P2 lo aprueba).

### Mensajes de control y resultados
Restringidos a: Objetos planos, uniones discriminadas, campos versionados, payloads serializables y datos sanitizados. Sin clases del parser, funciones, componentes, stack traces o valores crudos.

### Payload binario
Excepción gobernada: Solo un archivo o buffer activo. Nunca retornarlo a la UI. Nunca guardarlo en reducer. Nunca persistirlo. Estado: `P2_SPIKE_DECISION_REQUIRED`.

## 10. Protocolo mínimo
- **Main -> Worker**: `PROFILE_FILE`, `CANCEL_CURRENT_JOB`.
- **Worker -> Main**: `JOB_ACCEPTED`, `PHASE_CHANGED`, `PROFILE_COMPLETED`, `PROFILE_FAILED`, `JOB_CANCELLED`.

Campos comunes: `protocolVersion`, `type`, `jobId`, `fileId`, `batchId` (cuando aplique), Payload discriminado.
Validaciones del spike: Versión/tipo desconocido, IDs incorrectos, payload incompleto, mensajes fuera de orden o para un job cancelado/terminado. Sin crear tipos TypeScript todavía.

## 11. Presupuestos experimentales
Valores provisionales a evaluar en casos sintéticos controlados:
- 10 hojas.
- 100.000 filas declaradas.
- 500 columnas declaradas.
- 10.000 celdas inspeccionadas por hoja.
- 10 muestras por columna (160 caracteres por muestra).
- 15 segundos como presupuesto blando.

Continúan abiertos: Presupuesto duro, presupuesto de memoria observable, expansión ZIP, entradas comprimidas, complejidad, tiempo de terminación. Sin garantías universales.

## 12. Benchmark y Memoria
El benchmark debe diferenciar tamaño del archivo, tamaño del buffer, copias observables, tiempo de transferencia, retención y estado del Worker al terminar. La memoria solo se reporta si el navegador la expone. No se prometen mediciones precisas universales ni garbage collection inmediata.

## 13. Seguridad ZIP
No se construirán ZIP bombs peligrosas ni se intentará agotar la memoria realmente. Casos pequeños y controlados, simulando excesos en el adapter o harness para comprobar detección, terminación y traducción de error.

## 14. Sanitización
Reglas heurísticas verificadas con casos sintéticos. Falsos positivos/negativos documentados. Ningún valor crudo cruza al hilo principal en casos aprobados. Las reglas no constituyen anonimización. Las muestras se limitan y truncan antes del `postMessage`. Casos mínimos: correo, teléfono, ID ficticio, URL, texto largo, fórmula, HTML, Unicode anómalo.

## 15. Cancelación
- Antes de aceptar: no iniciar.
- Durante lectura o inspección: terminar Worker.
- Entre archivos: no iniciar el siguiente.
- Worker no responde: terminar por presupuesto duro experimental.
- Descartar resultados incompletos, eliminar referencias controlables, emitir estado seguro. Sin promesas de garbage collection.

## 16. Fixtures sintéticos
Generación reproducible, datos ficticios, cero datos reales. Los fixtures adversariales serán seguros y controlados.

## 17. Criterios de aprobación
- **Dependency gate**: Versión, fuente, integridad documentados.
- **Worker spike**: Worker compila, parser permanece en el Worker sin fallback, protocolo validado, cancelación/terminación observada, bundle medido, UI responsiva.
- **Parser spike**: `.xlsx` mínimo abre, hojas se enumeran, rango se consulta, inspección permanece limitada, fórmulas no se ejecutan, errores se traducen, resultado es seguro y serializable.
- **Security spike**: Casos sintéticos controlados, presupuestos observados, mensajes inválidos rechazados, sanitización heurística probada, cancelación probada, riesgos residuales documentados.

## 18. Criterios de rechazo
Procedencia no reproducible, integridad insuficiente, licencia incompatible tras revisión, requiere CDN en runtime, no funciona en Worker, parser termina en main bundle, expone objetos del proveedor, cruza valores crudos a UI, evalúa fórmulas, no puede terminarse de forma controlada, no permite inspección acotada, viola CSP, produce errores inseguros, bundle/memoria inviables.

## 19. Rollback
- **Antes de commit**: Restaurar `package.json` y lockfile. Eliminar archivos del spike. Confirmar ausencia de imports y ejecutar build base.
- **Después de commit**: Commit de reversión normal. Sin reescribir historial. Confirmar dependencias eliminadas, lockfile restaurado y U1/U2 intactas. No ejecutar rollback durante esta fase.

## 20. Evidencia requerida
Cada spike debe documentar: Commit base, entorno, navegador, dependencia, versión, fuente, integridad, archivos, fixtures, comandos, build, bundle, tiempo, memoria observable, mensajes, casos funcionales, casos de seguridad, cancelación, errores, riesgos residuales, diff, rollback, recomendación, estado. "Funciona" no es evidencia suficiente.

## 21. Matriz de tareas

| ID | Tarea | Prerrequisito | Archivos futuros permitidos | Evidencia | Criterio de salida |
| -- | ----- | ------------- | --------------------------- | --------- | ------------------ |
| P0.1 | Procedencia | - | `docs/U3_PARSER_SPIKE_EVIDENCE.md` | Matriz de procedencia | `DEPENDENCY_SPIKE_APPROVED` |
| P0.2 | Licencia | P0.1 | `docs/U3_PARSER_SPIKE_EVIDENCE.md` | Revisión legal | Licencia compatible |
| P0.3 | Seguridad | P0.2 | `docs/U3_PARSER_SPIKE_EVIDENCE.md` | Análisis de vulnerabilidades | Sin riesgos bloqueantes |
| P0.4 | Compatibilidad | P0.3 | `docs/U3_PARSER_SPIKE_EVIDENCE.md` | Compatibilidad teórica | Cumple requisitos |
| P0.5 | Recomendación | P0.4 | `docs/U3_PARSER_SPIKE_EVIDENCE.md` | Recomendación del gate | Pase formal a P1 |
| P1.1 | Worker mínimo | P0.5 | `spikes/survey-import/*` | Build exitoso en Worker | Comunicación base |
| P1.2 | Parser en Worker | P1.1 | `spikes/survey-import/*` | Parser carga sin UI | Aisla librería |
| P1.3 | XLSX mínimo | P1.2 | `spikes/survey-import/*` | Abre `.xlsx` | Lectura básica |
| P1.4 | Resultado serializable | P1.3 | `spikes/survey-import/*` | Structured clone | Sin objetos crudos |
| P1.5 | Bundle | P1.4 | `spikes/survey-import/*` | Bundle medido | Reporte Vite |
| P2.1 | File | P1.5 | `spikes/survey-import/*` | Clone de `File` a Worker | Funciona, mide mem/tiempo |
| P2.2 | ArrayBuffer | P1.5 | `spikes/survey-import/*` | Transfer list de Buffer | Funciona, estado detached |
| P2.3 | Cancelación | P2.1/P2.2 | `spikes/survey-import/*` | Terminación probada | GC no garantizada |
| P2.4 | Decisión | P2.3 | `docs/U3_PARSER_SPIKE_EVIDENCE.md` | Comparativa final | Método elegido formal |
| P3.1 | Presupuestos | P2.4 | `spikes/survey-import/*` | Límites experimentales | Límite forzado observado |
| P3.2 | Sanitización | P3.1 | `spikes/survey-import/*` | Heurística validada | Valores enmascarados |
| P3.3 | Protocolo inválido | P3.2 | `spikes/survey-import/*` | Rechazo de IDs falsos | Protocolo robusto |
| P3.4 | Casos hostiles | P3.3 | `spikes/survey-import/*` | Archivo corrupto soportado | Crash controlado |
| P3.5 | Resultado | P3.4 | `docs/U3_PARSER_SPIKE_EVIDENCE.md` | Informe final P3 | Evidencia completa |
| P4.1 | `.xls` | P3.5 | `spikes/survey-import/*` | Lectura de `.xls` legado | Viabilidad evaluada |

## 22. Matriz de decisiones

| Decisión | Alternativas | Evidencia necesaria | Responsable | Estado |
| -------- | ------------ | ------------------- | ----------- | ------ |
| Dependencia parser | SheetJS CE / ExcelJS | Licencia, bundle, worker compat | Plataforma | `READY_FOR_GATE` |
| Integridad dependencia | Tarball / npm oficial | Hash constante, build offline | Seguridad | `READY_FOR_GATE` |
| Entrada al Worker | File clone / Transfer ArrayBuffer | Memoria observable, clon vs transfer | Arquitectura | `P2_SPIKE_DECISION_REQUIRED` |
| Presupuesto experimental | Terminación observada | Latencia de terminación | Rendimiento | `OPEN` |
| Soporte `.xls` | Incluir / Bloquear / Diferir | Overhead memoria/bundle | Producto | `DEFERRED` |

## 23. Matriz de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación del spike | Evidencia requerida | Estado |
| ------ | ------------ | ------- | -------------------- | ------------------- | ------ |
| Bundle excede límite | Alta | Medio | Cargar parser solo en Worker | Reporte de Rollup/Vite build | `OPEN` |
| ZIP bomb / Memoria | Media | Alto | Worker timeout, budget experimental | Fallo controlado sintético | `OPEN` |
| Parser ejecuta scripts/fórmulas | Baja | Alto | Sandbox Worker, omitir flags parser | Archivo con macro ignorado | `OPEN` |
| Exposición PII | Alta | Alto | Sanitización heurística truncada | Salida del worker truncada | `OPEN` |

## 24. Decision gates abiertos
- Dependencia exacta.
- Versión, Procedencia, Integridad, Licencia (sin lenguaje peyorativo).
- Seguridad, Bundle, CSP.
- Estrategia File/ArrayBuffer (`P2_SPIKE_DECISION_REQUIRED`).
- Worker lifecycle, Presupuesto experimental, Memoria observable.
- ZIP bombs (casos controlados).
- Contratos TypeScript, Schemas, Fixtures.
- Harness U3, UI U3, `Continuar`, `.xls`.

## 25. Archivos futuros autorizables
- `docs/U3_PARSER_SPIKE_EVIDENCE.md`
- `spikes/survey-import/*`
- `package.json` (solo con dependencia aprobada, post-gate)
- Lockfile.

## 26. Archivos futuros prohibidos
- Modificaciones a U1 o U2.
- Modificaciones en `src/config/`, `src/types/`, `src/mocks/` reales.
- React components para U3 reales en fase spike.

## 27. Autorización o bloqueo para Fase 4C2C
Autorización explícita para la Fase **4C2C · Parser Dependency Decision Gate**.

## 28. Fecha
2026-06-10

## 29. Commit base
`0e1f630db0e2cabae2d96fcf0395e68f67b517e1`
