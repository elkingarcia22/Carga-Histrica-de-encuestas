# Fase 4C2D1 · SheetJS Dependency Acquisition and Integrity Checkpoint Report

## 1. Resumen ejecutivo
Se ejecutó la instalación controlada de SheetJS CE `0.20.3` proveniente exclusivamente de la fuente autorizada en P0. Se verificó el baseline del bundle, la integridad estática (SHA-256) del artefacto, la metadata sin dependencias inesperadas, y se bloqueó la ejecución de scripts. No se introdujeron imports en la aplicación productiva, validando el aislamiento del spike. El resultado es `DEPENDENCY_INSTALLED_FOR_ISOLATED_SPIKE`.

## 2. Estado formal
- **Objetivo**: Adquirir e instalar de manera segura y verificable SheetJS CE 0.20.3.
- **Commit base**: `5598884858b2a0e85791debb24903a3809ff5814`
- **Fecha**: 2026-06-11T07:37:00-05:00
- **Fuente**: `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`

## 3. Gate inicial
- **Rama**: `main`
- **HEAD**: `5598884858b2a0e85791debb24903a3809ff5814`
- **Working Tree**: Limpio.
- **Dependencias**: Confirmada la ausencia de `xlsx`, `exceljs` y `papaparse`.

## 4. Baseline previo
- **TypeScript**: 0 errores de compilación (`tsc --noEmit`).
- **Build**: Exitoso (`npm run build` en 3.01s).
- **Bundle**: `dist/assets/index-TULkNSGF.js` (324.25 kB).

## 5. Artefacto e integridad
- **Nombre**: `xlsx-0.20.3.tgz`
- **Tamaño**: 2409319 bytes.
- **Hash calculado**: `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8`
- **Hash esperado**: `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8`
- **Coincidencia**: Exacta.

## 6. Metadata y scripts
- **Nombre en `package.json`**: `xlsx`
- **Versión**: `0.20.3`
- **Scripts identificados**: Sin hooks maliciosos (`preinstall`, `install`, `postinstall`).
- **Dependencias de producción**: Ninguna.
- **Licencia**: Apache-2.0.

## 7. Instalación controlada
- **Comando**: `npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz --ignore-scripts --save-exact`
- **Comportamiento**: Restringido para no ejecutar scripts, anclado al URL exacto.

## 8. Cambios en package.json
Se agregó la dependencia directamente anclada a la URL del tarball:
```json
"xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"
```

## 9. Cambios en lockfile
Se registró la resolución de `xlsx` apuntando a `cdn.sheetjs.com` con el campo `integrity` correspondiente a `sha512-oLDq3jw...`. Adicionalmente, el gestor de paquetes actualizó de manera rutinaria unas sub-dependencias puramente de desarrollo (`@emnapi/wasi-threads` subió a `1.2.2`).

## 10. Versión y árbol resuelto
- **Versión en node_modules**: `0.20.3`
- **Instalación de paquetes adicionales**: Ningún paquete sospechoso ni parsers paralelos (`exceljs`, `papaparse` ausentes).

## 11. QA técnico posterior
- **TypeScript**: 0 errores nuevos (`tsc --noEmit`).
- **Build**: Exitoso en 3.54s.

## 12. Bundle
- **Resultado post-instalación**: `dist/assets/index-TULkNSGF.js` (324.25 kB).
- **Análisis**: Idéntico al baseline. SheetJS no aparece en el chunk principal debido a la ausencia de importaciones.

## 13. Seguridad e imports
- No existen importaciones de `xlsx` en `src/**`.
- Solo existen referencias en strings al formato `.xlsx`.
- No hay código Worker, fetch de CDN en runtime ni telemetría.

## 14. Rollback
En caso de falla o reversión manual:
1. Ejecutar `git restore package.json package-lock.json`.
2. Ejecutar `rm -rf node_modules/xlsx` o `npm ci`.
3. Ejecutar `npx tsc --noEmit && npm run build`.
4. Verificar que el build retorne el tamaño original y no quede rastro de `xlsx`.

## 15. Riesgos residuales
- La dependencia es grande y aunque no forma parte del main bundle, deberá ser encapsulada estrictamente en un Web Worker (P1B) para no impactar el rendimiento.

## 16. Archivos creados y modificados
- **Modificados**: `package.json`, `package-lock.json`, `docs/PROMPT_LOG.md`
- **Creados**: `docs/U3_P1_DEPENDENCY_ACQUISITION.md` (este documento).

## 17. QA de integridad
El repositorio en `src/` no sufrió modificaciones, U1 y U2 continúan intactas, y los botones relacionados como `Continuar` permanecen deshabilitados.

## 18. Autorización o bloqueo para Fase 4C2D2
**Aprobada**. La dependencia se encuentra instalada, aislada y sin fugas en la aplicación productiva.

## 19. Estado
`DEPENDENCY_INSTALLED_FOR_ISOLATED_SPIKE`

---

## Anexo: Fase 4C2D1.1 · Lockfile Drift Recovery Hotfix

- **Hallazgo original**: Mutación no explicable de la dependencia `@emnapi/wasi-threads` (1.2.1 -> 1.2.2) y aparición de dependencias no relacionadas de `@emnapi` durante la fase 4C2D1.
- **Paquete afectado**: `@emnapi/wasi-threads`.
- **Diff causal**:
  - `package.json` -> Adición de `xlsx` (`SHEETJS_REQUIRED`)
  - `package-lock.json` -> Adición de `xlsx` (`SHEETJS_REQUIRED`)
  - `package-lock.json` -> Actualización de `@emnapi/wasi-threads` a `1.2.2` (`UNRELATED_VERSION_DRIFT`)
  - `package-lock.json` -> Adición de `@emnapi/core` y `@emnapi/runtime` (`UNRELATED_VERSION_DRIFT`)
- **Node y npm**: Node v24.13.0, npm 11.6.2.
- **Lockfile version**: 3
- **Causa demostrada**: El lockfile original de la rama principal (`HEAD`) presentaba inconsistencias internas (dependencias faltantes de `@rolldown/binding-wasm32-wasi`). Al ejecutar cualquier comando de instalación, npm corrigió la inconsistencia y desplazó dependencias opcionales de la rama.
- **Alternativas evaluadas**: 
  - A. Regeneración mínima: Falló debido a que `npm ci` no puede reproducir el árbol base original.
  - B. Toolchain compatible: No aplicable.
  - C. Rollback total: Obligatorio ante la imposibilidad de reproducir limpiamente el árbol sin derivas.
- **Resultado Final**: Resultado B (Rollback Seguro).
- **Diff final**: Idéntico a `HEAD`.
- **Instalación limpia**: Descartada por fallo inherente en el lockfile base, se restauró el entorno local limpiando dependencias ajenas.
- **TypeScript**: Aprobado.
- **Build**: Aprobado.
- **Bundle**: Restaurado al baseline.
- **Rollback**: Restaurados `package.json` y `package-lock.json` desde `HEAD`. Mantenimiento estricto de gobernanza sin realizar commmits ni push.
- **Riesgos residuales**: Imposibilidad de instalar `SheetJS` reproduciblemente sin corregir la deriva del toolchain general del proyecto.
- **Autorización / Bloqueo**: Se bloquea Fase 4C2D2 (`BLOCKED_BY_PACKAGE_MANAGER_REPRODUCIBILITY`). No se autoriza Fase 5C1. Se autoriza auditoría independiente.
