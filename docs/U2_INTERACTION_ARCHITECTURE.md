# U2 Interaction Architecture Lock

## 1. Propósito
Bloquear formalmente la arquitectura de interacción U1–U2, estableciendo la fuente única de verdad, el manejo de estado efímero para archivos binarios, las reglas de lote, transiciones y responsabilidades de componentes para la pantalla U2 "Archivos seleccionados", antes de su construcción.

## 2. Contexto
Fase: 4B2
Pantalla: U2 · Archivos seleccionados
Macroetapa: `upload`
El intake (Fase 4B1) dejó sentadas las bases y límites provisionales. Esta fase define la separación estricta entre metadata serializable (UI) y referencias binarias efímeras, estableciendo un pipeline síncrono sin parser.

## 3. Fuentes
Orden de autoridad:
1. `docs/U2_INTERACTION_INTAKE.md`
2. `docs/DATA_CONTRACT_APPROVAL.md`
3. `docs/IMPORT_ARCHITECTURE.md`
4. `docs/IMPORT_ARCHITECTURE_APPROVAL.md`
5. `docs/SCREEN_MAP.md`
6. `docs/DATA_MODEL.md`
7. `docs/MOCK_DATA_CONTRACT.md`
8. `docs/U1_QA_REPORT.md`
9. `docs/DESIGN.md`
10. `docs/ANTIGRAVITY.md`
11. `docs/ARCHITECTURE.md`
12. `docs/QA_CHECKLIST.md`
13. `src/types/survey-import/`
14. `src/mocks/survey-import/scenarios/filesSelectedValidScenario.ts`
15. `src/mocks/survey-import/scenarios/uploadInitialScenario.ts`
16. Implementación actual de componentes de upload

## 4. Estado formal
`APPROVED_WITH_PROVISIONAL_LIMITS`

## 5. Decisiones congeladas
- U2 no necesita parser.
- Separación de `File` y metadata.
- Límites provisorios de tamaño y cantidad.
- Pipeline síncrono para validación preliminar.
- Componentes base (`UploadZone`, `FileUpload`, `FilePreview`) reciben props sin mutar fixtures.

## 6. Frontera U1–U2
- **Evento que inicia la selección:** Recepción de `File[]` emitido por el `onChange` del componente `UploadZone` o `FileUpload`.
- **Condición para entrar a U2:** Al menos un archivo presente en la selección (válido o inválido).
- **Selección vacía:** Mantiene la vista en `idle` (U1).
- **Archivos todos inválidos:** Transita a U2 mostrando la lista de archivos inválidos, con botón "Continuar" deshabilitado.
- **Cancelación nativa:** Si el usuario cancela el diálogo nativo sin archivos previos, se mantiene U1.
- **Estado de decisión:** `LOCKED`

## 7. Arquitectura de estado
Se resuelve la contradicción entre `useState<File[]>` y reducer, eliminando el uso de `File[]` en el estado visual. Quedan prohibidos explícitamente: `useState<File[]>`, estado duplicado, Context global para binarios, persistencia, Store externo y la mutación de `ImportSession` con objetos nativos. El estado de esta arquitectura queda explícitamente `LOCKED`.

### Estado serializable local (Reducer/Hook)
- Mantiene la vista (`idle` o `files-selected`).
- Metadata derivada de los archivos (`UploadFileItem` customizado).
- Resumen del lote (tamaño total, cantidad).
- Errores de validación seguros.
- Región de mensajes de accesibilidad.

### Estado binario efímero (Boundary)
- `Map<FileId, File>` manejado fuera del reducer (ej. `useRef` o componente orquestador sin triggering de re-renders por su contenido).
- No se serializa ni se envía al contexto global (`ImportSession`).
- Se destruye completamente al desmontar, cancelar o remover.

