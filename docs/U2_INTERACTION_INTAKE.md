# Fase 4B1 · U2 Interaction Intake Report

## 1. Resumen ejecutivo
Este documento define la arquitectura de interacción, límites provisionales y decisiones técnicas para la pantalla **U2 · Archivos seleccionados**, correspondiente a la fase de carga inicial del proceso de importación de encuestas. Establece las reglas para manejar archivos locales sin comprometer el estado canónico y sin requerir parsers profundos en esta etapa.

## 2. Estado formal
READY_WITH_PROVISIONAL_LIMITS

## 3. Intake validado
- **Objetivo**: Permitir la revisión de archivos seleccionados antes del procesamiento, identificando errores superficiales y permitiendo la gestión del lote.
- **Usuario principal**: Administrador UBITS o consultor.
- **Stack**: React, TypeScript, Tailwind, shadcn/ui, Tokens UBITS.
- **Datos**: Solo metadata superficial en esta etapa, uso de fixtures para estados visuales.
- **Criterios de éxito**: Usuario comprende el lote, identifica errores, puede remover archivos, no se persiste PII, no hay parsing profundo ni conexión a API.

## 4. Componentes auditados
| Componente | Ruta | Responsabilidad actual | Props relevantes | Reutilizable | Cambio requerido |
| ---------- | ---- | ---------------------- | ---------------- | ------------ | ---------------- |
| `UploadZone` | `src/components/upload/UploadZone.tsx` | Zona de drag & drop | `value`, `onChange`, `accept`, `multiple`, `maxFiles`, `maxSizeMB` | Sí | Soporta múltiple, límites y validación básica. No emite IDs, emite `File[]`. Requiere wrapper o control en screen. |
| `FileUpload` | `src/components/upload/FileUpload.tsx` | Botón nativo de subida | `value`, `onChange`, `accept`, `multiple`, `maxFiles`, `maxSizeMB` | Sí | Similar a UploadZone. |
| `FilePreview` | `src/components/upload/FilePreview.tsx` | Visualización individual | `file`, `variant`, `removable`, `onRemove`, `error` | Sí | Soporta `File` y `UploadFileItem`. Diferencia errores. |
| `AttachmentList` | `src/components/upload/AttachmentList.tsx` | Lista de archivos | `files`, `variant`, `removable`, `onRemove` | Sí | Agrupa `FilePreview`. Reutilizable tal cual. |
| `UploadProgress` | `src/components/upload/UploadProgress.tsx` | Barra de progreso | `value`, `status`, `label`, `error` | Sí | Controlled progress. |

## 5. Decisiones de formatos
- **Opción Recomendada**: Opción C · Configuración progresiva (U2 acepta Excel `.xlsx`, `.xls`). CSV queda como soporte futuro no habilitado.
- **Motivo**: Minimiza riesgo sin un parser aprobado. La validación de metadatos de Excel es suficiente para la experiencia de U2.

## 6. Límites preliminares
- **Mínimo**: 1 archivo.
- **Máximo por lote (Cantidad)**: 5 archivos (Provisional).
- **Tamaño máximo por archivo**: 25 MB (Provisional).
- **Tamaño máximo del lote**: 50 MB (Provisional).
- **Comportamiento al exceder**: Bloqueo informativo (no se agrega el archivo excedente o se marca con error visual `too-large`).

## 7. Manejo del objeto File
- **Patrón Recomendado**: Opción A · Estado React local.
- **Reglas**: Los objetos `File` residen exclusivamente en el estado local del componente orquestador (`SurveyImportUploadScreen`) como `File[]`. Se destruyen al cancelar o navegar. No entran al store canónico global.

## 8. Metadata serializable
- **Estado canónico**: `id` (generado temporalmente o por hash), `name`, `extension`, `mimeType`, `sizeBytes`, `lastModified`, `status`.
- **Estado efímero**: Objeto `File`.

## 9. Validaciones preliminares
1. Extensión permitida (Implementable sin parser).
2. Tamaño mayor que cero (Implementable sin parser).
3. Tamaño máximo (Implementable sin parser).
4. Cantidad máxima (Implementable sin parser).
5. Archivos duplicados (Implementable sin parser).
6. Archivo temporal del sistema (Implementable heurísticamente ej: `~$`).
- **Diferidas a parser/backend**: Cifrado, estructura interna, corrupción profunda.

## 10. Duplicados
- **Detección**: Coincidencia exacta de `name` + `size` + `lastModified`.
- **Acción**: Bloqueo. Se marca como `duplicate` y no se permite continuar si ocupa un espacio válido, o directamente se ignora en la selección informando al usuario.

