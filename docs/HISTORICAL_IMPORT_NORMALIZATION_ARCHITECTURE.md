# Arquitectura Conceptual: Vista Previa de Normalización (U4-SIM)

## 1. Estado y propósito
* **Nombre de la fase:** Fase 4E-R2A · Multi-file Single-Survey Architecture Amendment
* **Pantalla cubierta:** U4-SIM · Vista previa de normalización
* **Estado de arquitectura:** AMENDED (Multi-file)
* **Alcance:** Actualizar la arquitectura conceptual para soportar un lote multiarchivo, manteniendo límites de responsabilidad, ownership de estado, y estructura de componentes para la pantalla de Vista Previa de Normalización.
* **Exclusiones:** No incluye generación de código, ni lógicas de favorabilidad, participación, deltas o comparaciones analíticas.
* **Relación con el intake aprobado:** Se alinea estrictamente con el enfoque de normalización estructural definido en la Fase 4E-R1 y modificado en 4E-R2A.

## 2. Sustitución del supuesto anterior
**Supuesto original:** La primera versión procesaría "un workbook raw".
**Evidencia que lo invalida:** Una ejecución de importación puede recibir varios archivos cargados simultáneamente (ej. respuestas, participantes, jerarquía), pero todos deben corresponder a una sola encuesta y a un solo periodo.
**Nueva decisión (Regla de negocio principal):** UNA IMPORTACIÓN = UNA ENCUESTA + UN PERIODO + UNO O VARIOS ARCHIVOS. El lote multiarchivo corresponde a una única encuesta y un único periodo.
**Impacto arquitectónico:** La arquitectura pasa de estar centrada en un archivo único a estar centrada en un lote (`batch`). El boundary U3-SIM → U4-SIM, los estados y el `scenarioId` operan a nivel de lote, con soporte para metadatos por archivo y relaciones entre ellos.

## 3. Regla de negocio principal
* **UNA IMPORTACIÓN = UNA ENCUESTA + UN PERIODO + UNO O VARIOS ARCHIVOS.**
* **Encuesta:** Un evento de recolección de datos específico de clima, desempeño, etc.
* **Periodo:** El lapso temporal al que pertenecen los datos (ej. 2024).
* **Lote (Batch):** Conjunto de archivos subidos simultáneamente en una sola ejecución.
* **Archivo dentro del lote:** Una pieza individual de información (Excel, CSV) que contribuye a la encuesta del lote.
* **Condición de validez del lote:** Todos los archivos pertenecen a la misma encuesta y al mismo periodo. Existe al menos una fuente principal válida. No hay incidencias bloqueantes.
* **Condición de bloqueo del lote:** Se mezclan archivos de diferentes periodos o diferentes encuestas. Falta fuente principal, lote vacío, o errores críticos irreconciliables.

## 4. Identidad conceptual del lote
A nivel conceptual (sin crear tipos en esta fase), el lote se define por:
* `batchId`: Identificador único de la importación.
* `surveyIdentity`: Identificación de la encuesta detectada.
* `surveyType`: Tipo de encuesta (ej. Clima).
* `surveyPeriod`: Periodo detectado (ej. 2024).
* `scenarioId`: Identificador del escenario sintético para el lote.
* `fileCount`: Cantidad de archivos.
* `batchStatus`: Estado global del lote.
* `batchIssues`: Incidencias globales del lote.
* `fileSummaries`: Resumen de los archivos que componen el lote.

## 5. Metadata serializable por archivo
Cada archivo del lote representa conceptualmente:
* Identificador local.
* Filename sanitizado.
* Extensión.
* Tamaño.
* Posición dentro del lote.
* Familia estructural simulada.
* Rol propuesto.
* Encuesta detectada.
* Periodo detectado.
* Confianza simulada.
* Estado.
* Incidencias.
* Relación con otros archivos.

**Restricción estricta:** NUNCA debe incluir `File`, `Blob`, `ArrayBuffer`, contenido binario, rutas locales, celdas reales, PII, ni respuestas abiertas reales.

