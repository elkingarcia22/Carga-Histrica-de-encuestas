# Fase 4E1 · Historical Preview Simulated Intake Report

## 1. Resumen ejecutivo
La Fase 4E1 establece el intake documental para la preview histórica simulada. Tras el procesamiento simulado exitoso (U3-SIM), el usuario requiere visualizar cómo se vería la carga histórica agregada. Esta fase define los requerimientos de interfaz, fuentes de datos, KPIs, riesgos y restricciones de la primera pantalla de preview, garantizando el uso estricto de datos sintéticos (`aggregated-happy-path` y `SYNTHETIC_PREVIEW_VALUE_REQUIRES_MOCK_CONTRACT`) sin lectura real de archivos ni integración de lógicas productivas todavía.

## 2. Estado formal
- **Fase:** 4E1 · Historical Preview Simulated Intake
- **Tipo:** Documental y de definición conceptual.
- **Artefactos:** `docs/HISTORICAL_PREVIEW_SIMULATED_INTAKE.md`, `docs/PROMPT_LOG.md`
- **Bloqueos UI/Code:** Activos (sin dependencias, rutas, ni parser/Worker reales).

## 3. Gate inicial
Se verificó el estado del repositorio:
- **Rama actual:** `main`
- **HEAD:** `a002fa35cb0d5c6fd494f9b877fbbd8020f7a97a`
- **origin/main:** `a002fa35cb0d5c6fd494f9b877fbbd8020f7a97a`
- **Tracking:** Up to date.
- **Ahead:** 0
- **Behind:** 0
- **Working Tree:** Limpio.
- **Staging:** Vacío.
- **Untracked:** 0.
- **Módulos:** U1, U2, U3-SIM congelados; parser, Worker, SheetJS ausentes.

## 4. Objetivo del prototipo
La preview debe permitir que un administrador UBITS o consultor observe cómo se vería una carga histórica agregada después de un procesamiento exitoso simulado. Aclara cómo los datos simulados se presentarían antes de activar el procesamiento real, eliminando la incertidumbre sobre la estructura de la información, pero no pretende resolver analítica productiva ni leer los datos de los archivos seleccionados. Aporta valor al validar la experiencia del usuario de inmediato.

## 5. Usuario principal
- **Usuarios autorizados:** Administrador UBITS, consultor de implementación, consultor de experiencia, analista autorizado.
- **Conocimiento esperado:** Nivel intermedio a experto en métricas de encuestas (favorabilidad, participación).
- **Tarea principal:** Validar que los resultados y la estructura histórica cargada tiene sentido y puede configurar la plataforma correctamente.
- **Riesgos de interpretación:** Asumir que los datos en la pantalla provienen de los archivos subidos.
- **Nivel de detalle:** Agregado; no diseñar para colaboradores finales.

## 6. Problema y decisión soportada
Permite al administrador tomar la decisión de confirmar la estructura visual y de datos que resultaría del archivo subido. Elimina la incertidumbre sobre "cómo quedarán los resultados cargados en la plataforma" antes de comprometer la configuración final o publicación.

## 7. Primera pantalla
**Historical Preview Simulated · Resumen histórico**
Responderá sin navegación real:
- Encuesta en previsualización.
- Cantidad de periodos y cuáles son el base/comparativo.
- KPIs principales y variación (delta).
- Capacidades disponibles en la plataforma.
- Recordatorio permanente de que los datos son sintéticos/simulados.

## 8. Stack y base técnica
- React + TypeScript.
- Tailwind CSS + shadcn/ui.
- Tokens UBITS y Starter Kit UBITS (desktop-first).
- **Restricciones:** Sin dependencias nuevas, sin rutas reales, sin API, sin parser, sin Worker, sin storage.

## 9. Referentes visuales
- Patrón B2B sobrio y limpio.
- Header estructurado con disclosure de simulación.
- Cards blancas en fondo gris claro.
- Acción primaria en Azul UBITS.
- Sin gradientes ni estética "IA mágica", sin `text-white` forzado ni sombras exageradas.

## 10. Datos mock autorizados
- **Fixture principal:** `aggregated-happy-path`.
- **Valores ausentes (segundo periodo, etc.):** Se marcarán como `SYNTHETIC_PREVIEW_VALUE_REQUIRES_MOCK_CONTRACT` y se definirán en la Fase 4E3.
- No usar datos reales. Ningún dato hardcodeado para uso futuro; justificar toda métrica basada en contratos mock.

## 11. Identidad de encuesta
- Nombre sintético.
- Tipo de encuesta.
- Modo agregado.
- Rango temporal y cantidad de periodos.
- Fuente simulada.
- Estado de preview explícito.
- **Excluidos:** Nombres reales, rutas de archivos, IDs técnicos.

