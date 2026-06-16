# Historical Import Review & Mapping Prototype Intake

## 1. Contexto
Fase 4G-R1 · Historical Import Review & Mapping Prototype Intake.
Esta fase define conceptualmente el intake de producto y experiencia para la etapa posterior a "Configurar encuesta histórica" dentro del flujo de Carga Histórica de Encuestas.

## 2. Estado del flujo
La fase anterior "Configurar encuesta histórica" cerró formalmente. 
El flujo consolidado actual:
1. U1 · Carga de archivos.
2. U2 · Archivos seleccionados.
3. U3-SIM · Análisis simulado.
4. U4-SIM · Vista previa de normalización.
5. Configurar encuesta histórica.
6. Próxima etapa: Review & Mapping (Actual).
7. Siguiente etapa: Confirmar importación.

## 3. Objetivo exacto
Permitir al consultor revisar cómo la estructura histórica detectada se relacionará con el modelo UBITS, confirmar mapeos automáticos simulados y resolver únicamente las ambigüedades necesarias antes de confirmar la importación.
*(Formulación validada y aprobada por reflejar la naturaleza de mapeo estructural sin entrar en analítica prematura).*

## 4. Usuario principal
**Consultor de implementación.**
*Validación:* Se mantiene el consultor de implementación como usuario principal, dado que el proceso de mapeo histórico requiere comprender el modelo de datos de UBITS, la estructura de la encuesta importada y tomar decisiones técnicas sobre el destino de los datos y escalas.

## 5. Nombre recomendado
**Revisar y mapear información**
*(Opción recomendada por ser clara, orientada a la acción y alineada con el lenguaje del consultor)*.

## 6. Primera pantalla recomendada
**Opción A · Resumen general de mapeo**
Presenta todos los dominios con estado y permite entrar posteriormente a cada uno.
*Justificación:* Mitiga el riesgo de sobrecarga cognitiva al manejar múltiples dominios (preguntas, escalas, demográficos, participantes) provenientes de hasta 200 archivos. Provee un punto de anclaje claro donde el usuario puede ver el progreso global ("readiness") antes de sumergirse en la resolución de cada ambigüedad.

## 7. Alternativas evaluadas
- **Opción B (Mapeo de preguntas y escalas directo):** Rechazada para la primera pantalla, pues ignora el panorama global (demográficos, relaciones) y fuerza al usuario a resolver sin contexto.
- **Opción C (Revisión priorizada de incidencias):** Rechazada como pantalla principal porque oculta los mapeos correctos (que a veces requieren revisión de sanity), aunque el patrón se aplicará dentro de las vistas de detalle.

## 8. Happy path
1. El usuario aterriza en la pantalla y ve un resumen de los dominios procesados (Preguntas, Escalas, Demográficos, etc.).
2. Observa indicadores de "Listo" o "Requiere revisión".
3. Ingresa a un dominio que requiere acción (ej. Preguntas ambiguas).
4. Confirma sugerencias o reasigna campos manualmente.
5. Regresa al resumen general; todos los dominios marcan "Listo".
6. Hace clic en "Continuar a confirmar importación".

## 9. Entrada conceptual
Recibe mediante identificador y adapter:
- `configurationDraftId`
- `sourceBatchId`
- `sourceScenarioId`
- nombre confirmado
- tipo confirmado
- año confirmado
- privacidad
- umbral
- visibilidad
- archivos y roles detectados
- relaciones propuestas
- incidencias diferidas
- readiness de configuración

*No recibe:* File, Blob, ArrayBuffer, contenido binario, respuestas reales, PII, objetos React, estado visual de la pantalla anterior.

## 10. Salida conceptual
- `mappingDraftId`
- referencias de configuración
- mappings confirmados
- mappings pendientes
- columnas ignoradas
- incidencias resueltas
- incidencias diferidas
- readiness para confirmación
- `canContinueToConfirmation`

## 11. Dominios de mapeo
- preguntas
- opciones de respuesta
- escalas
- participantes
- jerarquías
- áreas
- cargos
- sedes
- campos demográficos
- identificadores técnicos
- relaciones entre archivos
- columnas ignoradas
- incidencias de incompatibilidad

## 12. Dominios de la primera pantalla
- **Resumen Global (SUMMARY_ONLY):** Todos los dominios mayores se presentan como tarjetas o secciones de resumen (Preguntas, Escalas, Demográficos, Participantes) indicando si hay bloqueos o ambigüedades. `IN_SCOPE_FIRST_SCREEN` es aplicable al resumen de estado.

