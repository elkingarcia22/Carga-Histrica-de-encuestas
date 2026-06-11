# SCREEN MAP - Fase 2B

Este documento define el mapa conceptual de pantallas, estados visuales, navegación y bifurcaciones del wizard de importación asistida por IA para UBITS.

**Nota Arquitectónica Restrictiva**: Este es un mapa conceptual de *vistas*. Las vistas descritas a continuación **no deben implementarse como rutas o URLs independientes**. El wizard debe sentirse como un único flujo continuo (single-page flow), utilizando renderizado condicional basado en la máquina de estados definida en `docs/IMPORT_ARCHITECTURE.md`.

---

## Contexto de Entrada

### Contexto E0 · Lista de encuestas
* **Propósito**: Mostrar encuestas existentes, ofrecer la acción para iniciar una importación y mantener el contexto del módulo UBITS Encuestas.
* **Reglas**: No es parte del wizard. No debe construirse primero. Sirve únicamente como punto de entrada conceptual.

---

## Shell Persistente del Wizard

Todas las vistas internas del wizard comparten un shell conceptual persistente:

### Header superior
* Nombre contextual del proceso.
* Subtítulo del estado actual.
* Acción `Cancelar importación` (jerarquía visual sobria).
* No incluye múltiples acciones primarias.

### Navegación lateral del proceso (Macroetapas)
El wizard se divide en cuatro macroetapas visibles. Cada etapa indica su estado (Activa, Completada, Bloqueada, Requiere revisión, Con error).
1. **Cargar archivos**
2. **Configurar importación**
3. **Revisar y mapear**
4. **Importar encuesta**

### Resumen lateral
Muestra únicamente información segura y agregada (dependiendo de la etapa actual):
* Nombre del archivo o cantidad de archivos.
* Familia detectada.
* Tipo de encuesta.
* Visibilidad.
* Conteos agregados y revisiones pendientes.
* *Restricción*: No muestra respuestas individuales, correos, nombres completos reales, filas del archivo o PII.

### Footer persistente
* Acciones contextuales: Volver, Continuar, Procesando, Revisar conflictos, Importar encuesta.
* Una sola acción primaria.
* Estado `disabled` claro cuando corresponda. No permite saltar validaciones bloqueantes.

---

## Macroetapa 1 · Cargar archivos

### Vista U1 · Carga inicial
* **Objetivo**: Permitir seleccionar o arrastrar archivos de origen.
* **Elementos**: Zona de carga, selector múltiple, explicación de formatos y capacidades, estado inicial del resumen lateral, CTA Continuar deshabilitado.
* **Estados**: `idle`, `files-selected`.
* **Nota**: Esta será la **primera pantalla de construcción**.

### Vista U2 · Archivos seleccionados y validación inicial
* **Objetivo**: Mostrar el lote antes del análisis profundo.
* **Elementos**: Lista de archivos (nombre sanitizado, tamaño, formato), estado individual, acciones de eliminar/agregar, manejo de errores de formato/duplicados, CTA para iniciar análisis.
* **Estados**: `files-selected`, `validating`.
* **Recomendación**: Implementar U2 **dentro de U1 como estado enriquecido** (cuando la zona de carga está poblada). Justificación: Mantiene al usuario en el contexto de carga, optimizando la interacción sin transiciones de vista innecesarias antes de iniciar el procesamiento profundo.

### Vista U3 · Analizando lote
* **Objetivo**: Comunicar perfilado y clasificación en curso.
* **Elementos**: Progreso global, fase actual, hojas detectadas progresivamente, skeletons, cancelación controlada.
* **Restricciones**: No mostrar resultados definitivos prematuros. No simular streaming de IA en tiempo real.
* **Estados**: `validating`, `profiling`, `classifying`.

### Vista U3-SIM · Procesamiento inicial simulado (Variante Temporal)
* **Objetivo**: Simular el procesamiento profundo para validar flujo de producto sin dependencia del parser real.
* **Nota**: Esta vista no crea una nueva ruta y no sustituye a la U3 real de producción.
* **Handoff**: Al completarse guiará al usuario hacia la vista HP-SIM (Historical Preview Simulated).