## 12. Selección de periodos
- Un periodo base (cronológicamente anterior) y un periodo comparativo (más reciente).
- Sujetos al Mock Data Contract de la Fase 4E3.
- Selector pasivo en esta fase inicial, evidenciando conceptualmente el comportamiento cuando existe uno o más periodos.

## 13. KPIs
- **Obligatorios:** Favorabilidad, participación, respuestas, delta porcentual entre periodos.
- **Condicionales:** Puntuación promedio, tasa de finalización, cobertura de segmentos.
- Fórmulas reales y direcciones de los KPIs (porcentual o puntos porcentuales) pendientes de Mock Data Contract. Sin eNPS.

## 14. Distribución de respuestas
- Visualización de taxonomía: favorables, neutrales, desfavorables.
- Visualización sobria mostrando la diferencia de distribución entre periodos. Tolerancia de redondeo y estado limited pendientes.

## 15. Tendencia histórica
- Métrica principal mostrada de forma conceptual, auditando librerías existentes en el Starter Kit. Accesibilidad textual obligatoria como fallback.

## 16. Segmentos
- Solo mostrar un resumen de la disponibilidad (ej. número de segmentos).
- Filtrado funcional diferido.

## 17. Insights
- **Clasificación:** `VALUABLE_LATER` (o conceptualmente incluidos solo si están marcados como simulados y derivados sintéticamente).
- Sin copiloto, chat o análisis generativo de IA por ahora.

## 18. Retención, Expansión y ARR
- **Dimensión:** Diferida / Contextual.
- No mostrar causalidad directa de ARR en la preview. Se mantendrá como capa de negocio futura.

## 19. Disclosure
**Vista histórica simulada**
"Los resultados mostrados son datos sintéticos para validar la experiencia del prototipo. El contenido de los archivos seleccionados no fue leído ni procesado."

## 20. Acciones
- **Permitidas:** Volver al procesamiento simulado, Volver a archivos, Cerrar preview.
- **Bloqueadas/Deshabilitadas:** Continuar a configuración (Visible pero disabled).
- **Prohibidas:** Importar, guardar, publicar, descargar/exportar, confirmar datos reales, editar.

## 21. Layout conceptual
1. Header y disclosure.
2. Selector de periodos.
3. Fila de KPIs.
4. Distribución de respuestas.
5. Tendencia histórica.
6. Resumen de capacidades.
7. Insights simulados (opcional).
8. Acciones.

## 22. Estados
- `preview-ready`: Carga exitosa de simulación.
- `preview-limited`: Simulación con advertencias (ej. distribución fuera de tolerancia).
- `preview-empty`: Sin datos en simulación.
- `preview-error-simulated`: Falla simulada (contrato inválido o mock incoherente).

## 23. Accesibilidad
- Un `h1` único, jerarquía clara, y KPIs con labels semánticos.
- Deltas independientes de color (indicadores visuales/textuales).
- Orden de teclado y alto contraste con tokens UBITS.

## 24. Responsive
- Desktop-first priorizado en 1440x900.
- Soporte para 1280x800 y 900x800.
- Evitar overflows, permitiendo apilamiento lógico de KPIs y prioridad visual de gráficos y cards.

## 25. Criterios de éxito
1. Reconocer simulación.
2. Identificar encuesta y periodos.
3. Comparar base y comparativo.
4. Interpretar favorabilidad, participación y delta.
5. Ver distribución y tendencia de respuestas.
6. Entender las limitaciones técnicas.
7. Cero datos reales, cero API, dependencias y rutas.

## 26. Matriz de decisiones
| Decisión | Estado | Fase |
|---|---|---|
| UI Stepper vs Subvista | `LOCKED` | 4E2 |
| Insights IA | `OUT_OF_SCOPE` | Futuro |

## 27. Matriz de riesgos
| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Usuario confunde con datos reales | Alta | Alto | Disclosure fijo, nombres de test. |
| Inconsistencia de escalas comparativas | Media | Alto | Limitar a un delta unificado en el mock de Fase 4E3. |
| Exceso de información | Alta | Medio | Priorizar obligatorios, condicionar secundarios. |

## 28. Decision gates abiertos
- Fórmula real de favorabilidad.
- Regla de participación y unidad del delta.
- Tolerancia de distribución.
- Datos productivos (API, parser, worker).

## 29. Archivos creados y modificados
- **Creado:** `docs/HISTORICAL_PREVIEW_SIMULATED_INTAKE.md`
- **Modificado:** `docs/PROMPT_LOG.md`

## 30. QA de integridad
- Cero dependencias instaladas.
- Cero commits realizados por el Agente.
- Cero UI creada.
- U1, U2 y U3-SIM permanecen idénticos.

## 31. Autorización o bloqueo
**Autorizado** únicamente para **Fase 4E3 · Historical Preview Simulated Mock Data Contract**.

## 32. Estado
COMPLETED
