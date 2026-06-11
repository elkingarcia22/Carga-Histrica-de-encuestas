# U3 Parser and Profiling Intake

## 1. Propósito
Definir y documentar las decisiones arquitectónicas, de seguridad, técnicas y de experiencia de usuario requeridas antes de construir la fase "U3 · Procesamiento inicial y profiling" del prototipo de importación asistida por IA.

## 2. Contexto
El prototipo actual (U1 y U2) ha establecido el marco de interacción para la selección de archivos locales (hasta 5 archivos, máximo 50 MB en total). Actualmente, U2 permite seleccionar archivos `.xlsx` y `.xls`, validando únicamente la metadata (tamaño y tipo MIME) de manera efímera. La siguiente fase (U3) debe profundizar en la estructura de estos archivos para identificar hojas, columnas, y tipos de datos, sin persistir ni procesar los datos de manera definitiva.

## 3. Usuario
* Administrador UBITS.
* Consultor de implementación.
* Consultor de experiencia o analítica.

## 4. Objetivo de U3
El objetivo de U3 es inspeccionar el contenido de los archivos seleccionados para validar su estructura, extraer muestras sanitizadas, e identificar parámetros clave (como filas de encabezado y distribuciones de tipos) que permitan decidir si los archivos son viables para la fase de clasificación (U4), de forma segura, efímera y sin comprometer el rendimiento del navegador.

## 5. Estado de entrada
* Lote de hasta 5 archivos válidos en cuanto a tamaño y tipo MIME.
* Estado efímero de archivos (`Map<FileId, File>`).
* Componentes de U2 (stepper, cards) mostrando los archivos seleccionados pero sin la opción "Continuar" habilitada.

## 6. Estado de salida
* Resultado del profiling por archivo (dimensiones, hojas, muestras sanitizadas).
* Lista consolidada de errores (blocking, review required, informational).
* Transición habilitada hacia U4 si el profiling es exitoso, o UI de error con acciones claras si falla.

## 7. Inventario técnico

| Capacidad | Evidencia encontrada | Estado | Reutilizable | Decision gate |
| --------- | -------------------- | ------ | ------------ | ------------- |
| `xlsx` (SheetJS) | No instalada en `package.json` | Ausente | No | Requerida |
| ExcelJS | No instalada en `package.json` | Ausente | No | Requerida |
| Papa Parse | No instalada en `package.json` | Ausente | No | Diferida |
| Comlink | No instalada en `package.json` | Ausente | No | Opcional |
| Librerías Web Worker | Funciones nativas del navegador y Vite support | Presente (Nativo) | Sí | Requerida |
| Utilidades ZIP | No instaladas (internas de parsers Excel) | Ausente | No | N/A |
| Vitest/Jest | No configurado explícitamente en package.json actual | Ausente | No | Opcional |

## 8. Formatos

| Formato | Seleccionable en U2 | Parseable en U3 | Productivo confirmado | Recomendación | Estado |
| ------- | ------------------: | --------------: | --------------------: | ------------- | ------ |
| `.xlsx` | Sí | Sí | Sí | Formato objetivo inicial de U3. Soporte técnico condicionado a parser y spike. | `PROVISIONAL_LOCKED` |
| `.xls` | Sí | No | No | No elegible para iniciar profiling hasta comprobar parser, encoding y memoria. Producirá un bloqueo controlado si U3 se habilita antes de esa comprobación. | `BLOCKED_PENDING_PARSER_SPIKE` |
| `.csv` | No | No | Sí | No entra en la primera versión de U3. Diferir para post-prototipo | `DEFERRED` |

**Formatos Excluidos:**
Mantener fuera del alcance inicial: `.xlsm`, `.ods`, `.json`, `.zip`, `.pdf`, URLs de Google Sheets, Carpetas.
Nota: La exclusión de `.xlsm` es una decisión de alcance y seguridad, no una afirmación de que el parser sea incapaz de leerlo.

## 9. Comparación de parsers

| Candidato | Formatos | Navegador | Lectura | Escritura | Bundle | Licencia | Riesgos | Recomendación |
| --------- | -------- | --------- | ------- | --------- | ------ | -------- | ------- | ------------- |
| `xlsx` (SheetJS) | `.xlsx`, `.xls`, `.csv` | Sí | Sí | Sí | Alto | Apache 2.0 (Community) | Limitaciones en edición community, tamaño | Candidato técnico principal |
| ExcelJS | `.xlsx`, `.csv` | Sí | Sí | Sí | Muy Alto | MIT | No soporta `.xls`, alto consumo de memoria | Candidato secundario |
| Papa Parse | `.csv` | Sí | Sí | No | Bajo | MIT | Solo CSV | Diferido |

