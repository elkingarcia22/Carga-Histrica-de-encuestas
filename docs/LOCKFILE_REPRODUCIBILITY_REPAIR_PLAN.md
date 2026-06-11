# Lockfile Reproducibility Repair Plan

## 1. Propósito
Definir un plan pequeño, secuencial y verificable para crear un entorno técnico aislado, evaluar candidatos de toolchain, auditar la reparación mínima frente a la regeneración del lockfile, prevenir derivas de dependencias y establecer el roadmap formal hasta la adquisición de dependencias, asegurando la integridad visual y funcional del prototipo.

## 2. Contexto
* La Fase 4C2D1 · SheetJS Dependency Acquisition fue revertida en la Fase 4C2D1.1.
* SheetJS se encuentra retirado completamente.
* `package.json` y `package-lock.json` coinciden con `HEAD`.
* `npm ci --ignore-scripts` falla en copias limpias y aisladas del repositorio, confirmando el defecto sin SheetJS.
* El entorno local histórico todavía permite TypeScript y build exitoso.
* El lockfile publicado contiene resoluciones incompletas de `@rolldown/binding-wasm32-wasi`, `@emnapi/core`, `@emnapi/runtime` y `@emnapi/wasi-threads`.
* El repositorio no gobierna formalmente Node y npm.
* La reparación todavía no ha sido autorizada. U1 y U2 permanecen congeladas, la acción `Continuar` se mantiene deshabilitada, y U3 y el Worker no existen.

## 3. Estado formal
`READY_FOR_REPRODUCIBILITY_REPAIR_PLAN`

## 4. Commit base
Hash: `5598884858b2a0e85791debb24903a3809ff5814`

## 5. Evidencia disponible
La Fase 5C1 demostró que con el toolchain actual no es posible completar un `npm ci` limpio. Las resoluciones faltantes de `@emnapi` en el lockfile no pueden subsanarse de forma automatizada por npm ci sin generar una modificación en la integridad, demostrando la deriva del lockfile frente al registry para el entorno actual.

## 6. Defecto confirmado
El archivo `package-lock.json` es parcial o estructuralmente incompatible con instalaciones deterministas en el actual entorno `npm 11.6.2`, al faltar dependencias cross-platform de Rolldown necesarias durante la resolución de dependencias pre-compiladas (WASM/WASI).

## 7. Límites de la evidencia
* No se ha comprobado si el defecto está presente en `upstream/main` del Starter Kit original.
* No existe evidencia de que Node 24.13.0 y npm 11.6.2 sean el toolchain oficial, aprobado o históricamente estable para el Starter Kit.

## 8. Toolchain candidato
* **Node `24.13.0`**
* **npm `11.6.2`**
*Nota: Estas son únicamente las versiones donde se reprodujo el defecto. Son un candidato de reparación, no el estándar aprobado. Su compatibilidad global debe probarse rigurosamente.*

## 9. Toolchains por comparar
* **Candidato T1:** Entorno actual (Node 24.13.0, npm 11.6.2).
* **Candidato T2:** Toolchain del Starter Kit (Si existe evidencia en upstream, CI o documentación).
* **Candidato T3:** Toolchain LTS gobernable alternativo (Propuesta conceptual, p.ej. Node 22 LTS).

## 10. Estrategias de lockfile
La regeneración total (eliminar y reinstalar) permanece como `HIGH_RISK_EXPERIMENT_ONLY`. El plan comparará dos alternativas:
* **Experimento L1:** Reparación generada por npm sobre el lockfile existente (conservando versiones directas e integridades no relacionadas).
* **Experimento L2:** Regeneración completa desde `package.json` (sin SheetJS, sin cambios a directas, evaluando el alcance en rama aislada).

## 11. Plan R0–R6
* **R0 · Evidence Freeze:** Fijar commit base, hashes del lockfile, baseline de TypeScript/Build y estado visual U1/U2 (`REPAIR_BASELINE_FROZEN`).
* **R1 · Isolated Toolchain Comparison:** Ejecutar fuera de `main`. Evaluar candidatos de toolchain, probando `npm ci`, build e idempotencia (`TOOLCHAIN_CANDIDATE_SELECTED` / `INSUFFICIENT_TOOLCHAIN_EVIDENCE`).
* **R2 · Lockfile Strategy Comparison:** Comparar L1 y L2, midiendo diffs, dependencias afectadas, y bundle (`MINIMAL_REPAIR_SELECTED` / `FULL_REGENERATION_SELECTED_WITH_CONDITIONS`).
* **R3 · Ownership Decision:** Confirmar origen del defecto para recomendar `FIX_IN_UPSTREAM_STARTER` o mantener un parche documentado en el prototipo.
* **R4 · Technical Repair:** (Fase futura) Establecer la gobernanza del toolchain y realizar la reparación del lockfile en main.
* **R5 · Independent QA:** QA obligatorio del toolchain estabilizado y entorno local.
* **R6 · SheetJS Retry:** Reintento seguro de la adquisición de SheetJS CE, seguido del Worker Spike.