### Vista HP-SIM · Historical Preview Simulated
* **Objetivo**: Mostrar el resumen simulado de una carga histórica agregada basada en fixtures puramente sintéticos.
* **Elementos**: Encuesta en previsualización, selector pasivo de periodos, KPIs sintéticos, distribución y tendencia, disclosure permanente.
* **Estados**: `preview-ready`, `preview-limited`, `preview-empty`.
* **Nota**: Esta pantalla es terminal para el proceso simulado, con opciones exclusivas para cerrar o volver atrás.

### Vista U4 · Estructura detectada
* **Objetivo**: Explicar los hallazgos antes de configurar.
* **Elementos**: Familia detectada, confianza (IA), hojas y roles, tipo sugerido, alertas, CTA Continuar.
* **Variantes**: Detección completa, parcial, desconocida (`unknown`), incompatible.
* **Reglas**: Para `unknown` o incompatibilidad bloqueante, no se habilita el avance a configuración.
* **Estados**: `detection-complete`, `detection-partial`.

---

## Macroetapa 2 · Configurar importación

### Vista C1 · Configuración general
* **Objetivo**: Definir la interpretación y protección de la encuesta.
* **Elementos**: Nombre, sugerencia IA de tipo, visibilidad, modo detectado, periodo, fuente/huella, resumen lateral actualizado.
* **Condicional por modo**:
  * **Raw individual**: Visibilidad, anonimato, umbral, asociación posterior.
  * **Agregado comparativo**: Histórico/periodo/alcance. Aviso claro de no disponibilidad de respuestas nominales.
* **Estados**: `configuration-required`, `review-required`.

---

## Macroetapa 3 · Revisar y mapear

Navegación interna basada en tabs. Las correcciones se conservan al cambiar de tab.

### Vista R1 · Preguntas y escalas (Tab 1)
* **Objetivo**: Validar interpretación de preguntas y escalas.
* **Elementos**: Resumen total (nuevas, alineadas, no interpretables), filtros, tabla (tipo, escala, dimensión, match sugerido, confianza IA, corrección manual), bloqueos.
* **Estados**: `review-required`, `ready-for-preview`.

### Vista R2 · Demográficos (Tab 2)
* **Objetivo**: Validar nombres, equivalencias y valores demográficos.
* **Elementos**: Campo original, sugerencia UBITS, valores nuevos, estado del match, corrección manual, aviso de no contaminación del directorio.
* **Estados**: `review-required`, `ready-for-preview`.

### Vista R3A · Participantes (Tab 3 - Solo Raw Individual)
* **Objetivo**: Validar identidad y tratamiento de participantes.
* **Elementos**: Participante sanitizado, username/correo detectado, match UBITS, usuario existente/externo, resolución de conflictos, bloqueos de privacidad.

### Vista R3B · Segmentos (Tab 3 - Solo Agregado Comparativo)
* **Objetivo**: Validar los cortes en el histórico agregado.
* **Elementos**: Área/código, valor de segmento, tamaño de muestra, estado del match, conflictos de taxonomía, segmentos nuevos. Sin PII nominal.

---

## Macroetapa 4 · Importar encuesta

### Vista P1 · Preview de impacto
* **Objetivo**: Resumen de impacto previo a la confirmación.
* **Elementos**: Conteos de archivos, hojas (usadas/ignoradas), preguntas (asociadas/nuevas), demográficos, participantes/segmentos, conflictos/warnings, errores bloqueantes, privacidad. CTA "Confirmar importación" bloqueado ante errores críticos.
* **Estados**: `ready-for-preview`, `ready-to-import`.

### Vista P2 · Importando
* **Objetivo**: Simulación del proceso de guardado final.
* **Elementos**: Estado, progreso, fases conceptuales. Mensaje de no cerrar la ventana.
* **Regla `commit-start`**: Una vez iniciada la transacción en esta vista (después de `commit-start`), la cancelación manual queda deshabilitada.
* **Estados**: `importing`.

