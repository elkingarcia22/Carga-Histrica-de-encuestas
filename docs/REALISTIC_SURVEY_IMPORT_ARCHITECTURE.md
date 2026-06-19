# REALISTIC_SURVEY_IMPORT_ARCHITECTURE.md

## 1. Purpose
Este documento define la transición de la fase de sandbox sintético a una arquitectura de ingesta realista controlada de archivos de encuesta dentro del prototipo. El objetivo es estructurar cómo pasamos de interactuar con datos hardcodeados y simulados a procesar estructuras de archivos reales, separando estrictamente la extracción determinística de la interpretación asistida por IA (Claude), manteniendo la experiencia paso a paso sin conectar aún la ingesta productiva.

## 2. Current Prototype State
Hasta ahora, se ha construido:
- **Chat-first workspace**: Área principal de trabajo guiada por conversación.
- **Synthetic file mount**: Simulación de montaje de archivo con contrato predefinido.
- **Guided review**: Flujo conversacional paso a paso para confirmar cada entidad.
- **Demográficos**: Detección y aprobación de demográficos y sus valores.
- **Dimensiones**: Revisión y mapeo de dimensiones detectadas.
- **Preguntas**: Análisis de preguntas históricas, nuevas y comparables.
- **Mapeos**: Aprobación de la relación pregunta-dimensión.
- **Contrato sintético**: Aprobación final del bloque de datos consolidado.
- **Visual polish**: Composer con márgenes seguros, estado de typing, mensajes conversacionales, bloques visuales y advertencias sobre demográficos.

## 3. Target Experience
La experiencia futura permitirá:
- **Usuario carga encuesta**: Sube un archivo real en un sandbox.
- **Agente analiza**: El sistema examina el archivo sin guardarlo en productivo.
- **Detecta estructura**: Identifica dimensiones, preguntas, demográficos y participantes.
- **Guía revisión**: Inicia un proceso conversacional, una decisión por turno.
- **Propone homologaciones**: Utiliza IA para sugerir mapeos con catálogos existentes y guía decisiones en el chat de forma segura.

## 4. High-Level Architecture
La arquitectura se divide en las siguientes capas:
- **UI Chat**: Interfaz principal de usuario, asegurando un paso a la vez.
- **Sandbox upload layer**: Entorno seguro, aislado y temporal para la ingesta del archivo.
- **Deterministic Parser**: Capa técnica que extrae información de forma estricta (filas, columnas, tipos). Source of truth para estructura.
- **Normalization layer**: Limpieza de datos (tildes, espacios, capitalización).
- **Matching engine**: Motor que busca correspondencias exactas, fuzzy o por alias entre la extracción y los catálogos.
- **Mock UBITS Catalogs**: Datos mockeados locales contra los cuales hacer matching.
- **Claude Reasoning Layer**: Interpreta, explica y sugiere sobre el contrato extraído. Source of interpretation, no truth.
- **Decision/Audit Trail**: Registro conversacional inmutable de cada decisión de homologación que toma el usuario.
- **Comparison preparation output**: Generación del contrato final listo para el dashboard.

## 5. Deterministic Parser Responsibilities
**Qué HACE:**
- Lee el archivo (ej. XLSX) determinísticamente.
- Detecta hojas, columnas y encabezados.
- Identifica tipos de datos y realiza conteos.
- Detecta posibles bloques de preguntas por formato de escala.
- Detecta columnas que parecen de participantes.
- Detecta columnas que parecen demográficos.
- Produce un contrato estructurado verificable.

**Qué NO HACE:**
- No asume significados semánticos de preguntas.
- No alucina valores o correspondencias.
- No toma decisiones sobre privacidad.

## 6. AI / Claude Responsibilities
**Qué HACE:**
- Explica hallazgos del parser en lenguaje natural.
- Sugiere homologaciones semánticas basándose en reglas.
- Identifica ambigüedades.
- Ayuda a priorizar decisiones.
- Redacta mensajes conversacionales.

