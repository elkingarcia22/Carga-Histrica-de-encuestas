# SURVEY_FILE_ANALYSIS_CONTRACT.md

## 1. Purpose
Este documento define la estructura conceptual del contrato (`SurveyFileAnalysisContract`) que se genera como resultado del análisis determinístico de un archivo de encuesta. Este contrato sirve como medio de transporte entre la capa del Parser (que extrae la verdad del archivo) y la capa de IA / UI (que guía la revisión conversacional).

## 2. Contract Ownership
- **Parser es source of truth para estructura**: Cualquier inferencia que se haga sobre columnas, tipos o celdas parte del resultado inmutable de esta extracción.
- **IA es source of interpretation, not source of truth**: La IA enriquece, sugiere o mapea campos de este contrato, pero no puede alterar la estructura subyacente extraída por el parser.

## Estructura Conceptual del Contrato

```typescript
SurveyFileAnalysisContract {
  analysisId: string;
  files: FileSummary[];
  detectedSurveys: DetectedSurvey[];
  selectedSurvey: string | null;
  sheets: SheetSummary[];
  columns: ColumnDefinition[];
  demographics: DemographicDetection[];
  demographicValues: DemographicValueMap[];
  dimensions: DimensionDetection[];
  questions: QuestionDetection[];
  responsesSummary: ResponsesSummary;
  participantDetection: ParticipantDetection;
  participantMatches: ParticipantMatchResult[];
  piiDetection: PiiDetection;
  warnings: SystemWarning[];
  requiredUserDecisions: UserDecisionRequirement[];
  auditTrail: AuditEntry[];
}
```

## 3. File Summary
Resumen del archivo físico ingerido en el sandbox.
- `fileName`: Nombre del archivo.
- `fileSize`: Tamaño en bytes.
- `fileType`: Extensión (XLSX, CSV).
- `md5hash`: Firma del archivo original para validación.

## 4. Survey Detection
Identificación de encuestas lógicas dentro del archivo.
- `surveyId`: Identificador interno de la encuesta detectada.
- `name`: Posible nombre deducido (por nombre de hoja o celda inicial).
- `rowCount`: Número total de registros.

## 5. Sheet Detection
Inventario de hojas en archivos XLSX.
- `sheetName`: Nombre de la pestaña.
- `columnsCount`: Cantidad de columnas detectadas.
- `rowsCount`: Cantidad de filas.
- `isEmpty`: Bandera si está vacía.

## 6. Column Detection
El bloque más crítico. El parser define cada columna:
- `columnIndex`: Posición ordinal.
- `originalHeader`: Nombre exacto del encabezado.
- `normalizedHeader`: Nombre limpio.
- `inferredDataType`: Tipo de dato detectado (String, Integer, Float, Date, Boolean).
- `emptyCellsRatio`: Porcentaje de vacíos.

## 7. Demographic Detection
Mapeo tentativo de columnas que parecen demográficos.
- `columnReference`: Enlace a la columna.
- `proposedDemographicId`: Sugerencia de ID en catálogo UBITS.
- `confidenceScore`: Nivel de certeza del match.
- `matchReason`: Razón algorítmica.

## 8. Demographic Value Detection
Valores únicos dentro de un demográfico detectado.
- `demographicReference`: Enlace al demográfico.
- `originalValue`: Valor en la celda.
- `mappedValue`: Valor en catálogo o 'NEW' si debe crearse.

## 9. Dimension Detection
- `originalDimensionName`: Nombre extraído de los datos o agrupaciones.
- `mappedDimensionId`: ID de catálogo UBITS o 'NEW'.

## 10. Question Detection
- `columnReference`: Columna donde reside la pregunta.
- `originalQuestionText`: Texto extraído (generalmente el header).
- `mappedQuestionId`: ID en el catálogo de preguntas si aplica.
- `assignedDimensionId`: Dimensión a la que pertenece tentativamente.
- `matchType`: OFFICIAL, SIMILAR, NEW, HISTORICAL.

## 11. Response Scale Detection
Inferir el tipo de respuesta (ej. Likert 1-5, eNPS 0-10, Abierta).
- `questionReference`: Link a la pregunta.
- `detectedScaleType`: LIKERT_5, LIKERT_4, BOOLEAN, TEXT, ENPS.
- `minValue` / `maxValue`: Rangos extraídos empíricamente.

## 12. Participant Detection
Estrategia para columnas identificadoras.
- `isAnonymous`: Boolean (true si no hay PII ni identificadores de participante).
- `participantColumns`: Lista de columnas que parecen ser Email, Documento, ID, etc.

## 13. Participant Matching
- `totalParticipantsInFile`: Conteo.
- `exactMatches`: Coinciden con usuarios UBITS.
- `notFound`: Necesitan creación o mapeo manual.

## 14. PII Detection
- `hasPII`: Boolean.
- `piiColumns`: Columnas flaggeadas por posible contenido sensible (Sueldo, Teléfono, SSN).
- `riskLevel`: LOW, MEDIUM, HIGH.

## 15. Matching Results
Metadatos globales del motor de similitud (resumen de scores de todo el archivo).

## 16. User Decisions
Cola de decisiones estandarizadas pendientes que el agente conversacional debe resolver.
- `step`: A qué paso pertenece (Demographics, Dimensions, etc).
- `promptDescription`: Texto descriptivo para guiar a Claude.

## 17. Warnings and Risks
- Lista de advertencias (Ej. "Columna con 90% nulos", "Valores fuera de rango en escala").

## 18. Audit Trail
Registro inmutable.
- `timestamp`: Hora de la decisión.
- `action`: Acción del usuario (Ej. OVERRIDE_DEMOGRAPHIC_MATCH).
- `oldValue` / `newValue`.

## 19. Ready for Comparison Output
Estructura final que se exportará cuando el usuario termine de resolver el `requiredUserDecisions`.

## 20. Guardrails
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
