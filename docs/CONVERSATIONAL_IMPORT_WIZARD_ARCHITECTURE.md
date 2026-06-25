# Conversational Import Wizard Architecture

## 1. Propósito
Conversational Import Wizard convierte el flujo de carga histórica en una conversación guiada, donde el agente solicita datos, valida interpretaciones, resuelve ambigüedades y prepara una importación sandbox sin sacar al usuario del chat.

## 2. Principios de UX
ALL_ACTIONS_BY_CHAT_TEXT_ONLY = YES
NO_TABS = YES
NO_SIDE_PANEL_EDITOR = YES
NO_FORM_BASED_WIZARD = YES
NO_TABLE_BASED_MAPPING_UI = YES
NO_BUTTON_DEPENDENT_FLOW = YES

Los botones pueden existir solo para subir archivos o enviar mensaje.
La decisión de negocio debe ocurrir escribiendo en el chat.

## 3. Flujo conversacional completo
idle
files_uploaded
detecting_survey_scope
awaiting_survey_scope_selection
asking_general_configuration
confirming_survey_name
confirming_survey_type
confirming_visibility
confirming_confidentiality_threshold
reviewing_structure_match
reviewing_questions_and_scales
reviewing_demographics
reviewing_participants_or_responses
reviewing_dimensions
reviewing_question_dimension_mapping
reviewing_segments
resolving_ambiguity
structure_approved
reviewing_detected_results
draft_preview_ready
awaiting_import_confirmation
sandbox_import_completed
import_cancelled

## 4. Selección de encuesta/ciclo
Cuando haya más de una encuesta/ciclo:

Detecté más de una encuesta o ciclo en los archivos cargados.

1. QS Clima 2025
2. QS Clima 2024
3. Carga histórica multicíclo QS Clima 2024/2025

¿Qué quieres procesar primero? Responde 1, 2 o 3.

Debe aceptar número o texto.

## 5. Configuración general por chat
Después de elegir scope, el agente debe preguntar uno por uno:

1. Nombre de la encuesta
2. Tipo de encuesta
3. Visibilidad y confidencialidad
4. Umbral mínimo de confidencialidad
5. Archivo principal
6. Archivos asociados/cortes

Ejemplo:
Nombre sugerido: QS Clima 2025.
¿Quieres usar este nombre o escribir otro?

## 6. Match conversacional por secciones
El agente debe presentar el match detectado por secciones, no como tabla editable:

1. Preguntas y escalas
2. Demográficos
3. Participantes / respuestas
4. Dimensiones
5. Mapeo pregunta-dimensión
6. Segmentos/cortes
7. Privacidad

Cada sección debe mostrar:
- detectados;
- alineados;
- nuevos;
- por revisar;
- no interpretables;
- recomendación;
- pregunta de confirmación si aplica.

## 7. Manejo de ambigüedades
Si algo no hace match, el agente debe preguntar solo por ese punto.

Ejemplo:
Encontré una pregunta sin dimensión clara:

“¿Recomendarías trabajar aquí?”

¿Qué hacemos?
1. Asociarla a eNPS
2. Asociarla a Engagement
3. Marcarla como pregunta sin dimensión
4. Ignorarla para esta carga

## 8. Reglas de confirmación
Para ajustes puntuales, solo aceptar:
aprobar
cancelar

Para decisiones de menú, aceptar número o texto.

Si hay una respuesta ambigua:
Para confirmar este ajuste, responde exactamente “aprobar” o “cancelar”.

## 9. Aprobación de estructura
Después de revisar estructura:

La estructura está lista para revisar resultados detectados.

¿Qué quieres hacer?
1. Aprobar estructura y revisar resultados
2. Ajustar nombres de dimensiones o preguntas
3. Ver archivos usados
4. Cancelar importación

## 10. Revisión de resultados detectados
Después de aprobar estructura, mostrar:

📊 Resultados detectados

- Métricas agregadas disponibles
- Participación / respuestas agregadas
- Favorabilidad
- eNPS
- Segmentos por gerencia
- Privacidad

No mostrar respuestas individuales.
No mostrar comentarios abiertos.
No mostrar PII.
No mostrar raw rows.

## 11. Preparación de importación sandbox
Definir que la importación de esta fase futura será sandbox/mock.

SANDBOX_IMPORT_ONLY = YES
REAL_IMPORT_NOT_AUTHORIZED = YES

El agente debe decir:
Puedo preparar una importación sandbox para validar el flujo. Esto no crea una encuesta productiva ni guarda datos reales en UBITS.

## 12. Confirmación final de importación
El agente debe preguntar:

¿Quieres importar esta encuesta en modo sandbox?

Responde:
1. Importar en sandbox
2. Ver preview del borrador
3. Cancelar importación

Solo si responde explícitamente:
importar
importar en sandbox
1
se completa la importación simulada.

## 13. Enlace mock a resultados
Después de importación sandbox:

Importación sandbox completada.

Puedes revisar la vista de resultados aquí:
sandbox:/ubits/encuestas/qs-clima-2025/resultados

Aclarar:
Este enlace es simulado para prototipo. No corresponde a una encuesta productiva real.

No crear ruta real todavía.

## 14. Cancelación
Si el usuario escribe:
cancelar importación
cancelar carga
cancelar proceso
reiniciar
empezar de nuevo

El agente debe responder:
Importación cancelada. Puedes volver a subir los archivos para iniciar una nueva carga histórica.

## 15. Privacidad
NO_REAL_RESPONSES_VISIBLE = YES
NO_OPEN_TEXT_VISIBLE = YES
NO_PII_VISIBLE = YES
NO_RAW_ROWS_VISIBLE = YES
NO_WORKBOOK_DUMP_VISIBLE = YES
NO_API_CONNECTIONS = YES
NO_STORAGE_CREATED = YES
NO_CLAUDE_CONNECTION_CREATED = YES

## 16. Relación con fases futuras
11D-H42 · Conversational Wizard State Types
11D-H43 · General Configuration Conversational Flow
11D-H44 · Conversational Match Review Flow
11D-H45 · Ambiguity Resolution Flow
11D-H46 · Sandbox Import Confirmation Flow
11D-H47 · Sandbox Import Result Link UI
11D-H48 · Conversational Wizard Visual QA
11D-H49 · Hotfix si aplica
11D-H50 · Real Import Execution Decision Gate