## 13. Dominios diferidos
- La resolución detallada de cada mapeo individual será un drill-down o modal/pantalla posterior (`IN_SCOPE_LATER_SCREEN`).

## 14. Preguntas
- *Representación histórica:* Texto de la pregunta, tipo detectado, y archivo de origen.
- *Relación Target:* Vinculación conceptual a una familia o factor UBITS, o a una pregunta custom.
- *No reconocida:* Queda "unmapped" o "ambiguous", requiere que el usuario la ignore o la mapee manualmente.
- *Preguntas abiertas:* Se mapean a un target de texto libre (si existe) o se marcan como ignoradas.
- *Columnas técnicas/ignoradas:* Aparecen en listados secundarios o filtradas como "Ignoradas".

## 15. Escalas
- *Representación detectada:* Rango de valores o categorías (ej. 1 a 5, "Totalmente de acuerdo").
- *Ambigüedad:* Cuando el sistema no sabe si un 5 es positivo o negativo, o si la escala no cuadra con el estándar UBITS.
- *Confirmación requerida:* Elegir la polaridad y el tipo equivalente UBITS.

## 16. Participantes
- Se sugiere diferir a una pantalla posterior o modal, presentados como resumen en la primera pantalla. Su modelado implica asegurar que el archivo de roster mapee sus columnas (email, ID) correctamente. No mezclar iterativamente la lista de participantes en la misma vista de preguntas.

## 17. Jerarquías
- Aplican en la validación de líderes o estructuras de árbol, se manejan junto con la configuración demográfica. `SUMMARY_ONLY` en la primera pantalla.

## 18. Demográficos
- Áreas, cargos, sedes, etc. Se validan frente al catálogo de dimensiones disponibles en el target.

## 19. Columnas ignoradas
- Columnas técnicas detectadas como basura, IDs internos del cliente, fechas de completitud. Se mantienen accesibles en un tab o acordeón de "Ignoradas" por si el usuario desea rescatarlas.

## 20. Incidencias
### Bloqueantes
- pregunta sin destino obligatorio.
- escala incompatible o polaridad no definida.
- archivo principal inconsistente (faltan IDs).
- identificador requerido ausente en roster.
### Confirmables
- target sugerido ambiguo.
- escala parcialmente reconocida.
- campo demográfico parecido (ej. "Departamento" sugerido como "Área").
- columna técnica posiblemente ignorable.
### No bloqueantes
- columna ignorada explícitamente.
- campo auxiliar o metadata opcional.

## 21. Estados
- `ready`
- `needs-review`
- `ambiguous`
- `unmapped`
- `ignored`
- `confirmed`
- `blocked`
- `simulated-error`

## 22. Acciones
- **confirmar mapeo:** Consolida un target. Consecuencia: Pasa de needs-review a confirmed. Mejora readiness.
- **editar destino:** Cambia el target manualmente.
- **marcar como ignorado:** Excluye una columna.
- **restaurar sugerencia:** Devuelve la columna ignorada al flujo.
- **resolver incidencia:** Acción genérica en una alerta que lleva al campo afectado.
- **volver a Configuración:** Retorno.
- **cancelar importación:** Abort.
- **continuar a Confirmar importación:** Cierra Review & Mapping. Requiere 100% readiness.

## 23. Datos mock
**Escenario principal ("Clima Organizacional 2026"):**
- Preguntas reconocidas (80% mapped).
- Al menos una pregunta ambigua (ej. "Mi jefe me cae bien").
- Una escala reconocida (Likert 5 puntos).
- Una escala que requiere confirmación (Polaridad invertida sugerida).
- Demográficos resumidos (Área, Sede mapeados).
- Columna ignorada ("InternalID_789").
- CERO PII, CERO datos reales.

**Escenarios mínimos futuros:**
`ready-for-confirmation`, `ambiguous-question-target`, `incompatible-scale`, `unmapped-required-field`, `ignored-technical-column`, `demographic-review-required`, `inherited-blocking-issue`, `simulated-error`.

## 24. Escalabilidad
- **Principios:** Con hasta 200 archivos, no se muestran todos los mapeos en una lista plana infinita.
- **Estrategia:**
  - Agrupamiento por dominios funcionales (Preguntas, Demográficos, Escalas).
  - Listas de mapeo paginadas internamente cuando se superan ~25 elementos.
  - Filtros (Mostrar solo "Requiere revisión").
  - CTA calculado a nivel de estado global, no por página.
  - Alertas globales de incidencias bloqueantes consolidadas.

## 25. Referentes visuales
- drawer full-screen
- header compartido
- stepper lateral (indicando paso 3 activo)
- contenido amplio
- footer persistente
- fondo gris claro
- cards blancas
- tokens UBITS
- azul UBITS como acción primaria
- estilo B2B enterprise

