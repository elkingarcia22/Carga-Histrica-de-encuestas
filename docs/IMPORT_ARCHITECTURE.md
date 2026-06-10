# IMPORT ARCHITECTURE - Fase 2A

## 1. Límites y Responsabilidades del Frontend

El frontend actúa como el orquestador del flujo de importación (wizard), gestionando la interacción local antes del envío final a la API productiva.

**Responsabilidades:**
* Orquestar la máquina de estados del wizard.
* Validar inicialmente archivos (peso, formato).
* Gestionar el pipeline de parseo y perfilado local a través de adaptadores.
* Proveer UI/UX responsivo sobre el progreso, estado y errores.
* Capturar la decisión humana para recomendaciones de IA.

**Límites estrictos:**
* **No guarda datos persistentes**: No persiste respuestas, demográficos ni perfiles en `localStorage` ni `sessionStorage` para asegurar la privacidad.
* **No expone PII**: Nunca imprime correos, respuestas o metadatos de filas procesadas en consola.
* **No ejecuta mutaciones irrelevantes**: No intenta recalcular datos que no vienen en agregaciones base.
* **Completamente efímero**: El estado se pierde si la ventana es recargada o la sesión cancelada.

## 2. Organización Modular del Dominio de Importación

Estructura requerida dentro de `src/lib/survey-import/`:

* `adapters/`: Encapsulan librerías de terceros (parsers Excel/CSV) e interfaces conceptuales con APIs (IA, Backend). Reciben binarios/texto, devuelven datos canónicos. Aíslan el resto del sistema del parser subyacente.
* `classifiers/`: Analizan datos parseados y determinan si la familia es `raw-individual`, `aggregated-comparison` o `unknown`. 
* `normalizers/`: Estandarizan fechas, casos, booleanos y tipos nativos.
* `validators/`: Aplican reglas de negocio para coherencia de lote, obligatoriedad de campos y esquemas. Independientes de React.
* `matchers/`: (En un futuro con IA) Toman cabeceras y asocian de forma determinística o asistida las preguntas y demográficos a la base.
* `formatters/`: Preparan datos para simulaciones o previsualizaciones en UI.

## 3. Estrategia de Estado del Wizard

* **Patrón**: `Context` + `useReducer`.
* **Razón**: Permite centralizar la máquina de estados del flujo secuencial sin requerir persistencia y evita la sobrecarga de Redux/Zustand en esta etapa temprana.
* **Limitaciones de memoria**: Todo el estado vive en memoria volatil, lo cual es intencionado y requerido para este prototipo.

**Aclaración obligatoria sobre "Single-page flow":**
"Single-page flow" NO significa construir un componente gigante, poner toda la lógica en una pantalla, tener toda la UI en `App.tsx`, usar una única carpeta sin separación o acoplar lógica de parsing con componentes visuales.
SÍ significa proveer una experiencia continua sin navegación basada en rutas internas reales, utilizando vistas modulares y separadas controladas estrictamente por el estado del dominio.

## 4. Estrategia de Procesamiento de Archivos

**Local-first en el navegador.**

* La validación, parseo y clasificación ocurren localmente.
* No se enviarán archivos crudos al servidor hasta que la importación haya sido revisada.
* El procesamiento será por bloques cancelables cuando la lógica de la herramienta de parsing lo permita.
* **Web Workers**: Serán documentados como necesarios sólo si el UI Thread se bloquea significativamente por payloads superiores a X MBs en pruebas de carga futuras.

## 5. Pipeline Conceptual de Análisis

1. **Selección**: Captura archivos.
2. **Validación de metadatos**: Verifica extensiones y pesos (sin leer).
3. **Lectura**: Extracción en RAM vía adapter.
4. **Perfilado**: Identificación de nombres de columnas y tipos.
5. **Clasificación**: Se determina `raw-individual` o `aggregated-comparison`.
6. **Validación de coherencia del lote**: Confirmar que múltiples archivos (si los hay) pueden ir juntos.
7. **Extracción**: Lectura total de filas.
8. **Normalización**: Ajustes de formato y limpieza.
9. **Matching**: Emparejamiento de esquema (Pregunta -> Métrica).
10. **Revisión humana**: Confirma match de IA, resuelve colisiones.
11. **Preview**: Mostrar un diff o simulación del resultado.
12. **Simulación de importación**: Lógica de envío en el adapter mock.
    * **Punto de no retorno (`commit-start`)**: Durante esta fase existirá un estado de guardado. Antes de `commit-start`, la simulación es cancelable. Después de `commit-start`, la cancelación queda deshabilitada y la UI debe terminar en `completed`, `partially-completed` o `failed`. No se simula rollback backend.
