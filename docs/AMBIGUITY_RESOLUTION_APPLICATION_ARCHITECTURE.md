# Ambiguity Resolution Application Architecture

## 1. Propósito

Esta arquitectura define cómo aplicar resoluciones tipadas desde respuestas textuales del usuario en el flujo de preparación de carga histórica de encuestas.

Estado actual antes de esta fase:

- **Detección ya existe** (`detectHistoricalImportAmbiguities` en H47) — produce `AmbiguityResolutionSnapshot`.
- **Conversación ya existe** (`mapAmbiguityResolutionToChatMessages` en H48) — convierte snapshot en mensajes de chat.
- **Runtime visibility ya existe** (H49) — `MultipleSurveyScopeAmbiguity` visible en el chat real.
- **Runtime mapper ya existe** (`mapWorkspaceToAmbiguityDetectionInput` en H49) — construye input sanitizado desde el workspace.

Lo que **falta** es una capa de aplicación tipada que:

1. Capture la respuesta textual del usuario.
2. La valide contra la ambigüedad activa (`ActiveAmbiguity.expectedInput`).
3. Produzca un patch/command tipado.
4. Lo aplique al estado del workspace de forma determinística y segura.

Esta fase solo diseña el contrato. No se implementa código.

---

## 2. Boundary de responsabilidades

```
Chat Foundation
  └── Renderiza mensajes, no interpreta respuestas de negocio.
  └── Normaliza intents básicos (affirm, deny, choose_option, provide_value).
  └── No sabe de ambigüedades, tipos de encuesta, ni estado del wizard.

Flow Adapter
  └── Traduce estado del wizard a mensajes de Chat Foundation.
  └── Traduce intents normalizados de vuelta a comandos de dominio.
  └── No aplica resoluciones de ambigüedad.

Ambiguity Detection Mapper (H47)
  └── detectHistoricalImportAmbiguities(input)
  └── Detecta ambigüedades a partir de un snapshot sanitizado.
  └── Produce AmbiguityResolutionSnapshot.
  └── No aplica resoluciones.

Ambiguity Conversation Mapper (H48)
  └── mapAmbiguityResolutionToChatMessages(snapshot)
  └── Convierte snapshot en mensajes de chat.
  └── No aplica resoluciones.

Ambiguity Runtime Mapper (H49)
  └── mapWorkspaceToAmbiguityDetectionInput(context)
  └── Construye AmbiguityDetectionInput sanitizado desde el workspace.
  └── No aplica resoluciones.

Ambiguity Resolution Application Layer (NUEVO — diseño de esta fase)
  └── Recibe: (activeAmbiguity, userText, currentStateSnapshot)
  └── Valida la respuesta contra expectedInput.
  └── Produce: AmbiguityResolutionApplicationResult (patch/command tipado).
  └── Es puro, determinístico, sin side effects.

ConversationalImportWorkspace
  └── Mantiene el estado del wizard.
  └── Aplica el patch/command producido por la capa de aplicación.
  └── Transiciona al siguiente paso del flujo según el resultado.
  └── Delega render a Chat Foundation.
```

---

## 3. Contrato de entrada

La capa de aplicación necesita un snapshot sanitizado de entrada:

```text
Input contract: AmbiguityResolutionApplicationInput
```

Campos conceptuales:

```
activeAmbiguity: ActiveAmbiguity
  └── La ambigüedad activa actual (del snapshot H47).
  └── Contiene: type, status, options, expectedInput, privacyFlags, severity.

userTextSanitized: string
  └── Texto del usuario sanitizado (trim, length-cap, sin control chars).
  └── No PII, no raw rows, no open text, no workbook dump.
  └── El workspace debe sanitizar antes de pasar a esta capa.

currentWizardStep: string
  └── Estado actual del wizard (e.g. "awaiting_survey_scope_selection").
  └── Usado para validar que la ambigüedad corresponde al paso actual.

availableOptions: readonly AmbiguityResolutionOption[]
  └── Opciones disponibles para resolver la ambigüedad activa.
  └── Se deriva de activeAmbiguity.options.

privacyFlags: AmbiguityPrivacyFlags
  └── Flags de privacidad de la ambigüedad activa.
  ── Si privacyRisk=true, la resolución debe bloquearse hasta confirmación.
```

Reglas de sanitización del input:

```
NO_PII = YES
NO_RAW_ROWS = YES
NO_OPEN_TEXT = YES
NO_WORKBOOK_DUMP = YES
NO_REAL_CLIENT_DATA = YES
```

