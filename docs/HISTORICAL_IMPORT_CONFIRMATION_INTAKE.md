# Historical Import Confirmation and Final State Prototype Intake

## Fase
Fase 4H-R1 · Historical Import Confirmation and Final State Prototype Intake

## Naturaleza
Formaliza exclusivamente el intake de producto para la siguiente pantalla del flujo:
Confirmar importación histórica.
Esta fase es estrictamente documental. No crear código, mock, UI ni implementaciones.

## Objetivo exacto
Permitir que el consultor revise el consolidado final de la importación histórica, confirme explícitamente la operación y comprenda qué se importaría, sin ejecutar una importación real.

## Usuario Principal
- **Principal:** Consultor de implementación UBITS.
- **Secundario conceptual:** Administrador cliente con permisos de consulta, no responsable principal de mappings técnicos.
- *Nota:* No diseñar la pantalla para un usuario final encuestado.

## Primera Pantalla
**Confirmar importación histórica**
(Se construye conceptualmente como una sola pantalla sin pantallas de ejecución/progreso/éxito).

## Decisiones de producto aprobadas
- **Nombre de pantalla:** Confirmar importación histórica.
- **Confirmación explícita:** Checkbox obligatorio: “Confirmo que revisé la configuración, los mapeos y las columnas ignoradas de esta importación histórica.” (No usar modal de confirmación en esta primera pantalla).
- **Incidencias diferidas:** Permiten continuar con advertencia visible si no son bloqueantes, están claras y se incluyen en el resumen final. Incidencias blocking siempre impiden continuar.
- **CTA principal:** "Confirmar importación".
- **Resultado del CTA:** Muestra feedback simulado dentro de la misma experiencia: “La confirmación quedó preparada. La ejecución de la importación todavía no está conectada en este prototipo.”
- **Stepper:** Paso 4 final del wizard.

## Happy Path
1. El usuario llega desde Review & Mapping con estado `ready-for-confirmation`.
2. Revisa la identidad de la encuesta.
3. Revisa la configuración confirmada.
4. Revisa el resumen global del lote.
5. Revisa mappings confirmados, ignorados y diferidos.
6. Confirma que no existen incidencias bloqueantes.
7. Activa el checkbox de confirmación explícita.
8. El CTA "Confirmar importación" se habilita.
9. Presiona el CTA.
10. El sistema muestra feedback simulado.
11. No se realiza ninguna escritura real.
12. El usuario puede volver a Mapping sin perder el draft mientras el wizard siga montado.

## Entrada Conceptual
Boundary serializable desde Review & Mapping que incluye conceptualmente:
- `mappingDraftId`, `configurationDraftId`, `sourceBatchId`, `sourceScenarioId`
- Identidad, tipo, periodo, privacidad, visibilidad, umbral.
- Cantidad total de archivos.
- Resumen por dominio de mapping.
- Mappings confirmados, pendientes.
- Columnas ignoradas, incidencias resueltas, diferidas.
- Readiness global.
- Configuración vigente, `canContinueToConfirmation`.

*(No incluye datos binarios, archivos, respuestas, PII, objetos React, etc.)*

## Salida Conceptual
Un borrador simulado de confirmación:
- `confirmationDraftId`, `mappingDraftId`, `configurationDraftId`, `sourceBatchId`
- `confirmedByRole`, `explicitConfirmationAccepted`, `confirmationStatus`
- `blockingIssueIds`, `deferredIssueIds`, `ignoredColumnIds`
- `finalReadiness`, `canPrepareSimulatedExecution`.

## Módulos visibles obligatorios
1. Disclosure de simulación.
2. Identidad de la encuesta.
3. Resumen del lote.
4. Configuración confirmada (read-only).
5. Resumen de mappings por dominio.
6. Columnas ignoradas.
7. Incidencias resueltas.
8. Incidencias diferidas.
9. Validaciones finales.
10. Confirmación explícita.
11. Resumen de readiness.
12. Footer persistente.

## Comportamiento del CTA
El CTA "Confirmar importación" se habilita solo si:
- Mapping está `ready-for-confirmation`.
- La configuración vigente y el mapping coinciden.
- No hay incidencias blocking ni `simulated-error`.
- No hay confirmaciones pendientes.
- Checkbox explícito activo.
- Boundary de entrada válido.

## Acciones y Navegación
- **Volver:** Conserva borradores locales.
- **Cancelar:** Limpia flujos locales.
- **Confirmar:** Prepara simulación sin persistencia y muestra feedback in-place.

## Incidencias y Estados
- **Clasificación de incidencias:** Blocking, Confirmation-required, Deferred, Informational, Simulated-error.
- **Estados de confirmación:** incomplete, confirmation-required, blocked, stale, incompatible, ready-for-confirmation, confirmation-prepared, simulated-error.

## Mock principal
- Datos sintéticos (Ej. Clima Organizacional 2026, Privacidad Confidencial, etc.).
- Sin PII o datos reales.

## Ocho escenarios futuros propuestos para MDC
1. `ready-for-confirmation`
2. `explicit-confirmation-required`
3. `stale-mapping`
4. `blocking-issue-present`
5. `deferred-issues-present`
6. `ignored-required-column`
7. `configuration-mismatch`
8. `simulated-error`

## Referente visual y Componentes
- **Shell U1-U6:** Drawer full-screen, stepper, contenido scrollable, footer. Sin rediseñar shell.
- **Stack:** React, TS, Tailwind, shadcn/ui.
- **Componentes a evaluar:** ImportWizardShell, Header, Steps, Footer, Card, Alert, Badge, Checkbox, Tooltip, Separator, Button, UbitsIcon, toast.

## Accesibilidad y Riesgos
- **Accesibilidad:** Considerar disabled reasons en CTA y checkbox aria-labels.
- **Riesgos mitigados:** Falsa percepción de persistencia, confirmación accidental, bloqueos ocultos, diferencias de versiones, pérdida de trazabilidad.

## IA-First
- `LIMITED_VALUE_IN_SIMULATION`: Permitido para resúmenes de incidencias. No permitido para scoring, análisis real o auto-confirmación.

## Criterios de Éxito
- Consultor comprende qué se confirmará.
- Diferencia entre configuración, mapping e ignorados.
- Identifica bloqueos.
- Navegación sin pérdida de estado.
- Confirmación consciente y feedback claro sobre simulación.

## Decision Gates Cerrados
- Usuario principal.
- Nombre de pantalla.
- Checkbox obligatorio.
- CTA Confirmar importación.
- Manejo de incidencias diferidas.
- Feedback simulado.
- Paso 4 final.
- Sin ejecución, ruta, persistencia o parser real.

## Decision Gates Pendientes (R2)
- Ownership exacto.
- Boundary exacto.
- Preservation lifecycle.
- Modelo de compatibilidad.
- Contrato conceptual de simulación.
- Arquitectura visual.
- Estructura de archivos.