13. **Resultado**: Éxito y recuento.
14. **Limpieza/Cancelación**: Destrucción de la sesión activa y liberación de RAM.

## 6. Reglas para Lotes con Múltiples Archivos

Unidad de trabajo: **ImportSession** (solo una a la vez).

* **Válidos**: Un Excel con múltiples hojas válidas, varios archivos del mismo periodo/encuesta separados por demográfico.
* **Bloqueantes (Inválidos)**: Mezcla de encuestas o clientes diferentes, periodos incompatibles (excepto comparativos expresos), raw+agregado mezclados, archivos duplicados o encriptados. Si hay un inválido crítico, la sesión transita a error.

## 7. Separación entre Reglas Determinísticas e Inteligencia Asistida

El **Import Intelligence Adapter** es el límite conceptual.
* Durante la fase de prototipo: Este adapter proveerá recomendaciones harcodeadas o derivadas lógicamente.
* La UI debe mostrar cualquier sugerencia que pase este adapter como una "Recomendación de IA" (incluye Confianza, Evidencia, Explicación).
* **Regla Humana**: Toda sugerencia de confianza baja, creación de nuevo participante/demográfico, o que altere privacidad, detiene la simulación requiriendo aceptación explícita del usuario. No hay automatización silenciosa destructiva.

## 8. Adaptadores Futuros (UBITS APIs)

El **UBITS Import Adapter** aislará los contratos productivos futuros. Ninguna pantalla o action de React consumirá fetch o axios directo a productivo. Todos consumen el modelo canónico del Adapter que, por ahora, simulará demoras y respuestas positivas.

## 9. Seguridad y Privacidad

* Volatilidad garantizada: Al cancelar o cerrar, no quedan remanentes.
* Cero exfiltración: El prototipo prohíbe conexiones outbound externas.
* Limpieza de trazas: Ningún `console.log` para PII (Identificadores de usuario).

## 10. Taxonomía de Errores

| Tipo | Comportamiento | Ejemplos |
| :--- | :--- | :--- |
| **Blocking** | Impide avanzar, aborta el estado. | Archivo corrupto, Encuestas distintas en el lote, Escala no mapeable. |
| **Review Required** | Pausa y delega al usuario. | Demográfico nuevo sugerido, Confianza media en un match. |
| **Informational** | Registra y sigue el flujo. | Hoja "Instrucciones" ignorada, columnas vacías descartadas. |

## 11. Límites Configurables Diferidos

Configuraciones que existirán centralizadas:
* Archivos máximos, tamaño por archivo y total.
* Límite de hojas, filas y columnas a procesar.
* Umbral de confianza de IA.
* Anonimato (N participantes mínimos para un subgrupo).
*(Ninguno de estos límites es hardcodeado productivamente en el prototipo aún).*

## 12. Decision Gate: Dependencias Recomendadas

*No se realiza instalación en esta fase.*

**Excel Parser:**
* *Candidato Principal*: `xlsx` (SheetJS Community Edition). Excelente lectura en navegador, amplio soporte de multi-hoja.
* *Alternativa*: `exceljs`. Soporte para streaming, pero pesado.
* *Recomendación prototipo*: Evaluar `xlsx` para lectura determinística local-first si la licencia se aprueba.
**CSV Parser:**
* *Candidato Principal*: `papaparse`. Estándar de la industria para CSV streaming local. P0 o P1 según se decida la entrada de archivos CSV nativos.

## 13. Estructura de Pantallas (Screen Map)

El flujo completo de importación se divide conceptualmente en cuatro macroetapas (detallado en `docs/SCREEN_MAP.md`):
1. Cargar archivos
2. Configurar importación
3. Revisar y mapear
4. Importar encuesta

**Nota Arquitectónica**: Los estados internos de la máquina de estados dentro del wizard NO se modelan como rutas reales ni páginas independientes, sino como vistas y transiciones dentro de un flujo continuo.

## 14. Decisiones Diferidas a la Fase 3

* Diseño final del **Mock Data Contract** y esquemas TypeScript (`DATA_MODEL.md`).

---
*Fin de Architecture Lock - Fase 2A*
