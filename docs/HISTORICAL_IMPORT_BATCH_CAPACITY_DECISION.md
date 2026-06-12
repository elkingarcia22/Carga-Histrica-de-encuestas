# Historical Import Batch Capacity Decision

## 1. Contexto
En la fase 4E-R6B2H1 se evalúa la viabilidad de incrementar la capacidad del lote de importación de encuestas históricas de un límite inicial de 5 archivos a un límite propuesto de **200 archivos**. Este documento inspecciona el estado actual del prototipo, evalúa el impacto técnico en memoria y rendimiento (pantallas U1 a U4-SIM), y establece los límites complementarios y riesgos a mitigar antes de implementar el cambio.

## 2. Alcance
* Análisis estático y sintético de la capacidad del navegador.
* Impacto en la arquitectura del prototipo (frontend).
* Definición de restricciones y reglas complementarias.
* No incluye: Cambios de código, implementación o pruebas con datos reales.

## 3. Estado Actual y 4. Inventario de Reglas
Actualmente, las reglas de capacidad y validación se definen centralmente en `src/config/survey-import/uploadLimits.ts` y se aplican en `src/hooks/survey-import/useLocalUploadState.ts` y la pantalla de carga.

| Regla | Valor Actual | Ubicación | Nivel de Aplicación |
| :--- | :--- | :--- | :--- |
| **Límite máximo de archivos** | 5 | `uploadLimits.maxFiles` | Validación en U1 (bloquea selección adicional) |
| **Tamaño máximo por archivo** | 25 MB | `uploadLimits.maxSizeBytesPerFile` | Validación por archivo (U1/U2) (`too-large`) |
| **Tamaño máximo del lote** | 50 MB | `uploadLimits.maxSizeBytesPerBatch` | Validación agregada de lote (bloquea el paso a U3) |
| **Formatos aceptados** | `.xlsx`, `.xls` | `uploadLimits.allowedExtensions` | Validación por archivo y directiva `accept` en U1 |
| **Archivos temporales** | Prefijos `~$` | `uploadLimits.rejectedPrefixes` | Validación por archivo (`invalid`) |
| **Regla de duplicados** | Mismo nombre, tamaño y fecha | `revalidateBatch` | Validación de lote (`duplicate`) |

**Contrato Actual de Metadata (Paso 3):**
* **Retención de `File`:** La pantalla `SurveyImportUploadScreen.tsx` retiene explícitamente los objetos `File` binarios en memoria usando `const binaryMap = useRef<Map<string, File>>(new Map());`.
* **Metadata Serializable:** `LocalFileMetadata` (id, displayName, extension, size, status, etc.) se entrega a U3-SIM.
* **Impacto:** Mantener 200 objetos `File` significa que el navegador conserva 200 referencias de los archivos seleccionados hasta que se cancela el flujo o se reinicia. Esto incrementa el uso de recursos y requiere cautela con el tamaño máximo acumulado.

## 5. Escenarios de Capacidad Evaluados

| Escenario | Archivos | Tamaño representativo | Tamaño total | Impacto |
| :--- | ---: | ---: | ---: | :--- |
| Pequeño | 5 | 5 MB | 25 MB | Operación óptima actual. |
| Medio | 25 | 5 MB | 125 MB | Supera límite de lote actual (50 MB). |
| Grande | 100 | 5 MB | 500 MB | Consumo notable de memoria por `binaryMap`. |
| Máximo Propuesto | 200 | 5 MB | 1,000 MB (1 GB) | Exige estrategias de retención eficientes. |
| Estrés | 200 | 25 MB (Máximo) | 5,000 MB (5 GB) | Riesgo inminente de *OOM (Out Of Memory)* o crash en navegadores móviles/de baja gama. |

## 6. Impacto por Pantalla

### U1 · Selección
* **Drag & Drop:** Procesar 200 archivos secuencialmente puede tomar unos milisegundos, bloqueando levemente el hilo principal (Main Thread).
* **Live Region:** El contador ya agrega el resumen (ej: "Se agregaron X archivos"), por lo que no habrá un anuncio excesivamente verboso.

### U2 · Archivos seleccionados
* **Renderizado:** La lista `SelectedFileList` dibuja todos los componentes en un `flex-col`. Montar 200 `SelectedFileRow` simultáneamente impactará el *Time to Interactive (TTI)* y el rendimiento del scroll vertical.
* **Solución requerida:** Se requerirá virtualización estricta o paginación de la lista para sostener una experiencia fluida.

