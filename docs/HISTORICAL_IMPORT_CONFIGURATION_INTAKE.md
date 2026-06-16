# Historical Import Configuration Prototype Intake

## 1. Contexto
El prototipo actual representa el flujo de Carga Histórica de Encuestas cerrado en `main` bajo el estado `HISTORICAL_IMPORT_NORMALIZATION_MAIN_CLOSED`. Abarca desde la carga de archivos (U1) hasta la vista previa de normalización (U4-SIM). La siguiente etapa conceptual se inicia cuando el usuario pulsa "Continuar a configuración" desde U4-SIM.

## 2. Diferencia frente a Comparativo
Este proyecto corresponde exclusivamente a la **Carga Histórica de Encuestas**, no al Comparativo de Encuestas. La pantalla no incluirá comparaciones, favorabilidad, participación analítica, deltas, tendencias, benchmarks, dashboards de clima, eNPS, retención, expansión, ARR, recomendaciones de negocio, parser real, APIs, backend, persistencia, datos reales, PII, ni IA generativa real.

## 3. Estado del flujo actual
Consolidado y cerrado formalmente en `main`. (U1 -> U2 -> U3-SIM -> U4-SIM).

## 4. Objetivo exacto
Convertir el resultado estructural de U4-SIM en un borrador de configuración comprensible, editable y revisable antes de mapear preguntas, escalas, participantes, jerarquías y campos demográficos. (Objetivo validado y confirmado).

## 5. Usuario principal
**Consultor de implementación** (Recomendado). Al tratarse de cargas históricas, normalmente es un proceso asistido o ejecutado por el equipo de implementación de UBITS para garantizar la correcta parametrización y mapeo de datos legados. Los administradores cliente quedan como usuarios secundarios.

## 6. Nombre recomendado
**Configurar encuesta histórica** (Confirmado como primera opción por su claridad y acción directa).

## 7. Happy path
1. El usuario llega desde un lote con estado `ready-for-configuration`.
2. Revisa la identidad de la encuesta detectada.
3. Confirma o corrige nombre, tipo y periodo.
4. Define privacidad, visibilidad y umbral mínimo.
5. Revisa los archivos fuente heredados.
6. Confirma que no existen incidencias bloqueantes.
7. Guarda el borrador únicamente en memoria simulada.
8. Continúa hacia una futura etapa de revisión y mapeo.

## 8. Entrada conceptual
Recibe únicamente metadata serializable desde U4-SIM:
- `batchId`, `scenarioId`, `surveyIdentity`, `surveyType`, `surveyPeriod`, `batchStatus`, `fileCount`, fuente principal, archivos complementarios, familias estructurales, roles propuestos, incidencias heredadas, confirmaciones pendientes, estado de readiness.
(Sin File, Blob, ArrayBuffer, ni PII).

## 9. Salida conceptual
Un borrador simulado de configuración que incluye:
- Nombre visible de la encuesta, tipo de encuesta, periodo histórico (fecha inicial/final), modalidad de privacidad, visibilidad, umbral mínimo, idioma/configuración regional, lote de origen, confirmaciones, incidencias pendientes, estado del borrador, y flag para continuar a Review & Mapping.

## 10. Módulos visibles
1. Resumen heredado de normalización (Obligatorio)
2. Información general (Obligatorio)
3. Periodo histórico (Obligatorio)
4. Privacidad y tratamiento de respuestas (Obligatorio)
5. Umbral mínimo (Obligatorio)
6. Visibilidad (Obligatorio)
7. Archivos fuente (Diferido/Opcional en un callout)
8. Incidencias heredadas (Obligatorio si existen)
9. Resumen de configuración (Opcional)
10. Footer con Volver y Continuar (Obligatorio)

## 11. Campos editables
- Nombre de la encuesta
- Tipo de encuesta
- Periodo histórico
- Modalidad de privacidad
- Umbral mínimo
- Visibilidad

## 12. Campos confirmables
- Tipo de encuesta (cuando la detección no es 100% segura).
- Nombre de la encuesta (si proviene de nombre de archivo genérico).

## 13. Privacidad
- Opciones: Anónima, Confidencial, Identificada.
- **Anónima**: No se asocian datos personales, no hay trazabilidad de usuario.
- **Confidencial** (Default mock): Se conocen los usuarios pero sus respuestas individuales están protegidas bajo un umbral de agregación.
- **Identificada**: Se sabe quién responde qué. Requiere confirmación explícita (alerta).

## 14. Periodo
- Se configurará mediante **Año** y opcionalmente **Mes/Trimestre**. Para datos históricos, el año es el pivot principal.
- Si es incompleto, se debe permitir especificar el rango (ej. Q1 2026).

## 15. Umbral mínimo
- Propósito: Proteger el anonimato/confidencialidad en cruces de datos.
- Valor mock por defecto: `5` (valor estándar B2B).
- Rango permitido para el prototipo: `3` a `10`.
- Es obligatorio si la encuesta es Confidencial. Bloquea si es menor a 3.