**Qué NO HACE:**
- Nunca inventa datos ni alucina columnas.
- Nunca reemplaza al parser como source of truth de la estructura.
- Nunca decide sin consultar (a menos que haya reglas de automatch seguras).

## 7. Mock UBITS Catalogs
Para la transición realista, se requerirán los siguientes catálogos locales:
- **Dimensions catalog**: Catálogo oficial de dimensiones de la plataforma.
- **Questions catalog**: Banco de preguntas base por idioma.
- **Demographics catalog**: Demográficos oficiales.
- **Demographic values catalog**: Valores pre-aprobados para demográficos.
- **Users catalog**: Participantes existentes mockeados.
- **Survey types catalog**: Plantillas de encuestas conocidas.

## 8. Matching Strategy
- **Exact match**: Comparación byte a byte normalizada.
- **Normalized match**: Comparación tras limpiar tildes, minúsculas, recortes.
- **Alias match**: Correspondencia a través de diccionarios predefinidos de sinónimos.
- **Fuzzy match**: Distancia de Levenshtein u otros algoritmos si hay cercanía.
- **Confidence score**: Puntaje (ej. 0 a 1) sobre la probabilidad de acierto.
- **Explanation**: Motivo textual del match para justificar ante el usuario.
- **Ambiguity handling**: Si score < umbral o hay múltiples candidatos, escalamiento al usuario.
- **User override**: El usuario tiene SIEMPRE la palabra final y puede anular cualquier match sugerido.

## 9. Multi-Survey Detection
Reglas para detectar escenarios de múltiple encuesta:
- Si el archivo contiene hojas con estructuras completamente dispares.
- Si hay más de un archivo subido.
- Si dentro de una hoja hay separadores claros de dos bloques de metadatos de encuesta.
*(La IA deberá preguntar al usuario con cuál quiere proceder, o si desea unirlas, según alcance fase).*

## 10. Anonymous vs Identified Survey Detection
Reglas para determinar la naturaleza de privacidad:
- **Encuesta anónima**: Ausencia de identificadores personales en la estructura.
- **Encuesta identificada**: Presencia de columnas detectadas.
- Identificadores de búsqueda: IDs internos, correos, nombres, documentos.
- Banderas: Participantes externos no existentes en catálogos.

## 11. Participant Matching
Reglas de enlace para participantes mock:
- **Match por Email**: Alta prioridad, exact match.
- **Match por Document**: Secundario, requiere validación de país/tipo.
- **Match por Employee ID**: Interno corporativo.
- **Match por Full Name**: Fuzzy, muy propenso a colisiones, requiere cautela.
- **Ambiguous match / No match**: Marcar para creación/revisión.
- **External participant**: Bandera si es política aceptada o rechazada.

## 12. Demographic Homologation
Manejo de columnas demográficas:
- Ej: La plataforma tiene “País”. El archivo trae “PAIS”, “pais”, “País de residencia” o “Country”.
- Normalizer + Alias dict deben mapear a "País".
- Si hay valores nuevos (ej. "Honduras" en una lista donde no estaba configurado), el sistema advierte que se creará y que tendrá impacto posterior como filtro de análisis comparativo.
- Creación "solo en encuesta" vs "global" debe ser explicada.

## 13. Question and Dimension Matching
- **Dimensión existente**: Match directo.
- **Dimensión nueva**: Marcada como "solo para esta encuesta".
- **Pregunta oficial**: Coincide con banco global.
- **Pregunta similar**: Fuzzy match, IA sugiere homologar a pregunta oficial.
- **Pregunta nueva**: Se crea y se mapea a dimensión específica.
- **Pregunta histórica**: Proviniente de una versión anterior de la misma encuesta.
- **Pregunta excluida**: Si el usuario decide omitirla de la ingesta.

