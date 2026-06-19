# Synthetic File Mount Flow Architecture · Comparativo de Encuestas UBITS

## 1. Architecture Decision
- SYNTHETIC_FILE_MOUNT_FLOW_ARCHITECTURE_LOCKED = YES
- ENTRY_POINT = QUICK_ACTION_MONTAR_ARCHIVOS_SINTETICOS
- UPLOAD_MODE = SYNTHETIC_ONLY
- REAL_UPLOAD_ENABLED = NO
- FILE_PROCESSING_ENABLED = NO
- PARSER_RUNTIME_ENABLED_IN_UI = NO
- NEXT_ACTION = REVIEW_DETECTED_STRUCTURE

## 2. Product Goal
Permitir que el usuario inicie el flujo de importación desde el chat sin cargar archivos reales. El sistema simula archivos sintéticos listos para revisión estructural.

## 3. Entry Point
- Quick action: Montar archivos sintéticos
- Ubicación: panel principal del chat, debajo del composer
- Contexto: estado inicial del chat
- No debe abrir file picker.
- No debe usar drag and drop real.

## 4. Conversation Flow
1. INITIAL_CHAT_SHELL
2. USER_TRIGGERED_SYNTHETIC_MOUNT
3. ASSISTANT_PREPARING_SYNTHETIC_FILES
4. SYNTHETIC_FILES_STAGED
5. READY_TO_REVIEW_SYNTHETIC_STRUCTURE

Mensajes sugeridos:
Usuario/acción:
"Montar archivos sintéticos"

Asistente:
"Listo. Preparé dos archivos sintéticos de encuesta para revisar su estructura antes de generar el comparativo."

Nota de boundary:
Sandbox sintético: no se cargaron archivos reales ni se procesaron XLSX reales.

## 5. Session States
- INITIAL_CHAT_SHELL: muestra saludo, composer y quick actions.
- MOUNTING_SYNTHETIC_FILES: estado breve/mock, sin async real obligatorio.
- SYNTHETIC_FILES_STAGED: muestra cards de archivos sintéticos.
- READY_TO_REVIEW_STRUCTURE: habilita acción "Revisar estructura detectada".
- SYNTHETIC_MOUNT_ERROR: solo error mock, no error real de archivo.

## 6. Synthetic Mounted File Contract
```typescript
interface SyntheticMountedSurveyFile {
  id: string
  displayName: string
  periodLabel: string
  surveyType: "clima"
  fileKind: "xlsx_mock"
  source: "synthetic"
  status: "staged" | "ready_for_review"
  rowsLabel: string
  sheetsLabel: string
  safetyLabel: string
}
```

Instancias mock sugeridas:
1. `encuesta-clima-2024-sintetica.xlsx`
   - periodLabel: 2024
   - surveyType: clima
   - fileKind: xlsx_mock
   - source: synthetic
   - status: staged
2. `encuesta-clima-2025-sintetica.xlsx`
   - periodLabel: 2025
   - surveyType: clima
   - fileKind: xlsx_mock
   - source: synthetic
   - status: staged

No usar datos reales ni métricas reales de cliente.

## 7. Assistant Message Contract
```typescript
interface SyntheticMountAssistantMessage {
  id: string
  role: "assistant"
  type: "synthetic_file_mount_summary"
  title: string
  body: string
  files: SyntheticMountedSurveyFile[]
  boundaryNote: string
  nextActions: SyntheticMountNextAction[]
}
```

Next actions:
- Revisar estructura detectada
- Cambiar archivos sintéticos
- Ver formato esperado

## 8. File Card Presentation Rules
- Cards sobrias.
- Nombre del archivo.
- Periodo.
- Tipo de encuesta.
- Estado: Listo para revisión.
- Nota: Sintético.
- No mostrar ruta local.
- No mostrar tamaño real.
- No mostrar upload progress real.

## 9. Next Action Rules
- Revisar estructura detectada: puede mover el estado a READY_TO_REVIEW_STRUCTURE. Puede revelar la revisión de estructura en una fase posterior. No debe activar parser real.
- Cambiar archivos sintéticos: vuelve a estado inicial o re-staged mock.
- Ver formato esperado: muestra texto o mensaje mock.

## 10. Relationship With Inline Structure Review
Inline Structure Review existe como capacidad ya construida, pero permanece oculta por defecto.
Solo debe aparecer después de que el usuario solicite revisar estructura detectada.
No mostrar InlineReviewPanel automáticamente al montar archivos sintéticos si esta fase no lo construye.

## 11. Mock Data Rules
- Todo mock debe vivir en conversationalImportMock.ts o archivo mock del feature.
- No hardcodear arrays de negocio en componentes visuales.
- No usar datos reales de clientes.

## 12. Boundary Rules
- NO_REAL_UPLOAD_CREATED
- NO_FILE_INPUT_CREATED
- NO_PRODUCTIVE_FILE_PROCESSING
- NO_REAL_CLIENT_DATA
- NO_INSIGHTS_AI_YET
- NO_API_CONNECTIONS
- NO_STORAGE
- NO_PARSER_RUNTIME_IN_UI

## 13. Visual Rules
- Mantener shell visual aprobado.
- No volver al layout dashboard.
- No mostrar panel derecho inicial.
- No mostrar estructura detectada por defecto.
- No usar HEX.
- No usar text-white.
- No usar arbitrary values.
- No usar blue/green/red/amber/yellow/slate literals.
- Usar tokens UBITS semánticos.

## 14. Accessibility Rules
- Quick action con texto visible.
- Cards de archivo con nombre legible.
- Estado sintético comunicado en texto, no solo color.
- Botones navegables por teclado.
- Mensaje del asistente legible por screen readers.
- No controles sin acción.

## 15. QA Criteria
- No test files changed
- No source files changed
- No package files changed
- Documentation fully specifies the flow boundaries

## 16. Next Authorized Phase
- CHAT_VIS3B_SYNTHETIC_FILE_MOUNT_BUILD_READY

## 17. Final Status Markers
- PHASE_4K_CHAT_VIS3A_COMPLETE
- SYNTHETIC_FILE_MOUNT_FLOW_ARCHITECTURE_LOCKED
- CHAT_VIS3B_SYNTHETIC_FILE_MOUNT_BUILD_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED
