# Fase 2C · Architecture Formal Approval Report

## 1. Resumen ejecutivo
El propósito de este documento es certificar la revisión cruzada entre el intake de producto (`PROJECT_INTAKE.md`), la arquitectura técnica (`IMPORT_ARCHITECTURE.md`) y el mapa de experiencia (`SCREEN_MAP.md`), asegurando que las decisiones estén alineadas para avanzar al diseño del contrato de datos. La revisión confirma la viabilidad de una experiencia tipo "single-page flow" guiada por un estado efímero en memoria y asistida por IA sin comprometer dependencias tempranas.

## 2. Estado formal
APPROVED_WITH_CONDITIONS

## 3. Archivos creados y modificados
* **Creados**: `docs/IMPORT_ARCHITECTURE_APPROVAL.md`
* **Modificados**:
  * `docs/IMPORT_ARCHITECTURE.md` (Se agregó definición de `commit-start` y aclaración sobre *single-page flow*).
  * `docs/SCREEN_MAP.md` (Se incluyeron restricciones sobre la cancelación usando el concepto `commit-start`).
  * `docs/PROMPT_LOG.md` (Registro formal de la Fase 2C).

## 4. Matriz de consistencia

| Tema | PROJECT_INTAKE | IMPORT_ARCHITECTURE | SCREEN_MAP | Consistente | Acción |
| ---- | -------------- | ------------------- | ---------- | ----------- | ------ |
| Usuario principal | Administrador / Consultor | Implícito en UI bounds | Implícito | Sí | Ninguna. |
| Primera experiencia | Agente visual guiado | Frontend orquestador | Flujo continuo | Sí | Ninguna. |
| Primera pantalla | Carga de archivos (U1) | Flujo continuo / Vista U1 | Vista U1 (Carga inicial) | Sí | Ninguna. |
| Familias de entrada | Raw, Agregado, Desconocido | `raw-individual`, `aggregated-comparison`, `unknown` | Vistas R3A (Raw) y R3B (Agregado) | Sí | Ninguna. |
| Unidad de sesión | Una sesión activa a la vez | `ImportSession` única | Implícito (wizard global) | Sí | Ninguna. |
| Manejo múltiples archivos | Lote con validación de coherencia | Reglas de lotes definidos | Vista U2 (lista múltiple) | Sí | Ninguna. |
| Persistencia / Privacidad | No PII, Local-first | Efímero, no localStorage ni logs | Resumen visual sin PII nominal | Sí | Ninguna. |
| IA | Sugerencias, no decisiones mudas | Límite: Import Intelligence Adapter | UI con badges de confianza | Sí | Ninguna. |
| APIs | Excluidas conexiones productivas | Adapter simula latencia | Sin endpoints reales mostrados | Sí | Ninguna. |
| Macroetapas | Listado de 11 fases lógicas | 4 macroetapas base | 4 macroetapas visibles | Sí | Ninguna. |
| Raw individual | Carga de participantes/resultados | Clasificación como raw | Tabs R3A | Sí | Ninguna. |
| Agregado comparativo | Resultados macro, sin individuos | Clasificación como agregado | Tabs R3B | Sí | Ninguna. |
| Unknown / Incompatible | Error bloqueante | Clasificado e impide avance | U4 incompatible bloquea C1 | Sí | Ninguna. |
| Cancelación / No retorno | Cancelación controlada (Intake) | Limpieza/Cancelación destruye todo | **No (No detallaba `commit-start`)** | Faltaba | Modificado IMPORT_ARCHITECTURE y SCREEN_MAP. |
| Primera implementación | Construcción de UI inicial (solo shell) | Delegado a SCREEN_MAP | Restringido a U1 (Carga) | Sí | Ninguna. |
| Dependencias | Decisiones pendientes sobre librerías | Candidatos ExcelJS/xlsx/PapaParse | Ninguna dependencia forzada | Sí | Ninguna. |
| Contrato de datos pendiente| Fase posterior (Data Contract) | Aplazado como `DATA_MODEL.md` | N/A | Sí | Ninguna. |

