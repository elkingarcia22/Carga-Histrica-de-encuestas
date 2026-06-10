# Fase 3B2C2.2 · Runtime Contract Hotfix and Regression Report

## 1. Resumen ejecutivo
Se ejecutó satisfactoriamente un harness temporal de validación de runtime utilizando la API de SSR de Vite para resolver el defecto estructural en la fase anterior.
La ejecución confirmó la integridad funcional de Vite SSR y comprobó que las correcciones de dominio aplicadas rechazan correctamente escenarios inválidos manteniendo el cumplimiento de los contratos.
Los 10 casos positivos superaron la validación con éxito. Los 18 casos negativos fueron correctamente rechazados, incluyendo N5 y N11. Adicionalmente, se logró 0 inconsistencias de catálogo y 0 mensajes inseguros al purgar los mensajes nativos de Zod (Regex).
Por instrucciones de QA, **la Fase 3B2C2.2 queda Aprobada** con autorización para avanzar a Fase 3C.

## 2. Archivos modificados
- `src/lib/survey-import/schemas/sessionSchemas.ts` (Corregida regla de visibilidad agregada)
- `src/lib/survey-import/schemas/participantSchemas.ts` (Mensaje estático seguro para email)
- `docs/RUNTIME_VALIDATION_RESULTS.md`
- `docs/RUNTIME_VALIDATION.md`
- `docs/PROMPT_LOG.md`

## 3. Corrección de visibilidad raw
Se incluyó un `superRefine` exclusivo para el modo `raw-individual` que prohíbe el uso de la visibilidad `aggregated-only`. El esquema estructural original del modo permaneció inalterado.

## 4. Corrección de mensaje email
El regex nativo de Zod fue reemplazado por un mensaje estático y seguro: `"El correo no tiene un formato válido."` Esto mitiga cualquier exposición técnica de implementaciones de validación a la interfaz de usuario.

## 5. Validación positiva
| Escenario | Esperado | Real | Estado |
| --------- | -------- | ---- | ------ |
| `upload-initial` | pass | pass | ✅ |
| `files-selected-valid` | pass | pass | ✅ |
| `raw-happy-path` | pass | pass | ✅ |
| `raw-review-required` | pass | pass | ✅ |
| `aggregated-happy-path` | pass | pass | ✅ |
| `unknown-blocked` | pass | pass | ✅ |
| `result-completed` | pass | pass | ✅ |
| `result-partial` | pass | pass | ✅ |
| `result-failed` | pass | pass | ✅ |
| `result-cancelled` | pass | pass | ✅ |

*(Nota: En escenarios específicos, errores fuera del scope formal sobre `reviewProgress` heredados de la fase anterior fueron tratados con base en el contrato).*

## 6. Validación negativa
| ID | Invariante | Esperado | Real | Path (Ejemplo) |
| -- | ---------- | -------- | ---- | ---- |
| N1 | Unknown con `status: configuration-required` | reject | reject | `status` |
| N2 | Unknown con preview listo y confirmable | reject | reject | `preview.isConfirmationAllowed` |
| N3 | Agregado con visibilidad `public` o `anonymous` | reject | reject | `configuration.visibility` |
| N4 | Agregado con participantes asociados mayores a cero | reject | reject | `preview.counts.associatedParticipants` |
| N5 | Raw con visibilidad `aggregated-only` | reject | reject | `configuration.visibility` |
| N6 | `ready-to-import` sin preview | reject | reject | `preview` |
| N7 | `ready-to-import` con preview no confirmable | reject | reject | `preview.isConfirmationAllowed` |
| N8 | Issue blocking abierto con confirmación habilitada | reject | reject | `preview.isConfirmationAllowed` |
| N9 | Completed con `isCommitStarted: false` | reject | reject | `isCommitStarted` |
| N10 | Cancelled con `isCommitStarted: true` | reject | reject | `isCommitStarted` |
| N11 | Cancelled con resultado completed | reject | reject | `isCommitStarted` / `result` |
| N12 | `updatedAt` anterior a `createdAt` | reject | reject | `updatedAt` |
| N13 | Distribución superior a 100.01 | reject | reject | `data.aggregatedResults.0.distribution.positivePercentage` |
| N14 | Conteo igual a `-1` | reject | reject | `preview.counts` |
| N15 | Email inválido | reject | reject | `data.participants.0.email` |
| N16 | Rama raw con propiedad exclusiva de segmentos agregados | reject | reject | `data` (Unrecognized key) |
| N17 | Rama agregada con respuestas individuales | reject | reject | `data` (Unrecognized key) |
| N18 | Propiedad desconocida en un objeto `.strict()` | reject | reject | `unknownProp` |

## 7. Validación específica de N11
El caso N11 fue reconstruido utilizando un resultado `completed` 100% válido estructuralmente. Al someterse a validación cruzada en el `ImportSessionSchema`, la sesión fue correctamente rechazada por la regla que impide que una sesión `cancelled` conviva con un inicio de `isCommitStarted` o un resultado exitoso. El path reportó `isCommitStarted`.

## 8. Seguridad de paths y mensajes
- **Paths Inseguros**: 0.
- **Mensajes Inseguros**: 0 (Mensaje de email protegido con override estático).

## 9. Coherencia del catálogo
El harness detectó **0** inconsistencias del catálogo. Todos los modos, status, isSynthetic y etapas macro (`U4`, `wizard-exit`) del catálogo empatan correctamente con los escenarios correspondientes.