### Vista P3 · Resultado final
* **Objetivo**: Conclusión del flujo.
* **Variantes**:
  * **Éxito**: Resumen, capacidades habilitadas, acciones para ver encuesta o volver a la lista.
  * **Éxito parcial**: Importados/omitidos, warnings, reporte de errores.
  * **Fallo**: Razón segura, elementos no persistidos, acción para volver/reiniciar.
* **Estados**: `completed`, `partially-completed`, `failed`.

---

## Matriz de Navegación

| ID  | Vista                                  | Macroetapa               | Estado de dominio                                 | Entrada válida   | Salida válida     | CTA primario           | CTA secundario       | Bloqueos                          |
| --- | -------------------------------------- | ------------------------ | ------------------------------------------------- | ---------------- | ----------------- | ---------------------- | -------------------- | --------------------------------- |
| E0  | Lista de encuestas                     | (Externa)                | N/A                                               | N/A              | U1                | Iniciar importación    | N/A                  | N/A                               |
| U1  | Carga inicial                          | 1. Cargar archivos       | `idle`, `files-selected`                          | E0               | U2                | Continuar (deshabilitado) | Descargar plantilla  | Sin archivos                      |
| U2  | Archivos seleccionados y validación    | 1. Cargar archivos       | `files-selected`, `validating`                    | U1               | U3/U3-SIM         | Analizar lote          | Agregar archivos     | Errores de formato                |
| U3  | Analizando lote                        | 1. Cargar archivos       | `validating`, `profiling`, `classifying`          | U2               | U4                | N/A (Automático)       | Cancelar             | N/A                               |
| U3-SIM | Analizando lote (Simulado)          | 1. Cargar archivos       | `queued`, `running`, `completed`                  | U2               | HP-SIM            | N/A (Automático)       | Cancelar             | N/A                               |
| HP-SIM | Historical Preview Simulated        | 1. Cargar archivos       | `preview-ready`, `preview-limited`, `preview-empty` | U3-SIM           | U2                | Cerrar vista previa    | Volver a archivos    | N/A                               |
| U4  | Estructura detectada                   | 1. Cargar archivos       | `detection-complete`, `detection-partial`         | U3               | C1 (o U1 si error)| Continuar              | Reemplazar archivos  | Unknown o incompatibilidad        |
| C1  | Configuración general                  | 2. Configurar importación| `configuration-required`, `review-required`       | U4, R1/R2/R3      | R1                | Ir a revisar           | Volver               | Omisiones en campos obligatorios  |
| R1  | Preguntas y escalas (Tab)              | 3. Revisar y mapear      | `review-required`, `ready-for-preview`            | C1, R2, R3        | R2, P1            | Siguiente Tab / Preview| Volver               | Conflictos críticos de escala     |
| R2  | Demográficos (Tab)                     | 3. Revisar y mapear      | `review-required`, `ready-for-preview`            | R1, R3            | R1, R3            | Siguiente Tab          | Volver               | Mapeos no resueltos requeridos    |
| R3A | Participantes (Tab Raw)                | 3. Revisar y mapear      | `review-required`, `ready-for-preview`            | R2                | P1                | Ver resumen (Preview)  | Volver               | Privacidad / Conflictos identidad |
| R3B | Segmentos (Tab Agregado)               | 3. Revisar y mapear      | `review-required`, `ready-for-preview`            | R2                | P1                | Ver resumen (Preview)  | Volver               | Segmentos huérfanos requeridos    |
| P1  | Preview de impacto                     | 4. Importar encuesta     | `ready-for-preview`, `ready-to-import`            | R1, R2, R3        | P2, R1            | Confirmar importación  | Volver a revisar     | Errores blocking latentes         |
| P2  | Importando                             | 4. Importar encuesta     | `importing`                                       | P1               | P3                | N/A (Automático)       | Cancelar (si aplica) | N/A                               |
| P3  | Resultado final                        | 4. Importar encuesta     | `completed`, `partially-completed`, `failed`      | P2               | E0                | Ir a encuesta / Volver a lista | Ver detalles         | N/A                               |