---

## 4. Contrato de salida

La capa de aplicación produce un resultado tipado:

```text
Output contract: AmbiguityResolutionApplicationResult
```

Estados posibles (`status`):

| Estado | Significado |
|--------|-------------|
| `applied` | Resolución válida, se produjo un patch de estado. |
| `invalid_input` | Input no válido para la ambigüedad activa. |
| `needs_clarification` | Input ambiguo, se necesita más información. |
| `blocked_privacy` | La ambigüedad tiene riesgo de privacidad, bloquea resolución. |
| `out_of_scope_redirect` | El usuario solicitó algo fuera de alcance. |
| `no_active_ambiguity` | No hay ambigüedad activa, no se aplica nada. |

Campos conceptuales del resultado:

```
resolutionId: string (deterministic, derivado de ambiguityId + turno)
ambiguityType: AmbiguityType
selectedOptionId?: string
  └── Opción seleccionada por el usuario (para numeric_choice).

statePatch?: object
  └── Parche conceptual para aplicar al estado del workspace.
  └── Ejemplo: { selectedSurveyScope: "qs_clima_2025" }
  └── No mutation directa — el workspace aplica el patch.

nextWizardStep: string
  └── Siguiente paso del wizard después de aplicar la resolución.
  └── Ejemplo: "confirming_survey_name"

agentFollowUpMessageIntent: string
  └── Intención del mensaje de seguimiento del asistente.
  └── Ejemplo: "scope_selected_proceed_to_general_config"

privacySafeDetails?: string
  └── Detalles seguros sobre la resolución aplicada (sin PII).
  └── Solo si privacyFlags requiere explicación.

validationMessage?: string
  └── Mensaje para el usuario si el input no es válido.
  └── Ejemplo: "Por favor responde 1, 2 o 3."

auditNote: string
  └── Nota de auditoría (no se renderiza al usuario).
```

---

## 5. Reglas para MultipleSurveyScopeAmbiguity

Primera ambigüedad soportada por la capa de aplicación.

Configuración:

```
active ambiguity        = MultipleSurveyScopeAmbiguity
expectedInput.kind      = "numeric_choice"
validOptionIds          = ["multiple-survey-scope-ambiguity-opt-1",
                           "multiple-survey-scope-ambiguity-opt-2",
                           "multiple-survey-scope-ambiguity-opt-3"]
```

Entrada válida:

```
userText "1" → normalizedSelectionId = opt-1 → selectedSurveyScope = "qs_clima_2025"
userText "2" → normalizedSelectionId = opt-2 → selectedSurveyScope = "qs_clima_2024"
userText "3" → normalizedSelectionId = opt-3 → selectedSurveyScope = "qs_clima_multicycle_2024_2025"
```

Entrada inválida:

```
userText "4"      → invalid_input → "Por favor responde 1, 2 o 3."
userText "texto"   → invalid_input → "Por favor responde 1, 2 o 3."
userText ""        → invalid_input → "Por favor responde una opción."
```

State patch producido:

```
{
  selectedSurveyScope: "qs_clima_2025" | "qs_clima_2024" | "qs_clima_multicycle_2024_2025",
  conversationalEditState: "confirming_survey_name"
}
```

Siguiente paso del wizard:

```
nextWizardStep = "confirming_survey_name"
```

Mantiene:

```
USER_RESPONSE_1_STILL_ADVANCES_TO_GENERAL_CONFIGURATION = YES
TEXT_ONLY_RESOLUTION_PRESERVED = YES
NO_DUPLICATE_SCOPE_SELECTION_MESSAGES = YES
NO_ACTION_BUTTONS_FOR_REVIEW = YES
ALL_ACTIONS_BY_CHAT_TEXT_ONLY = YES
```

---

## 6. Reglas para inputs inválidos

Cuando el usuario responde algo no válido:

```
- No mutar estado del workspace.
- Explicar brevemente por qué el input no es válido.
- Repetir las opciones disponibles como texto (no botones).
- Mantener la ambigüedad activa (no avanzar de paso).
- No crear botones de acción.
- No caer a importación.
- No avanzar a configuración general ni a match review.
```

Flujo para input inválido:

```
1. Capa de aplicación retorna { status: "invalid_input", validationMessage }
2. Workspace no aplica patch.
3. Workspace envía mensaje con validationMessage.
4. Workspace mantiene conversationalEditState actual.
5. Usuario puede intentar de nuevo.
```

