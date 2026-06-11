# Fase 5C1 · Independent Dependency Acquisition and Lockfile Reproducibility QA Report

## 1. Resumen ejecutivo
Se ejecutó una auditoría independiente de la fase 4C2D1 y 4C2D1.1. Se confirmó que el rollback fue completo y seguro, sin rastros de SheetJS en el repositorio ni alteraciones de código. Se reprodujo aisladamente el fallo de `npm ci`, verificando que la causa es un defecto preexistente en el `package-lock.json` de la rama `main` asociado a dependencias de `@rolldown/binding-wasm32-wasi` (`@emnapi/core`, `@emnapi/runtime`). Las afirmaciones documentales son en gran parte correctas. El estado del entorno local es funcional, pero no reproducible sin regeneración del lockfile.

## 2. Estado formal
- **Objetivo**: Verificar el rollback, reproducir el defecto del lockfile y auditar la fase 4C2D1.
- **Commit auditado**: `5598884858b2a0e85791debb24903a3809ff5814`
- **Fecha**: 2026-06-11
- **Resultado**: `QA_CONFIRMS_SAFE_ROLLBACK_AND_REPRODUCIBILITY_BLOCKER`

## 3. Gate inicial
- **Rama actual**: `main`
- **Hash HEAD**: `5598884858b2a0e85791debb24903a3809ff5814`
- **Track**: `origin/main` (Ahead: 0, Behind: 0)
- **Staging**: Vacío.
- **Cambios locales**: Únicamente `docs/U3_P1_DEPENDENCY_ACQUISITION.md` y `docs/PROMPT_LOG.md`.
- **Validación**: Gate inicial superado.

## 4. Verificación del rollback
- **package.json**: Sin diferencias respecto a HEAD.
- **package-lock.json**: Sin diferencias respecto a HEAD.
- **node_modules**: SheetJS (`xlsx`), `exceljs`, `papaparse` ausentes. Directorios residuales inexistentes.
- **Estado**: Rollback verificado y completo.

## 5. Auditoría estructural del lockfile
El lockfile publicado en HEAD presenta inconsistencias internas estructurales, auditadas estáticamente sin modificación:

| Paquete consumidor | Dependencia requerida | Rango o versión requerida | Resolución presente | Ubicación | Consistente |
| ------------------ | --------------------- | ------------------------- | ------------------- | --------- | ----------- |
| `@rolldown/binding-wasm32-wasi` | `@emnapi/core` | `1.10.0` | `null` | Ausente | Falso |
| `@rolldown/binding-wasm32-wasi` | `@emnapi/runtime` | `1.10.0` | `null` | Ausente | Falso |
| N/A | `@emnapi/wasi-threads` | N/A | `1.2.1` | `node_modules/@emnapi/wasi-threads` | Desvinculado |

- **Veredicto**: `PREEXISTING_LOCKFILE_DEFECT_CONFIRMED`

## 6. Gobernanza de Node y npm

| Elemento de gobernanza | Existe | Valor | Fuente | Estado |
| ---------------------- | -----: | ----- | ------ | ------ |
| Sistema Operativo | Sí | macOS (Darwin 25.5.0) | `uname -a` | `GOVERNED` |
| Arquitectura | Sí | arm64 | `uname -a` | `GOVERNED` |
| Node | Sí | v24.13.0 | `node -v` | `GOVERNED` |
| npm | Sí | 11.6.2 | `npm -v` | `GOVERNED` |
| lockfileVersion | Sí | 3 | `package-lock.json` | `GOVERNED` |
| packageManager | No | `null` | `package.json` | `UNGOVERNED` |
| engines | No | `null` | `package.json` | `UNGOVERNED` |
| .npmrc / .nvmrc / .node-version | No | N/A | FS | `UNGOVERNED` |

- **Veredicto general**: `PARTIALLY_GOVERNED`

