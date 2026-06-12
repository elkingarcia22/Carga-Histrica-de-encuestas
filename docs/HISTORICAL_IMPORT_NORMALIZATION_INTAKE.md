# Fase 4E-R1 · Historical Import Normalization Prototype Intake

## 1. Resumen ejecutivo
La Fase 4E-R1 establece el intake documental para la vista previa de normalización histórica, recuperando el objetivo correcto del dominio de importación. Tras el procesamiento simulado exitoso (U3-SIM), el usuario requiere visualizar cómo el sistema ha interpretado la estructura de sus archivos externos, qué campos se detectaron, qué incidencias existen y qué mapeo hacia UBITS se propone. Esta fase define los requerimientos de interfaz, escenarios mock, estados y restricciones, garantizando la total ausencia de lógicas analíticas (como favorabilidad o participación) y preparando el terreno para una configuración determinística.

## 2. Estado formal
- **Fase:** 4E-R1 · Historical Import Normalization Prototype Intake
- **Tipo:** Documental y de definición conceptual.
- **Artefactos:** `docs/HISTORICAL_IMPORT_NORMALIZATION_INTAKE.md`, `docs/PROMPT_LOG.md`
- **Bloqueos UI/Code:** Activos (sin dependencias, rutas, ni parser reales).

## 3. Gate inicial
Se verificó el estado del repositorio:
- **Rama actual:** `main`
- **Working Tree:** Limpio (únicamente documentación).
- **Módulos:** U1, U2, U3-SIM intactos.

## 4. Objetivo exacto
La pantalla debe permitir que el administrador o consultor comprenda qué ha "entendido" la plataforma de los archivos procesados. Su propósito es exponer la estructura detectada (columnas, periodos, preguntas), el estado del mapeo preliminar (Campo Externo → Campo UBITS) y cualquier incidencia estructural que bloquee la importación. **Bajo ninguna circunstancia** se debe presentar favorabilidad, eNPS, participación o comparativas de negocio.

## 5. Usuario principal
- **Usuarios autorizados:** Administrador UBITS o consultor de implementación.
- **Conocimiento esperado:** Conocimiento de la estructura de datos de su organización y formato de las encuestas originales.
- **Tarea principal:** Validar la estructura detectada, revisar incidencias (headers faltantes, columnas ambiguas) y confirmar que la información está lista para el mapeo final.
- **Nivel de detalle:** Estructural y de metadatos.

## 6. Primera pantalla correcta
**Nombre:** `Vista previa de normalización`

Debe responder:
- ¿Cuántos registros y periodos se encontraron?
- ¿Qué columnas y preguntas se detectaron?
- ¿Qué incidencias críticas requieren atención?
- ¿Cuál es la propuesta inicial de mapeo hacia el modelo UBITS?

## 7. Estructura esperada de la información
- **Identidad y Origen:** Archivos procesados, modo detectado (respuestas vs agregados).
- **Resumen Estructural:** Conteo de periodos, preguntas y respuestas totales.
- **Mapeo Preliminar:** Tabla o listado mostrando el `Campo de origen`, el `Campo destino (UBITS)` propuesto y su nivel de confianza (Simulado).
- **Panel de Incidencias:** Lista accionable de problemas detectados (ej. "Columna 'Depto' ambigua", "2 periodos solapados", "Faltan encabezados en la Hoja 2").

## 8. Escenarios mock
Se definirán posteriormente de forma ejecutable, basados en estos conceptos:
- `normalization-ready`: Estructura perfectamente detectada, mapeo propuesto con alta confianza, cero incidencias.
- `normalization-issues`: Estructura detectada pero con incidencias formales (columnas desconocidas, tipos de datos mixtos). Requiere revisión antes de mapear.
- `normalization-empty`: Archivo leído pero sin datos estructurales útiles para encuestas.
- `normalization-error-simulated`: Falla estructural grave simulada.

## 9. Estados UI
- `normalization-preview-ready`: Muestra el resumen y habilita paso a configuración.
- `normalization-preview-issues`: Muestra alertas y advierte revisión manual requerida.
- `normalization-preview-empty`: Estado vacío bloqueante.
- `normalization-preview-error`: Pantalla de fallo estructural.

## 10. Acciones
- **Permitidas:**
  - `Volver a archivos` (Retorna a U2).
  - `Cancelar flujo` (Aborta todo).
  - `Revisar incidencias` (Abre panel o modal, conceptual).
  - `Continuar a configuración` (Avanza a futura U5-SIM).
- **Prohibidas:** Modificar datos reales, importar prematuramente, mostrar métricas de clima.

## 11. Criterios de éxito
1. Transición clara desde U3-SIM hacia el dominio de la estructura, no al de la analítica.
2. Comprensión inmediata de las incidencias del archivo.
3. Transparencia sobre el mapeo propuesto.
4. Cero código analítico o matemático relacionado con clima.
5. Continuidad visual con el Starter Kit B2B de UBITS.

## 12. Oportunidades de IA (AI-First)
- **Mapeo Semántico:** Sugerir a qué dimensión de UBITS corresponde una pregunta externa.
- **Detección de Anomalías:** Identificar tipos de datos mixtos en una columna y sugerir correcciones.
- **Resolución de Conflictos:** Agrupar columnas similares de distintos archivos.
- **Estado:** `VALUABLE_LATER_AFTER_DETERMINISTIC_MAPPING`. Todas estas capacidades se construirán sobre la base determinística y no en la primera iteración sintética.

## 13. Relación con U3-SIM
U3-SIM debe concluir su animación de procesamiento y entregar un "resultado de normalización" (Mock) a esta pantalla. U3-SIM ya no entregará un `HistoricalPreviewModel` analítico, sino un `NormalizationPreviewModel` que expone estructuras, mapeos e incidencias.

## 14. Matriz de decisiones
| Decisión | Opción seleccionada | Estado |
|---|---|---|
| Dominio visual | Estructural y Mapping | `LOCKED` |
| Analítica (Favorabilidad) | Eliminada | `LOCKED` |
| IA Inferencia | Diferida | `DEFERRED` |

## 15. Archivos creados
- `docs/HISTORICAL_IMPORT_NORMALIZATION_INTAKE.md`

## 16. QA de integridad
- Cero dependencias instaladas.
- Cero UI creada.
- U1, U2 y U3-SIM permanecen idénticos.
- El alcance analítico desviado ha sido formalmente reemplazado por la normalización.

## 17. Autorización o bloqueo
**Autorizada** únicamente la siguiente fase de definición arquitectónica:
**Fase 4E-R2 · Historical Import Normalization Architecture Lock**

## 18. Estado
COMPLETED
