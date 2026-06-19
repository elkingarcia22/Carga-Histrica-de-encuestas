# SANDBOX_UPLOAD_ARCHITECTURE.md

## 1. Purpose
Define el diseño técnico y de producto del sandbox upload para encuestas.

## 2. Current State
Hoy el prototipo usa carga sintética/mock y chat-first flow ("Montar archivos sintéticos"). No hay procesamiento real ni subida de archivos físicos habilitada en la UI.

## 3. Target User Experience
- El usuario activa la acción “Cargar encuesta”.
- El sistema presenta una zona de carga sandbox integrada en la UI conversacional.
- El asistente analiza preliminarmente los archivos subidos.
- Detecta archivos y valida si hay una o varias encuestas.
- Guía al usuario paso a paso en el proceso de resolución de conflictos, si los hay.

## 4. Accepted File Types
Inicialmente se permitirán:
- `.xlsx`
- `.xls`
- `.csv`
Opcionalmente (futuro, no ahora):
- `.zip`

## 5. File Source Modes
- **Example project files**: Archivos locales empaquetados en la app para demostraciones rápidas.
- **User selected local file**: Archivos reales seleccionados por el usuario desde su equipo.
- **Future backend uploaded file**: Integración con almacenamiento persistente (fases posteriores).
Solo el análisis en memoria de archivos locales o de ejemplo está permitido en la fase de sandbox.

## 6. Single Survey Rule
- Se permite **una encuesta activa por sesión de importación**.
- Si se detectan varias encuestas mezcladas en los archivos, el usuario debe elegir explícitamente una.
- No se mezclarán encuestas en un mismo análisis de estructura sin decisión explícita.

## 7. Multi-file Handling
- Varios archivos de la **misma encuesta**: Se consolidan para el análisis de la misma estructura (ej. múltiples sheets o archivos fragmentados horizontalmente).
- Varios archivos de **encuestas distintas**: Requiere selección explícita del usuario para enfocarse en una sola.
- Archivos por gerencia, archivo total + segmentados, o archivo 2024 + 2025: El sistema buscará alertar sobre estructuras redundantes o incompatibles, requiriendo validación.

## 8. Pre-analysis Safety Gate
Antes de cualquier análisis profundo:
- Se muestra un **aviso sandbox** para indicar que el entorno es de prueba.
- Se hace una detección superficial de posible PII (Personally Identifiable Information).
- Se pide confirmación explícita para continuar.
- **No se envían datos a la IA todavía**. Todo ocurre en local.

## 9. Upload Data Lifecycle
- El archivo seleccionado **solo vive en la memoria de sesión** del navegador.
- **No storage**, no persistencia en disco o base de datos.
- **No subida productiva**, no hay un backend real recibiendo o guardando los bytes.
- **No API real** de creación de encuestas.
- Los datos sufren una limpieza total (garbage collection / state reset) al cerrar la sesión o cambiar de contexto.

## 10. Connection to SurveyFileAnalysisContract
El upload sandbox no analiza ni entiende de encuestas a profundidad; su responsabilidad es solo orquestar la recepción de archivos en memoria y entregarlos a la fase futura de parser local. Ese parser producirá el `SurveyFileAnalysisContract` definido en la arquitectura de importación.

## 11. Conversation Flow
1. Usuario selecciona “Cargar encuesta”.
2. Sistema muestra zona/acción de carga sandbox.
3. Usuario selecciona archivo(s).
4. Asistente confirma archivos recibidos.
5. Asistente valida cantidad/estructura preliminar.
6. Si hay múltiples encuestas, pide selección.
7. Si hay una encuesta, pasa a pre-analysis safety gate.
8. Luego fase futura: parser produce contrato.

## 12. Privacy and PII
- Detección preliminar de PII basada en nombres de columnas o muestreo rápido.
- Alertas al usuario si hay riesgo.
- Minimización de datos a procesar (solo columnas necesarias).
- **No enviar crudo a Claude** o a otros LLMs.
- No persistir datos sensibles.

## 13. Error States
- Archivo no soportado (extensión inválida).
- Archivo vacío o corrupto.
- Múltiples encuestas (detectado a nivel macro).
- Estructura no reconocible (no hay headers tabulares lógicos).
- Archivo demasiado grande (excede el límite de memoria del sandbox).
- Columnas altamente sensibles bloqueantes.
- Fallo parser futuro (parse error no recuperable).

## 14. Out of Scope
- Parser real de hojas de cálculo a objetos de dominio de encuesta.
- Matching o engine de homologación.
- Conexión a Claude o AI APIs.
- Dashboard final.
- Comparativo histórico funcional.
- Upload productivo (Cloud Storage, S3).
- Almacenamiento local persistente (IndexedDB) para encuestas enteras.
- Creación real de la encuesta en la plataforma core UBITS.

## 15. Phase Plan
- **Fase 5B**: Sandbox upload UI build.
- **Fase 5C**: Sandbox upload QA.
- **Fase 6A**: Local parser architecture.
- **Fase 6B**: Local parser prototype.
