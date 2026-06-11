# Fase 4C2D1.2 · Package Manager and Lockfile Reproducibility Decision Gate

## 1. Resumen ejecutivo
La Fase 5C1 demostró que el entorno local actual compila correctamente pero el `package-lock.json` de `HEAD` no permite una instalación limpia y reproducible con `npm ci`. El fallo se localiza en resoluciones incompletas de dependencias relacionadas con el compilador subyacente de Vite (`@rolldown/binding-wasm32-wasi` y la cadena Emnapi). Adicionalmente, el proyecto carece de gobernanza explícita del toolchain (`packageManager`, `engines`, `.node-version`). Se ha evaluado la situación y se proponen alternativas, recomendando la creación de una rama técnica temporal para gobernar el toolchain (Node v24.13.0 / npm 11.6.2) y regenerar controladamente el lockfile antes de intentar cualquier adquisición de nuevas dependencias como SheetJS.

## 2. Estado formal
- **Objetivo**: Documentar el defecto de reproducibilidad y definir un plan de reparación de la gobernanza de paquetes y lockfile.
- **Commit base**: `5598884858b2a0e85791debb24903a3809ff5814`
- **Fecha**: 2026-06-11
- **Resultado de auditoría**: `QA_CONFIRMS_SAFE_ROLLBACK_AND_REPRODUCIBILITY_BLOCKER`

## 3. Gate inicial
- **Rama actual**: `main`
- **Hash de HEAD**: `5598884858b2a0e85791debb24903a3809ff5814`
- **HEAD === origin/main**: Sí
- **Tracking**: `origin/main` (Ahead: 0, Behind: 0)
- **Staging**: Vacío
- **Cambios locales**: Únicamente archivos de documentación de auditorías y logs de la fase anterior (no rastreados/modificados, aceptados en el protocolo de la fase documental).

## 4. Validación de Fase 5C1
- Rollback completo: `VERIFIED`
- SheetJS ausente: `VERIFIED`
- Package files iguales a HEAD: `VERIFIED`
- Fallo reproducible de `npm ci`: `VERIFIED`
- Fallo presente sin SheetJS: `VERIFIED`
- Build local exitoso: `VERIFIED`
- Diferencia entre entorno local funcional y entorno limpio reproducible: `VERIFIED`
- Lockfile estructuralmente incompleto: `VERIFIED`
- Toolchain no gobernado o parcialmente gobernado: `VERIFIED`

## 5. Alcance del defecto

| Área auditada | Evidencia | Alcance observado | Confianza | Estado |
| ------------- | --------- | ----------------- | --------: | ------ |
| Lockfile Emnapi | Fallos en `npm ci` aislando `node_modules` | Resolución faltante de `@emnapi/core` y `runtime` v1.10.0 | Alta | Opción A (Defecto localizado) |
| Integridad Global | El resto del árbol instala y compila bien localmente | Defecto acotado al sub-árbol de Rolldown | Media | Opción A (Defecto localizado) |
| Toolchain | `npm ci` con v11.6.2 lo detecta y `npm install` intenta corregirlo | Falta gobernanza de la versión original con que se creó el lockfile | Alta | Opción C (Interpretación dependiente del toolchain) |

**Conclusión del alcance**: El problema parece ser predominantemente una "Opción A (Defecto localizado)" pero exacerbado por "Opción C (Interpretación dependiente del toolchain)" al estar usando Node 24 y npm 11 sin un `.node-version` que ancle el comportamiento.

## 6. Gobernanza actual del toolchain

| Elemento | Valor encontrado | Fuente | Riesgo | Recomendación |
| -------- | ---------------- | ------ | ------ | ------------- |
| Node | v24.13.0 | Entorno (Terminal) | Alto (Falta de anclaje) | Adoptar e instituir en `.node-version` e `engines` |
| npm | 11.6.2 | Entorno (Terminal) | Alto (Falta de anclaje) | Adoptar e instituir vía `packageManager` |
| lockfileVersion | 3 | `package-lock.json` | Bajo | Mantener |
| packageManager | Ausente | `package.json` | Alto | Agregar `"packageManager": "npm@11.6.2"` |
| engines | Ausente | `package.json` | Medio | Agregar `"engines": {"node": ">=24.0.0", "npm": ">=11.0.0"}` |
| .npmrc | Ausente | FS | Bajo | No estrictamente necesario ahora |
| .node-version | Ausente | FS | Alto | Crear archivo `.node-version` |

**Estado Global**: `TOOLCHAIN_UNGOVERNED` en el proyecto (solo existe de facto en la máquina).

## 7. Alternativas evaluadas

### Alternativa A · Gobernar Node/npm actual y regenerar el lockfile completo
Adoptar formalmente v24 y npm 11, borrando dependencias y regenerando el lockfile completo para asegurar total consistencia.

### Alternativa B · Identificar y usar el toolchain original
Buscar qué versión de Node/npm originó el lockfile y retroceder a ella. (Requiere investigación que puede ser infructuosa; Node 24 es el actual y compila bien).

### Alternativa C · Reparación mínima del lockfile
Editar a mano el `package-lock.json` para agregar los `@emnapi` faltantes.

### Alternativa D · Corregir primero el Starter Kit upstream
Trasladar la corrección al repositorio plantilla y luego importar aquí.

### Alternativa E · Mantener bloqueo
No hacer nada y detener U3.