## 10. Licencias y gobernanza
* **`xlsx` (SheetJS Community Edition)**: Licencia Apache 2.0 verificada. Atribución y open-source disclosure requeridos. Capacidad documental para `.xlsx` y formatos `.xls`. Candidato técnico principal. No aprobado todavía para instalación. Requiere revisión de seguridad, legal, procedencia y bundle. La versión y fuente de distribución deberán fijarse explícitamente. No se permitirá instalar de forma genérica una versión desactualizada del registro público. Clasificación: `CANDIDATE_REQUIRES_DEPENDENCY_GATE`.
* **ExcelJS**: Licencia MIT verificada. Capacidades oficiales centradas en XLSX y CSV. No asumir soporte `.xls`. Candidato secundario si el alcance se limita a `.xlsx`. Requiere benchmark de navegador, memoria y bundle. Clasificación: `CANDIDATE_REQUIRES_DEPENDENCY_GATE`.
* **Papa Parse**: Diferido para CSV. Sin instalación. Fuera de la primera arquitectura ejecutable de U3. Licencia MIT identificada, revisión pendiente. Clasificación: `DEFERRED_CSV_GATE`.

## 11. Estrategia de ejecución
Recomendación: **Worker desde el primer spike ejecutable del parser**.
* Main Thread permitido únicamente para micropruebas técnicas fuera del flujo U3.
* Ningún parser productivo o demostrable debe ejecutarse en el hilo principal con el límite actual de 25 MB.
* No se requiere Comlink inicialmente.
* Utilizar soporte nativo de Worker de Vite si el spike lo valida.
* Procesamiento secuencial: un archivo activo a la vez.
* Concurrencia inicial: `1`.
Estado: `PROVISIONAL_LOCKED_PENDING_SPIKE`

## 12. Lectura binaria y memoria
* **API preferida**: `File.arrayBuffer()`. La futura capa de procesamiento podrá leer una vez mediante `File.arrayBuffer()`.
* El buffer deberá transferirse al Worker cuando sea técnicamente viable.
* Después de transferirlo o cancelar:
  * eliminar referencias,
  * cerrar el Worker cuando corresponda,
  * descartar resultados parciales,
  * limpiar el estado local.
* No se puede forzar garbage collection.
* No prometer liberación instantánea de memoria.
* Evitar múltiples copias del mismo buffer.
* El reducer visual nunca recibe `ArrayBuffer`.

## 13. Seguridad

El límite comprimido de U2 no basta para mitigar ZIP bombs. `.xlsx` utiliza una estructura comprimida. La arquitectura futura requiere límites de: tamaño comprimido, tamaño expandido estimado, cantidad de entradas, hojas, rango declarado, celdas inspeccionadas, caracteres, tiempo y memoria. Si la librería no expone métricas suficientes antes de expandir, el riesgo debe permanecer abierto. Un timeout por sí solo no garantiza recuperación en Main Thread. El Worker debe poder terminarse ante exceso de presupuesto.
Estado del riesgo de ZIP Bomb: `BLOCKING_SECURITY_GATE`

| Riesgo | Detectable antes de parser | Detectable durante parser | Acción | Severidad |
| ------ | -------------------------: | ------------------------: | ------ | --------- |
| ZIP bomb | Por límite de tamaño en U2 (parcial) | Error de memoria/tiempo (en Worker) | Terminar Worker / Bloquear archivo | Alta |
| Fórmulas maliciosas | No | Detección de nodos de fórmula | Ignorar/Warning | Media |
| Macros (`.xlsm`) | Por extensión | Por firma interna | Bloquear archivo | Alta |
| Archivo cifrado | No | Error de desencriptado | Bloquear archivo | Alta |
| Corrupción | No | Error de formato | Bloquear archivo | Media |

## 14. Fórmulas y macros
* Las macros no se ejecutarán. Los archivos `.xlsm` están fuera del alcance inicial. La detección de macros depende de las capacidades verificadas del parser.
* Las fórmulas no se evaluarán ni se ejecutarán. No abrir enlaces externos. No resolver referencias externas. Los valores precalculados solo podrán usarse si el parser los entrega separadamente. La presencia de fórmulas debe registrarse como metadata estructural o warning. No almacenar expresiones completas en logs. No afirmar que un valor precalculado es necesariamente confiable. La detección de fórmulas depende de las capacidades verificadas del parser.

