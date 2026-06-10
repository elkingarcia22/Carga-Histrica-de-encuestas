# Fase 3B2C2.4 · Review Progress Semantics Decision Report

## 1. Resumen ejecutivo

El fallo de `safeParse` en los fixtures `raw-review-required` y `unknown-blocked` expone una ambigüedad implementada entre el contrato, el schema y los fixtures respecto a la propiedad `blocking` de `ReviewProgress`. El schema actual suma `blocking` como si fuera un estado mutuamente exclusivo (Modelo A), lo cual contradice matemáticamente el total. Al analizar la documentación arquitectónica (`DATA_MODEL.md`) y el uso en el happy path, se evidencia que los estados exclusivos son solo 5. `blocking` actúa como una dimensión transversal (Modelo B) indicando cuántas de esas entidades poseen errores bloqueantes. Con esta definición, el schema es defectuoso por sumar `blocking`, y el fixture `unknown-blocked` es defectuoso por declarar 1 entidad bloqueada cuando el total de entidades a revisar es 0. Nos encontramos ante un **MIXED_DEFECT**.

## 2. Fuentes revisadas

1. `src/types/survey-import/preview.ts`
2. `src/types/survey-import/session.ts`
3. `docs/DATA_MODEL.md`
4. `docs/MOCK_DATA_CONTRACT.md`
5. `docs/RUNTIME_VALIDATION.md`
6. `docs/RUNTIME_VALIDATION_RESULTS.md`
7. `docs/IMPORT_ARCHITECTURE.md`
8. `src/lib/survey-import/schemas/reviewSchemas.ts`
9. `src/mocks/survey-import/scenarios/rawReviewRequiredScenario.ts`
10. `src/mocks/survey-import/scenarios/unknownBlockedScenario.ts`

## 3. Semántica de ReviewProgress

| Campo | Unidad | Exclusivo | Transversal | Regla |
| ----- | ------ | --------- | ----------- | ----- |
| total | Entidades | No | N/A | `session.ts`, Modelo B |
| confirmed | Entidades | Sí | No | `DATA_MODEL.md` |
| modified | Entidades | Sí | No | `DATA_MODEL.md` |
| pending | Entidades | Sí | No | `DATA_MODEL.md` |
| conflict | Entidades | Sí | No | `DATA_MODEL.md` (`conflicting`) |
| ignored | Entidades | Sí | No | `DATA_MODEL.md` |
| blocking | Entidades | No | Sí | `reviewSchemas.ts` (intención original) |

- `total` representa **entidades**, no issues ni mappings.
- Los desgloses deben compartir la misma semántica.
- `overall` es una suma de los desgloses aplicables.
- `total` puede ser cero cuando existen issues blocking a nivel sesión (ej. error de parseo global), ya que no existen entidades parseadas.

## 4. Comportamiento actual del schema

En `reviewSchemas.ts`:
1. El schema suma actualmente `confirmed + modified + pending + conflicting + ignored + blocking`.
2. Sí incluye `blocking` en la sumatoria de exclusividad, lo cual es incorrecto.
3. Sí exige `blocking <= total`.
4. Sí aplica las mismas reglas uniformemente a `overall`, `byQuestion`, `byDemographic`, `byParticipant` y `bySegment`.
5. El schema no implementa lo documentado (Modelo B), ya que asume exclusividad para `blocking`.
6. Existe double counting: una entidad `pending` que tenga un issue bloqueante es contada dos veces, excediendo falsamente el `total`.
7. El mensaje y path identifican de forma explícita las validaciones rotas.

## 5. Análisis de raw-review-required

| Grupo | Total | Confirmed | Modified | Pending | Conflict | Ignored | Blocking |
| ----- | ----: | --------: | -------: | ------: | -------: | ------: | -------: |
| overall | 4 | 1 | 0 | 2 | 1 | 0 | 1 |
| byQuestion | 2 | 1 | 0 | 0 | 1 | 0 | 1 |
| byDemographic | 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| byParticipant | 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| bySegment | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

- **Modelo A (Exclusivo)**: Falla. Suma de `overall` = 5, lo cual excede el total de 4.
- **Modelo B (Transversal)**: Pasa. Suma de exclusivos = 4. `blocking` (1) <= `total` (4).
- **Modelo C (Conteo)**: Pasaría ignorando invariantes de entidades.
- **Veredicto**: El fixture usa `blocking` correctamente como atributo transversal, evidenciando el defecto en el schema.

## 6. Análisis de unknown-blocked

| Grupo | Total | Confirmed | Modified | Pending | Conflict | Ignored | Blocking |
| ----- | ----: | --------: | -------: | ------: | -------: | ------: | -------: |
| overall | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| byQuestion | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| byDemographic | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| byParticipant | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| bySegment | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

