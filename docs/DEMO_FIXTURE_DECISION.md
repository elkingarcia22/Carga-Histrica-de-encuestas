# Demo Fixture Decision

## 1. Propósito

El fixture demo permite simular una experiencia funcional con los archivos QS Clima 2024/2025 ya analizados, sin afirmar que el sistema puede importar cualquier Excel histórico.

## 2. Alcance del fixture

- QS Clima 2025
- QS Clima 2024
- archivos totales
- archivos por gerencia
- hojas Clima, Engagement, eNPS cuando aplique
- estructura agregada por filas
- estructura raw responses by columns para 2024 cuando aplique

## 3. Qué puede contener el fixture

- surveyCycle
- surveyName
- sourceFiles
- sheets
- dimensions
- questions
- questionToDimensionMapping
- metrics
- demographics
- segments
- privacySignals
- reviewDecisions

## 4. Qué NO puede contener

- respuestas individuales reales
- comentarios abiertos reales
- correos
- documentos
- nombres
- IDs personales reales
- PII
- raw rows completos
- workbook dumps
- raw JSON completo
- binary/base64

## 5. Fuente inmutable + overlay

- source fixture layer = representa estructura curada del caso demo;
- review overlay layer = representa ajustes humanos futuros;
- la UI futura no modifica la fuente original;
- renombrar o mover preguntas solo cambia la organización visible.

## 6. Reglas de honestidad del prototipo

- No mostrar al usuario final que esto es importación productiva.
- No afirmar que se soportan todos los formatos Excel.
- No afirmar que se importan datos reales.
- No conectar backend.
- No usar Claude.
- No hacer persistencia real.
- No activar comparativo.

## 7. Relación con fases futuras

- 11D-H24 · Demo Fixture Data Contract
- 11D-H25 · Demo Fixture QS Clima Data
- 11D-H26 · Structure Review Visual List from Demo Fixture
- 11D-H27 · Visual QA
- 11D-H28 · Hotfix si aplica
- 11D-H29 · Controlled Overlay Editing Architecture

## 8. Primer objetivo visual futuro

Revisión de estructura

- Dimensiones detectadas: N
- Preguntas/ítems detectados: N
- Demográficos detectados: N
- Métricas detectadas: N
- Segmentos/cortes detectados: N

Dimensión A
- Pregunta 1
- Pregunta 2

Dimensión B
- Pregunta 3
- Pregunta 4
