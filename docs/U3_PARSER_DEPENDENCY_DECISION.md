# Fase 4C2C.1 · Parser Dependency Decision Gate Report

## 1. Resumen ejecutivo
El objetivo de esta fase (P0) es evaluar formalmente y seleccionar una biblioteca para parseo de archivos Excel que será autorizada para un spike técnico aislado (P1) en un Web Worker. Se evaluaron **SheetJS Community Edition** (0.20.3) y **ExcelJS** (4.4.0) bajo criterios de procedencia, integridad, seguridad, soporte y riesgos arquitectónicos.

La decisión final autoriza el spike de **SheetJS CE** condicionado al uso estricto de su fuente oficial y la validación de 20 condiciones específicas en P1. **ExcelJS** queda como candidato secundario en caso de bloqueo (`SECONDARY_CANDIDATE_NOT_SELECTED`). No se han instalado dependencias ni ejecutado código en esta fase.

## 2. Estado formal
* Fase actual: 4C2C.1
* Estado: `DEPENDENCY_SPIKE_APPROVED_WITH_CONDITIONS`
* Candidato seleccionado para P1: **SheetJS CE** (0.20.3)
* Candidato secundario: **ExcelJS** (4.4.0) - `SECONDARY_CANDIDATE_NOT_SELECTED`

## 3. Gate inicial
* Rama: `main`
* HEAD === `origin/main`: Sí.
* Working tree limpio, sin unstaged ni untracked: Sí.
* Commit base: `6895e681dbcdae9216157ae2bdc4d7c6931f218d`
* Ausencia de `xlsx`, `exceljs`, y `papaparse` instalados: Confirmada.
* Ausencia de Worker de U3, contratos de profiling y fixtures de spreadsheets: Confirmada.
* U1 y U2 congeladas: Confirmadas.

## 4. Artefactos inspeccionados
Se descargaron temporalmente fuera del repositorio:
1. `xlsx-0.20.3.tgz`
2. `exceljs-4.4.0.tgz`
Los artefactos fueron inspeccionados extrayendo su `package.json` para revisión de scripts, dependencias y metadatos sin ejecución, siendo posteriormente eliminados.

## 5. Procedencia
| Campo | SheetJS CE | ExcelJS |
| --- | --- | --- |
| Paquete | `xlsx` | `exceljs` |
| Versión | `0.20.3` | `4.4.0` |
| Fuente oficial | `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` | `https://registry.npmjs.org/exceljs/-/exceljs-4.4.0.tgz` |
| Artefacto | `xlsx-0.20.3.tgz` | `exceljs-4.4.0.tgz` |
| Hash disponible | N/A en registry público | `cfb1cb8dcc82c760a9fc9faa9e52dadab66b0156` (shasum npm) |
| Hash calculado (SHA-256) | `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8` | `8adac13d192ce80e11304732d3ab96708b2c64bb54771b5da4f946e5eea55a18` |
| Fuente reproducible | Sí (URL oficial versionada) | Sí (NPM registry) |
| Riesgo de disponibilidad | Medio (Dependencia de CDN externo vs Registro público) | Bajo (Registro público de npm) |
| Estado | `EVIDENCE_SUPPORTS_SPIKE` | `EVIDENCE_SUPPORTS_SPIKE` |

## 6. Integridad
* **SheetJS**: Versión exacta `0.20.3` desde fuente oficial versionada. Fecha de descarga e inspección: 2026-06-10. SHA-256 calculado: `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8`. Artefacto eliminado y no ejecutado.
* **ExcelJS**: Versión exacta `4.4.0` desde el registro oficial. SHA-256 calculado: `8adac13d192ce80e11304732d3ab96708b2c64bb54771b5da4f946e5eea55a18`. Artefacto eliminado y no ejecutado.

El hash calculado prueba identidad del artefacto inspeccionado. No prueba por sí solo que el código sea seguro. Para reproducibilidad futura, P1 debe comprobar que la descarga coincide con el hash aprobado. Una divergencia de hash bloquea la instalación.

## 7. Metadata y scripts
### SheetJS CE
| Área | Evidencia | Riesgo | Resultado |
| --- | --- | --- | --- |
| preinstall / install / postinstall | No declara scripts de instalación automáticos. | Bajo | `APPROVED` |
| dependencies | No posee dependencias de producción. | Bajo | `APPROVED` |
| optional / native modules | No declara. | Bajo | `APPROVED` |
| descarga en runtime / red | No se identificaron dependencias en metadata. La documentación oficial permite distribución local y no requiere CDN por diseño. | Pendiente de P1 | `MUST_BE_PROVEN_IN_P1` |
| telemetría / CSP | Pendiente de verificación en runtime. | Pendiente de P1 | `MUST_BE_PROVEN_IN_P1` |
| Worker compatibilidad | Documentado soporte ESM. | Pendiente de P1 | `MUST_BE_PROVEN_IN_P1` |