## 5. Decisiones congeladas
* **Alcance Actual**: Se incluye el agente visual guiado. Se tratará una única sesión activa permitiendo lotes multi-archivo (para la misma importación). Las validaciones humanas son ineludibles. No habrá importaciones recurrentes autónomas, modelo de IA real directo, APIs activas ni persistencia local en storage de disco de datos del negocio.
* **Estado del Flujo**: React Context con `useReducer`. Estado puramente en memoria volátil sin Redux, Zustand o almacenamiento permanente.
* **Arquitectura Modular**: Separación radical entre componentes de dominio y pantallas. Existencia de Validators, Matchers, Classifiers y Normalizers apartados.
* **Navegación Conceptual**: Consolidación de 4 macroetapas (Cargar, Configurar, Revisar, Importar) sin rutas. Todo el enrutamiento visual depende de la máquina de estados dentro de la AppShell principal.
* **Primera Pantalla**: La implementación técnica prioritaria arranca con **U1 · Carga inicial**, sin validaciones profundas reales de contenido o parseo de datos.
* **Seguridad y Privacidad**: Datos mock puramente sintéticos, no hay rastro de PII nominal en el frontend, y protección completa contra envíos inadvertidos o visualizaciones inadecuadas.
* **Límites de Integración y de IA**: IA provee datos que viajan a través de los Adapters, con visibilidad requerida de confianza y evidencia. Sin confirmaciones automáticas basadas en score heurístico y sin conexiones a API UBITS.

## 6. Aclaraciones incorporadas
* **Single-page flow**: Definido explícitamente. No significa una gran App.tsx ni un archivo monolítico. Requiere un flujo con componentes independientes que no alteren el Router de la aplicación sino su Contexto interno.
* **Punto de `commit-start`**: Queda claro que la cancelación limpia la máquina de estados. Sin embargo, al iniciar el volcado (`commit-start`), el proceso es irrevocable; no hay simulaciones de *rollback* de bases de datos relacionales en el frontend, resultando ineludiblemente en éxito total, éxito parcial o error duro.

## 7. Riesgos abiertos
**Riesgos Altos**:
* Parseo: Ausencia de una biblioteca aprobada definitiva de Excel (xlsx vs exceljs).
* Performance: Lotes inmensos de datos en CSV/Excel podrían bloquear el Main Thread del navegador.
* Data Shape: Discrepancias masivas en las nomenclaturas provistas por clientes de otras plataformas.
* Seguridad: Carga imprudente de archivos reales (PII) durante las simulaciones del desarrollador.

**Riesgos Medios**:
* Posible incremento inmanejable de las acciones dentro del reducer de React a medida que escalan las transiciones.
* Dificultades de diseño UX para presentar evidencia y justificación IA de manera breve.
* Casos límite en hojas o tablas extraídas (tablas rotas, pivotes nativos).

**Riesgos Bajos**:
* Dependencia inicial en íconos Lucide.
* Desajustes de pixel-perfect.

## 8. Decision gates abiertos
La Fase 2C mantiene pospuestos y pendientes:
* La selección final de las librerías parser (CSV/Excel).
* Límites máximos estandarizados por negocio (tamaño/filas permitidas).
* Especificaciones precisas del Data Contract (Types, Interfaces, Zod schemas).
* La selección y contrato API del proveedor de LLM / inferencia.
* Especificaciones de endpoints para volcado en bases de datos productivas.

## 9. Condiciones de gobernanza
Esta aprobación es vinculante y prohíbe, en las subsecuentes fases del wizard:
* La creación de UI, rutas o instalación de paquetes si no está explícitamente dictaminado.
* Cambiar la primera pantalla (U1).
* Cualquier ajuste de los archivos `.config`, `package.json` o componentes en `src/components/ui`.

## 10. Autorización para Fase 3
**SE AUTORIZA EL INICIO DE FASE 3 · MOCK DATA CONTRACT.**
La Fase 3 puede:
* Modelar entidades, contratos conceptuales y estados del dominio.
* Crear el archivo `docs/DATA_MODEL.md`.
* Definir tipos TS pequeños.
* Crear mocks puramente sintéticos (en futuras vistas).

La Fase 3 **NO** puede:
* Instalar parsers ni librerías nuevas.
* Crear UI ni usar datos reales.
* Conectar APIs.

## 11. QA realizado
1. Reemplazo y modificaciones localizadas exclusivamente en `IMPORT_ARCHITECTURE.md` y `SCREEN_MAP.md`.
2. Archivos intocables como `PROJECT_INTAKE.md`, configuración, `src/**`, `QA_CHECKLIST.md` no fueron alterados.
3. Consistencia certificada por cruce de reglas.
4. Definición explícita de `commit-start` añadida.
5. Clarificación sobre single-page flow realizada exitosamente.
6. Ningún modelo de mock (`DATA_MODEL.md`) fue construido prematuramente.
7. Commit base asumido como lo indica la petición.

## 12. Diff de archivos
* `IMPORT_ARCHITECTURE.md`: Bloque 3 actualizado para single-page flow. Bloque 5 actualizado para commit-start.
* `SCREEN_MAP.md`: Actualización de la vista P2 y la lógica transversal de reglas de navegación.
* Nuevo archivo `IMPORT_ARCHITECTURE_APPROVAL.md` con esta especificación de reporte.

## 13. Estado de la fase
Aprobada con condiciones.
