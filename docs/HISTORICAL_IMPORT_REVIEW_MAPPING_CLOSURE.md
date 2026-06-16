# Estado formal

`HISTORICAL_IMPORT_REVIEW_MAPPING_FORMALLY_CLOSED`

## Resumen ejecutivo

Cierre formal de la fase 4G-R7 para el prototipo "Revisar y mapear información". Se construyó la pantalla general de mapping overview con el contrato de datos, estado y componentes visuales correspondientes, dirigida al usuario administrador de RRHH encargado de importar encuestas históricas.

## Alcance publicado

* Contrato de datos R3: tipos, mock data y adapter puro.
* Estado local (`useHistoricalImportReviewMappingState`) en el orquestador (`SurveyImportUploadScreen`), que provee persistencia del borrador de mapping durante la navegación.
* Overview componentizado: `HistoricalImportReviewMappingScreen` utilizando cards de estado para 8 dominios.
* Integración fluida desde Configuración hacia Confirmación a través de boundaries simulados.

## Arquitectura final

* **Ownership**: `useHistoricalImportReviewMappingState` es poseído por `SurveyImportUploadScreen`.
* **Boundaries**: Entrada determinada por la configuración previa; salida mediante la transición a "Confirmar importación".
* **Separación de capas**: Componentes puramente presentacionales sin estado de negocio; el adapter extrae la lógica pura de negocio (determinación de prioridades, firma, estados); el hook provee derivación síncrona y manipulación.
* `DOMAIN_STATUS_CARDS_WITH_PRIORITY_ISSUES`

## Escenarios

Los ocho escenarios (Mock) definidos y cerrados:
1. `ready-for-confirmation`: Mapping completo. CTA: Continuar. Boundary disponible.
2. `ambiguous-question-target`: Multiples destinos para preguntas. CTA: Revisar.
3. `incompatible-scale`: Escala no mapeable. CTA: Revisar.
4. `unmapped-required-field`: Campo demográfico obligatorio sin mapear. CTA: Revisar.
5. `ignored-technical-column`: Columna ignorada de sistema. CTA: Revisar.
6. `demographic-review-required`: Demográficos requieren revisión estándar. CTA: Revisar.
7. `inherited-blocking-issue`: Problema de normalización previo. CTA: Revisar configuración.
8. `simulated-error`: Fallo técnico en la carga. CTA: Reintentar importación.

## QA aprobado

* Typecheck (tsc -b)
* Lint focalizado
* Build (Vite)
* Desktop & 900 px responsive layout
* Accesibilidad semántica básica

## Historial de publicación

* SHA funcional: `0b625dd8557a8a09c3f232cbffd419e06ddf9e15`
* SHA correctivo: `8374f45c5b547daada9183b562b9250d240b43a8`
* SHA de verificación: `9714196f4e23f4598b0495ebf175001460d1db09`
* SHA final antes del cierre: `9714196f4e23f4598b0495ebf175001460d1db09`
* Publicación forward-only auditable
* Local y remoto alineados.

## Deployment

`NO_DEPLOYMENT_TRIGGERED`
No se ha activado promoción a Production.

## Fuera de alcance

* Resolución detallada (drawers/pantallas secundarias).
* Pantalla Confirmar importación real.
* Parser de archivos de Excel.
* Llamadas a APIs o servicios backend reales.
* Persistencia en base de datos.
* Uso de PII (Personally Identifiable Information).
* Uso de IA real.
* Production deployments.

## Riesgos diferidos

* Definición del catálogo real de UBITS.
* Modelo real de preguntas, sub-dimensiones y escalas.
* Implementación de un parser real y temas de seguridad.
* Diseño del backend y su estrategia de persistencia para borradores.
* Estrategias de resolución para volúmenes enormes de datos (cientos de miles de filas).
* Políticas y scrubbing de PII.

## Siguiente fase potencial

Requiere un nuevo intake. No iniciar implementación automáticamente.
Opciones conceptuales futuras:
* Resolución detallada de mappings
* Confirmar importación
* Arquitectura de parsing real
* Arquitectura backend y persistencia