## 16. Visibilidad
Opciones conceptuales:
- Solo administradores
- Administradores y consultores autorizados

## 17. Incidencias heredadas
- **Bloqueantes**: Falta de metadatos estructurales clave (ej. periodo totalmente ambiguo sin resolución manual). Devuelven al usuario a U4-SIM o impiden continuar.
- **Confirmables en configuración**: Ambigüedad en el tipo de encuesta o nombre.
- **Diferibles**: Problemas con escalas o campos demográficos específicos, pasan a Review & Mapping.

## 18. Estados
- `incomplete`
- `valid`
- `confirmation-required`
- `blocked-by-inherited-issue`
- `simulated-error`
- `ready-for-mapping`

## 19. Acciones
- **Volver a vista previa**: Retorna a U4-SIM.
- **Cancelar importación**: Aborta el proceso (con confirmación).
- **Continuar a revisión y mapeo**: Avanza a la siguiente fase (disabled si `incomplete` o `blocked`).

## 20. Datos mock
- Encuesta: Clima Organizacional 2026
- Tipo: Clima
- Periodo: 2026
- Modalidad: Confidencial
- Umbral mínimo: 5
- Visibilidad: Administradores y consultores autorizados
- Archivos: 4 archivos sintéticos de U4-SIM
- Estado: `ready-for-configuration`
- Sin incidencias bloqueantes.

## 21. Referentes visuales
- Drawer full-screen existente del flujo U1-U4-SIM.
- Header compartido y stepper lateral.
- Área de contenido amplia con cards blancas.
- Estilo B2B enterprise sobrio (azul UBITS para primaria).

## 22. Componentes existentes confirmados
- `ImportWizardShell`, `ImportWizardHeader`, `ImportWizardSteps`, `ImportWizardFooter` (presentes en `src/components/survey-import`)
- Formularios UI: `Select`, `Input`, `Cards` (`card.tsx`), `Alerts` (`alert.tsx`), `Tooltips` (`tooltip.tsx`) (presentes en `src/components/ui`)
- Date & Range Inputs: `DatePicker`, `DateRangePicker`, `PeriodSelector`, `QuarterSelector` (presentes en `src/components/date`)
- Visual Selection: `SelectableCard`, `RadioCardGroup` (presentes en `src/components/selection`)
- AI Lightweight: `AIButton`, `Chip`, `AILoader` (presentes en `src/components/ai-interaction`)

## 23. Stack y tokens
- React, TypeScript, Tailwind CSS, shadcn/ui, tokens UBITS confirmados.

## 24. Accesibilidad
- Soporte para navegación por teclado, focus traps dentro del drawer, etiquetas aria correctas para los inputs y selectores.

## 25. Riesgos
- Pérdida de contexto entre U4-SIM y configuración.
- Exceso de campos en una sola pantalla.
- Contradicción entre encuesta y periodo.
- Falsa percepción de IA real.

## 26. Oportunidades IA-first
- **Sugerir nombre de encuesta**: VALUABLE_IN_SIMULATION
- **Sugerir tipo**: VALUABLE_IN_SIMULATION
- **Sugerir periodo**: VALUABLE_IN_SIMULATION
- **Explicar por qué un campo requiere confirmación**: VALUABLE_IN_SIMULATION
- **Resumir incidencias heredadas**: VALUABLE_LATER_AFTER_REAL_PARSING

## 27. Criterios de éxito
- La pantalla consolida la metadata de U4-SIM en un formulario claro y manejable.
- Todos los campos requeridos tienen un estado mock controlable.
- La pantalla reutiliza el drawer y los componentes existentes de `ImportWizard*` sin requerir reescrituras estructurales.

## 28. Decision gates cerrados
- Usuario principal.
- Nombre final.
- Modelo de privacidad (default Confidencial).
- Umbral mínimo (default 5).

## 29. Decision gates pendientes
- Estrategia de estado local para este paso (¿Zustand, Context, o local State para el draft?).
- Boundary exacto entre Configuración y Review & Mapping (¿qué pasa a la siguiente fase?).

## 30. Boundary U4-SIM → Configuración
- Transición suave pasando el `scenarioId` o `batchId` que carga el estado pre-procesado simulado.

## 31. Boundary Configuración → Review & Mapping
- Envío del draft JSON configurado que definirá las reglas para el mapeo de columnas y escalas en la siguiente fase.

## 32. Áreas fuera de alcance
- Construcción real de la pantalla, persistencia, llamadas a API, validaciones reales en servidor.

## 33. Estado final
`HISTORICAL_IMPORT_CONFIGURATION_INTAKE_READY`

## 34. Siguiente fase máxima autorizable
`Fase 4F-R2 · Historical Import Configuration Architecture Lock`