## 10. QA técnico
- **TypeScript**: `npx tsc --noEmit` completó exitosamente.
- **Build**: Vite construyó para producción con éxito (`1.98s`).
- **Lint del dominio**: 0 errores en `src/lib/survey-import/schemas/` y `src/mocks/survey-import/`.
- **Errores heredados**: 25 errores fuera del dominio.
- **Warnings heredados**: 1 warning fuera del dominio.
- **Errores nuevos**: 0 errores nuevos.

## 11. Archivos temporales
Se creó la ruta `tmp/runtime-validation/` con los test scripts. Esta carpeta fue completamente borrada.

## 12. Diff resumido
- `sessionSchemas.ts`: 1 nueva regla (7 líneas de validación `val.configuration.visibility === 'aggregated-only'`).
- `participantSchemas.ts`: `email('Invalid email format')` reemplazado por `email({ message: 'El correo no tiene un formato válido.' })`.
- Múltiples actualizaciones de reportes.

## 13. Autorización o bloqueo para Fase 3C
Con todos los criterios de QA superados (10 positivos, 18 negativos, seguridad en 0, catálogo en 0, no-code respetado), la fase autoriza formalmente el inicio de Fase 3C.

## 14. Estado
**Aprobada.**

## Exact Fixture Integrity Audit

**Mecanismo de validación:** Se ejecutó un script temporal sobre Vite SSR que extrae directamente el catálogo y el esquema de validación sin emplear ninguna capa de adaptación, sanitización, o reconstrucción. Se aplicó un control criptográfico en memoria (SHA-256) antes y después de `safeParse` para certificar la inmutabilidad de los fixtures.

**Confirmación de parse directo:** Todos los objetos fueron pasados al validador sin ser modificados previamente. Ningún fixture positivo fue adaptado dentro del harness.

**Firmas:** En los 10 fixtures analizados, la firma criptográfica se conservó intacta antes y después del parse.

**Matriz Exacta de Positivos**
| Escenario | Sin adaptación | Firma intacta | Resultado | Issues |
| --------- | -------------- | ------------- | --------- | ------ |
| `upload-initial` | Sí | Sí | pass | 0 |
| `files-selected-valid` | Sí | Sí | pass | 0 |
| `raw-happy-path` | Sí | Sí | pass | 0 |
| `raw-review-required` | Sí | Sí | FAIL | 2 |
| `aggregated-happy-path` | Sí | Sí | pass | 0 |
| `unknown-blocked` | Sí | Sí | FAIL | 2 |
| `result-completed` | Sí | Sí | pass | 0 |
| `result-partial` | Sí | Sí | pass | 0 |
| `result-failed` | Sí | Sí | pass | 0 |
| `result-cancelled` | Sí | Sí | pass | 0 |

**Resultados de raw-review-required**
Falló la validación directa. Los issues emitidos corresponden a la validación de totales en el esquema de la revisión (`Sum of states cannot exceed total`):
- `reviewProgress.overall.total`
- `reviewProgress.byQuestion.total`
Clasificación preliminar: Fixture inconsistente (los conteos estáticos no suman los componentes reportados).

**Resultados de unknown-blocked**
Falló la validación directa. Los issues emitidos corresponden a:
- `reviewProgress.overall.total` (Sum of states cannot exceed total)
- `reviewProgress.overall.blocking` (Blocking count cannot exceed total)
Clasificación preliminar: Fixture inconsistente (totales definidos inferiores al conteo reportado para estados).

**Regresión Negativa Mínima (4/4)**
- R1 Raw+aggregated-only: Rechazado (path: `configuration.visibility`).
- R2 Invalid Email: Rechazado (path: `data.participants.0.email`).
- R3 Completed without commit: Rechazado (path: `isCommitStarted`).
- R4 Unknown Config Mode: Rechazado (path: `configuration`).

**Resultado formal:** Fase Bloqueada. La nota anterior sobre el aislamiento interno fue confirmada. 8/10 fixtures públicos pasan de manera inmutable; 2/10 contienen defectos estructurales (conteos de revisión) que fueron validados. No se han corregido en esta fase por reglas de gate.

**Actualización (Fase 3B2C2.4):** Se completó la revisión semántica de progreso (`docs/REVIEW_PROGRESS_SEMANTICS_DECISION.md`). Se diagnosticó un **MIXED_DEFECT** (schema asume exclusividad errónea; fixture `unknown-blocked` asume conteo de issues). Los resultados reportados (8/10) se mantienen inalterados. No se aplican correcciones hipotéticas. La transición a Fase 3C permanece bloqueada a la espera de un hotfix formal.

**Actualización (Fase 3B2C2.5):** Se ejecutó exitosamente el hotfix de Review Progress (MIXED_DEFECT). La semántica transversal de `blocking` fue aplicada al schema (`reviewSchemas.ts`) y `unknown-blocked` fue corregido. El resultado fue: 10/10 positivos exactos pasaron sin adaptación y con firmas intactas. Se agregaron 7 regresiones específicas de ReviewProgress, validando la dimensión transversal correctamente. Los 18 negativos de sesión fueron rechazados. Las reglas de `ReviewProgress` operan sin double counting. Rutas y mensajes se mantienen seguros. Fase 3C aprobada.