## 14. Privacy, PII and Ethics Guardrails
- **Detección PII**: El parser debe marcar columnas que parecen contener Personal Identifiable Information (teléfonos, SSN, sueldos).
- **Advertencias**: Notificar al usuario si sube datos sensibles no necesarios.
- **Minimización de datos**: Omitir columnas no relevantes en el contrato.
- **No enviar datos sensibles a IA**: NUNCA enviar valores completos de PII a Claude; enviar metadatos o resúmenes estructurados (ej: "Columna 'Sueldo' con valores numéricos continuos detectada").
- **Trazabilidad**: Registrar quién aprobó ingestar columnas con riesgo PII.
- **Consentimiento explícito**: Antes de procesamiento y persistencia real.

## 15. Claude Integration Principles
- **No API key en frontend**: Por seguridad estricta.
- **Backend/Endpoint seguro**: Todo request a Claude viaja por un proxy o backend seguro.
- **Prompts controlados**: Sistema de templates.
- **Límites de tamaño**: Truncamiento de muestras. Se envía esquema, no el CSV de 100k filas.
- **Envío de muestras/resúmenes**: Solo las 10 primeras filas o estadísticas.
- **Fallback sin IA**: Si Claude falla, el flujo debe permitir configuración manual pura.
- **Logs seguros**: No loguear PII en los requests a Claude.
- **Redacción segura**: Claude debe tener un system prompt que le prohíba asumir decisiones finales estructurales.

## 16. Conversation Flow
El flujo ideal, interactuando paso a paso:
1. Cargar encuesta.
2. Analizar.
3. Elegir encuesta (si hay múltiples).
4. Revisar estructura global.
5. Revisar demográficos y advertencias.
6. Revisar participantes.
7. Revisar dimensiones.
8. Revisar preguntas (oficiales, similares, nuevas).
9. Revisar mapeos.
10. Aprobación de contrato.
11. Preparar comparativo (Dashboard).

## 17. Out of Scope
Lo que **queda fuera** explícitamente en esta fase:
- Construcción del dashboard final de analítica.
- Comparación visual real de datos.
- Insights generados por IA sobre los resultados de la encuesta.
- Conexión real a la plataforma productiva UBITS.
- Creación real de usuarios en bases de datos productivas.
- Modificación real del catálogo de dimensiones/preguntas UBITS.
- Procesamiento de archivos reales de clientes en entornos productivos.

## 18. Phase Plan
- **Fase 3**: File analysis contract lock (Definición estricta de interfaces TypeScript de este análisis).
- **Fase 4**: Mock UBITS catalogs (Creación de los diccionarios).
- **Fase 5**: Sandbox upload architecture/build (Componente Dropzone y lector file local).
- **Fase 6**: Local parser prototype (Lectura real de xlsx en navegador, sin subir al server).
- **Fase 7**: Matching engine prototype (Normalizador + distancias).
- **Fase 8**: Conversational review with real parsed contract (Integrar el parser al chat).
- **Fase 9**: Claude endpoint architecture (Diseño del backend).
- **Fase 10**: Claude integration behind backend (Conexión de IA para asistencia real en la configuración).

---
**Bloqueos y Decisiones Firmes:**
- `IA_NO_ES_SOURCE_OF_TRUTH` = YES
- `PARSER_SOURCE_OF_TRUTH` = YES
- `CLAUDE_NOT_CONNECTED_YET` = YES
- `NO_FRONTEND_API_KEY` = YES
- `NO_REAL_CLIENT_DATA` = YES
- `NO_PRODUCTIVE_PROCESSING_YET` = YES
- `CHAT_FIRST_FLOW_REMAINS` = YES
- `ONE_DECISION_PER_STEP` = YES
- `NO_FULL_STRUCTURE_DUMP` = YES
- `USER_CAN_OVERRIDE_MATCHES` = YES
- `AUDIT_TRAIL_REQUIRED` = YES
- `PII_DETECTION_REQUIRED` = YES