## 8. Fuente única de verdad
- El Reducer local es la única fuente de verdad para la UI (metadata).
- La Referencia Binaria Efímera es la única fuente para retener los blobs necesarios para el futuro parser.
- No se duplicará la metadata en el mapa de binarios, ni binarios en la metadata.
- **Estado de decisión:** `LOCKED`

## 9. Ciclo de vida de `File`
- Creación al seleccionar desde el File System.
- Asignación de ID efímero opaco (UUID local).
- Extracción síncrona de metadata (nombre, tamaño, tipo, lastModified).
- Almacenamiento en `Map<FileId, File>` si es válido, "warning", "duplicate" o individualmente válido dentro de un lote > 50 MB. (No se almacena para "unsupported", "too-large" individual > 25MB, "zero-byte", "temporary", "invalid-name" ni excedentes de 5 archivos).
- Destrucción al dispararse evento de remoción, cancelación, o desmontaje del componente.

## 10. Modelo local de metadata
Modelo conceptual (TypeScript interface a crear futuramente):
```typescript
interface LocalFileMetadata {
  id: string; // ID efímero opaco
  displayName: string; // Nombre visible (puede contener PII)
  extension: string; // Extensión normalizada
  mimeType: string; // MIME reportado
  size: number; // En bytes
  lastModified: number;
  status: 'valid' | 'invalid' | 'duplicate' | 'unsupported' | 'too-large' | 'warning';
  issues: string[]; // Errores legibles
  hasBinary: boolean; // Si se retuvo el blob
}
```
No contiene objetos complejos ni arrays de buffers.

## 11. Configuración de límites
- **Extensiones aceptadas:** `.xlsx`, `.xls`
- **CSV:** Excluido en esta fase inicial.
- **Máximo de archivos:** 5
- **Máximo por archivo:** 25 MB
- **Máximo del lote:** 50 MB
- **Prefijos temporales:** Rechazados (ej. `~$`).
- **Ubicación futura recomendada:** `src/config/survey-import/uploadLimits.ts`.
- **Estado de decisión:** `PROVISIONAL_LOCKED`

## 12. Pipeline
Orden estricto de ejecución síncrona:
1. Recibir `File[]`.
2. Ignorar selección vacía (no despachar acción).
3. Aplicar capacidad restante del lote (ignorar excedentes silenciados o con advertencia general).
4. Asignar IDs efímeros localmente.
5. Extraer metadata segura.
6. Normalizar extensión a minúsculas.
7. Detectar temporales del sistema (`~$`).
8. Validar nombre (no vacío).
9. Validar extensión.
10. Evaluar MIME (señal auxiliar).
11. Validar tamaño (> 0 bytes).
12. Validar tamaño máximo por archivo.
13. Detectar duplicados preliminares (Clave normalizada `normalizedNameKey` + Tamaño + LastModified).
14. Evaluar cantidad total y tamaño de lote.
15. Derivar estado visual.
16. Decidir si retener el binario (sí para valid, warning, duplicate, e individualmente válidos en lote bloqueado).
17. Actualizar `Map<FileId, File>`.
18. Despachar metadata al reducer/hook.
19. Re-render UI U2.

Prohibido: `FileReader`, Hashing, Parsing. Nunca transferir binarios entre IDs.

## 13. Política MIME
- Extensión permitida + MIME compatible = Válido.
- Extensión permitida + MIME vacío = Warning visual no bloqueante (permite continuar, retiene binario).
- Extensión permitida + MIME inesperado = Warning visual no bloqueante.
- Extensión no permitida = `unsupported` (bloquea, descarta binario), ignorando el MIME.
- MIME no corrige una extensión no autorizada.

## 14. Inválidos
| Categoría | Visible | Metadata | Binario | Bloquea |
| --- | --- | --- | --- | --- |
| `unsupported` | Sí | Sí | No | Sí |
| `too-large` | Sí | Sí | No | Sí |
| `temporary` | Sí | Sí | No | Sí |
| `zero-byte` | Sí | Sí | No | Sí |
| `invalid-name` | Sí | Sí | No | Sí |
| MIME warning | Sí | Sí | Sí | No |