## 8. Matriz de decisión

| Alternativa | Ventajas | Riesgos | Evidencia necesaria | Recomendación | Estado |
| ----------- | -------- | ------- | ------------------- | ------------- | ------ |
| A. Regenerar actual | Asegura alineación total, soluciona `npm ci` futuro | Actualización de dependencias indirectas puede romper cosas | QA exhaustivo post-regeneración | La más robusta a futuro | `RECOMMENDED` |
| B. Toolchain original | Mínimo diff | Entorno obsoleto, difícil de adivinar sin logs | Logs históricos de creación del repo | Inviable temporalmente | `REJECTED` |
| C. Reparación mínima | Mínimo impacto | Lockfile inconsistente "artesanal", muy propenso a errores | Estructura exacta requerida por npm v3 | Peligrosa | `REJECTED` |
| D. Corregir upstream | Solución de raíz | Retrasa el prototipo U3 de forma crítica | Aceptación del PR upstream | Ideal pero lenta | `DEFERRED` |
| E. Bloqueo | Riesgo cero | Mata la iniciativa de U3 | Ninguna | Contraproducente | `REJECTED` |

## 9. Ownership recomendado

**Veredicto**: `TECHNICAL_BRANCH_REQUIRED`
Debe crearse una rama técnica temporal en el prototipo actual para la ejecución de la "Alternativa A". A mediano plazo, una vez verificado, el arreglo debería ser portado al Starter Kit (`FIX_IN_UPSTREAM_STARTER`).

## 10. Estrategia de toolchain

- **Versión de Node candidata**: `24.13.0`
- **Versión de npm candidata**: `11.6.2`
- **Gobernanza**: 
  - Archivo `.node-version` en la raíz.
  - Campo `engines` en `package.json`.
  - Campo `packageManager` en `package.json`.
- **Estado**: `READY_TO_GOVERN`

## 11. Estrategia de lockfile

1. **Preparación**: Crear rama técnica separada. Asegurar working tree limpio.
2. **Regeneración**: Actualizar gobernanza en `package.json`. Eliminar `node_modules` y `package-lock.json`. Ejecutar `npm install` (sin `--force`, sin SheetJS, sin `audit fix`). 
3. **Validación**: Borrar `node_modules`. Ejecutar `npm ci --ignore-scripts` para validar idempotencia. Correr build y TypeScript.
4. **Aprobación**: Revisión de QA sobre las pruebas construidas. Checkpoint.

## 12. Secuencia futura de commits

1. **Commit I · Toolchain Governance**: Creación de `.node-version` y modificación de `package.json` (`engines`, `packageManager`).
2. **Commit II · Lockfile Reproducibility Repair**: `npm install` limpio y adición de un `package-lock.json` funcional y consistente.
3. **Commit III · SheetJS Dependency Acquisition**: Solo tras éxito en CI de Commit II.
4. **Commit IV · Worker Spike**: Construcción inicial del worker.

## 13. QA requerido

| Área | Prueba | Evidencia | Criterio de aprobación | Severidad si falla |
| ---- | ------ | --------- | ---------------------- | ------------------ |
| Instalación | `npm ci --ignore-scripts` | Terminal aislado | Éxito total sin advertencias estructurales | Bloqueante |
| Idempotencia | Segunda ejecución de `npm ci` | Terminal aislado | Lockfile sin cambios de Git | Bloqueante |
| Compilación | `tsc -b && vite build` | Directorio `dist` | 0 errores de Typescript, build OK | Bloqueante |
| UI Core | Carga y render de U1/U2 | Servidor Vite | Interfaz sin errores de consola | Alta |

## 14. Rollback
- **Reparación no commiteada**: `git checkout -- .` y `git clean -fd`. Restaurar entorno aislado.
- **Reparación commiteada**: `git revert <commit>`. 
- **Upstream**: No aplicar directamente, abrir fase en el Starter Kit y sugerir cambios mediante Pull Request independiente.

## 15. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación | Evidencia pendiente | Owner |
| ------ | ------------ | ------- | ---------- | ------------------- | ----- |
| Actualización indirecta rompe la build | Media | Alto | Verificación de build y TypeScript pos-regeneración | Resultados de QA de Commit II | Platform Architect |
| Vite o Rolldown fallan con nueva Emnapi | Baja | Alto | Servir preview local y revisar logs | `vite preview` | Platform Architect |
| Divergencia extrema de lockfile con upstream | Alta | Medio | Extraer listado de cambios directos para el PR upstream | Git Diff final | Repository Owner |

## 16. Decision gates abiertos
- Aprobación explícita para la "Alternativa A" (regeneración total).
- Confirmación de si el arreglo de upstream se hace en paralelo o posterior al prototipo.
- Eventual adquisición de SheetJS tras la reparación.

## 17. Archivos creados y modificados
- `docs/PACKAGE_MANAGER_LOCKFILE_DECISION.md` (Este documento)
- `docs/PROMPT_LOG.md` (Registro de fase)

## 18. QA de integridad
- Archivos de código y configuración intactos.
- No se instalaron dependencias.
- No se ejecutó ningún `npm ci` ni `install`.
- No hay código del parser ni worker.

## 19. Autorización o bloqueo para la siguiente fase
Autoriza únicamente: **Fase 4C2D1.3 · Lockfile Reproducibility Repair Plan**

## 20. Estado
Aprobada.
