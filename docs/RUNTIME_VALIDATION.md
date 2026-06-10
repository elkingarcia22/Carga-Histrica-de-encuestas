# Runtime Validation Definition

## 1. Alcance
Definición, validación y testing del contrato de datos a través de Zod para la importación asistida por IA.

## 2. Estado Final de Ejecución (Fase 3B2C2.2)
Las pruebas de validación en runtime fueron formalmente cerradas con un **PASS** global.
- 10 de 10 escenarios positivos aprobados.
- 18 de 18 escenarios negativos rechazados de forma segura y consistente.
- Cero fugas de información técnica (Regex purgados).
- Cero inconsistencias en el catálogo de fixtures.

## 3. Invariancia Raw/Visibilidad
Para garantizar la coherencia de negocio, el `ImportSessionSchema` incorpora reglas cruzadas estrictas:
- El modo `raw-individual` **nunca** podrá configurarse con visibilidad `aggregated-only`.
- La visibilidad `aggregated-only` es exclusiva para sesiones con modo estructural `aggregated-comparison`.

## 4. Política Segura de Email
Los mensajes de error arrojados por los analizadores nativos de Zod (ej. validación de email o URLs) han sido sobreescritos por mensajes estáticos seguros:
- *Ejemplo*: `"El correo no tiene un formato válido."*
- *Razón*: Evita la inyección y exposición de regex complejos en la capa de interfaz de usuario.

## 5. Cierre de Pruebas Runtime
Con el harness temporal de Vite finalizado de manera satisfactoria y sin archivos residuales en el repositorio, se da por completada la Fase 3B. Los schemas han demostrado la rigurosidad y exactitud necesaria para soportar la capa de UI.

## 6. Pendientes para Fase 3C
- Generación y consolidación de Stores.
- Implementación de controladores React y hooks mockeados.
- Acoplamiento final del MOCK_DATA_CONTRACT con el catálogo validador.

### Fase 3B2C2.3: Exact Fixture Integrity Audit
**Estado:** Bloqueada.
**Hallazgo:** La nota anterior de aislamiento fue confirmada. Al validar directamente y sin adaptación los fixtures exportados por el catálogo, 8 de los 10 fixtures pasan de forma inmutable y con firma criptográfica intacta. Sin embargo, `raw-review-required` y `unknown-blocked` fallaron `safeParse` debido a inconsistencias documentales en los conteos internos del fixture y un defecto en el schema. 

### Fase 3B2C2.4: Review Progress Semantics Decision Gate
**Estado:** Completada (Analíticamente) / Fase 3C Bloqueada.
**Decisión:** Clasificado como **MIXED_DEFECT**. Se determinó que `blocking` representa una dimensión transversal de las entidades y no un estado exclusivo. Se elaboró `docs/REVIEW_PROGRESS_SEMANTICS_DECISION.md` recomendando correcciones mínimas sobre `reviewSchemas.ts` y `unknownBlockedScenario.ts`. No se ha corregido el schema ni el fixture aún. Se mantiene el bloqueo hacia Fase 3C.

### Fase 3B2C2.5: Review Progress Mixed-Defect Hotfix
**Estado:** Completada / Fase 3C Autorizada.
**Resolución:** Se aplicaron las correcciones autorizadas en `reviewSchemas.ts` (exclusión de `blocking` en la suma de estados excluyentes) y en `unknownBlockedScenario.ts` (reinicio a 0). El validation harness confirmó la validez estructural de la semántica.
**Resultado de Regresión:** 10/10 fixtures exactos con firma intacta pasaron. 7/7 casos específicos de Review Progress pasaron o fueron rechazados correctamente. 18/18 negativos rechazados correctamente. Se autoriza la transición a Fase 3C.