## 15. Duplicados
- Criterio: Coincidencia de Clave Normalizada (`normalizedNameKey`) + Tamaño en bytes + `lastModified`.
- Un archivo duplicado aparece como fila visible, conserva su propio `File` (`hasBinary: true`), y bloquea el botón "Continuar".
- Cuenta para la cantidad y tamaño total del lote.
- Permite remoción para desbloquear el lote. Se reevalúa después de cada eliminación.
- El primer archivo agregado del grupo se muestra como `valid` o `warning`. Los siguientes como `duplicate`.
- Si se elimina el primero: Se recalcula el grupo completo. El primer archivo restante se convierte en `valid` o `warning` utilizando exclusivamente el `File` asociado a su propio ID. Nunca se transfiere ni reutiliza el binario eliminado. Queda prohibida la lectura profunda de contenido para resolver duplicados.

## 16. Taxonomía visual
| Estado | Origen | Severidad | Retiene binario | Bloquea | Acción |
| --- | --- | --- | --- | --- | --- |
| `valid` | UI | Info | Sí | No | Remover |
| `warning` | UI | Low | Sí | No | Remover |
| `invalid` | UI | High | No | Sí | Remover |
| `duplicate` | UI | High | Sí | Sí | Remover (reevaluación obligatoria) |
| `unsupported` | UI | High | No | Sí | Remover |
| `too-large` | UI | High | No | Sí | Remover |

`pending-validation` es innecesario y se descarta, dado que el pipeline es 100% síncrono.
Aclaración: Los estados derivados mencionados (`valid`, `warning`, `invalid`, `duplicate`, `unsupported`, `too-large`) son puramente locales. No cambian contratos canónicos, no cambian schemas, y no se persisten. Pueden representarse mediante un tipo local futuro.

## 17. Reglas del lote
- **Lote vacío:** Vista U1, `Continuar` deshabilitado.
- **Todos inválidos:** Vista U2, `Continuar` deshabilitado, lista visible para remoción.
- **Lote mixto:** Vista U2, `Continuar` deshabilitado por presencia de archivos bloqueantes.
- **Lote válido:** Vista U2, `Continuar` habilitado.
- **Excedentes de 5 archivos:** Solo se incorporan archivos hasta completar la capacidad restante. Los excedentes no entran en metadata ni en el Map binario. Se muestra un mensaje visible dentro de U2 y se anuncia el número rechazado mediante la única región `aria-live="polite"`. Un toast puede ser complementario únicamente si ya existe un patrón aprobado.
- **Excedentes de 50 MB:** Los archivos individualmente válidos conservan sus referencias binarias. El lote se bloquea por una regla global. Se muestra una alerta persistente y el usuario debe remover archivos. Tras quedar en 50 MB o menos, el lote se recalcula sin solicitar nuevamente archivos ya seleccionados. No se descartan referencias binarias automáticamente por el error global.

## 18. Acciones
- **Agregar más:** Acumula respetando la capacidad restante de los 5 cupos. Revalida estado global.
- **Remover:** Destruye metadata y entrada en el Map binario. Si no quedan archivos, regresa a `idle` (U1).
- **Volver:** Regresa a U1, descarta todo metadata y Map binario.
- **Cancelar:** Regresa al inicio, limpia todo.
- **Continuar:** Acción suspendida. En la primera construcción de U2, este botón debe permanecer realmente disabled, sin callback, sin transición conceptual a U3, sin modal falso, sin toast de éxito y sin navegación. El copy conceptual recomendado es: "La validación profunda se habilitará en la siguiente fase." La UI puede demostrar que el lote es preliminarmente válido mediante el estado del resumen o un badge seguro, sin activar el CTA.

