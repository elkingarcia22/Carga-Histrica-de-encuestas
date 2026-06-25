# Conversational Chat Foundation Architecture

## 1. Propósito

Definir que la base de chat debe:
- preservar estilos comunes;
- preservar iconos y avatares;
- preservar estado de “pensando”;
- preservar reglas de respuesta;
- manejar entradas ambiguas;
- manejar cancelación;
- manejar respuestas de seguridad;
- permitir conectar flujos de negocio sin romper el chat.

## 2. Separación de responsabilidades

Definir estas capas conceptuales:

- **ChatShell** = layout, input, scroll, contenedor y estructura visual.
- **MessageRenderer** = renderiza mensajes del usuario, agente, sistema, advertencias y errores.
- **ThinkingBehavior** = controla cuándo aparece “pensando”.
- **ConversationPolicy** = respuestas estándar ante entradas comunes.
- **IntentNormalization** = normaliza sí, no, aprobar, cancelar, números, texto libre.
- **SafetyResponsePolicy** = bloquea o redirige PII, lenguaje ofensivo, racista, discriminatorio o fuera de alcance.
- **FlowAdapter** = conecta el chat base con un flujo específico.
- **DomainFlow** = define pasos de negocio, por ejemplo Carga Histórica de Encuestas.

## 3. Comportamientos que deben ser invariantes

Documentar como invariantes:
- ASSISTANT_AVATAR_ALWAYS_VISIBLE = YES
- ASSISTANT_ICON_SYSTEM_CONSISTENT = YES
- THINKING_INDICATOR_BEFORE_AGENT_REPLY = YES
- NO_DIRECT_AGENT_REPLY_WITHOUT_THINKING = YES
- USER_MESSAGE_STYLE_CONSISTENT = YES
- ASSISTANT_MESSAGE_STYLE_CONSISTENT = YES
- SYSTEM_WARNING_STYLE_CONSISTENT = YES
- ERROR_MESSAGE_STYLE_CONSISTENT = YES
- SAFE_DETAILS_RENDERING = YES
- NO_RAW_MARKDOWN_LEAKS = YES
- NO_BROKEN_ICON_RENDERING = YES

## 4. Respuestas comunes obligatorias

Definir respuestas base para:
- entrada no entendida;
- respuesta fuera de opciones;
- confirmación ambigua;
- cancelación;
- reinicio;
- solicitud de ayuda;
- solicitud de detalles;
- solicitud fuera del flujo;
- intento de ver datos personales;
- lenguaje ofensivo;
- lenguaje racista o discriminatorio;
- intento de importar sin aprobación;
- intento de abrir dashboard/comparativo fuera de alcance.

Ejemplo de respuesta ante ambigüedad:
> No estoy seguro de cómo interpretar tu respuesta.
> Puedes responder con una de estas opciones:
> 1. Confirmar
> 2. Ver detalles
> 3. Cancelar importación

Ejemplo de respuesta ante PII:
> No puedo mostrar datos personales, respuestas individuales, correos, nombres o filas crudas. Puedo mostrarte solo resultados agregados y seguros.

Ejemplo ante lenguaje ofensivo o discriminatorio:
> No puedo ayudar a clasificar, etiquetar o procesar personas con lenguaje ofensivo, racista o discriminatorio. Reformula la instrucción usando criterios laborales o de segmentación permitidos.

## 5. Contrato de integración con flujos

Definir que cada flujo de negocio debe entregar al chat base:
- currentState
- availableActions
- messageToRender
- expectedUserInputs
- safeDetails
- nextState
- blockingReason

El chat base no debe conocer detalles de encuestas.
El flujo de encuesta se conecta mediante adapter.

## 6. Contrato para flujos mockup

Documentar que cualquier mockup futuro debe poder integrarse así:
- define sus estados;
- define prompts del agente;
- define respuestas esperadas;
- define validaciones;
- define salidas seguras;
- no modifica ChatShell;
- no modifica MessageRenderer;
- no modifica ThinkingBehavior;
- no modifica ConversationPolicy.

## 7. Relación con Carga Histórica de Encuestas

El flujo actual debe migrar gradualmente a esta base, sin reescribir todo en una sola fase.

Proponer fases futuras:
- 11D-H44-H2 · Chat Foundation Types
- 11D-H44-H3 · Chat Foundation Message Renderer
- 11D-H44-H4 · Chat Foundation Thinking Behavior
- 11D-H44-H5 · Chat Foundation Conversation Policy
- 11D-H44-H6 · Historical Import Flow Adapter
- 11D-H44-H7 · Visual QA del chat foundation
- 11D-H45 · Ambiguity Resolution Flow

## 8. Límites

Bloquear:
- NO_CHAT_REWRITE_IN_ONE_PHASE = YES
- NO_VISUAL_REGRESSION_ALLOWED = YES
- NO_FLOW_LOGIC_MIXED_WITH_CHAT_SHELL = YES
- NO_SAFETY_RULES_HARDCODED_INSIDE_COMPONENTS = YES
- NO_DOMAIN_SPECIFIC_COPY_INSIDE_CHAT_BASE = YES
- NO_DASHBOARD_OR_COMPARISON_CHANGES = YES
- NO_IMPORT_EXECUTION = YES
- NO_SANDBOX_IMPORT_RUNTIME = YES
- NO_RESULT_LINK_CREATED = YES

## Marcadores
- PHASE_11D_H44_H1_CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE_COMPLETE
- CONVERSATIONAL_CHAT_FOUNDATION_ARCHITECTURE_LOCKED
- CHAT_SHELL_LAYER_DEFINED
- MESSAGE_RENDERER_LAYER_DEFINED
- THINKING_BEHAVIOR_LAYER_DEFINED
- CONVERSATION_POLICY_LAYER_DEFINED
- INTENT_NORMALIZATION_LAYER_DEFINED
- SAFETY_RESPONSE_POLICY_LAYER_DEFINED
- FLOW_ADAPTER_LAYER_DEFINED
- DOMAIN_FLOW_LAYER_DEFINED
- CHAT_BEHAVIOR_INVARIANTS_DEFINED
- COMMON_RESPONSES_DEFINED
- MOCKUP_FLOW_INTEGRATION_CONTRACT_DEFINED
- HISTORICAL_IMPORT_FLOW_ADAPTER_FUTURE_PHASE_DEFINED
- NO_SRC_CHANGES
- NO_RUNTIME_UI_INTEGRATION
- NO_IMPORT_EXECUTION
- NO_SANDBOX_IMPORT_RUNTIME
- NO_RESULT_LINK_CREATED
- NO_DASHBOARD_OR_COMPARISON_CHANGES
- READY_FOR_COMPARISON_OUTPUT_DISABLED
- VISIBLE_UI_CHECKPOINT_NO
- PHASE_11D_H44_H2_CHAT_FOUNDATION_TYPES_READY
- R1H5_DEFINED_BUT_NOT_TRIGGERED