## 6. Familias estructurales
Clasificación simulada que describe qué tipo de estructura parece contener el archivo. NO autoriza analítica ni importación agregada:
* Respuestas individuales raw.
* Catálogo de preguntas.
* Roster o participantes.
* Jerarquía organizacional.
* Reporte agregado organizacional.
* Reporte agregado demográfico.
* Archivo desconocido.
* Archivo incompatible.

## 7. Roles dentro del lote
Describe para qué se utilizaría el archivo dentro de la importación (separado de la familia estructural):
* Fuente principal.
* Fuente complementaria.
* Catálogo auxiliar.
* Roster auxiliar.
* Jerarquía auxiliar.
* Evidencia de validación.
* Redundante.
* Requiere confirmación.
* Incompatible.
* Pertenece a otro periodo.

## 8. Relaciones entre archivos
Relaciones conceptuales detectadas entre los elementos del lote:
* Complementa.
* Describe.
* Contiene roster para.
* Contiene jerarquía para.
* Resume.
* Duplica parcialmente.
* Contradice.
* Pertenece a otro periodo.
* No relacionado.

## 9. Regla de una sola encuesta
* **Coincidencia:** Todos los archivos coinciden en la encuesta detectada.
* **Identidad pendiente de confirmación:** Ambigüedad en la detección.
* **Conflicto de identidad / Encuesta diferente:** Si existe un archivo de otra encuesta, el lote queda en `review-required` o `blocked` según la severidad. El CTA principal no puede quedar habilitado mientras el conflicto no esté resuelto.

## 10. Regla de un solo periodo
* Todos los archivos deben corresponder al mismo periodo (ej. 2024, 2025, o rango de fechas).
* Si el lote mezcla periodos (ej. 2024 y 2025), se genera una incidencia bloqueante.
* El estado global es `blocked`.
* "Continuar a configuración" queda deshabilitado.
* La UI debe explicar qué archivos pertenecen al periodo conflictivo.
* No debe combinarse ni consolidarse automáticamente.

## 11. Precedencia de fuentes
Reglas iniciales:
* Una fuente raw individual puede ser candidata a fuente principal.
* Un catálogo puede complementar la interpretación de preguntas.
* Un roster puede complementar participantes y universo invitado.
* Una jerarquía puede complementar estructura organizacional.
* Un reporte agregado puede actuar como evidencia o complemento estructural, pero NO debe duplicar ni sobrescribir respuestas individuales.
* Ninguna precedencia debe considerarse definitiva sin revisión humana.
* Se permite detectar duplicidad, pero no resolverla automáticamente en R2A.

## 12. Boundary U3-SIM → U4-SIM actualizado
Centrado en el lote, no en un archivo individual:
* **U3-SIM debe entregar:** `scenarioId`, `batchId`, metadata serializable del lote, metadata serializable de cada archivo, estado de procesamiento simulado, conteo de archivos, resultado simulado de clasificación inicial.
* **U4-SIM debe:** Consultar el fixture correspondiente, representar el lote, mostrar resumen global, permitir revisar cada archivo, mostrar relaciones e incidencias, y decidir si el lote está listo para configurar una sola encuesta.
* **U4-SIM no debe:** Recibir binarios, leer archivos, inferir contenido real, combinar encuestas, combinar periodos, ejecutar analytics, modificar los archivos.

## 13. Jerarquía de estado

### Estado de archivo
* `recognized`
* `confirmation-required`
* `redundant`
* `incompatible`
* `different-survey`
* `different-period`
* `simulated-error`

### Estado de relación
* `complementary`
* `supporting`
* `duplicated`
* `conflicting`
* `unrelated`

### Estado global del lote
* `ready-for-configuration`
* `review-required`
* `blocked`
* `empty`
* `simulated-error`

El estado global refleja la agregación de los estados de archivo y relación. Si hay archivos de diferentes periodos o diferentes encuestas (conflictos severos), el estado del lote es `blocked`.

## 14. Reglas del CTA
El botón "Continuar a configuración" obedece al estado global:

**Habilitado cuando:**
* Todos los archivos pertenecen a la misma encuesta.
* Todos los archivos pertenecen al mismo periodo.
* Existe al menos una fuente principal válida.
* No hay incidencias bloqueantes.
* Las redundancias críticas están resueltas o clasificadas.
* El lote representa una única encuesta histórica.