---

## Bifurcaciones y Reglas de Flujo

### Flujo Raw Individual
Secuencia: `U1 → U2 → U3 → U4 → C1 → R1 → R2 → R3A → P1 → P2 → P3`

### Flujo Agregado Comparativo
Secuencia: `U1 → U2 → U3 → U4 → C1 → R1 → R2 → R3B → P1 → P2 → P3`

### Flujo Unknown o Incompatible
Secuencia: `U1 → U2 → U3 → U4`
Al llegar a U4 con bloqueo:
* Opciones: Volver a U1, eliminar archivos, descargar plantilla, cancelar.
* Regla: No avanza a C1 mientras exista el bloqueo.

---

## Reglas de Navegación, Cancelación y Recarga

* **Volver**: No borra las decisiones ya confirmadas. Volver desde revisión (R) a configuración (C1) puede invalidar matches dependientes (marcando campos como pendientes). No aplica durante el procesamiento final.
* **Cancelar importación**: Pide confirmación si hay datos procesados. Limpia estado/memoria, no deja datos locales y dirige conceptualmente al contexto de encuestas (E0).
  * *Antes de `commit-start`*: Permitida. La sesión pasa a `cancelled`.
  * *Después de `commit-start`*: La opción de cancelar se oculta o deshabilita en P2.
* **Recargar navegador**: Destruye la sesión de memoria, reiniciando al estado inicial (volatilidad garantizada).
* **Salir con cambios**: Desencadena diálogo conceptual de confirmación advirtiendo pérdida de progreso.

---

## IA-First en el Mapa de Experiencia

Presencia de IA:
* **U3**: Explicación en lenguaje natural de la acción en curso.
* **U4**: Clasificación de estructura, confianza y evidencia.
* **C1**: Sugerencia de tipo de encuesta.
* **R1**: Matching de preguntas y normalización de escalas.
* **R2**: Equivalencias semánticas de demográficos.
* **R3A**: Sugerencia de identidad mitigando colisiones.
* **R3B**: Equivalencia de segmentos organizacionales.
* **P1**: Análisis de riesgos e impacto.

**Reglas IA**: La IA nunca actúa de forma autónoma destructiva, siempre requiere confirmación explícita, no oculta incertidumbre y sus sugerencias son distinguibles de las confirmaciones humanas. Sin "gradientes IA" indiscriminados.

---

## Estados Visuales Transversales

Patrones reutilizables, utilizando los tokens y componentes del Starter Kit:
* **Generales**: Loading, Skeleton, Empty, Success, Warning, Error, Disabled, Processing, Informational notice.
* **Específicos de Dominio**: AI suggestion, Confidence high/medium/low, Blocking issue, Review required.

---

## Componentes Reutilizables Identificados

Se utilizarán componentes existentes y aprobados de `shadcn/ui` y el Starter Kit, sin alterarlos:
* **Estructura**: `AppShell`, `Header`, `PageShell`, `TabsNav`, `Breadcrumbs`, `DrawerShell`.
* **Carga**: `FileUpload`, `UploadZone`, `FilePreview`, `AttachmentList`, `UploadProgress`.
* **Datos y Feedback**: `TableShell`, `Badge`, `Progress`, `Card`, `Dialog`, `AILoader`, `Chip`.

---

## Primera Pantalla de Implementación (Bloqueada)

La **primera pantalla que se construirá** (Fase de UI) será:
**U1 · Carga inicial** (que podrá incluir U2 como estado en la misma vista).

**Alcance de esta primera construcción:**
* Shell básico del wizard.
* Primera macroetapa activa.
* Zona de carga (UploadZone / FileUpload).
* Información explicativa (formatos, capacidades).
* Resumen lateral vacío.
* Footer con CTA primario disabled (si aplica).
* Hover/focus states básicos y tokens de diseño.

**Fuera del alcance (para iteraciones posteriores):**
* Lógica real de parsing.
* U3 (Analizando) y U4 (Estructura detectada).
* C1, R1-R3, P1-P3.
* Rutas reales, APIs, o Modelos IA.
