# MOCK_DATA_CONTRACT

## 1. Propósito
Definir los principios, reglas y catálogo del conjunto de fixtures sintéticos para probar la UI del wizard de importación sin conectarse a servicios reales.

## 2. Relación con DATA_MODEL.md
Todos los fixtures implementan estrictamente el modelo canónico en src/types/survey-import/. No se introducen any ni se modifican contratos para facilitar los fixtures.

## 3. Principios de datos sintéticos
- Datos 100% ficticios.
- 0% de PII o clientes reales.
- Matemáticas coherentes (porcentajes de distribución que suman 100, conteos válidos).
- Estricto tipado (satisfies).

## 4. Convenciones de nombres
- Empresa: Compañía Demo Aurora
- Nombres visibles: Persona Demo 001
- Prefijos de ID: demo-*

## 5. Restricciones de privacidad
- Correos electrónicos sintéticos (example.test).
- Sin data que se pueda relacionar con personas físicas.

## 6. Catálogo de escenarios

| Escenario | Modo | Estado | Vista principal | Confirmable | Blocking issues | Datos nominales |
| --------- | ---- | ------ | --------------- | ----------- | --------------- | --------------- |
| upload-initial | unknown | idle | U1 | No | 0 | Ninguno |
| files-selected-valid | unknown | files-selected | U2 | No | 0 | Ninguno |
| raw-happy-path | raw-individual | ready-for-preview | U4 / C1 / R3A / P1 | Sí | 0 | Sintéticos |
| raw-review-required | raw-individual | review-required | C1 / R1 / R2 / R3A / P1 | No | 1 | Sintéticos |
| aggregated-happy-path | aggregated-comparison | ready-for-preview | U4 / C1 / R1 / R2 / R3B / P1 | Sí | 0 | No aplicable |
| unknown-blocked | unknown | detection-partial | U4 | No | 1 | Ninguno |
| result-completed | raw-individual | completed | P3 | No | 0 | Sintéticos |
| result-partial | raw-individual | partially-completed | P3 | No | 0 | Sintéticos |
| result-failed | raw-individual | failed | P3 | No | 1 | Sintéticos |
| result-cancelled | unknown | cancelled | wizard-exit | No | 0 | Ninguno |

## 7. Entidades incluidas por escenario
- M2: 2 Preguntas, 1 Demográfico, 1 Participante, 1 Respuesta.
- M3: 2 Preguntas, 1 Demográfico, 1 Participante, 0 Respuestas, 2 Issues.
- M4: 1 Pregunta, 1 Demográfico, 1 Segmento, 1 Resultado Agregado.

## 8. Matriz de capacidades
Las capacidades generadas son coherentes con `mode`.
- raw-individual soporta participacion, nps, etc.
- aggregated-comparison restringe respuestas individuales y usuarios.

## 9. Matriz de issues
M3 y M5 contienen `blockingIssues` que evitan `isConfirmationAllowed: true`.

## 10. Consistencia matemática
Todos los datos de segmentos (ej: 80% + 15% + 5% = 100%) y conteos generales suman correctamente dentro de los mock data arrays.

## 11. Qué fixture alimentará U1
upload-initial (estado idle).

## 12. Qué fixtures alimentarán vistas posteriores
Mapeado en el Catálogo (U2 usa files-selected, etc.).

## 13. Campos que nunca deben mostrarse completos
Passwords, raw personal PII original fields. Solamente se usa visibleName anonimizado.

## 14. Limitaciones de los fixtures
No hay grandes volúmenes para pruebas de rendimiento; su tamaño máximo es <10 items por arreglo.

## 15. Decision gates abiertos
- ¿Usaremos un provider estático para inyectar este escenario en modo local dev?
- ¿Permitiremos transiciones de un escenario a otro simulando "clicks" para demos?

## 16. Pendientes para Fase 3B2
- Implementar validaciones Zod para estos tipos.
- Construir provider de estado UI con estos fixtures.
