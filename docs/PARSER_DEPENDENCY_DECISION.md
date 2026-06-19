# PARSER_DEPENDENCY_DECISION.md

## 1. Purpose
Definir la decisión técnica para lectura local de archivos de encuesta.

## 2. Current State
Actualmente existe el upload sandbox metadata-only, el contrato de análisis y la arquitectura de parser definida, pero todavía no hay un runtime parser implementado.

## 3. Decision Scope
Esta fase decide la estrategia técnica de parseo y recomienda la dependencia a utilizar. No implementa el parser ni altera archivos de dependencias del proyecto.

## 4. Requirements
- leer .xlsx
- leer .xls
- leer .csv
- detectar sheets
- detectar headers fuera de fila 0
- soportar filas introductorias
- producir SurveyFileAnalysisContract
- no enviar datos a Claude
- trabajar en memoria
- manejar PII con guardrails
- no bloquear UI

## 5. Options Evaluated

### Option A: Use `xlsx`
- soporta XLSX/XLS/CSV de forma nativa
- permite lectura de sheets
- permite control de range/header
- peso de bundle considerable
- requiere manejo cuidadoso para riesgos de seguridad (macros, etc.)
- buen mantenimiento y adopción
- licencia compatible
- compatible con Vite
- facilidad para construir el prototipo local

### Option B: Use lightweight CSV-only parser first
- menor riesgo y peso
- no cubre XLSX real (requerimiento crítico)
- insuficiente para archivos típicos de clientes (sólo CSV no es realista)
- útil como Fase 6D alternativa o fallback si el archivo es demasiado grande

### Option C: Backend parser later
- más seguro para archivos grandes
- evita bundle pesado en frontend
- requiere backend
- fuera del scope actual del prototipo frontend conversacional, pero es la opción correcta para producción a futuro

### Option D: Web Worker parser
- evita congelar la UI durante parseo
- agrega complejidad al prototipo
- útil si se autorizan archivos grandes
- puede ser una fase futura de optimización

## 6. Recommended Decision
- Autorizar `xlsx` como dependencia futura para prototipo local, pero NO instalar todavía en esta fase.
- Mantener CSV simple como fallback futuro.
- Mantener backend parser como opción futura productiva.
- Mantener Web Worker como optimización futura, no primera implementación.

## 7. Dependency Gate Result
- `DEPENDENCY_APPROVED_FOR_NEXT_PHASE = YES`
- `DEPENDENCY_TO_INSTALL_NEXT_PHASE = xlsx`
- `PACKAGE_CHANGE_ALLOWED_NEXT_PHASE_ONLY = YES`
- `PACKAGE_CHANGE_NOT_ALLOWED_IN_THIS_PHASE = YES`

## 8. Security and Privacy Assessment
- archivos procesados solo en memoria
- no storage ni persistencia local
- no upload productivo
- no Claude connection en parsing
- no envío externo
- se requiere advertencia PII antes de lectura
- se debe usar sampling seguro (limitar filas/columnas extraídas)

## 9. Performance Assessment
- tamaño máximo recomendado: estricto (ej. 25MB)
- límite de filas a muestrear para perfiles: restringido (ej. primeras 50-100 filas)
- límite de hojas: parsear sólo las necesarias o advertir
- fallback si archivo es grande: usar CSV simple o requerir backend
- worker futuro si la UI se bloquea

## 10. Parser Behavior Requirements
- header row detection dinámico
- soporte para introductory rows
- manejo de empty sheets
- manejo de merged/introductory title rows
- multiple survey detection (distintas hojas)
- detección de señales de PII en columnas
- typed warnings integrados al contrato
- required user decisions ante ambigüedades

## 11. SIIS-like Header Offset Case
- Archivos con 3 filas introductorias antes del header real (ejemplo clásico SIIS).
- El parser no debe asumir que el header está en row 0.
- Debe detectar header dinámicamente o solicitar confirmación.
- Para librerías tipo `xlsx`, se debe poder controlar `range` cuando aplique para ignorar filas previas.
- Este caso se documenta como patrón de robustez, no como implementación SIIS productiva directa.

## 12. Out of Scope
- instalar dependencia ahora
- crear el parser runtime
- lectura real de archivos
- integración UI
- conectar Claude
- implementar backend
- mostrar dashboard
- activar matching engine

## 13. Next Phase Recommendation
- Fase 6C: parser dependency installation + parser module scaffolding
(O si se decide más conservador: Fase 6C: parser type scaffolding sin instalación)