## 12. Ownership
La procedencia del `package-lock.json` defectuoso debe verificarse contra `upstream`. Posibles estados:
* `UPSTREAM_DEFECT_CONFIRMED`
* `PROTOTYPE_ONLY_DEFECT`
* `SHARED_DEFECT`
* `OWNERSHIP_EVIDENCE_INSUFFICIENT`

## 13. Archivos de gobernanza candidatos
| Archivo | Ventajas | Riesgos / Notas | Estado |
| ------- | -------- | --------------- | ------ |
| `package.json` (packageManager, engines) | Nativo, sin dependencias | engines no es un strict constraint sin configuración | `CANDIDATE` |
| `.node-version` | Simple, compatible multi-manager | No controla la versión de npm | `CANDIDATE` |
| `.nvmrc` | Muy usado por devs con NVM | Restringido a NVM | `CANDIDATE` |
| Volta (`package.json`) | Control estricto de Node y npm | Requiere instalar Volta, fuente contradictoria | `NEEDS_TEAM_DECISION` |
| GitHub CI Workflows | Alinea el source of truth de CI | Debe coincidir estrictamente con el config local | `RECOMMENDED` |

## 14. Matriz de toolchains
| Candidato | Evidencia de origen | npm ci | Diff lockfile | Build | Soporte | Riesgo | Estado |
| --------- | ------------------- | ------ | ------------- | ----- | ------- | ------ | ------ |
| T1 (24/11) | Local (Reproducción) | PENDING | PENDING | PENDING | PENDING | PENDING | `CURRENT_ENVIRONMENT_CANDIDATE_REQUIRES_SPIKE` |
| T2 (TBD) | Starter Kit upstream | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING_SPIKE |
| T3 (LTS) | Ninguna (Propuesta) | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING_SPIKE |

## 15. Matriz de lockfiles
| Estrategia | Paquetes cambiados | Directas afectadas | Transitivas afectadas | Idempotente | Riesgo | Estado |
| ---------- | -----------------: | -----------------: | --------------------: | ----------- | ------ | ------ |
| L1 (Minimal) | PENDING_SPIKE | PENDING_SPIKE | PENDING_SPIKE | PENDING_SPIKE | PENDING_SPIKE | PENDING_SPIKE |
| L2 (Total) | PENDING_SPIKE | PENDING_SPIKE | PENDING_SPIKE | PENDING_SPIKE | PENDING_SPIKE | PENDING_SPIKE |

## 16. Límites de cambio
* Dependencia directa modificada: **Blocking**.
* Nuevo script en package.json: **Blocking**.
* Nueva dependencia no explicada: **Blocking**.
* Cambio de integridad sin cambio de versión: **High** (Requiere explicación detallada).
* Múltiples subárboles no relacionados modificados: **High**.
* Cambio significativo del chunk principal: **Revisión obligatoria**.
* Cambio de comportamiento de U1/U2: **Blocking**.
* Errores nuevos de TypeScript / Lint en dominio: **Blocking**.