## 15. Archivos protegidos
* Workbook cifrado o con contraseña: `blocking`. No solicitar contraseñas.
* Formato corrupto o ilegible: `blocking`.
* Protección de hoja: `review-required` si la estructura puede leerse.
* Protección de workbook: `review-required` o `blocking` según capacidad real.
* Formato no reconocido: `blocking`.
No afirmar detección anticipada si depende del parser.

## 16. Límites provisionales (`PROVISIONAL_LOCKED_PENDING_BENCHMARK`)
* Máximo de hojas por archivo: `10`.
* Máximo de rango declarado por hoja: `100.000 filas` (Metadata reportada por el workbook).
* Máximo de columnas declaradas por hoja: definir provisionalmente y justificar.
* Máximo de celdas realmente inspeccionadas por hoja: `10.000` (Contenido que realmente se recorre para profiling).
* Máximo de muestras conservadas por columna: `10`.
* Máximo de caracteres por muestra: definir provisionalmente.
* Presupuesto blando de procesamiento: `15 segundos`.
* Presupuesto duro: pendiente del Worker spike.
* Máximo de memoria: pendiente de benchmark.
Estos límites son provisionales y no deben presentarse como productivos.

## 17. Alcance del profiling
U3 producirá un perfilamiento estructural (hojas, dimensiones, tipos de columnas, filas vacías) y extraerá muestras sanitizadas para las columnas identificadas. No se generará aún un payload final UBITS ni participantes canónicos.

## 18. Sanitización
Estado: `PROVISIONAL_HEURISTIC`
* Enmascaramiento heurístico. No garantiza detección completa de PII. (No usar expresiones como "supresión garantizada de PII" o "anonimización completa").
* Correos, teléfonos e identificadores aparentes deben enmascararse.
* Muestras truncadas.
* No enviar muestras a consola, telemetría o APIs.
* No persistir datos originales.
* Preferir estadísticas y tipos inferidos sobre muestras.
* La UI futura debe minimizar la exposición de valores.
* Los tests usarán datos sintéticos.

## 19. Contrato conceptual
El contrato sigue siendo conceptual y no implementado. No debe crearse en `src/types` hasta Fase 4C2 o una subfase autorizada. No contiene `File` ni `ArrayBuffer`. Debe ser serializable. Las muestras deben estar sanitizadas. El resultado se relaciona mediante `FileId`.
* `ProfilingRequest`: `{ fileId, fileRef }`
* `ProfilingFileResult`: `{ fileId, status, error?, sheets: ProfilingSheetResult[] }`
* `ProfilingSheetResult`: `{ name, estimatedRows, estimatedCols, formulasPresent, columns: ProfilingColumnResult[] }`
* `ProfilingColumnResult`: `{ index, inferredName, inferredType, emptyPercentage, samples: string[] }`
* `ProfilingIssue`: Representa un error o warning durante el profiling.
* `ProfilingProgress`: Progreso por fases y archivos.
* `ProfilingBatchResult`: Estado general del lote de archivos.

## 20. Estados y progreso
Progreso por fases y archivos. Sin porcentaje exacto hasta que exista evidencia técnica. Un archivo activo a la vez. No usar porcentajes inventados. No simular progreso con timers.
Estados visibles: esperando, leyendo, inspeccionando, completado, fallido, cancelado.
El estado global del lote depende de los estados individuales. Si un archivo falla pero los otros pasan, se permite la revisión de los archivos válidos y descartar el fallido.

## 21. Cancelación
Cancelación cooperativa. La cancelación solo aplica antes de `commit-start`.
* Evitar iniciar el siguiente archivo.
* Terminar el Worker activo.
* Descartar resultados parciales no aprobados.
* Eliminar referencias locales.
* Transicionar a `profiling-cancelled`.
* No prometer rollback productivo.
* No forzar garbage collection.

## 22. Errores
* **Blocking**: Falla al leer, archivo cifrado, límite crítico excedido, formato no reconocido.
* **Review Required**: Varias tablas en una hoja, formatos mixtos, filas de encabezado ambiguas.
* **Informational**: Hojas vacías ignoradas, columnas con más del 90% de celdas vacías.

## 23. Lotes multiarchivo
El prototipo ejecutará el profiling secuencialmente (uno a uno) para limitar el consumo de memoria. Si un archivo falla, continuará con el siguiente, pero reportará el estado final del lote como parcial.

## 24. Relación con clasificación
U3 proveerá a la futura fase U4 la estructura (dimensiones, columnas, hojas y muestras). La U4 utilizará esto para decidir si es un perfil "raw" o "agregado".