- **Representación**: No existe ninguna entidad revisable porque la sesión está en macroetapa `upload` con falla de detección global. `ReviewProgress` no aplica.
- **Veredicto**: El fixture asume `blocking` como conteo de issues globales (Modelo C), contradiciendo el contrato donde `blocking` son entidades (Modelo B). `blocking: 1` con `total: 0` es matemáticamente inválido. El issue ya se contabiliza correctamente en la propiedad global `issues`.

## 7. Relación con ImportIssue

`ReviewProgress.blocking` debe derivarse conceptualmente de la **cantidad de entidades con al menos un issue blocking** (`blocking entities`).
No debe ser el conteo total de issues (`blocking issues`), ya que el modelo actual exige que sea una dimensión de las entidades listadas para ser validada con `total` y mostrada coherentemente en las barras de progreso de la UI.

## 8. Matriz de alternativas

| Alternativa | Cambio de schema | Cambio de fixtures | Cambio documental | Riesgo | Recomendación |
| ----------- | ---------------- | ------------------ | ----------------- | ------ | ------------- |
| 1. Mantener schema | No | Sí (raw-review) | Sí | Alto (rompe UI) | Descartada |
| 2. Cambiar schema a transversal | Sí | No | Sí | Medio (falla unknown)| Descartada |
| 3. Corregir schema y unknown | Sí (`sumStates`) | Sí (`unknown-blocked`) | Sí | Bajo | **Recomendada** |
| 4. Cambiar contrato base | Sí | Sí | Sí | Muy Alto | Descartada |

## 9. Decisión formal

**MIXED_DEFECT**

- **Evidencia**: El schema falla al considerar `blocking` exclusivo, sumándolo al total (defecto lógico). El fixture `unknown-blocked` falla al declarar `blocking: 1` con `total: 0` (defecto de datos).
- **Archivos afectados**: `src/lib/survey-import/schemas/reviewSchemas.ts`, `src/mocks/survey-import/scenarios/unknownBlockedScenario.ts`.
- **Cambio mínimo recomendado**: Remover `val.blocking` de `sumStates` en el schema. Reiniciar `blocking` a `0` en el fixture.
- **Invariantes que deben conservarse**: `sumStates <= total` y `blocking <= total`.
- **Riesgo de regresión**: Muy bajo.
- **Casos que deberán reejecutarse**: Regresión total (10 positivos + 18 negativos originales + 4 nuevos).

## 10. Cambio mínimo recomendado

1. Modificar `reviewSchemas.ts` en `sumStates`: 
   `const sumStates = val.confirmed + val.modified + val.pending + val.conflicting + val.ignored;`
2. Modificar `unknownBlockedScenario.ts` en `reviewProgress.overall.blocking`: 
   `blocking: 0`

## 11. Archivos autorizados para el hotfix

- `src/lib/survey-import/schemas/reviewSchemas.ts`
- `src/mocks/survey-import/scenarios/unknownBlockedScenario.ts`

## 12. Regresión obligatoria

Casos que debe proponer el gate para la próxima fase:
1. `raw-review-required` directo (deberá pasar).
2. `unknown-blocked` modificado (deberá pasar).
3. Diez (10) escenarios positivos exactos.
4. Conteos exclusivos superiores a total (falla `Sum of states`).
5. Blocking superior a total (falla `Blocking count`).
6. Elemento pending y blocking simultáneamente en mock custom.
7. Grupo con total cero y todo en cero (deberá pasar).
8. Grupo no aplicable con todos valores en cero (deberá pasar).
9. Dieciocho (18) negativos de sesión previamente aprobados.
10. Firma intacta antes y después para todo fixture no alterado en esta decisión.

## 13. QA de integridad

Realizado. No se modificaron schemas, fixtures, ni contratos. Se respetó la prohibición de crear código o comitear. Fase 3C permanece bloqueada.

## 14. Autorización o bloqueo para Fase 3C

Fase 3C **Bloqueada** hasta ejecutar el hotfix en la próxima fase.

## 15. Estado

**Aprobada.** (Fase de análisis)

## 16. Ejecución del Hotfix (Fase 3B2C2.5)

- **Hotfix aplicado:** Corrección de la suma de estados exclusivos removiendo `val.blocking` y reinicio de entidades bloqueadas a 0 en el fixture `unknown-blocked`.
- **Fecha:** 2026-06-10
- **Archivos modificados:** `src/lib/survey-import/schemas/reviewSchemas.ts`, `src/mocks/survey-import/scenarios/unknownBlockedScenario.ts`.
- **Resultado de regresión:** Se ejecutaron validaciones exhaustivas utilizando un harness temporal. 10 de 10 positivos exactos resultaron en 'pass' con firma intacta. Las reglas semánticas fueron evaluadas satisfactoriamente. 18 de 18 regresiones negativas de sesión permanecen operativas y seguras. Fases subsecuentes quedan desbloqueadas.