## 17. QA obligatorio
| Área | Prueba | Entorno | Evidencia | Criterio |
| ---- | ------ | ------- | --------- | -------- |
| Base | `npm ci --ignore-scripts` | Entorno limpio A | TBD | Éxito sin errores |
| Base | `npm ci --ignore-scripts` | Entorno limpio B | TBD | Éxito sin errores |
| Idempotencia | Segunda ejecución | Entornos A/B | TBD | Sin diff ni reinstalaciones extrañas |
| Integridad | Lockfile sin cambios | Entornos A/B | TBD | Determinismo garantizado |
| Integridad | Árbol de dependencias | Entorno Aislado | TBD | Cambios limitados a los subárboles justificados |
| Integridad | Versiones directas | Entorno Aislado | TBD | Ninguna versión directa modificada |
| Integridad | Transitivas | Entorno Aislado | TBD | Explicadas y documentadas |
| QA Técnico | TypeScript | Entorno Aislado | TBD | Sin warnings/errores nuevos |
| QA Técnico | Build | Entorno Aislado | TBD | Compila exitosamente |
| QA Técnico | Lint del dominio | Entorno Aislado | TBD | Pasa sin errores |
| QA Técnico | Runtime schemas | Entorno Aislado | TBD | Válidos y ejecutados |
| Fixtures | Fixtures estáticos | Entorno Aislado | TBD | No corrompidos |
| QA Visual | U1 en navegador | Local / Preview | TBD | Renderizado y funcional |
| QA Visual | U2 en navegador | Local / Preview | TBD | Renderizado y funcional |
| QA Funcional | Carga archivos U2 | Local / Preview | TBD | Retiene estado, bloquea action según arquitectura |
| Análisis | Duplicados D1–D4 | Local / Preview | TBD | Validado contra reglas D1-D6 |
| Análisis | Bundle | Entorno Aislado | TBD | Diferencia dentro del margen aceptable |
| Seguridad | CSP baseline | Local | TBD | Aprobado |
| Seguridad | Secret / PII scan | Local | TBD | Cero secretos/PII expuestos |
| Operaciones | Remotos | Local | TBD | Sin remotos/ramas corrompidas |
| Operaciones | Rollback | Local / Aislado | TBD | Capacidad de reversión sin basura |

## 18. Secuencia de commits
* **Commit I · Toolchain Governance:** Exclusivamente la configuración aprobada de Node/npm (ej. package.json `engines`, `.node-version`).
* **Commit II · Lockfile Repair:** Únicamente el archivo `package-lock.json` reparado, y documentación asociada (sin SheetJS).
* **Commit III · SheetJS Acquisition:** `package.json` y `package-lock.json` modificados para SheetJS. Documentación (sin Worker).
* **Commit IV · Worker Spike:** Fixture sintético, arnés aislado y Worker. Documentación (sin UI U3).

## 19. Rollback
* **Entorno temporal:** Eliminar únicamente el directorio temporal inventariado; no tocar el working tree real.
* **En rama técnica (antes de commit):** Restaurar rutas explícitas mediante `git restore package.json package-lock.json` y eliminar únicamente archivos nuevos inventariados. No ejecutar `git clean -fd` ni `git reset --hard`.
* **Después de commit:** Utilizar un commit de reversión normal (`git revert`). No reescribir historial. No usar force push.

## 20. Riesgos
* Toolchain candidato equivocado (ej. fallos en otros sistemas operativos).
* Node en versión no LTS, reduciendo la estabilidad.
* npm sin soporte futuro (incompatibilidades tempranas).
* Regeneración amplia del lockfile que cause roturas en runtime desconocidas.
* Reparación incompleta en la que npm `ci` siga fallando.
* Integridades cambiadas por registries locales sin notarlo.
* Vite/Rolldown alterados.
* Pérdida o corrupción del entorno local histórico de los desarrolladores.
* Upstream no corregido o ignorado.
* Prototipo divergente y con alta deuda técnica.
* Fusión conflictiva en el lockfile durante PRs.
* Reintroducción prematura de dependencias (SheetJS) arruinando el diagnóstico.
* Bloqueo prolongado que impida el desarrollo de la vista U3.

## 21. Decision gates
1. Aprobación de candidato de Toolchain.
2. Selección entre Minimal Repair vs Full Regeneration.
3. Decisión de Ownership y Pull Request a Upstream (si aplica).

## 22. Archivos futuros autorizables
* `docs/*` (Documentación).
* `package-lock.json` (Solo reparación L1/L2).
* `package.json` (Solo metadata de packageManager / engines).
* `.node-version` / `.nvmrc` (Solo tras decisión de equipo).

## 23. Archivos futuros prohibidos
* `src/**`
* UI (U1, U2, U3).
* Contratos, fixtures, schemas.
* Vite config.
* Configuración de TypeScript.
* Código del Worker.

## 24. Autorización o bloqueo
**Estado:** Autorización parcial - `READY_FOR_ISOLATED_REPRODUCIBILITY_REPAIR_SPIKE`
El plan detallado ha sido establecido y validado.
Únicamente se autoriza iniciar la **Fase 4C2D1.4 · Isolated Toolchain and Lockfile Repair Spike**, la cual deberá llevarse a cabo en una rama técnica independiente o checkout aislado aprobado (fuera del working tree actual principal).

## 25. Fecha
2026-06-11