## 25. Acción Continuar
`Continuar` deshabilitado en U2. No modificar U2 en esta fase.
Su habilitación requiere: parser elegido, dependencia aprobada, arquitectura U3 aprobada, Worker spike aprobado, contrato de profiling definido, lote U2 preliminarmente válido.
El clic futuro deberá cambiar a U3 antes de iniciar lectura, permitiendo al usuario comprender y cancelar el proceso.

## 26. UX conceptual
Se mostrará un skeleton o lista de archivos con indicadores de progreso visuales a medida que avanza el profiling de cada uno. Se presentarán alertas claras en caso de errores blocking o warnings.

## 27. IA
La Inteligencia Artificial está fuera del alcance de la lectura binaria y parsing. Podría evaluarse en fases futuras para asistir en la inferencia de la fila de encabezados si no es la primera, o para detectar mapeo semántico de columnas.

## 28. Fixtures sintéticos futuros
Deben generarse en una fase separada después de elegir parser. No crear archivos sintéticos ahora.
Se requerirán:
* `.xlsx` mínimo válido.
* Varias hojas.
* Hoja vacía.
* Hoja oculta.
* Fórmulas.
* Headers ambiguos.
* Dos tablas.
* Rango declarado excesivo.
* Archivo corrupto.
* Archivo protegido.
* Extensión falsa.
* Lote mixto.
* Estructura raw.
* Estructura agregada.
* `.xls` solo si el spike autoriza ese formato.

## 29. Matriz de decisiones

| Decisión                     | Estado requerido                       |
| ---------------------------- | -------------------------------------- |
| `.xlsx` objetivo             | `PROVISIONAL_LOCKED`                   |
| `.xls`                       | `BLOCKED_PENDING_PARSER_SPIKE`         |
| CSV                          | `DEFERRED`                             |
| SheetJS CE                   | `CANDIDATE_REQUIRES_DEPENDENCY_GATE`   |
| ExcelJS                      | `CANDIDATE_REQUIRES_DEPENDENCY_GATE`   |
| Papa Parse                   | `DEFERRED_CSV_GATE`                    |
| Worker                       | `PROVISIONAL_LOCKED_PENDING_SPIKE`     |
| Main Thread productivo       | `BLOCKED`                              |
| Lectura mediante ArrayBuffer | `PROVISIONAL`                          |
| ZIP bomb mitigation          | `BLOCKING_SECURITY_GATE`               |
| Límites                      | `PROVISIONAL_LOCKED_PENDING_BENCHMARK` |
| Profiling contract           | `READY_FOR_ARCHITECTURE`               |
| Sanitización                 | `PROVISIONAL_HEURISTIC`                |
| Acción Continuar             | `BLOCKED`                              |
| Construcción U3              | `BLOCKED`                              |

## 30. Matriz de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación | Decision gate | Fase responsable |
| ------ | ------------ | ------- | ---------- | ------------- | ---------------- |
| Bundle excesivo por Parser | Alta | Medio | Carga asíncrona del parser en U3 | Gate 4 | 4C2 |
| ZIP bomb / OOM | Baja | Alto | Límites arquitectónicos y control desde Worker | Gate 11 | 4C2 |
| PII en muestras o logs | Alta | Alto | Sanitización heurística, truncado. No enviar logs. | Gate 13 | 4C2 |

## 31. Decision gates abiertos
1. Selección final del parser a utilizar (SheetJS vs otro), validando el trade-off con `.xls`.
2. Confirmar si el Worker spike aprueba la implementación.
3. Definición final de las reglas heurísticas de sanitización de PII y límites productivos.

## 32. Autorización o bloqueo para Fase 4C2
**Estado**: `READY_WITH_BLOCKING_DECISION_GATES`
Se autoriza la documentación de arquitectura de la Fase 4C2, pero está **ESTRICTAMENTE BLOQUEADA** la instalación de parsers o la construcción de código hasta que se aprueben los gates pendientes (especialmente la selección de la librería parser que soporte `.xls` y la estrategia de Web Worker).

## 33. Criterios de éxito
* Documentación refleja con precisión los riesgos y decisiones de arquitectura para el parsing seguro en navegador.
* No se instalaron dependencias ni se escribió código productivo o UI en esta fase.
* Los límites funcionales y la seguridad (sanitización) han sido formalizados conceptualmente.

## 34. Fecha
2026-06-10

## 35. Commit base
`a26b512865bd528c99cba31dc6c1de457d5ce568`
