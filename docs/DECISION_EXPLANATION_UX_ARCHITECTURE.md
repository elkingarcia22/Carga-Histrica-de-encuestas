# Decision Explanation UX Architecture

## 1. Purpose
Definir cómo la Carga Histórica de Encuestas debe explicar hallazgos, warnings y decisiones al usuario.
El sistema no debe mostrar códigos técnicos como mensaje principal. Los códigos técnicos pueden existir internamente, pero no deben ser la experiencia visible.

## 2. Current Problem
- warnings aparecen como IDs o códigos técnicos
- decisiones aparecen como tipos internos
- el usuario no entiende qué problema existe
- el usuario no entiende qué impacto tiene
- el usuario no sabe qué opción elegir
- la carga histórica pierde confianza operacional

Ejemplos actuales problemáticos:
- `multiple_sheets_detected`
- `unsupported_columns`
- `select_primary_sheet`
- Resolver Ambigüedad
- Quedan 2 decisiones pendientes

## 3. Target UX
Cada hallazgo debe presentarse con:
- Título claro
- Qué detecté
- Por qué importa
- Impacto en la carga histórica
- Recomendación
- Acciones contextuales
- Consecuencia de cada acción

## 4. Decision Explanation Contract
Contrato conceptual de presentación para decisiones.
Campos requeridos:
- `title`
- `detectedIssue`
- `whyItMatters`
- `historicalLoadImpact`
- `recommendation`
- `primaryQuestion`
- `actions`

Cada acción debe tener:
- `label`
- `intent`
- `consequence`
- `riskLevel`

*(Nota: No implementar TypeScript en esta fase. Solo documentar el contrato UX).*

## 5. Warning Explanation Contract
Cada warning debe mapearse a una explicación visible.
Campos sugeridos:
- `warningTitle`
- `whatDetected`
- `whyItMatters`
- `impactIfIgnored`
- `recommendedNextStep`
- `severity`

## 6. Technical Codes Visibility Rule
Bloquear esta regla: `TECHNICAL_CODES_HIDDEN_FROM_USER = YES`

No mostrar como copy principal:
- `multiple_sheets_detected`
- `unsupported_columns`
- `select_primary_sheet`
- `select_primary_survey_group`
- `ambiguous_column`

Los códigos pueden quedar solo para auditoría interna o debugging no visible.

## 7. Decision Copy Patterns

### Múltiples grupos / ciclos detectados
- **Título**: Encontré más de una encuesta en los archivos cargados
- **Qué detecté**: Detecté grupos que parecen corresponder a encuestas distintas, por ejemplo Clima 2025, General 2025 y Clima 2024.
- **Por qué importa**: La carga histórica se procesa una encuesta a la vez. Si mezclamos ciclos o estructuras distintas, las preguntas, demográficos y participantes pueden quedar mal clasificados.
- **Recomendación**: Te recomiendo procesar primero el grupo con mayor consistencia estructural.
- **Acciones**:
  - Procesar Clima 2025
  - Procesar General 2025
  - Procesar Clima 2024
  - Ver detalle de grupos
  - Cancelar

### Varias hojas detectadas
- **Título**: Encontré varias hojas que podrían contener datos de encuesta
- **Impacto**: Necesito saber cuál hoja representa la encuesta que quieres cargar. Si elegimos una hoja incorrecta, el sistema podría leer columnas que no corresponden a respuestas reales.
- **Acciones**:
  - Procesar hoja Clima
  - Procesar hoja Resultados
  - Ver detalle de hojas

### Columnas no reconocidas
- **Título**: Hay columnas que no pude clasificar automáticamente
- **Qué detecté**: Algunas columnas no coinciden claramente con preguntas, demográficos, campos técnicos o identificadores de participantes.
- **Impacto**: Si no las revisamos, podrían quedar fuera de la carga histórica o clasificarse de forma incorrecta.
- **Acciones**:
  - Revisar columnas ambiguas
  - Ignorar columnas no reconocidas

### Posibles datos personales
- **Título**: Detecté posibles datos personales
- **Qué detecté**: Encontré columnas que podrían contener nombre, correo, documento u otros identificadores.
- **Impacto**: Esto puede afectar privacidad y también la forma en que se relacionan respuestas históricas con participantes.
- **Acciones**:
  - Excluir columnas sensibles
  - Tratar encuesta como anónima
  - Revisar identificadores detectados

### Preguntas no homologables
- **Título**: No encontré suficientes preguntas homologables automáticamente
- **Impacto**: La encuesta puede cargarse históricamente, pero algunas preguntas podrían quedar como nuevas o no comparables con catálogos existentes.
- **Acciones**:
  - Revisar preguntas detectadas
  - Marcar preguntas como no homologadas
  - Continuar como carga histórica no homologada

## 8. Action Consequence Rules
Cada acción debe explicar consecuencia.

Ejemplos:
- **Procesar Clima 2025**
  - Consecuencia: el análisis continuará solo con los archivos de este grupo.
- **Ignorar columnas no reconocidas**
  - Consecuencia: esas columnas no se incluirán en la carga histórica inicial.
- **Excluir columnas sensibles**
  - Consecuencia: los identificadores no se usarán para asociar respuestas con participantes.

## 9. Recommendation Rules
El sistema puede recomendar cuando exista señal suficiente:
- más archivos en un grupo
- año más reciente
- archivo total detectado
- headers más consistentes
- menor cantidad de warnings
- nombre más cercano a encuesta principal

Si no hay confianza suficiente: "No recomiendo una opción automáticamente porque los grupos tienen señales similares."

## 10. Chat Body Responsibility
El chat debe mostrar:
- explicaciones claras
- hallazgo actual
- decisión actual
- acciones contextuales
- recomendación
- consecuencia de acción

No debe mostrar:
- contrato completo
- JSON masivo
- IDs técnicos como contenido principal
- cola completa de decisiones
- dashboard comparativo
- ready for comparison
- grilla grande de archivos

## 11. Out of Scope
Fuera de esta fase:
- implementación UI
- parser changes
- assembler changes
- matching engine
- Claude
- backend
- storage
- dashboard
- comparación de encuestas
- datos reales embebidos
- nuevas rutas

## 12. Phase Plan
- Fase 8D-H5B: Decision Explanation UX Build.
- Fase 8D-H5C: Decision Explanation UX QA.
- Luego Fase 9B-R: Matching Engine Type Scaffolding Reconciliation.
- Luego Fase 9C: Matching Engine v1 para carga histórica, no comparativo.