### ExcelJS
| Área | Evidencia | Riesgo | Resultado |
| --- | --- | --- | --- |
| preinstall / install / postinstall | No declara scripts de ejecución riesgosa. | Bajo | `APPROVED` |
| dependencies | 9 dependencias directas (`archiver`, `dayjs`, `fast-csv`, `jszip`, `readable-stream`, `saxes`, `tmp`, `unzipper`, `uuid`). | Alto | `REQUIRES_BUNDLE_AND_SECURITY_REVIEW` |
| optional / native modules | No posee, `saxes` y `tmp` son dependencias directas declaradas. | Medio | `REQUIRES_BUNDLE_AND_SECURITY_REVIEW` |
| Browser entry | Bundle de navegador documentado. | Documentado | `EVIDENCE_FOUND` |
| Vite Worker compatibilidad | Sujeta a verificación de polyfills. | Pendiente de P1 | `MUST_BE_PROVEN_IN_P1` |

## 8. Dependencias transitivas
* **SheetJS CE**: `0` dependencias directas o transitivas declaradas.
* **ExcelJS**: `9` dependencias directas, más las transitivas asociadas (notablemente `jszip` y `saxes`). El árbol amplio requiere revisión profunda para entornos productivos.

## 9. Advisories
### SheetJS CE
**Estado:** `CONFLICTING_SECURITY_EVIDENCE_RESOLVED_FOR_ISOLATED_SPIKE`
* Identificador público: Reportes históricos de Prototype Pollution asociados al paquete npm desactualizado.
* Versiones reportadas: `~0.19.3` (npm registry).
* Corrección declarada: El proveedor (SheetJS) declara correcciones en sus builds recientes (CDN). SheetJS CE `0.20.3` es posterior a la versión de corrección declarada.
* **Resolución:** Existe divergencia entre herramientas de seguridad (que escanean el registro npm) y la fuente del proveedor. No existe evidencia actual de que la versión `0.20.3` oficial (CDN) esté afectada por ese advisory concreto. El historial de seguridad se conserva para trazabilidad y P1 debe ejecutar revisión de dependencia y escaneo con la fuente exacta instalada.

### ExcelJS
**Estado:** `APPLICABLE_ADVISORY_REQUIRES_REVIEW`
* Advisory: Existen reportes conocidos relacionados con sus dependencias subyacentes transitivas (`jszip`). Requiere revisión profunda de mitigación antes de uso productivo.

## 10. Licencias y atribución
| Candidato | Licencia identificada | Evidencia | Obligaciones | Revisión legal | Estado |
| --- | --- | --- | --- | --- | --- |
| SheetJS CE | Apache-2.0 | `package.json`, LICENSE | Atribución en avisos / NOTICE requerida en UI. | Recomendada | `LICENSE_IDENTIFIED_LEGAL_REVIEW_PENDING` |
| ExcelJS | MIT | `package.json`, LICENSE | Conservación del aviso. | Recomendada | `LICENSE_IDENTIFIED_LEGAL_REVIEW_PENDING` |

## 11. Compatibilidad teórica
SheetJS declara en documentación oficial el uso aislado ESM compatible con entornos sin abstracciones Node (`fs`, `stream`), mientras que ExcelJS requiere evaluación estricta en Vite Worker por sus dependencias (`archiver`, `tmp`, etc.). Ambas herramientas tienen el estado real `MUST_BE_PROVEN_IN_P1`.

## 12. Formatos
* **SheetJS CE**: Documenta soporte oficial para `.xlsx`, `.xls`, `.csv`, etc.
* **ExcelJS**: Documenta soporte para `.xlsx` y `.csv`. Soporte `.xls`: `NOT_DOCUMENTED`.

> [!IMPORTANT]
> El Spike P1 se limitará estricta y exclusivamente a `.xlsx`. El soporte de `.xls` queda diferido a P4 de acuerdo al gate de formatos.

## 13. Bundle y CSP
Ambos candidatos tienen el estado `MUST_BE_PROVEN_IN_P1`.
**Umbral provisional para P1:**
* El incremento del Worker chunk gzipeado no debe exceder 1 MB. Es un umbral de spike, no productivo; si se excede, debe evaluarse y no rechazarse silenciosamente.
* El `main` chunk no debe incorporar el parser (0 KB incrementados en main thread).

## 14. Estrategia de adquisición
### P1 · Spike aislado
**Estado:** `APPROVED_FOR_P1_ONLY`
* Artefacto oficial versionado fijado en `package.json`.
* URL: `"xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"`.
* Instalación local autorizada solo después de verificar el hash aprobado. Lockfile será generado y auditado, garantizando que no se use registro desactualizado.
* Sin CDN en runtime y sin vendor local en este checkpoint.

### Producción futura
**Estado:** `PRODUCTION_ACQUISITION_OPEN`
* Se mantienen abiertas las estrategias de vendoring controlado, registro interno, mirror corporativo o fuente oficial fijada para cuando termine P1.

## 15. Rollback
Criterios definidos para P1:
### Antes del commit
* Restaurar `package.json` y lockfile al estado del checkpoint P0.
* Limpiar dependencias en `node_modules` y archivos residuales del spike.
* Confirmar ausencia de imports de `xlsx`.
* Ejecutar TypeScript y Build originales para confirmar baseline.
### Después del commit
* Si es necesario tras evaluación, realizar commit normal de reversión (sin force push).
* Confirmar que el lockfile refleja la ausencia del parser.
* Asegurar que U1 y U2 sigan intactas.

