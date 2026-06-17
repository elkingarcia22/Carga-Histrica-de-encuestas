# Historical Import Synthetic Sandbox Intake

## 1. Purpose
Validar que el sistema puede recibir, interpretar y analizar localmente archivos de encuestas completamente sintéticos con una estructura representativa de exportaciones históricas reales, sin persistencia, sin red y sin datos de clientes.

## 2. Problem Statement
Se requiere un entorno aislado y seguro (Sandbox) para probar técnicamente el flujo de importación de encuestas históricas utilizando archivos sintéticos, sin arriesgar datos productivos, alterar la arquitectura principal ni incumplir los bloqueos vigentes de seguridad y privacidad.

## 3. Primary User
**Provisional:** Analista interno UBITS responsable de migraciones históricas de encuestas.

## 4. Use Context
El analista necesita:
1. Seleccionar un workbook sintético.
2. Verificar que contiene las hojas esperadas.
3. Validar columnas y tipos de datos.
4. Detectar preguntas y segmentos.
5. Identificar errores y advertencias.
6. Comparar dos periodos sintéticos.
7. Revisar participación, favorabilidad, distribución y eNPS.
8. Confirmar que no se guarda ni transmite el archivo.

## 5. First Future Screen
Carga y validación inicial.

## 6. Technical Stack
* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Tokens UBITS
* Datos mock locales
* Sin backend

## 7. Starter Kit Validation
* `docs/DESIGN.md`: Presente
* `docs/ANTIGRAVITY.md`: Presente
* `docs/ARCHITECTURE.md`: Presente
* `docs/QA_CHECKLIST.md`: Presente
* `docs/PROMPT_LOG.md`: Presente
* `src/styles/tokens.css`: Presente
* `package.json`: Presente

## 8. Existing Components Inventory
* **Upload & Files**: Exists (`src/components/upload/`), Reusable as-is (with composition for new specs).
* **Survey Analytics**: Exists (`src/components/survey-analytics/`), Reusable as-is.
* **Date & Range Inputs**: Exists (`src/components/date/`), Reusable as-is.
* **Visual Selection**: Exists (`src/components/selection/`), Reusable as-is.
* **Navigation Shell**: Exists (`src/components/navigation/`), Reusable as-is.
* **AI Interaction lightweight controls**: Exists (`src/components/ai-interaction/`), Reusable as-is.
* **UbitsIcon**: Exists (`src/icons/UbitsIcon.tsx`), Reusable as-is.
* **Button, Card, Alert, Table, Progress, Tabs, Drawer, Tooltip**: Exists via shadcn/ui (`src/components/ui/`), Reusable as-is.

## 9. Visual References
* B2B enterprise
* desktop-first
* fondo gris claro
* cards blancas
* bordes sutiles
* azul UBITS como acción primaria
* tokens oficiales

## 10. Structural Findings from Real-Format Review
* 4 hojas esperadas: answers, Dimensions, colaboradores, Jerarquía.
* 14 columnas iniciales de identificación y segmentación.
* Escala Likert 1-5, eNPS 1-11, preguntas abiertas, valores vacíos.
* Variaciones entre periodos (preguntas agregadas/retiradas, cambios de redacción, etc.).

## 11. Authorized Synthetic Scope
* SYNTHETIC_FILES_ONLY
* LOCAL_BROWSER_PROCESSING_ONLY
* IN_MEMORY_ONLY
* NO_NETWORK_FILE_TRANSMISSION
* NO_BACKEND
* NO_DATABASE
* NO_REAL_CLIENT_DATA
* NO_PRODUCTIVE_IDENTIFIERS
* NO_EXTERNAL_AI_FILE_CONTENT
* NO_CORE_PUBLICATION
* NO_MULTI_TENANT_PROCESSING

