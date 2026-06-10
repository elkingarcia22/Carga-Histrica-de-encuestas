# Data Contract Formal Approval

## 1. Propósito
Emitir la aprobación formal del contrato de datos completo antes de comenzar la construcción de la primera pantalla visual del prototipo (Fase 4).

## 2. Alcance
Validación cruzada de consistencia entre la Arquitectura Aprobada (Fase 2C), el Contrato TypeScript (Fase 3A), los Fixtures Sintéticos (Fase 3B1) y las validaciones de Schema Runtime (Fase 3B2).

## 3. Commit Base Local
Commit actual base de validación: `862bb1cdfe0dd471d234a9dc2fc8af785f9d3476`

## 4. Documentos Revisados
- `docs/IMPORT_ARCHITECTURE_APPROVAL.md`
- `docs/PROJECT_INTAKE.md`
- `docs/IMPORT_ARCHITECTURE.md`
- `docs/SCREEN_MAP.md`
- `docs/DATA_MODEL.md`
- `docs/MOCK_DATA_CONTRACT.md`
- `docs/RUNTIME_VALIDATION.md`
- `docs/RUNTIME_VALIDATION_RESULTS.md`
- `docs/REVIEW_PROGRESS_SEMANTICS_DECISION.md`
- `src/types/survey-import/`
- `src/mocks/survey-import/`
- `src/lib/survey-import/schemas/`
- `docs/DESIGN.md`
- `docs/ANTIGRAVITY.md`
- `docs/ARCHITECTURE.md`
- `docs/QA_CHECKLIST.md`

## 5. Matriz de Consistencia

| Tema | Arquitectura | Contratos | Fixtures | Schemas | Runtime | Consistente | Acción |
| ---- | ------------ | --------- | -------- | ------- | ------- | ----------- | ------ |
| `ImportSession` | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Modos (raw, aggregated, unknown) | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Archivos, hojas y campos | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Detección | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Configuración | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Preguntas | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Escalas | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Demográficos | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Participantes | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Segmentos | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Respuestas raw | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Resultados agregados | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Issues | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Capacidades analíticas | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Progreso de revisión (`ReviewProgress`) | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Preview | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Resultado final | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| `commit-start` | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Cancelación | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Privacidad | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Mensajes seguros | Sí | Sí | Sí | Sí | Sí | Sí | Aprobado |
| Primera pantalla U1 | Sí | Sí | Sí | N/A | N/A | Sí | Aprobado |

## 6. Contratos Aprobados
- **Entidad raíz**: `ImportSession` queda aprobada como única sesión activa, conservando su macroetapa, configuración, progreso y resultados.
- **Modos**: `raw-individual`, `aggregated-comparison`, `unknown`.
- **Invariantes de modo**: Raw no contiene datos agregados; Agregado no contiene individuales; Unknown no contiene datos interpretados; no hay conversiones silenciosas.

## 7. Invariantes Congeladas
- **ReviewProgress**:
  - `exclusiveStateSum <= total` (Confirmed + Modified + Pending + Conflicting + Ignored).
  - `blocking <= total`. Un issue puede ser pendiente/conflicto y además blocking.
- **Preview**: No puede confirmar con blocking abiertos; no puede confirmar si no está `ready-to-import`; usa conteos no negativos; sin datos nominales.
- **Commit-start**: Obligatorio para completados parcial o totalmente y fallidos post-procesamiento.
- **Cancelación**: Exige `commit-start: false` y ausencia de entidades creadas. Sin rollback modelado.

## 8. Evidencia Runtime
- **Positivos exactos**: 10/10 pasaron directamente (sin adaptación, firmas intactas antes y después).
- **ReviewProgress**: RP1, RP2 y RP6 fueron rechazados. RP3, RP4, RP5 y RP7 fueron aprobados exitosamente.
- **Negativos de sesión**: 18/18 rechazados adecuadamente.
- **Seguridad**: Cero mensajes inseguros, cero paths inseguros y cero inconsistencias de catálogo identificadas en runtime.

## 9. Seguridad y Privacidad
Las siguientes políticas quedan congeladas:
- Sin PII real en fixtures.
- Sin archivos reales en Git.
- Sin contenido de filas en logs.
- Sin correos en mensajes de validación.
- Sin regex internas en errores.
- Sin `File` o `Blob` en el modelo serializable.
- Sin persistencia temporal en localStorage o sessionStorage.
- Sin llamadas a APIs reales.
- Sin proveedor IA real.

## 10. Deuda Heredada
- Existen 25 errores y 1 warning de Lint en el proyecto base (fuera del dominio `survey-import`).
- Cero errores y cero warnings dentro del nuevo dominio de `survey-import`.
- Condición: Todo código nuevo deberá estar limpio; la deuda heredada no es excusa para inyectar errores nuevos.

## 11. Decision Gates Abiertos
1. Parser Excel definitivo.
2. Parser CSV definitivo.
3. Licencias de parsers.
4. Forma de mantener el objeto binario `File`.
5. Web Workers.
6. Procesamiento por fragmentos.
7. Límites productivos de archivos y tamaño.
8. Límites productivos de filas y columnas.
9. Umbral final de confianza y anonimato.
10. Proveedor IA.
11. Contrato productivo del Import Intelligence Adapter.
12. Contratos API UBITS.
13. Autenticación y telemetría.
14. Persistencia remota.
15. Reglas productivas de favorabilidad.
16. Paginación de respuestas y procesamiento real.

## 12. Áreas Congeladas
- `src/types/survey-import/**`
- `src/mocks/survey-import/**`
- `src/lib/survey-import/schemas/**`
- `docs/DATA_MODEL.md`
- `docs/MOCK_DATA_CONTRACT.md`
- `docs/RUNTIME_VALIDATION.md`
- `docs/RUNTIME_VALIDATION_RESULTS.md`
- `docs/REVIEW_PROGRESS_SEMANTICS_DECISION.md`

## 13. Condiciones para Modificar el Contrato
Solo podrán modificarse bajo:
- Defecto reproducible.
- Decision gate resuelto.
- Hotfix documentado.
- Regresión obligatoria validada.
- Aprobación formal.

## 14. Alcance Autorizado para U1
La pantalla **U1 · Carga inicial** queda autorizada con las siguientes especificaciones:
- Shell visual del wizard con cuatro macroetapas visibles (primera activa).
- Título, descripción, zona de carga, información de formatos y proceso.
- Resumen lateral (vacío).
- Footer con CTA deshabilitado inicialmente.
- Interacciones visuales (Hover, Focus, Responsive).
- Conexión simulada usando el fixture `upload-initial`.
- Uso permitido de `AppShell`, `Header`, `PageShell`, Cards, Badges, Botones y tokens UBITS ya existentes.

## 15. Alcance Prohibido para U1
No se permite en esta etapa:
- Parsing o lectura real de Excel/CSV, procesamiento o detección.
- Vistas U3, U4, configuración, review tabs, preview, result.
- Reducer complejo, Context o Provider global de estado dinámico real.
- Rutas reales, conexiones API o simulaciones completas de timers/IA.

## 16. Autorización para Fase 3C2
Se autoriza el progreso a la Fase 3C2 · Git Checkpoint.

## 17. Autorización Condicionada para Fase 4
Se autoriza condicionadamente la Fase 4 para la construcción de U1 (sujeto a las restricciones establecidas).

## 18. Estado Formal
**APPROVED_WITH_CONDITIONS**

## 19. Fecha
2026-06-10