## 16. Matriz ponderada
| Criterio | Peso | SheetJS CE | Evidencia | Incertidumbre |
| --- | ---: | ---: | --- | --- |
| Procedencia e integridad | 25 | 25 | Oficial, hash idéntico | Mínima |
| Seguridad y advisories | 20 | 15 | 0 deps, advisory divergente | Validación P1 del advisory |
| Compatibilidad Worker/browser | 15 | 5 | Documental (`xlsx.mjs`) | Pendiente prueba en Vite |
| Licencia y atribución | 10 | 5 | Apache-2.0 detectada | Revisión legal pendiente |
| API adecuada para inspección | 10 | 5 | ArrayBuffer read documentado | Pendiente confirmación P1 |
| Bundle y transitivas | 10 | 5 | 0 dependencias transitivas | Bundle real pendiente |
| Reproducibilidad y rollback | 10 | 10 | URL explícita | Ninguna |
| **Total** | **100** | **70** | | |

| Criterio | Peso | ExcelJS | Evidencia | Incertidumbre |
| --- | ---: | ---: | --- | --- |
| Procedencia e integridad | 25 | 25 | NPM, hash idéntico | Mínima |
| Seguridad y advisories | 20 | 5 | 9 deps directas, riesgo jszip | Vulnerabilidades transitivas |
| Compatibilidad Worker/browser | 15 | 0 | Browser entry documentado | Node polyfills en Vite |
| Licencia y atribución | 10 | 5 | MIT detectada | Revisión legal pendiente |
| API adecuada para inspección | 10 | 0 | Basado en streams Node | Complejidad en aislar worker |
| Bundle y transitivas | 10 | 0 | 9 dependencias directas | Riesgo de inflar build |
| Reproducibilidad y rollback | 10 | 10 | NPM fixado | Ninguna |
| **Total** | **100** | **45** | | |

## 17. Decisión del candidato
El candidato **SheetJS CE (0.20.3)** es el mejor posicionado para P1 debido a su menor árbol de dependencias, API documentada y mejor adecuación teórica. Se le otorga el estado:
**`DEPENDENCY_SPIKE_APPROVED_WITH_CONDITIONS`**

ExcelJS queda como `SECONDARY_CANDIDATE_NOT_SELECTED`. No debe instalarse en paralelo.

## 18. Condiciones obligatorias para P1
P1 debe demostrar estrictamente:
1. La descarga coincide con el SHA-256 aprobado.
2. `package.json` y lockfile cambian únicamente por la dependencia autorizada.
3. No existen scripts de instalación ejecutados por el paquete.
4. Parser importado exclusivamente dentro del Worker aislado.
5. Cero import del parser desde componentes o hooks productivos.
6. Worker compila con Vite.
7. Fixture XLSX sintético mínimo abre.
8. Se enumeran hojas.
9. Se obtiene un resultado mínimo serializable.
10. Ningún valor crudo cruza al hilo principal.
11. Cero requests de red durante runtime.
12. CSP-sensitive constructs documentadas.
13. Main chunk medido.
14. Worker chunk medido.
15. Bundle comparado con baseline.
16. TypeScript pasa.
17. Build pasa.
18. U1 y U2 permanecen intactas.
19. `Continuar` sigue deshabilitado.
20. Rollback puede restaurar el baseline.

## 19. Riesgos residuales
Se mantienen abiertos los siguientes riesgos post-P0:
* Revisión legal.
* CSP.
* Runtime network.
* Worker stability.
* Bundle final.
* Memoria máxima requerida.
* ZIP expansion exploits (bombas ZIP).
* Errores silenciosos del parser.
* File frente a ArrayBuffer transfer.
* Presupuesto duro de tiempo.
* Soporte a futuro para `.xls`.
* Decisión productiva de adquisición.
* Actualizaciones a futuro y fin de soporte.
* Divergencia de bases de datos de advisories.
*(El árbol sin dependencias minimiza, pero no elimina por completo el riesgo de supply chain).*

## 20. Decision gates abiertos
* Autorización a P1 y ejecución exitosa.
* Estrategia de vendoring vs mirror en producción.

## 21. Archivos creados y modificados
* `docs/U3_PARSER_DEPENDENCY_DECISION.md` (Modificado)
* `docs/PROMPT_LOG.md` (Modificado)

## 22. QA de integridad
* 1. Solo cambiaron los dos archivos documentales.
* 2. No cambió `src/`, U1, U2, contratos, schemas ni fixtures.
* 3. No se instaló nada y el working tree no tiene código ni tests adicionales.

## 23. Autorización o bloqueo para P1
Queda autorizada formalmente la fase **Fase 4C2D · P1 Isolated Worker and XLSX Spike** para **SheetJS CE (0.20.3)**, bajo las condiciones previamente descritas.

## 24. Estado
**Aprobada.**
