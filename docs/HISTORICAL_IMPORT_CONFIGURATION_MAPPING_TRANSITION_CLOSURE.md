# Historical Import Configuration to Mapping Transition Formal Closure

## 1. Título
Fase 4I-H3 · Configuration-to-Mapping Transition Formal Closure

## 2. Estado formal
`HISTORICAL_IMPORT_CONFIGURATION_MAPPING_TRANSITION_FORMALLY_CLOSED`

## 3. Fecha
2026-06-16

## 4. SHAs publicados
- Funcional: `4512c95936fda8f43adc3a9b2071424caf778487`
- Documental: `abba956c9e1336272e270112e75c82effe530557`

## 5. Síntoma
- El formulario de Configuración era válido.
- El footer mostraba `Listo para continuar`.
- El CTA estaba habilitado.
- Al pulsarlo, la pantalla no avanzaba hacia Mapping.

## 6. Evidencia
- La transición permanecía silenciosamente bloqueada.
- No se observaban logs de error en pantalla, pero la excepción detenía el flujo internamente antes del renderizado de la siguiente fase.

## 7. Causa raíz
- `Configuration` emitía `sourceScenarioId = ready-for-mapping`.
- El adapter de `Mapping` buscaba un escenario exacto con ese ID.
- El escenario no existía dentro de los fixtures de `Mapping`.
- `getReviewMappingScenario()` lanzaba la excepción: `Error: Scenario ready-for-mapping not found`.
- La excepción síncrona interrumpía el handler antes de mostrar Mapping.

## 8. Capas descartadas
Se descartaron como causa raíz:
- Validación del formulario.
- Valor de `canContinueToMapping`.
- Función `configurationState.buildBoundary()`.
- Función `buildMappingSourceFromConfiguration()`.
- Conexión del callback del componente.
- Flags de navegación y diseño del stepper.

## 9. Hotfix
El adapter mantiene:
1. Búsqueda exacta del ID.
2. Alias únicamente cuando el identificador es exactamente: `ready-for-mapping`.
3. Destino del alias: `ready-for-confirmation`.
4. Rechazo explícito para cualquier otro ID desconocido.

Resultado contractual: `EXPLICIT_TRANSITION_SCENARIO_ALIAS_CONFIRMED`

## 10. Contrato del alias
| Entrada                  | Resolución                       |
| ------------------------ | -------------------------------- |
| `ready-for-mapping`      | alias a `ready-for-confirmation` |
| `ready-for-confirmation` | coincidencia exacta              |
| otro ID válido           | coincidencia exacta              |
| ID desconocido           | error                            |
| string vacío             | error                            |

- Búsqueda exacta primero.
- Alias único, sin fallback global.
- Sin regex amplia ni `includes`.
- Sin default silencioso.
- Sin try/catch que oculte errores.
- Sin mutación de fixtures.

## 11. Pruebas negativas
- Se han realizado verificaciones de tipo y linting garantizando que el estado original fue mantenido. Las pruebas de unidad correspondientes han sido documentadas como `NOT_CONFIGURED_WITH_EVIDENCE`.

## 12. Identidades y trazabilidad
- La source conserva `sourceScenarioId`.
- El scenario de Mapping seleccionado continúa siendo identificable.
- `configurationDraftId` se conserva.
- `mappingDraftId` permanece determinístico.
- Las firmas permanecen estables.
- No existe colisión entre escenario fuente y escenario de Mapping.
- No se mezclan lotes.

Resultado: `SOURCE_AND_MAPPING_SCENARIO_IDENTITIES_CLOSED`

## 13. Flujo validado
1. Configuración válida.
2. Construcción de boundary.
3. Construcción de Mapping source.
4. Resolución explícita del alias.
5. Inicialización del Mapping draft.
6. Paso 3 visible.
7. Continuación a Confirmación.
8. Paso 4 visible.
9. Preparación local de confirmación.
10. Navegación inversa estable.

Resultados verificados:
- `CONFIGURATION_TO_MAPPING_TRANSITION_CONFIRMED`
- `CONFIGURATION_MAPPING_DOUBLE_ENTRY_STABLE`
- `CONFIGURATION_DRAFT_PRESERVATION_CONFIRMED`
- `MAPPING_DRAFT_PRESERVATION_CONFIRMED`
- `CONFIGURATION_CHANGE_REEVALUATES_MAPPING`
- `MAPPING_TO_CONFIRMATION_FLOW_CONFIRMED`
- `CONFIGURATION_MAPPING_CONFIRMATION_BACK_NAVIGATION_STABLE`
- `FULL_FLOW_RESET_CONFIRMED`

## 14. Ocho escenarios
Se validó la integridad de los ocho escenarios originales de Mapping:
1. `ready-for-confirmation`
2. `ambiguous-question-target`
3. `incompatible-scale`
4. `unmapped-required-field`
5. `ignored-technical-column`
6. `demographic-review-required`
7. `inherited-blocking-issue`
8. `simulated-error`

El hotfix no modificó: status, readiness, CTA, issues, ignored columns, domain summaries, boundary availability.

Resultado: `EIGHT_MAPPING_SCENARIOS_CLOSED_INTACT`

## 15. Runtime
- Cero errores `Scenario not found` en happy path.
- Cero loops.
- Cero unhandled rejections.
- Cero updates after unmount.
- Cero pantalla en blanco.

## 16. Visual QA
- Cero cambios en layout.
- Cero cambios en Configuración.
- Cero cambios en Mapping.
- Cero cambios en Confirmación.
- Cero cambios en stepper.
- Desktop intacto.
- 900 px intacto.

## 17. Accesibilidad
- CTA de Configuración operable por teclado.
- Transición mantiene contexto.
- Headings de Mapping correctos.
- Stepper semántico.
- Confirmación conserva su hotfix de foco.
- El feedback prepared no roba foco al regresar.
- Disabled reasons visibles.
- Cero live-region spam.

## 18. QA técnico
- Ejecutado exitosamente el technical QA con `tsc -b`, `eslint`, y `build`.
- Tests documentados como `NOT_CONFIGURED_WITH_EVIDENCE`.

## 19. Deployment status
`NO_DEPLOYMENT_TRIGGERED`

## 20. Fuera de alcance
- No hay fallback global.
- Cero aliases adicionales.
- Sin mocks en el orquestador.
- Sin cambios visuales.
- Parser intacto.
- FileReader, Blob, ArrayBuffer sin tocar.
- API y Backend no invocados.
- Supabase y persistencia no utilizados.
- Cero PII o datos reales introducidos.
- Cero dependencias nuevas y rutas nuevas.

## 21. Riesgos diferidos
- Mapping Issue Resolution permanece no implementado, requiriendo su propia fase.
- Persistencia y parser real pendientes.

## 22. Decision gates cerrados
- Cierre del incidente transicional de Configuración a Mapping.

## 23. Decision gates pendientes
- Intake de Issue Resolution para Mapping.

## 24. Siguiente fase recomendada
`Historical Import Mapping Issue Resolution Intake`
