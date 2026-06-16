# Historical Import Configuration - Formal Closure

## 1. Fecha
2026-06-16

## 2. Contexto
Fase 4F-R7 · Historical Import Configuration Formal Closure

## 3. Objetivo de la etapa
Cerrar formalmente la etapa de Configuración y dejar una fuente de verdad inequívoca sobre el alcance construido, commits publicados, arquitectura final, contrato mock, comportamiento funcional, preservación del borrador, QA, estado de GitHub, estado de deployment, riesgos diferidos, decision gates cerrados y la siguiente fase de producto.

## 4. Usuario principal
Administradores y usuarios configurando una importación histórica.

## 5. Alcance construido
Se implementó la vista de "Configurar encuesta histórica" (U5) que permite a los usuarios revisar y ajustar la metadata general de la encuesta (nombre, tipo, año, privacidad, visibilidad) antes de proceder al mapeo detallado. Esta fase es enteramente simulada en el front-end y no se conecta a bases de datos o servicios en la nube.

## 6. Flujo completo
* **U1 · Carga**: carga de metadata superficial, máximo 200 archivos, warning desde 51, 25 MB por archivo, máximo provisional de 500 MB, sin lectura de contenido.
* **U2 · Archivos seleccionados**: resumen global, paginación de 25, agregar y eliminar, foco row-aware, CTA derivado del lote completo.
* **U3-SIM · Análisis simulado**: disclosure, AILoader, máximo 10 archivos en full, tray máximo 3, minimizar y restaurar, sin análisis real.
* **U4-SIM · Normalización**: agrupamiento por familia, roles, relaciones, mapeos, incidencias, paginación de 25, CTA global.
* **U5 · Configurar encuesta histórica**: resumen heredado, nombre, tipo, año, privacidad, umbral, visibilidad, incidencias heredadas, readiness, preservación del borrador, CTA hacia Review & Mapping (todavía no conectado).

## 7. Arquitectura final
* **Pantallas**: Una sola pantalla (`HistoricalImportConfigurationScreen`).
* **Rutas**: `NO_NEW_ROUTE`. Integración dentro de `SurveyImportUploadScreen`.
* **Estado**: Una sola instancia de `useHistoricalImportConfigurationState`.
* **Ownership**: `SurveyImportUploadScreen` actúa como orquestador. Pantalla controlada mediante props. Componentes hijos stateless.
* **Boundaries**: Entrada mediante ID + adapter. Salida mediante draft ID + adapter.
* **Manejo de estado**: Estado local sin Context global. Cero persistencia real. Borrador conservado al volver, reset al cancelar. Refresh no preserva el borrador.

## 8. Contrato R3
* Tipos estrictos. Config central. Exactamente ocho escenarios. Adapter determinístico. Validadores puros. CTA global derivado. Boundary hacia Mapping. Referencias internas válidas. Cero datos reales. Cero PII. Cero `any`. Cero React dentro del contrato. Cero efectos. Cero red.

## 9. Escenarios
1. ready-for-mapping
2. incomplete-name
3. ambiguous-survey-type
4. missing-period
5. privacy-confirmation-required
6. invalid-threshold
7. inherited-blocking-issue
8. simulated-error

## 10. Reglas de periodo
* Únicamente año.
* Obligatorio.
* Rango obtenido del config.

## 11. Privacidad y umbral
* **Anónima**: Umbral no aplica.
* **Confidencial**: Umbral obligatorio; default 5; rango 3–10.
* **Identificada**: Umbral no aplica; confirmación explícita mediante Alert informativa, no destructiva.

## 12. Visibilidad
* Solo administradores.
* Administradores y consultores autorizados.

## 13. Preservación del borrador
El borrador se preserva al navegar hacia atrás o adelante (U4-SIM <-> U5), pero se reinicia si el usuario cancela la importación.

## 14. Boundary hacia Mapping
La salida se prepara mediante el ID del borrador actual (`configurationDraftId`) para ser consumido por un adapter en la siguiente pantalla (Review & Mapping).

## 15. Accesibilidad
Headings jerárquicos, labels y legends consistentes, campos requeridos, mensajes de error asociados mediante `aria-describedby`, navegación por teclado completa, foco visible, confirmación explícita para "Identificada", CTA disabled comprensible.

## 16. QA funcional
* U4-SIM → Configuración validado.
* Modificación de metadata (nombre, privacidad, visibilidad) validado.
* Retorno y avance sin pérdida de datos validado (`DRAFT_PRESERVATION_CONFIRMED`).
* Reset al cancelar validado (`RESET_ON_CANCEL_CONFIRMED`).

## 17. QA técnico
* TypeScript, ESLint, Tests y build completados sin errores (`npx tsc -b`, `npm run build`, `git diff --check`).

## 18. Commits publicados
* `c76ed03a746b6187311be458a31c57c7cb9a61ee` (Funcional)
* `dd924f3614525967f97fd737299219d5632e9b69` (Documental)

## 19. SHA inicial de cierre
`dd924f3614525967f97fd737299219d5632e9b69`

## 20. Estado de GitHub
`main` local y `origin/main` alineados; ahead / behind `0 / 0`; working tree limpio.

## 21. Estado de deployment
`NO_DEPLOYMENT_TRIGGERED`

## 22. Riesgos diferidos
* Selección de rangos de fechas o meses específicos (diferido, solo se usa año).

## 23. Decision gates cerrados
* Ownership.
* Boundaries de entrada y salida.
* Hook local.
* Reglas de privacidad y periodo.
* Arquitectura UI.

## 24. Decision gates pendientes
* Ninguno para esta fase.

## 25. Fuera de alcance
* Review & Mapping.
* Parseo real de archivos, FileReader, Blob, ArrayBuffer.
* Integración con APIs o base de datos.
* Persistencia en Storage.

## 26. Estado formal
`HISTORICAL_IMPORT_CONFIGURATION_FORMALLY_CLOSED`

## 27. Siguiente fase máxima
`Fase 4G-R1 · Historical Import Review & Mapping Prototype Intake`