## 12. Explicitly Prohibited Scope
* No escribir código.
* No crear arquitectura todavía.
* No crear rutas.
* No construir UI.
* No crear archivos sintéticos.
* No copiar datos reales.
* No registrar nombres de personas.
* No reproducir respuestas abiertas reales.
* No reproducir atributos o segmentos reales.
* No incluir nombres de clientes en fixtures.
* No instalar dependencias.
* No modificar shadcn/ui.
* No modificar tokens.
* No usar HEX hardcodeados.
* No usar text-white.
* No usar any, any[] o as any.
* No conectar APIs.
* No usar servicios de IA.
* No activar carga productiva.
* No iniciar R1H5.
* No alterar los safe postures vigentes.

## 13. Initial Functional Capabilities
* Selección local de un XLSX
* Reconocimiento de las cuatro hojas esperadas
* Validación de columnas obligatorias y duplicados
* Cruce answers vs colaboradores y jerarquías
* Detección de preguntas Likert y eNPS
* Participación, favorabilidad y distribución

## 14. Required Synthetic Edge Cases
* Workbook válido
* Hoja faltante
* Columna obligatoria faltante
* Columna inesperada
* Identifier duplicado
* Respuesta sin colaborador
* Colaborador sin respuesta
* Código jerárquico inexistente
* Likert fuera de rango
* eNPS fuera de rango
* Texto abierto
* Valor vacío
* Pregunta nueva
* Pregunta eliminada
* Pregunta con ID físico modificado
* Pregunta con redacción modificada
* Segmento renombrado
* Segmento nuevo
* Segmento pequeño privado
* Archivo demasiado grande
* Formato no XLSX
* Workbook corrupto

## 15. Success Criteria
* [x] Selección local de un XLSX
* [x] Cero transmisión del archivo por red
* [x] Cero persistencia del archivo
* [x] Reconocimiento de las cuatro hojas esperadas
* [x] Validación de columnas obligatorias
* [x] Validación de identifiers duplicados
* [x] Cruce answers vs colaboradores
* [x] Validación de jerarquías
* [x] Detección de preguntas Likert
* [x] Detección y normalización de eNPS
* [x] Identificación de preguntas abiertas
* [x] Preguntas nuevas, retiradas y no comparables
* [x] Participación general y por segmento
* [x] Favorabilidad y distribución
* [x] Aplicación de privacidad en segmentos pequeños
* [x] Resultado descartado al recargar o cerrar

## 16. Privacy Constraints
* No persistir archivos.
* Ocultar/descartar segmentos pequeños.

## 17. AI Constraints
* NO_EXTERNAL_AI_FILE_CONTENT.
* IA no debe usarse para procesar el contenido de los archivos de encuestas.

## 18. Open Product Decisions
* Flujo de carga: UX exacto para manejar múltiples archivos o correcciones.
* Visualización: Grado de detalle mostrado en el cruce de segmentos y colaboradores.

## 19. Open Architecture Decisions
* Arquitectura en memoria para la validación de archivos (ej. uso de Web Workers, bibliotecas locales de XLSX).

## 20. Risks
* Sobrecarga de memoria del navegador con archivos muy grandes.
* Inconsistencias en parseo de XLSX local frente a un backend robusto.

## 21. Recommended Phase Sequence
1. 4K-SYN0 · Bootstrap Validation and Intake Lock
2. 4K-SYN1 · Synthetic Sandbox Architecture Lock
3. 4K-SYN2 · Synthetic Mock Data Contract
4. 4K-SYN3 · Synthetic Workbook Generation
5. 4K-SYN4 · First Screen Build Prompt
6. 4K-SYN5 · QA
7. 4K-SYN6 · Hotfix, si aplica
8. 4K-SYN7 · Formal Closure

## 22. Entry Criteria for Architecture Lock
* [x] Starter kit validado
* [x] docs/DESIGN.md presente
* [x] docs/ANTIGRAVITY.md presente
* [x] docs/ARCHITECTURE.md presente
* [x] docs/QA_CHECKLIST.md presente
* [x] Usuario principal registrado
* [x] Primera pantalla definida
* [x] Stack confirmado
* [x] Tokens confirmados
* [x] Componentes existentes inventariados
* [x] Alcance sintético aprobado
* [x] Prohibiciones registradas
* [x] Criterios de éxito registrados
* [x] No se incluyeron datos reales