## 19. Tabla de transiciones
| Estado actual | Evento | Condición | Estado siguiente | Efecto |
| --- | --- | --- | --- | --- |
| `idle` | Agregar (Vacío) | - | `idle` | Sin efecto |
| `idle` | Agregar (N files) | N > 0 | `files-selected` | Lote procesado |
| `files-selected` | Agregar (N files) | Cupo restante | `files-selected` | Lote sumado y re-evaluado |
| `files-selected` | Remover | Quedan archivos | `files-selected` | Lote re-evaluado |
| `files-selected` | Remover último | 0 archivos | `idle` | Limpieza total |
| `files-selected` | Volver/Cancelar | - | `idle` | Limpieza total |
| `files-selected` | Continuar | Lote válido | `files-selected` | Acción suspendida (Parser Gate) |

## 20. Responsabilidades
| Capa | Responsabilidad | Conoce File | Conoce metadata | Muta estado |
| --- | --- | --- | --- | --- |
| `SurveyImportUploadScreen` | Orquestador | Sí (lo recibe y pasa al boundary) | Sí | Sí (invoca reducer) |
| Boundary Binario | Retiene `Map<FileId, File>` | Sí | No | No |
| Reducer/Hook Local | Estado de UI y pipeline síncrono | No | Sí | Sí |
| `UploadZone` / `FileUpload` | Emitir `File[]` desde browser | Sí | No | No |
| Lista de archivos | Renderizar UI por metadata | No | Sí | No |

## 21. Fixture versus interacción
- La interacción real utilizará referencias reales y `LocalFileMetadata`.
- Los fixtures (`files-selected-valid`) se utilizarán **exclusivamente** para QA documental, el harness temporal existente, inyección explícita futura en un entorno de desarrollo aprobado, y test futuro cuando exista infraestructura. No se asume Storybook (al no existir en el repositorio) y no se usará en la implementación del componente de la Screen principal.

## 22. Accesibilidad
- `UploadZone` con alternativa de botón (ya implementado).
- Copy de formatos y límites claro y visible.
- Lista de archivos semántica (`<ul>`/`<li>` o ARIA grid si es complejo).
- Botones de remoción con `aria-label="Remove [filename]"`.
- Mensajes de validación y errores vinculados mediante `aria-describedby` o en la misma fila.
- Región de anuncios `aria-live="polite"` para altas y bajas.
- Indicador visual y semántico estricto (no depender solo de color).

## 23. Seguridad
- Los filenames pueden contener PII introducida por el usuario. El `displayName` se usa para presentación y el `normalizedNameKey` derivado en memoria solo participa en la comparación por duplicados sin anonimizar ni persistir nada.
- No se escriben filenames en consola ni en logs.
- No hay telemetría.
- No hay red.
- No hay almacenamiento.
- No hay object URLs.
- Extensión y MIME no validan el contenido ni demuestran que sea seguro, solo determinan la UI inicial.
- La validación real queda bloqueada por el parser gate.
- Sin lectura de `ArrayBuffer` ni parsers.
- El objeto `File` no se expone a reportes de telemetría, errores globales o `localStorage`.
- No se conservan binarios inválidos.
- Destrucción de la referencia binaria (incluyendo los válidos y warning) forzosa en `useEffect` de desmontaje, cancelación, remoción o acción de volver.

## 24. Parser gate
`DEFERRED_BLOCKING_U3`. El parseo de las filas y hojas queda pospuesto hasta que se defina la biblioteca segura a utilizar (SheetJS/ExcelJS), y prohíbe el paso a U3.