**Deshabilitado cuando:**
* Se mezclan periodos.
* Se mezclen encuestas.
* No exista fuente principal.
* Existan archivos incompatibles críticos.
* El lote esté vacío.
* Exista un `simulated-error` no recuperado.

## 15. Composición futura de U4-SIM
Se mantiene en una sola pantalla, capaz de representar conceptualmente:
* Disclosure de simulación.
* Identidad de la encuesta y periodo.
* Resumen del lote.
* Conteo y estado de archivos.
* Listado de archivos con rol propuesto.
* Estructura detectada por archivo.
* Relaciones entre archivos.
* Mapeo preliminar consolidado.
* Incidencias globales y por archivo.
* Footer de acciones.

*Prohibiciones:* No agregar dashboards. No mostrar favorabilidad, participación analítica, deltas o tendencias.

## 16. Adaptación del scenarioId
El `scenarioId` pasa a seleccionar un escenario de lote. Ejemplos conceptuales:
* `multi-file-single-survey-ready`
* `multi-file-review-required`
* `mixed-period-blocked`
* `missing-primary-source`
* `redundant-files-review`
* `incompatible-file-blocked`
* `simulated-error`

## 17. Impacto en la estructura futura de archivos
Las rutas derivadas en R2 (tipos, config, fixtures, adapters, componentes y pantalla bajo `src/**/normalization-preview/`) siguen siendo válidas para el dominio, pero sus responsabilidades futuras incluirán:
* Tipos de lote y por archivo.
* Relaciones.
* Selectores de resumen.
* Cálculo determinístico del estado global.
* Fixtures multiarchivo.
* Componentes de lote y por archivo.

## 18. Decision gates
| Decisión | Estado | Detalles |
|----------|--------|----------|
| Lote multiarchivo | Cerrado | Arquitectura soporta N archivos por importación. |
| Encuesta única | Cerrado | Lote = 1 encuesta. Mixed-survey bloquea. |
| Periodo único | Cerrado | Lote = 1 periodo. Mixed-period bloquea. |
| `scenarioId` | Cerrado | Escala a nivel de lote. |
| Metadata por archivo | Cerrado | Serializable, sin paso de binarios (File/Blob). |
| Familia vs Rol | Cerrado | Separación explícita (Qué es vs Para qué se usa). |
| Relación entre archivos | Cerrado | Modeladas conceptualmente (complemento, duplicado, etc). |
| Fuente principal | Cerrado | Obligatoria para avanzar (puede ser raw). |
| CTA dependiente | Cerrado | Bloqueado si hay errores globales o de mezcla. |
| Reportes agregados | Cerrado | Son complementos/evidencia, NO analítica. |
| Rutas/Dependencias | Cerrado | No se crean rutas ni se instalan dependencias en R2A. |
| Resolución automática | Cerrado | No se resuelven duplicidades automáticamente. |
| Definición final tipos | Diferido (R3) | Nombres y esquemas definitivos. |
| Valores fixtures | Diferido (R3) | Mock data exacto, IDs de escenario, conteos. |

## 19. Riesgos nuevos
**Alta:**
* Mezcla accidental de periodos.
* Mezcla accidental de encuestas.
* Duplicación de respuestas.
* Sobrescritura del raw por un agregado.
* Lote sin fuente principal.
* Fuga de binarios.
* PII en filenames o fixtures.

**Media:**
* Clasificación incorrecta del rol.
* Conteos globales inconsistentes.
* Relaciones contradictorias.
* Componente de listado de archivos demasiado grande.
* Escenario mock centrado todavía en un archivo.
* Semántica analítica reintroducida mediante reportes agregados.

## 20. Criterios de salida hacia R3
R3 solo podrá autorizarse cuando la arquitectura deje explícito:
* Una encuesta por lote.
* Un periodo por lote.
* Múltiples archivos permitidos.
* Clasificación por familia.
* Asignación de roles.
* Relaciones entre archivos.
* Fuente principal obligatoria.
* Reglas de bloqueo (ej. mezcla de periodos).
* Reglas de CTA basadas en estado global del lote.
* `scenarioId` a nivel de lote.
* Boundary sin binarios.
* Separación entre raw y agregados.
* Ausencia absoluta de analítica comparativa.