---

## 7. Privacidad y seguridad

Reglas de privacidad en la capa de aplicación:

```
NO_PII_VISIBLE:
  └── La capa de aplicación nunca recibe PII.
  └── UserText ya debe estar sanitizado antes de llegar.

NO_RAW_ROWS_VISIBLE:
  └── La capa de aplicación no recibe ni produce raw rows.

NO_OPEN_TEXT_VISIBLE:
  └── Respuestas abiertas de encuesta no entran a esta capa.

NO_WORKBOOK_DUMP_VISIBLE:
  └── Dumps de Excel no entran a esta capa.

NO_REAL_CLIENT_DATA:
  └── Solo datos sintéticos/demo/fixture.
```

Privacy blocking:

```
SI activeAmbiguity.privacyFlags.privacyRisk = true
  └── La capa de aplicación retorna { status: "blocked_privacy" }
  └── No se aplica resolución normal.
  └── Se requiere confirmación explícita del usuario.
  └── privacy blocking gana sobre cualquier otra regla de resolución.

SI activeAmbiguity.type = "OutOfScopeRequestAmbiguity"
  └── La capa de aplicación retorna { status: "out_of_scope_redirect" }
  └── No se modifica estado del workspace.
  └── Se redirige al usuario al flujo de preparación.
```

---

## 8. Orden de precedencia

Orden conceptual en que la capa de aplicación evalúa y resuelve:

```text
1. NO_ACTIVE_AMBIGUITY
   └── No hay ambigüedad activa.
   └── No se aplica nada. Flujo normal.

2. BLOCKING_PRIVACY_AMBIGUITY
   └── privacyFlags.privacyRisk = true.
   └── Bloquea cualquier resolución hasta confirmación explícita.
   └── Retorna: { status: "blocked_privacy" }

3. OUT_OF_SCOPE_AMBIGUITY
   └── type = "OutOfScopeRequestAmbiguity".
   └── No modifica estado. Redirige al flujo de preparación.
   └── Retorna: { status: "out_of_scope_redirect" }

4. ACTIVE_AMBIGUITY_WITH_VALID_INPUT
   └── expectedInput validado correctamente.
   └── Se produce statePatch.
   └── Se define nextWizardStep.
   └── Retorna: { status: "applied", statePatch, nextWizardStep }

5. ACTIVE_AMBIGUITY_WITH_INVALID_INPUT
   └── expectedInput no válido.
   └── No se muta estado.
   └── Se mantiene ambigüedad activa.
   ── Retorna: { status: "invalid_input", validationMessage }

6. ACTIVE_AMBIGUITY_WITH_AMBIGUOUS_INPUT
   └── Input no claramente válido ni inválido.
   └── Se necesita aclaración.
   └── Retorna: { status: "needs_clarification" }
```

---

## 9. Estado y side effects

La capa de aplicación debe ser:

```
DETERMINISTIC = YES
  └── Mismo input siempre produce mismo output.
  └── No depende de estado externo, hora, ni random.

NO_DATE = YES
  └── No usa Date, Date.now(), new Date().

NO_MATH_RANDOM = YES
  └── No usa Math.random ni cualquier fuente de aleatoriedad.

NO_STORAGE = YES
  └── No usa localStorage, sessionStorage, IndexedDB.

NO_FETCH = YES
  └── No llama APIs ni servicios externos.

NO_IMPORT_EXECUTION = YES
  └── No ejecuta importación real ni sandbox.

NO_DASHBOARD_OR_COMPARISON = YES
  └── No crea dashboard ni vista comparativa.

NO_INPUT_MUTATION = YES
  └── No muta el input recibido.
  └── Produce un nuevo objeto de resultado.

NO_SIDE_EFFECTS = YES
  └── No modifica estado global, DOM, ni archivos.
  └── Solo produce un resultado tipado para que el workspace lo consuma.
```

---

## 10. Testing strategy futura (H54 en adelante)

Cuando se implemente la capa de aplicación, se debe probar:

```
INPUT_1_RESOLVES_TO_QS_CLIMA_2025 = YES
  └── activeAmbiguity.type = MultipleSurveyScopeAmbiguity
  └── userText = "1"
  └── Result: statePatch.selectedSurveyScope = "qs_clima_2025"

INPUT_2_RESOLVES_TO_QS_CLIMA_2024 = YES
INPUT_3_RESOLVES_TO_MULTICICLO = YES

INVALID_INPUT_MAINTAINS_AMBIGUITY = YES
  └── userText = "4" → status = "invalid_input"
  └── No se produce statePatch.
  └── expectedInput.kind preserved.

INVALID_TEXT_MAINTAINS_AMBIGUITY = YES
  └── userText = "texto arbitrario" → status = "invalid_input"

EMPTY_INPUT_MAINTAINS_AMBIGUITY = YES
  └── userText = "" → status = "invalid_input"

NO_ACTIVE_AMBIGUITY_RETURNS_NOOP = YES
  └── activeAmbiguity = undefined → status = "no_active_ambiguity"

PRIVACY_BLOCKS_RESOLUTION = YES
  └── privacyFlags.privacyRisk = true
  └── userText = "1" → status = "blocked_privacy"
  └── No se produce statePatch.

OUT_OF_SCOPE_DOES_NOT_MUTATE_STATE = YES
  └── type = OutOfScopeRequestAmbiguity → status = "out_of_scope_redirect"

OUTPUT_IS_DETERMINISTIC = YES
  └── Mismo input 3 veces → mismo output 3 veces.

INPUT_NOT_MUTATED = YES
  └── El input original no se modifica después de la llamada.

NO_PII_IN_OUTPUT = YES
NO_RAW_ROWS_IN_OUTPUT = YES
NO_OPEN_TEXT_IN_OUTPUT = YES
NO_SIDE_EFFECTS = YES
```

---

## 11. Plan de implementación futura

Fases propuestas para implementar la capa de aplicación:

```text
H54 = Resolution Application Types
  └── Crear tipos del contrato de entrada y salida:
      - AmbiguityResolutionApplicationInput
      - AmbiguityResolutionApplicationResult (los 6 estados)
      - StatePatch por tipo de ambigüedad
  └── Solo tipos, sin funciones.
  └── Referenciar este documento.
  └── No modificar runtime. No modificar UI.

H55 = Resolution Application Mapper
  └── Implementar el mapper puro que valida input y produce resultado.
  └── Reglas para MultipleSurveyScopeAmbiguity.
  └── Reglas para privacy blocking.
  └── Reglas para out-of-scope redirect.
  └── Reglas para invalid input.
  └── Tests puros (no integration, no runtime).
  └── No modificar workspace. No modificar UI.

H56 = Workspace Integration
  └── Integrar la capa de aplicación en ConversationalImportWorkspace.
  └── Reemplazar el hardcoded scope resolution actual.
  └── Workspace llama al mapper en lugar de keywords.
  └── Workspace aplica statePatch.
  └── Workspace transiciona según nextWizardStep.
  └── No romper flujo 5173. Feature gate si es necesario.

H57 = Visual QA (si hay cambio visible)
  └── Verificar que la resolución por texto sigue funcionando.
  └── Verificar que no hay regresión visual.
  └── Verificar que "1" sigue avanzando a configuración general.
  └── Verificar que input inválido mantiene ambigüedad.
  └── Verificar que no hay botones.

H58 = Stabilization / Hotfix (si aplica)
  └── Bugs encontrados en QA.
  └── Sin nuevas features.
```

No implementar estas fases todavía. Solo están definidas.

---

## Marcadores

```
PHASE_11D_H53_AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE_COMPLETE
AMBIGUITY_RESOLUTION_APPLICATION_ARCHITECTURE_LOCKED
RESOLUTION_APPLICATION_BOUNDARY_DEFINED
TEXT_INPUT_TO_TYPED_RESOLUTION_CONTRACT_DEFINED
ACTIVE_AMBIGUITY_INPUT_CONTRACT_DEFINED
RESOLUTION_APPLICATION_OUTPUT_CONTRACT_DEFINED
MULTIPLE_SURVEY_SCOPE_RESOLUTION_RULES_DEFINED
INVALID_INPUT_RULES_DEFINED
PRIVACY_PRECEDENCE_RULES_DEFINED
OUT_OF_SCOPE_RULES_DEFINED
STATE_PATCH_CONCEPT_DEFINED
SIDE_EFFECTS_FORBIDDEN
TESTING_STRATEGY_DEFINED
FUTURE_IMPLEMENTATION_PLAN_DEFINED
NO_CODE_CHANGES
NO_RUNTIME_CHANGES
NO_UI_CHANGES
NO_IMPORT_EXECUTION
NO_DASHBOARD_OR_COMPARISON_CHANGES
READY_FOR_COMPARISON_OUTPUT_DISABLED
PHASE_11D_H54_READY
```
