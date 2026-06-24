# Secure Row Inventory Architecture

## Contexto

El producto "Carga Histórica de Encuestas" requiere poder listar dimensiones, preguntas, y métricas que vienen agregadas por filas (ej. los archivos 2025). Actualmente el sistema puede inferir estructura general, pero no inventariar cada elemento porque no lee filas profundas. 

Esta arquitectura define una capa intermedia segura (Secure Row Inventory) que inspecciona únicamente las filas estrictamente necesarias para levantar el inventario estructural, sin tocar los resultados originales y sin exponer información de identificación personal (PII).

## Objetivo
Definir la arquitectura para extraer de forma segura:
- dimensiones detectadas una por una;
- preguntas / ítems detectados uno por uno;
- relación pregunta -> dimensión;
- posibles demográficos si existen como labels seguros;
- métricas agregadas;
- trazabilidad hacia archivo, hoja y fila segura;
- límites de privacidad;
- fallbacks cuando no haya detalle suficiente.

## Principio Central
El **Secure Row Inventory** es una capa intermedia entre:
1. Workbook / sheet metadata segura ya detectada.
2. Structure Inventory / Structure Review Workspace futuro.

Su propósito es leer solo filas de estructura, no para analizar respuestas individuales.

## Scope Permitido de Filas (Allowed Structural Rows)
Solo puede inspeccionar filas cuando existan columnas que indiquen estructura, tales como:
- Tipo de item
- Item
- Dimensión
- Dimension
- Categoría
- Categoria
- Sección
- Seccion
- Pregunta
- Ítem
- Indicador

También puede leer labels de columnas métricas agregadas:
- Percepción Negativa
- Percepción Neutra
- Percepción Positiva
- Total de respuestas
- Favorabilidad
- Participación

## Límite de Privacidad (Forbidden Data Boundary)
Está estrictamente prohibido usar o exponer:
- valores individuales de respuesta
- comentarios abiertos
- correos
- documentos
- nombres
- IDs de participantes
- raw workbook dump
- full workbook dump
- raw JSON
- binary buffers
- base64

**Reglas adicionales**:
- No mostrar filas completas al usuario.
- No almacenar datos crudos.
- No enviar nada a API/backend/Claude/Firebase.

## Modelo de Entidades Seguras
Las siguientes entidades tipifican el resultado del inventario seguro:
- `SecureRowInventoryDimension`
- `SecureRowInventoryQuestion`
- `SecureRowInventoryMetric`
- `SecureRowInventoryDemographicCandidate`
- `SecureRowInventorySegment`
- `SecureRowInventorySourceTrace`
- `SecureRowInventoryResult`
- `SecureRowInventoryCapabilities`
- `SecureRowInventoryPrivacyBoundary`

## Trazabilidad Segura
Cada entidad detectada debe contar con trazabilidad hacia el origen:
- `sourceFileName`
- `sourceSheetName`
- `sourceLayout`
- `sourceRowIndex` (opcional)
- `sourceColumnKey` (opcional)
- `sourceLabel`
- `normalizedSourceLabel`
- `detectedFrom`
- `confidence`
- `detectionReason`

**Regla de Trazabilidad**: `sourceRowIndex` se mantiene como referencia técnica segura, pero nunca debe mostrarse como fila cruda ni utilizarse para extraer valores sensibles.

## Reglas de Detección de Dimensiones
Para layouts tipo `aggregated_items_by_rows`:
- Si "Tipo de item" = Dimension, crear `SecureRowInventoryDimension`.
- Si hay columna Dimension/Categoría/Sección, usarla como agrupador.
- Preservar el label original en `sourceLabel`.
- Crear un `normalizedLabel` para facilitar comparaciones y mapeo.
- No inventar dimensiones si no existen labels explícitos.

