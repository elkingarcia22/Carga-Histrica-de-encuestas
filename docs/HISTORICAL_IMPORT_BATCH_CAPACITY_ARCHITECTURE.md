# Historical Import Batch Capacity Architecture

## 1. Git Preflight Report
- **Branch**: `main`
- **Alignment**: HEAD matches `origin/main` (0 commits behind/ahead).
- **Staged files**: 0.
- **Contract R3**: Intact.
- **Frozen files**: Intact.
- **Status**: Explorable modifications and untracked files are from prior prototype phases; working tree is safe to lock architecture.

## 2. Previous Decision Audit
Reviewing `docs/HISTORICAL_IMPORT_BATCH_CAPACITY_DECISION.md`:
- **Confirmado**: La retención de `File` ocurre en `binaryMap` (`SurveyImportUploadScreen.tsx`). U2 renderiza un `flex-col` plano sin paginación, lo cual degrada la performance (Time to Interactive y Main Thread) al montar 200 filas DOM complejas.
- **No demostrado**: El riesgo de "OOM (Out of Memory) en el navegador por 5 GB de RAM" debido a seleccionar 200 archivos de 25 MB. Un objeto `File` no carga automáticamente su contenido al heap de JavaScript; solo es un puntero (*Blob pointer*) que expone metadata.
- **Provisional**: El límite total de 500 MB se recomendó, pero es un límite asociado más a un payload futuro de red y de backend que a una restricción de memoria de selección del cliente.

## 3. Memory Model Correction
- **Metadata vs Content**: `File` es solo una referencia. Seleccionar 200 archivos de 25 MB consumirá apenas unos KB de memoria en el hilo principal para guardar metadatos (nombre, tamaño, tipo).
- **Riesgo Real**: El verdadero impacto de memoria y CPU ocurrirá en fases futuras si se leen los archivos simultáneamente (`FileReader`, `arrayBuffer`) para generar vistas previas locales o se instancian buffers múltiples para el *upload* concurrente.
- **Conclusión**: El navegador puede manejar 200 referencias de `File` sin problemas de RAM. El enfoque de optimización en el cliente debe centrarse estrictamente en el renderizado del DOM (limitar filas visibles) y la complejidad algorítmica.

## 4. Configuration Source of Truth
- **Única fuente**: `src/config/survey-import/uploadLimits.ts` continuará siendo la fuente de verdad.
- **Nuevas directivas a integrar en implementación**:
  - Máximo absoluto.
  - `warningThreshold` (50).
  - Parámetros de paginación (`u2PageSize: 25`, `u3SimMaxRows: 10`).
- Se debe evitar *hardcodear* estos límites en los componentes o hooks de estado.

## 5. Absolute File Limit
- **Decisión**: **200 archivos**. Aprobado y definitivo.

## 6. Warning Threshold
- **Decisión**: **50 archivos**.
- Propósito: Proveer retroalimentación preventiva de tiempo de procesamiento futuro, de forma no bloqueante.

## 7. Per-file Limit
- **Decisión**: **25 MB**.
- Confirmado y conservado.

## 8. Total Batch Limit
- **Decisión**: **500 MB**.
- **Clasificación**: *Provisional pendiente de benchmark de red / backend*.
- Aunque no causará OOM en cliente por selección, enviar > 500 MB simultáneamente requerirá estrategias complejas de *upload* y *backend parsing*. Se mantiene como un límite de control de payload agregado.

## 9. U1 Architecture
- La interfaz no renderizará listas. Solo validaciones rápidas sobre el *DataTransfer* o *Input*.
- **Contador**: Resumen global del lote.
- Si supera 200 archivos: Bloqueo visual del DropZone ("Puedes agregar hasta 200 archivos por lote.").
- Si supera 500 MB totales: Bloqueo de la selección completa.
- Si está entre 51 y 200 archivos: Se muestra alerta *warning* amarilla.
- Validaciones hechas sin lectura de contenido (`file.size`).
- El anuncio *live-region* será agregado (ej. "Se agregaron 60 archivos"), evitando *spam* en lectores de pantalla.

## 10. U2 Pagination Architecture
- **Estrategia**: Paginación en cliente (Client-side Pagination).
- **Tamaño de página**: 25 archivos.
- **Mecanismo**: 
  - Se usará el componente base `Pagination` (`src/components/ui/pagination.tsx`).
  - No se montan 200 filas simultáneamente.
  - Eliminar un archivo debe reflejarse en la misma página, desplazando elementos desde las siguientes páginas.
  - Si se vacía la última página tras borrar el último elemento, debe regresar automáticamente a la página anterior.
- **Filtros**: No se implementará filtro por nombre de archivo para no ampliar el alcance.

## 11. U3-SIM Large Batch Architecture
- **Full View**: Se mostrará un **máximo acotado de 10 filas** visibles, priorizando los archivos recientes en procesamiento activo o la ventana actual de progreso.
- **Agregados**: El indicador global "Procesando X de 200 archivos" y la barra de progreso total. No se deben montar 200 instancias del componente Skeleton/Loader.

## 12. Tray Architecture
- **Decisión**: Conservar el estado actual.
- Máximo **3 filas** (simulando los últimos archivos en cola rotativa).
- Progreso agregado intacto.
- Estado completado intacto.

## 13. U4-SIM Large Batch Architecture
- **Escenario Actual**: El mock publicado de 4 archivos permanece intacto en esta fase.
- **Estrategia Futura para 200 ítems**: 
  - Prohibido renderizar listados planos de 200 archivos.
  - Usar Paginación por archivos o Agrupación por "Familia de Encuesta".
  - Proveer un Resumen Agregado superior (totales, errores encontrados).