## 11. Estados visuales
| Estado | Semántica | Severidad | Puede continuar | Acción |
| ------ | --------- | --------- | --------------- | ------ |
| `valid` | Cumple validaciones preliminares | Info | Sí | Ninguna / Remover |
| `invalid` | Falla regla genérica | Blocking | No | Remover |
| `duplicate` | Ya existe en el lote | Blocking | No | Remover |
| `unsupported` | Extensión no permitida | Blocking | No | Remover |
| `too-large` | Excede límite de tamaño | Blocking | No | Remover |

## 12. Acciones de U2
- **Agregar archivos**: Acumula hasta el máximo. Respeta el límite.
- **Remover archivo**: Elimina la referencia de `File` y recalcula el lote. Permitido.
- **Reemplazar**: Implícito mediante Remover + Agregar (Fuera de alcance como acción única).
- **Continuar**: Habilitado si `files.length > 0` y no hay archivos en estado de error (invalid, too-large, etc.).
- **Volver**: Regresa a U1 limpiando el estado efímero.
- **Cancelar**: Limpia todo y regresa a E0.

## 13. Arquitectura de interacción
- **Recomendación**: Opción A · Estado local de screen.
- **Motivo**: Prematuro implementar el Context global solo para sostener `File[]`. U1 y U2 operan en la misma screen lógica.

## 14. Uso de fixtures
- `files-selected-valid`: Uso exclusivo para QA estático, Storybook y demos. No controla interacción real.
- **Requeridos en el futuro**: `files-selected-invalid`, `files-selected-mixed`, `files-selected-too-large`.

## 15. Parser decision gate
- **Confirmación**: U2 NO necesita parser.
- **Candidatos (solo documental)**:
  - SheetJS/xlsx: Formatos (xlsx, csv), Browser (Sí), Licencia (Apache 2.0). Impacto grande.
  - ExcelJS: Formatos (xlsx, csv), Browser (Sí), Licencia (MIT). Impacto medio.
  - Papa Parse: Solo CSV, Browser (Sí), Licencia (MIT).
- **Decisión**: DEFERRED para la fase U3.

## 16. Accesibilidad
- **Selección/Error**: Uso de `aria-live="polite"` para anunciar resultados de la selección (ej. "1 archivo agregado, 1 con error").
- **Tabulación**: Los botones de remover deben ser accesibles por teclado y tener `aria-label="Remover [nombre del archivo]"`.
- **Botón Continuar**: Si está disabled, usar `aria-disabled` o título explicativo del motivo.

## 17. Matriz de decisiones
| Decisión | Opciones evaluadas | Recomendación | Motivo | Estado |
| -------- | ------------------ | ------------- | ------ | ------ |
| Formatos | Excel, Excel+CSV, Config. Progresiva | Config. Progresiva | Minimiza riesgo de parsing inicial | LOCKED |
| Max Archivos | 1, 5, 10, Sin Límite | 5 | Balance entre funcionalidad y complejidad | PROVISIONAL |
| Tamaño Max / Archivo | 5MB, 10MB, 25MB | 25MB | Soporte para encuestas corporativas grandes | PROVISIONAL |
| Manejo de `File` | Local, Ref, Context | Estado React local | Evita contaminar estado canónico | LOCKED |
| Continuar | Siempre, Sin errores | Sin errores blocking y > 0 | Asegura calidad de entrada al parser | LOCKED |
| Arquitectura UI | Local, Reducer, Context | Estado local de screen | Simplicidad para U1-U2 compartiendo screen | PROVISIONAL |
| Parser | SheetJS, ExcelJS, Ninguno | Ninguno | U2 solo necesita metadatos superficiales | DEFERRED |

## 18. Riesgos
- **Seguridad (PII local)**: Probabilidad Baja. Mitigación: `File` nunca se envía a logs ni `localStorage`.
- **Performance (Lotes grandes)**: Probabilidad Media. Mitigación: Límite estricto provisional de 5 archivos y 50MB total.
- **UX (Errores poco claros)**: Probabilidad Media. Mitigación: Mapeo exacto de validaciones a estados visuales con componentes `FilePreview` ya existentes.
- **Arquitectura (Guardar File en contrato)**: Probabilidad Alta. Mitigación: Prohibición explícita de agregar `File` a `ImportSession`.

## 19. Decisiones diferidas
- Selección de librería de parser definitiva (SheetJS vs ExcelJS).
- Límites productivos finales de cantidad y tamaño de archivos (requieren datos de uso).
- Backend APIs para procesamiento.

## 20. Archivos creados y modificados
- `docs/U2_INTERACTION_INTAKE.md` (Creado)
- `docs/PROMPT_LOG.md` (Modificado)

## 21. QA de integridad
- Ningún código modificado en `src/`.
- No se instalaron dependencias.
- No se construyó UI.

## 22. Autorización o bloqueo para Fase 4B2
Autorizada. El intake está completo y libre de contradicciones arquitectónicas.

## 23. Estado
Aprobada.