## 7. Reproducción aislada R1–R3
- **R1 (`npm ci`)**: Falló exitosamente en directorio aislado. Error idéntico al reportado (`Missing: @emnapi/core@1.10.0`).
- **R2 (Repetición)**: Falló de manera idéntica.
- **R3 (Diagnóstico con `npm install`)**: `npm` reescribió el lockfile temporal añadiendo `@emnapi/core@1.10.0`, `@emnapi/runtime@1.10.0` y actualizando `@emnapi/wasi-threads` a `1.2.2`.

## 8. Análisis causal

| Hipótesis | Evidencia a favor | Evidencia en contra | Veredicto |
| --------- | ----------------- | ------------------- | --------- |
| H1 (Defecto preexistente) | `npm ci` falla desde un HEAD intacto en entornos aislados. Lockfile omite dependencias. | Ninguna | Confirmada |
| H2 (Deriva por npm 11) | npm 11.6.2 intenta auto-reparar la estructura defectuosa. | No hay evidencia de otras versiones. | `TOOLCHAIN_CONTRIBUTION_POSSIBLE_NOT_PROVEN` |
| H3 (Deriva por SheetJS) | N/A | El fallo sucede sin instalar SheetJS. | Rechazada |
| H4 (Entorno local) | El build compila con `node_modules` actuales pese al lockfile. | N/A | `LOCAL_ENVIRONMENT_HEALTHY_BUT_NOT_REPRODUCIBLE` |

## 9. QA técnico actual
- **TypeScript**: 0 errores (`tsc --noEmit`).
- **Build**: Exitoso (`npm run build`).
- **Chunk principal**: `dist/assets/index-TULkNSGF.js` (324.25 kB).
- **Aclaración obligatoria**: Un build exitoso valida el entorno local actual. No demuestra una instalación limpia reproducible. `npm ci` en el entorno aislado es la evidencia para reproducibilidad.

## 10. Reproducibilidad frente a entorno local
Se confirma que el repositorio actual compila gracias a un `node_modules` funcional histórico, pero no es determinísticamente reproducible mediante `npm ci` debido a un defecto preexistente en el `package-lock.json`.

## 11. Seguridad e imports
- **Imports**: 0 de `xlsx`.
- **Workers**: 0 instancias de `Worker` o `FileReader`.
- **Seguridad**: U1 y U2 intactas, `Continuar` deshabilitado.

## 12. Auditoría documental
- **Rollback completo**: `VERIFIED`
- **Causa preexistente**: `VERIFIED`
- **npm 11 como contribuyente**: `PARTIALLY_VERIFIED`
- **Fallo de npm ci**: `VERIFIED`
- **SheetJS ausente**: `VERIFIED`
- **Baseline recuperado**: `VERIFIED`
- **Ausencia de temporales**: `VERIFIED`
- **Autorización exclusiva para QA**: `VERIFIED`

## 13. Hallazgos
- **Medium**: Ausencia de configuración `engines` y `packageManager` (`PARTIALLY_GOVERNED`).
- **Medium**: El repositorio sufre del síndrome "it works on my machine" (`LOCAL_ENVIRONMENT_HEALTHY_BUT_NOT_REPRODUCIBLE`).

## 14. Archivos creados y modificados
- **Creados**: `docs/U3_P1_DEPENDENCY_QA.md`
- **Modificados**: `docs/QA_CHECKLIST.md`, `docs/PROMPT_LOG.md`

## 15. QA de integridad
- 1. Solo cambiaron los archivos documentales permitidos.
- 2-12. Código, U1, U2, dependencias de compilación y metadata intactos.
- 13-17. SheetJS no instalado, sin Worker, sin parser, `Continuar` deshabilitado.
- 18. Temporales fueron eliminados.
- 19-20. No se hizo commit ni push.

## 16. Autorización o bloqueo
Autoriza únicamente: **Fase 4C2D1.2 · Package Manager and Lockfile Reproducibility Decision Gate**.

## 17. Estado
Aprobada.
