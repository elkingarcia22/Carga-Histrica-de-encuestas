export type MatchReviewSectionType =
  | "start"
  | "questions_and_scales"
  | "demographics"
  | "participants_or_responses"
  | "dimensions"
  | "question_dimension_mapping"
  | "segments"
  | "privacy"
  | "complete";

export function getMatchReviewSectionMessage(section: MatchReviewSectionType, _scope: string, details: boolean = false): string {
  switch (section) {
    case "start":
      return `Ahora revisaré el match detectado de la estructura.\n\nVoy a validar las secciones una por una:\n1. Preguntas y escalas\n2. Demográficos\n3. Participantes / respuestas\n4. Dimensiones\n5. Mapeo pregunta-dimensión\n6. Segmentos / cortes\n7. Privacidad\n\nEmpezaré por Preguntas y escalas.`;

    case "questions_and_scales":
      if (details) {
        return `1/7 · Preguntas y escalas (Detalles)\n\nSe detectaron 37 preguntas con formato de texto limpio.\nNo se encontraron caracteres extraños.\nLas escalas detectadas corresponden a percepción estándar de clima.\n\n¿Confirmas esta sección?`;
      }
      return `1/7 · Preguntas y escalas\n\nDetecté las preguntas desde las hojas Clima, Engagement y eNPS del archivo principal.\n\nResultado del match:\n- Preguntas detectadas: 37\n- Preguntas alineadas: 37\n- Preguntas nuevas: 0\n- Por revisar: 0\n- No interpretables: 0\n\nEscalas detectadas:\n- Percepción negativa\n- Percepción neutra\n- Percepción positiva\n- Total de respuestas\n\nRecomendación:\nLa estructura de preguntas y escalas está lista para este prototipo.\n\n¿Confirmas esta sección?\nResponde “confirmar” para continuar o “ver detalles” para revisar más contexto.`;

    case "demographics":
      if (details) {
        return `2/7 · Demográficos (Detalles)\n\nCampos detectados como demográficos no contienen información identificatoria directa (sin nombres, correos ni IDs).\nSe procesarán solo como etiquetas de corte.\n\n¿Confirmas esta sección?`;
      }
      return `2/7 · Demográficos\n\nDetecté campos demográficos y segmentadores asociados a la encuesta.\n\nResultado del match:\n- Demográficos detectados: 7\n- Alineados: 7\n- Nuevos: 0\n- Por revisar: 0\n- No interpretables: 0\n\nEjemplos seguros:\n- Gerencia\n- Área\n- Rol\n- Antigüedad\n- Sede\n- Nivel\n- Departamento\n\nRecomendación:\nUsar estos campos solo como segmentadores agregados. No se mostrarán datos individuales.\n\n¿Confirmas esta sección?`;

    case "participants_or_responses":
      if (details) {
        return `3/7 · Participantes / respuestas (Detalles)\n\nSe analizaron todas las filas de los archivos.\nNo se detectaron registros a nivel de persona individual. Solo se encontró información agregada por pregunta y por gerencia.\n\n¿Confirmas esta sección?`;
      }
      return `3/7 · Participantes / respuestas\n\nEl archivo 2025 es agregado. No contiene participantes individuales.\n\nResultado del match:\n- Respuestas agregadas detectadas: disponibles por pregunta\n- Participantes individuales: no disponibles en este archivo\n- IDs personales visibles: no\n- Riesgo de privacidad: bajo para el archivo agregado\n\nRecomendación:\nUsar “Total de respuestas” como base de participación agregada para este prototipo.\n\n¿Confirmas esta sección?`;

    case "dimensions":
      if (details) {
        return `4/7 · Dimensiones (Detalles)\n\nDimensiones detectadas: Ambiente de Trabajo, Liderazgo, Reconocimiento, Desarrollo, Bienestar, Cultura, Comunicación, Herramientas, Beneficios, y eNPS.\nTodas corresponden a métricas de clima estándar.\n\n¿Qué quieres hacer?\n1. Confirmar dimensiones\n2. Renombrar una dimensión por chat\n3. Ver lista de dimensiones`;
      }
      return `4/7 · Dimensiones\n\nDetecté dimensiones asociadas a las preguntas de clima.\n\nResultado del match:\n- Dimensiones detectadas: 10\n- Alineadas: 10\n- Nuevas: 0\n- Por revisar: 0\n- No interpretables: 0\n\nRecomendación:\nMantener los nombres detectados para esta carga, salvo que quieras renombrar alguna dimensión.\n\n¿Qué quieres hacer?\n1. Confirmar dimensiones\n2. Renombrar una dimensión por chat\n3. Ver lista de dimensiones`;

    case "question_dimension_mapping":
      if (details) {
        return `5/7 · Mapeo pregunta-dimensión (Detalles)\n\nTodas las 37 preguntas tienen una y solo una dimensión asignada en el archivo. No hay preguntas sueltas.\n\n¿Confirmas esta sección?`;
      }
      return `5/7 · Mapeo pregunta-dimensión\n\nRevisé la asociación entre preguntas y dimensiones.\n\nResultado del match:\n- Preguntas con dimensión asignada: 37\n- Preguntas sin dimensión clara: 0\n- Mapeos por revisar: 0\n- No interpretables: 0\n\nRecomendación:\nEl mapeo puede aprobarse para este prototipo.\n\n¿Confirmas esta sección?`;

    case "segments":
      if (details) {
        return `6/7 · Segmentos / cortes (Detalles)\n\nLos cortes por gerencia coinciden en estructura con el archivo principal.\nNo hay discrepancias en las preguntas evaluadas entre los archivos.\n\n¿Confirmas esta sección?`;
      }
      return `6/7 · Segmentos / cortes\n\nDetecté cortes por gerencia asociados al mismo levantamiento 2025.\n\nResultado del match:\n- Segmento total compañía: 1\n- Cortes por gerencia: 8\n- Archivos asociados usados: 8\n- Segmentos no interpretables: 0\n\nCortes detectados:\n1. Agropecuario\n2. Administración y finanzas\n3. Comercial\n4. General\n5. Industrial\n6. Marketing\n7. Personas y Organización\n8. Supply Chain\n\nRecomendación:\nUsar estos archivos como cortes agregados del mismo ciclo QS Clima 2025.\n\n¿Confirmas esta sección?`;

    case "privacy":
      if (details) {
        return `7/7 · Privacidad (Detalles)\n\nNo se han detectado datos de identificación personal (PII) en los archivos. No hay comentarios de texto abierto. Todo está agregado numéricamente.\n\n¿Confirmas esta sección?`;
      }
      return `7/7 · Privacidad\n\nRevisé riesgos de privacidad antes de preparar la estructura.\n\nResultado:\n- Respuestas individuales visibles: No\n- Comentarios abiertos visibles: No\n- Nombres o correos visibles: No\n- IDs personales visibles: No\n- Filas crudas visibles: No\n- Riesgo para el archivo agregado 2025: Bajo\n\nRegla aplicada:\nSolo se usarán resultados agregados y cortes con umbral de confidencialidad confirmado.\n\n¿Confirmas esta sección?`;

    case "complete":
      return `Match de estructura completado.\n\nResumen:\n- Preguntas y escalas: confirmado\n- Demográficos: confirmado\n- Participantes / respuestas: confirmado\n- Dimensiones: confirmado\n- Mapeo pregunta-dimensión: confirmado\n- Segmentos / cortes: confirmado\n- Privacidad: confirmado\n\nLa estructura está lista para revisar los resultados detectados.\n\n¿Qué quieres hacer?\n1. Aprobar estructura y revisar resultados\n2. Ajustar nombres de dimensiones o preguntas\n3. Ver archivos usados\n4. Cancelar importación`;

    default:
      return "";
  }
}