## 25. Matriz de validación
| Regla | Entrada | Resultado visual | Severidad | Retiene binario | Bloquea |
| --- | --- | --- | --- | --- | --- |
| Extensión inválida | `doc.pdf` | `unsupported` | High | No | Sí |
| MIME vacío | `data.xlsx` | `warning` | Low | Sí | No |
| MIME inesperado | `data.xlsx` | `warning` | Low | Sí | No |
| Cero bytes | `empty.xlsx` | `zero-byte` | High | No | Sí |
| > 25 MB | `huge.xlsx` | `too-large` | High | No | Sí |
| Lote > 50 MB | Varios válidos | `too-large` en total | High | Sí (individualmente válidos retienen) | Sí |
| > 5 archivos | 6 archivos | Alerta, muestra 5 | Info | Para los 5 | Para los 5 |
| Nombre vacío | `.xlsx` | `invalid-name` | High | No | Sí |
| Temporal | `~$data.xlsx` | `temporary` | High | No | Sí |
| Duplicado | `data.xlsx` | `duplicate` | High | Sí | Sí |
| Válido | `data.xlsx` | `valid` | Info | Sí | No |

## 26. Riesgos
| Riesgo | Probabilidad | Impacto | Mitigación | Fase responsable |
| --- | --- | --- | --- | --- |
| Binarios huérfanos | Media | Alto (RAM) | Limpieza forzada on unmount | 4B3 |
| MIME spoofing | Alta | Medio | Delegar validación real al parser futuro | U3 |
| Reglas de lote inconsistentes | Baja | Alto | Usar configuración central unificada | 4B3 |
| Botón Continuar ambiguo | Media | Medio | Estado disabled con tooltip "Pendiente" | 4B3 |

## 27. Archivos futuros autorizados
Puede autorizar conceptualmente la modificación localizada de:
- `src/screens/survey-import/SurveyImportUploadScreen.tsx`
- `src/components/survey-import/InitialUploadPanel.tsx`
- `src/components/survey-import/ImportSummaryCard.tsx`
- `src/components/survey-import/ImportWizardFooter.tsx`

Creación potencial de:
- `src/config/survey-import/uploadLimits.ts`
- `src/hooks/survey-import/useLocalUploadState.ts`
- `src/components/survey-import/SelectedFileList.tsx`
- `src/components/survey-import/SelectedFileRow.tsx`
- `src/components/survey-import/UploadBatchAlert.tsx`
- `src/components/survey-import/UploadLiveRegion.tsx`

## 28. Archivos futuros prohibidos
Debe prohibir expresamente la modificación o creación de:
- `src/types/survey-import/**`
- `src/mocks/survey-import/**`
- `src/lib/survey-import/schemas/**`
- `src/components/upload/**`
- `src/components/ui/**`
- `src/App.tsx`, salvo decision gate adicional
- Configuraciones globales
- Dependencias
- Rutas
- Parser
- U3

## 29. Criterios de aceptación para U2
La construcción futura deberá cumplir la separación metadata/blob, aplicar los límites centralizados, respetar accesibilidad y no alterar U1 estructuralmente.

### QA conceptual obligatorio (Regresión futura)
**D1 · Dos duplicados:** Ambos conservan su propio binario. Primero: `valid`. Segundo: `duplicate`. Lote bloqueado.
**D2 · Remover el original:** Se elimina el binario del original. El duplicado restante se recalcula como `valid`. Conserva su propio binario. No se solicita una nueva selección.
**D3 · Remover el duplicado:** El original continúa válido. Su binario permanece intacto.
**D4 · Tres duplicados:** Primero válido. Otros dos duplicados. Al eliminar el primero, uno de los restantes se convierte en válido. El tercero continúa duplicado.
**D5 · Lote superior a 50 MB:** Los archivos individualmente válidos conservan sus binarios. El lote está bloqueado. Al remover suficientes archivos, puede recuperar validez.
**D6 · Archivo individual mayor a 25 MB:** Visible. No conserva binario. Bloquea. No puede convertirse en válido solo por cambios en el resto del lote.

## 30. Decision gates abiertos
- Elección de la librería Parser para transitar a U3.
- Definición de los límites de lote productivos definitivos vs provisionales.

## 31. Autorización o bloqueo
Fase documental aprobada. **Se autoriza el desarrollo de la pantalla U2 en la siguiente fase.**

## 32. Fecha
2026-06-10

## 33. Commit base
`cc66cf12ef7adcda4994488b3e54326037a3ca9e`