## 26. Componentes existentes
- ImportWizardShell: `CONFIRMED_REUSABLE`
- ImportWizardHeader: `CONFIRMED_REUSABLE`
- ImportWizardSteps: `CONFIRMED_REUSABLE`
- ImportWizardFooter: `CONFIRMED_REUSABLE`
- Table: `CONFIRMED_REUSABLE`
- Select: `CONFIRMED_REUSABLE`
- Combobox: `CONFIRMED_REUSABLE`
- Visual Selection: `REQUIRES_DECISION_GATE`
- Accordion: `CONFIRMED_REUSABLE`
- Tabs: `CONFIRMED_REUSABLE`
- Pagination: `CONFIRMED_REUSABLE`
- Badge: `CONFIRMED_REUSABLE`
- Alert: `CONFIRMED_REUSABLE`
- Tooltip: `CONFIRMED_REUSABLE`
- Callout: `NOT_FOUND` / `REQUIRES_DECISION_GATE`
- Survey Analytics: `CONFIRMED_NOT_APPROPRIATE` (Solo verificación, se excluye uso).
- Componentes AI lightweight: `REQUIRES_DECISION_GATE`
- UbitsIcon e iconRegistry: `CONFIRMED_REUSABLE`

## 27. Accesibilidad
- Tablas y listas legibles por lectores de pantalla.
- Inputs de selección con aria-labels descriptivos.
- Foco automático tras resolver una incidencia (hacia el próximo item en conflicto o al panel general).
- Navegación total por teclado para Combobox y Selects.
- CTA disabled con tooltip que explique por qué.
- Mensajes de error (`Alert`) con role="alert".

## 28. IA-first
- **Sugerir target de pregunta:** `VALUABLE_IN_SIMULATION`
- **Sugerir tipo de escala:** `VALUABLE_IN_SIMULATION`
- **Agrupar preguntas similares:** `VALUABLE_LATER_AFTER_REAL_PARSING`
- **Identificar columnas ignorables:** `VALUABLE_IN_SIMULATION`
- **Explicar una ambigüedad:** `VALUABLE_IN_SIMULATION`
- **Priorizar incidencias:** `VALUABLE_LATER_AFTER_REAL_PARSING`

*Restricciones:* IA será simulada estáticamente. No mostrar porcentajes reales, no crear chat.

## 29. Riesgos
- Demasiados dominios en una pantalla causando fatiga (mitigado con Resumen General).
- Mappings contradictorios (ej. un target usado por dos preguntas).
- Pérdida de trazabilidad al agrupar de 200 archivos.
- Falsa percepción de importación final (debe quedar claro que es preparación).
- Acoplamiento prematuro con el parser real.
- Mezcla de UI para participantes y preguntas (mitigado separando dominios).

## 30. Criterios de éxito
- El usuario entiende de inmediato qué debe revisar en la pantalla resumen.
- Distingue claramente confirmado, ambiguo e ignorado.
- La interfaz no colapsa (UI o performance) asumiendo la representación conceptual de 200 archivos.
- El CTA representa el estado global y bloquea correctamente si hay ambigüedades.
- No aparenta procesamiento real (no usa endpoints).
- No introduce ni filtra PII simulado en las vistas de mapping.

## 31. Boundary Configuración → Mapping
Entrada pura vía ID y hook Adapter. Lee el borrador previo pero no re-renderea componentes previos.

## 32. Boundary Mapping → Confirmación
Salida pura vía `mappingDraftId`. Consolida si `canContinueToConfirmation` es `true`.

## 33. Decision gates cerrados
- Usuario principal validado.
- Nombre de la pantalla.
- Patrón de primera pantalla (Resumen general).
- Boundary de entrada y salida.
- Separación de Analítica.

## 34. Decision gates pendientes
- UI exacta para la vista de detalle del mapeo de preguntas.
- Componentes complejos (Combobox virtualizado, etc.) requeridos para el drill-down.
- Comportamiento de validación cruzada entre escalas y preguntas.

## 35. Fuera de alcance
- Favorabilidad, participación analítica, deltas, tendencias, eNPS, Retención, Expansión, ARR.
- Dashboards analíticos finales.
- Parser real, API, persistencia, UI real construida en esta fase.
- Múltiples pantallas (se hará luego en el build).

## 36. Estado final
`HISTORICAL_IMPORT_REVIEW_MAPPING_INTAKE_READY`

## 37. Siguiente fase máxima
`Fase 4G-R2 · Historical Import Review & Mapping Architecture Lock`