## 14. Virtualization Decision
- **Decisión**: `NO_DEPENDENCY_REQUIRED — CLIENT_SIDE_PAGINATION_FIRST`.
- 25 filas (U2) y 10 filas (U3-SIM) no degradan en absoluto el Main Thread. La paginación clásica con componentes de UI existentes resuelve el problema. Instalar `react-window` o librerías de virtualización queda desautorizado. Un benchmark futuro de retención del DOM solo se justificaría si U4 exigiera vistas expandidas masivas.

## 15. Complexity Review
- **O(1)**: Validación individual (tipo, extensión, límite 25 MB).
- **O(n)**: Cálculo del tamaño total iterando `File.size`.
- **Detección de Duplicados (Riesgo O(n²))**:
  - Comparar cada nuevo archivo contra los 200 preexistentes usando `find` en cada iteración es un problema de O(n²).
  - *Mitigación Obligatoria*: Usar una estructura hash (ej. un `Set` o un `Map` por clave computada `${name}-${size}-${lastModified}`) para mantener la detección en **O(1)** por archivo insertado y O(n) total.

## 16. Performance Budget
Para un dataset sintético de 200 archivos:
- **Max Filas en U2**: 25.
- **Max Filas en U3-SIM full**: 10.
- **Max Filas en Tray**: 3.
- **Tiempo validación superficial**: < 10 ms (garantizado con Hash Map para duplicados).
- **Interacción / TTI (después de Drop)**: Bloqueo del Main Thread < 50 ms.
- **Interacción Eliminación**: < 16 ms (1 frame).
- **Render**: Sin errores en consola, sin scroll horizontal en contenedores acotados.

## 17. QA Matrix
Validación para la próxima fase de implementación (con metadata sintética):
- 5 archivos.
- 50 archivos (gatilla warning threshold y 2 páginas).
- 100 archivos (4 páginas).
- 200 archivos (8 páginas).
- 201 archivos (Validación de bloqueo total).
- 200 archivos pequeños dentro de los 500 MB de límite.
- Lote > 500 MB (Bloqueo por tamaño total).
- Archivo individual > 25 MB.
- Duplicados sintéticos en un solo evento Drop y en eventos separados.
- Filenames muy largos (truncado visual vs tooltips).
- Operación "Eliminar" desde: primera página, intermedia y última página.
- Agregar más archivos teniendo una página intermedia activa.
- U3-SIM: Lote completo sin crashear.
- U3-SIM Tray: Conservando solo 3 ítems simultáneos.

## 18. Copy and Warning Rules
- **Warning threshold (50)**: `Este lote contiene una cantidad alta de archivos. La revisión puede requerir más tiempo.`
- **Máximo de archivos (200)**: `Puedes agregar hasta 200 archivos por lote.`
- **Máximo total (500 MB)**: `El lote supera el tamaño total permitido de 500 MB.`
- **Regla de negocio**: `Todos los archivos deben pertenecer a una misma encuesta y periodo.` (Debe preservarse).

## 19. Accessibility Rules
- **Live region**: Agregar mensaje *agregado* de éxito/falla sin iterar filenames.
- **Paginación**: Atributos `aria-label` descriptivos. (ej. "Ir a página 2").
- **Foco**: Al eliminar un archivo, restaurar el foco programáticamente a un elemento adyacente (siguiente botón de eliminar o contenedor de lista) para evitar pérdida de contexto del *Screen Reader*.
- **Truncamiento**: Todo *filename* cortado con `ellipsis` debe exponer su texto completo en un `title` nativo o mediante *Tooltip*.

## 20. Security and Parsing Deferrals
- `DEFERRED_UNTIL_REAL_UPLOAD_PARSING_AND_SECURITY_ARCHITECTURE`:
  - Lectura de celdas y filas reales.
  - Parsing de XLSX a JSON.
  - Escaneo de Antivirus.
  - Inspección MIME profunda en magic bytes.
  - Upload real y fragmentación multipart.
  - Interacciones con Backend y reintentos.
  - PII y Cifrado de tránsito.

## 21. Decision Gates Closed
1. **Máximo absoluto**: 200 (Definitivo).
2. **Warning threshold**: 50 (Definitivo).
3. **Máximo por archivo**: 25 MB (Definitivo).
4. **Estado del máximo total**: Provisional (500 MB) pendiente de network.
5. **Fuente única**: `src/config/survey-import/uploadLimits.ts`.
6. **Paginación U2**: Aprobada (Client-side).
7. **Filas máximas U2**: 25.
8. **Filas máximas U3-SIM full**: 10.
9. **Tray**: 3.
10. **Estrategia futura U4-SIM**: Paginación cliente + resumen agregado.
11. **Virtualización**: Bloqueada (Paginación nativa suficiente).
12. **Performance budget**: Formalizado (O(n) y < 50ms TTI).
13. **Copy**: Validado y bloqueado.
14. **Accesibilidad**: Reglas de foco, paginación y lectura agregada fijadas.
15. **QA matrix**: Especificada con 14 escenarios.

## 22. Decision Gates Pending
- Ninguno en el alcance de arquitectura estática. (Todos los técnicos críticos están cerrados o clasificados como diferidos).

## 23. Documentation Created
- `docs/HISTORICAL_IMPORT_BATCH_CAPACITY_ARCHITECTURE.md`

## 24. Source Code Integrity
- 100% (Ningún archivo en `src/` fue modificado).

## 25. Frozen Files Status
- 100% (Intactos).

## 26. Final Status
`HISTORICAL_IMPORT_NORMALIZATION_BATCH_CAPACITY_ARCHITECTURE_LOCKED`

## 27. Next Maximum Authorizable Phase
`Fase 4E-R6B2H2 · Historical Import Batch Capacity Implementation`