## Reglas de Detección de Preguntas / Ítems
- Si "Tipo de item" = Pregunta, Item, Ítem, Question o similar, crear `SecureRowInventoryQuestion`.
- Usar la columna Item/Pregunta/Ítem como `sourceLabel`.
- Asociar a la última dimensión válida anterior si el archivo está estructurado de forma secuencial.
- Si no hay dimensión anterior segura, asociar a “Sin dimensión confirmada” como estado de revisión, no como dimensión real.
- Bajo ninguna circunstancia utilizar textos de respuestas ni comentarios abiertos.

## Regla Crítica de Asignación Pregunta -> Dimensión
La relación pregunta -> dimensión detectada es estrictamente **interpretativa**. 
- No modifica valores de resultados originales.
- Debe conservar la dimensión detectada originalmente.
- Permite que exista una dimensión revisada en el futuro.
- Mantiene el `sourceTrace` hacia la fila original.

## Reglas de Candidatos Demográficos
Solo detectar como candidato demográfico si el label es seguro y no identifica directamente a una persona.

**Ejemplos permitidos:**
- gerencia, área, area, departamento, cargo, rol, antigüedad, antiguedad, país, pais, ciudad, sede, equipo, generación, generacion, rango, nivel.

**Identificadores bloqueados (PII):**
- correo, email, documento, cedula, cédula, id, employee_id, colaborador_id, nombre, teléfono, telefono.

## Reglas de Métricas
Detectar columnas que actúen como métricas agregadas mediante los siguientes labels:
- percepción negativa, percepción neutra, percepción positiva, total de respuestas, favorabilidad, participación.
- **Acción permitida:** Mapear labels a métricas estándar.
- **Acción prohibida:** Editar o calcular valores base.

## Capabilities
El inventario debe indicar explícitamente sus capacidades según los datos detectados:
- `canListDimensions`
- `canListQuestions`
- `canGroupQuestionsByDimension`
- `canListDemographics`
- `canListMetrics`
- `requiresHumanReview`
- `hasPrivacyRisk`
- `fallbackReason`

## Privacy Boundary
Definición estricta de `SecureRowInventoryPrivacyBoundary`:
- `rawRowsRendered` = false
- `rawWorkbookRendered` = false
- `participantValuesRendered` = false
- `openTextRendered` = false
- `piiFieldsBlocked` = true
- `onlyStructuralLabelsUsed` = true

## Fallbacks
Si el sistema encuentra limitaciones, debe aplicar mensajes de gracia:
- **No hay columnas suficientes**: "No tengo suficiente estructura segura para listar dimensiones y preguntas una por una."
- **Riesgo de PII**: "Detecté campos que podrían identificar personas; los dejaré bloqueados hasta revisión humana."
- **Estructura parcial**: "Encontré parte de la estructura, pero necesito confirmación antes de preparar el borrador."

## Futura Integración con Structure Inventory
La fase 11D-H24 y 11D-H25 utilizarán el resultado de Secure Row Inventory para enriquecer la estructura del H18:
- `StructureInventoryDimension`
- `StructureInventoryQuestion`
- `StructureInventoryDemographic`
- `StructureInventoryMetric`

*Nota: Esta fase 11D-H23 no modifica H18.*

## Fases Futuras
- **11D-H24** · Secure Row Inventory Types and Mapper
- **11D-H25** · Secure Row Inventory Integration with Structure Inventory
- **11D-H26** · Structure Inventory Visual List with Real Items
- **11D-H27** · Visual QA
- **11D-H28** · Hotfix si aplica
- **11D-H29** · Controlled Overlay Editing Architecture

## Out of Scope (Fuera de Alcance)
Esta arquitectura **NO INCLUYE** ni autoriza:
- Runtime implementation.
- UI.
- Editor / Drag and drop.
- Renombrar preguntas / Mover preguntas.
- Preparar borrador.
- Persistencia.
- API / backend / storage / Firebase / Claude.
- Dashboard / comparativo / `readyForComparison`.
- Importación real.
- Mutación de data fuente o de catálogos globales.