### U3-SIM · Procesamiento Simulado
* **Tray:** La `SimulatedProcessingTray` ya limita la vista a los 3 nodos más recientes. Funciona perfectamente con 200 archivos.
* **Full View:** `SimulatedProcessingFileList` renderiza todos los elementos. Al igual que U2, requeriría virtualización o colapso para 200 items.

### U4-SIM · Vista Previa de Normalización
* Mostrar 200 archivos en una tabla final sin paginación colapsará la interfaz. Será obligatorio incorporar paginación, filtros o agrupación inteligente.

## 7. Límites Complementarios Recomendados

* **Máximo por archivo:** 25 MB (Mantener).
* **Máximo total del lote:** 500 MB. (Si se permiten 200 archivos de 25MB, el lote alcanzaría 5GB, inviable para el navegador. Un límite de 500MB asegura un equilibrio).
* **Formatos:** Mantener exclusividad a Excel por ahora para evitar mezclas con CSV antes de habilitar el backend real.
* **Duplicados:** Se mantiene la validación inmediata por metadata.

## 8. Alternativas Evaluadas

* **Alternativa A (200 archivos absolutos):** Cumple la expectativa de negocio pero requiere implementar virtualización en frontend y establecer un límite estricto de tamaño total de lote para evitar crash del navegador.
* **Alternativa B (50 archivos):** Balance ideal para la arquitectura actual (sin virtualización de listas). Previene el límite de estrés pero frustra el caso de uso de importaciones masivas históricas de años completos.
* **Alternativa C (Configurable):** Extraer los límites a una API central, permitiendo escalar a 200 progresivamente.

## 9. Matriz de Decisión

| Criterio | Peso (1-5) | 50 Archivos | 100 Archivos | 200 Archivos | Configurable |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Ajuste al Caso de Uso** | 5 | 2 | 4 | 5 | 5 |
| **Rendimiento U2 / U3** | 4 | 4 | 2 | 1 | 3 |
| **Consumo de Memoria** | 4 | 4 | 3 | 1 | 3 |
| **Complejidad (Virtualización)**| 3 | 5 | 3 | 1 | 2 |
| **Escalabilidad Futura** | 4 | 2 | 3 | 5 | 5 |

## 10. Decisión Recomendada

**Decisión: Aprobar el incremento a 200 archivos con condiciones estrictas:**
1. **Máximo Recomendado y Absoluto:** 200 archivos.
2. **Tamaño Máximo Total:** 500 MB por lote.
3. **Condición de Implementación:** Exige implementar paginación o virtualización visual.

## 11. Riesgos y 12. Mitigaciones

| Riesgo | Severidad | Probabilidad | Mitigación | Fase Responsable |
| :--- | :--- | :--- | :--- | :--- |
| **Browser OOM por retener 200 `File`** | Alta | Media | Limitar `maxSizeBytesPerBatch` a 500 MB absolutos. | Fase 4E-R6B2H2 |
| **Crash al renderizar 200 filas** | Alta | Alta | Exigir virtualización de listas o paginación. | Fase 4E-R6B2H2 |
| **TTI degradado en U1** | Media | Alta | Cargar asíncronamente en UI si es posible. | Fase 4E-R6B2H2 |

## 13. Oportunidades IA-First
* Identificación de archivos irrelevantes (ej: plantillas vacías).
* Agrupación automática de encuestas por nombre y año.
* Todas catalogadas como: `VALUABLE_LATER_AFTER_REAL_PARSING_AND_SECURITY_REVIEW`

## 14. Decision Gates
* **Cerrado:** Máximo de archivos (200).
* **Cerrado:** Máximo total del lote (500 MB).
* **Cerrado:** Máximo por archivo (25 MB).
* **Cerrado:** Formato permitido.
* **Pendiente:** Configuración centralizada.
* **Pendiente:** Estrategia de representación en U2 (Virtualización vs Paginación).
* **Pendiente:** Comportamiento del tray.
* **Pendiente:** Estrategia de U4-SIM.
* **Pendiente:** Necesidad de virtualización.
* **Pendiente:** Copy y warnings.
* **Pendiente:** Accesibilidad.
* **Pendiente:** Performance budget.
* **Pendiente:** Futuro parsing.
* **Pendiente:** Seguridad y PII.

## 15. Plan de Implementación Posterior
* Modificar `uploadLimits.ts` estableciendo `maxFiles: 200` y `maxSizeBytesPerBatch: 500 * 1024 * 1024`.
* Decidir mecanismo de rendereo para 200 ítems en U2 y U3.

## 16. Criterios de QA y Fuera de Alcance
QA validará la carga de 200 archivos sintéticos bajo el límite de 500MB en un navegador con recursos restringidos, comprobando memory leaks en el `binaryMap`. El contenido real no será procesado ni validado en esta fase.
