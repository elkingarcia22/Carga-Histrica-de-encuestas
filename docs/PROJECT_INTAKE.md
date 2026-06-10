# PROJECT INTAKE

## Decisiones consolidadas
**Nombre del prototipo:** Importación asistida por IA de encuestas finalizadas.

**Objetivo:** Permitir que administradores de encuestas incorporen históricos provenientes de otras plataformas, homologando su estructura con UBITS mediante detección automatizada, sugerencias asistidas por IA y validación humana.

**Usuario principal:** Administrador de encuestas o consultor de implementación responsable de migrar y validar información histórica.
**Usuarios secundarios:** Customer Success, Analistas de talento, Equipos de implementación, Administradores de clientes, Líderes de RR. HH. que consumirán los resultados.

**Contexto de uso:** El usuario tiene uno o varios archivos exportados desde otra plataforma y necesita incorporarlos a UBITS sin reconstruir manualmente la encuesta, sus preguntas, escalas, demográficos, participantes y resultados.

**Experiencia prioritaria:** Agente visual guiado.
**Nivel de fidelidad:** Prototipo funcional de alta fidelidad, listo para demostración, con interacciones reales en frontend y procesamiento local progresivo cuando la arquitectura lo permita. No debe presentarse como integración productiva con UBITS hasta que exista autorización explícita para APIs reales.

**Primera pantalla que se construirá:** Carga de archivos de origen.

**Estilo visual:**
- UBITS B2B enterprise (desktop-first).
- Fondo general gris claro, superficies y cards blancas.
- Azul UBITS para acción primaria, bordes sutiles.
- Tokens oficiales; sin componentes copiados de otras herramientas.
- IA integrada como asistencia/explicación, no como decoración.

**Tratamiento de Datos:**
- No se usarán datos reales de clientes dentro del repositorio.
- No se versionarán archivos originales.
- Ejemplos visibles 100% sintéticos (no se copiarán nombres, correos ni IDs reales).
- Los archivos reales solo se usarán en pruebas locales controladas sin persistencia en Git.

## Familias de Entrada Conocidas
1. **A. Raw individual:**
   - *Puede contener:* Respuestas individuales, catálogo de preguntas, participantes, demográficos, jerarquías.
   - *Resultado potencial:* Encuesta finalizada completa, respuestas y demográficos granulares, analítica completa.
2. **B. Agregado comparativo:**
   - *Puede contener:* Resultados generales, áreas/dimensiones, distribuciones positiva/negativa.
   - *Resultado potencial:* Histórico agregado y comparativos. Sin creación de respuestas o participantes individuales ficticios.
3. **C. Desconocido o incompatible:**
   - *Archivos cuya estructura no puede clasificarse de forma segura.*
   - *Resultado potencial:* Solicitud de revisión, reporte de errores y bloqueo de importación.

## Alcance Inicial Propuesto
**Incluido en el prototipo:**
- Una sesión de importación activa a la vez.
- Selección múltiple de archivos (lote).
- Detección de pertenencia a la misma encuesta o conflictos en el lote.
- Soporte conceptual para "Raw individual" y "Agregado comparativo".
- Flujo inicial optimizado para Excel.
- Procesamiento local o simulado hasta aprobar backend y proveedor IA.
- Validación humana obligatoria antes de confirmar.

**Excluido del alcance inicial:**
- Solución posterior (Agente conversacional).
- Conexión a APIs productivas UBITS.
- Importaciones recurrentes.
- Aprendizaje automático de correcciones previas.
- Plantillas específicas por proveedor.
- Procesamiento paralelo de varios lotes.

## Hipótesis: Flujo funcional preliminar (Para validar en Fase 2)
1. Cargar archivos.
2. Analizar el lote.
3. Clasificar la fuente.
4. Mostrar estructura detectada.
5. Configurar encuesta y privacidad.
6. Revisar preguntas y escalas.
7. Revisar demográficos.
8. Revisar participantes o segmentos (según el modo).
9. Mostrar preview de impacto.
10. Confirmar importación.
11. Mostrar resultado, advertencias y reporte de errores.

## Rol de la IA: Valor real
**La IA puede aportar en:**
- Clasificación del tipo de archivo y hojas.
- Detección de columnas y matching de preguntas/demográficos.
- Clasificación de tipo de pregunta y normalización de escalas.
- Detección de valores equivalentes, inconsistencias y explicación de conflictos.

**La IA nunca debe:**
- Confirmar importación automáticamente.
- Inventar respuestas faltantes o participantes sintéticos sin advertencia.
- Ocultar transformaciones o persistir matches ambiguos sin revisión humana.
- Enviar información a un proveedor externo sin autorización.

## Requisitos funcionales preliminares
Drag and drop, selector múltiple, validación de formato/tamaño, estados de carga y procesamiento, cancelación controlada, clasificación (raw, agregado, desconocido), score de confianza, explicación de sugerencias, corrección manual, preview cuantitativo, errores bloqueantes y no bloqueantes, anonimato, trazabilidad.

**Estados a contemplar:** Inicial, Archivos seleccionados, Validando archivos, Procesando, Detección exitosa, Detección parcial, Archivo incompatible, Configuración incompleta, Revisión pendiente, Conflicto, Listo para importar, Importando, Importación exitosa, Importación parcial, Importación fallida, Cancelado.

## Criterios de éxito del prototipo
### Usabilidad
- El usuario entiende qué archivos puede cargar y el modo detectado.
- Distingue sugerencias de decisiones confirmadas y puede corregir matches sin salir del flujo.
- Entiende exactamente qué datos se crearán, asociarán o bloquearán.

### Confianza
- Cada sugerencia IA expone su justificación/confianza.
- Transformaciones de escala son visibles; conflictos críticos bloquean la confirmación.
- Datos nominales nunca se presentan como anónimos por accidente.

### Técnica
- 0 errores adicionales de lint.
- Cero usos de `any`, `any[]`, `as any`.
- Cero HEX hardcodeados, cero `text-white` literal y cero strings de datos quemados visualmente.
- Componentes base de shadcn/ui se mantienen intactos.
- Ninguna dependencia nueva se instala sin decision gate.

### Negocio
- **Retención:** Facilita migrar y preservar el histórico de clientes antiguos de otras plataformas.
- **Expansión:** Permite sumar encuestas previas para lograr una analítica histórica inmediata.
- **ARR:** Herramienta diferenciadora clave para desplazar a competidores mediante migraciones fluidas.

## Decisiones Pendientes (A resolver en Fase 2: Architecture Lock)
1. Librería para Excel.
2. Soporte técnico de CSV.
3. Parsing en navegador, backend o esquema híbrido.
4. Límite de cantidad de archivos.
5. Límite de tamaño por archivo y lote.
6. Manejo de archivos protegidos o corruptos.
7. Necesidad de estado global.
8. Persistencia temporal de la sesión.
9. Política de cancelación.
10. Contrato con APIs UBITS.
11. Proveedor y modelo IA.
12. Tratamiento permitido de información personal.
13. Política de logs y telemetría.
14. Estrategia para archivos agregados pertenecientes a múltiples áreas.
15. Comportamiento cuando un lote contiene más de una encuesta.
16. Reglas exactas para score de confianza.
17. Reglas de anonimato y umbral mínimo.
18. Qué módulos analíticos se habilitan por tipo de importación.
