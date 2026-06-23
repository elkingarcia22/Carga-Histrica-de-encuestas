import type {
  SafeColumnProfileInput,
  ColumnClassificationResult,
} from './types';

export function classifyXlsxColumns(
  profiles: SafeColumnProfileInput[]
): ColumnClassificationResult[] {
  return profiles.map(classifySingleColumn);
}

function classifySingleColumn(profile: SafeColumnProfileInput): ColumnClassificationResult {
  const { columnLabel, detectedTextSignals, sheetRole } = profile;

  if (!columnLabel || columnLabel.trim() === '') {
    return {
      role: 'unknown',
      confidence: 'blocked',
      classificationReason: 'El nombre de la columna está vacío o es inválido.',
      detectedSignals: []
    };
  }

  const labelLower = columnLabel.toLowerCase();
  const textSignalsStr = detectedTextSignals.join(' ').toLowerCase();
  const contextText = `${labelLower} ${textSignalsStr}`;
  const detectedSignals: string[] = [];

  // 1. Participant Identifiers (PII)
  const piiKeywords = [
    'email', 'correo', 'documento', 'identificación', 'identificacion',
    'rut', 'dni', 'id empleado', 'employee id', 'nombre', 'teléfono',
    'telefono', 'celular'
  ];
  const piiMatches = piiKeywords.filter(k => contextText.includes(k));
  if (piiMatches.length > 0) {
    detectedSignals.push(...piiMatches);
    return {
      role: 'participant_identifier_candidate',
      confidence: piiMatches.length > 1 ? 'high' : 'medium',
      classificationReason: 'Se detectaron posibles identificadores de participantes o datos de contacto.',
      detectedSignals
    };
  }

  // 2. Metadata
  const metadataKeywords = [
    'fecha', 'año', 'anio', 'periodo', 'ciclo', 'encuesta', 'archivo', 'fuente', 'sheet', 'hoja'
  ];
  const metadataMatches = metadataKeywords.filter(k => contextText.includes(k));
  if (metadataMatches.length > 0) {
    detectedSignals.push(...metadataMatches);
    return {
      role: 'metadata',
      confidence: metadataMatches.length > 1 ? 'high' : 'medium',
      classificationReason: 'Contiene términos asociados a metadatos de carga o archivo.',
      detectedSignals
    };
  }

  // 3. Questions
  const questionKeywords = [
    'clima', 'liderazgo', 'bienestar', 'compromiso', 'satisfacción', 'satisfaccion',
    'comunicación', 'comunicacion', 'reconocimiento', 'aprendizaje', 'desempeño',
    'percepción', 'percepcion', 'engagement', 'enps', 'e-nps'
  ];
  const questionMatches = questionKeywords.filter(k => contextText.includes(k));

  const isLongText = columnLabel.split(' ').length >= 5;
  const hasQuestionMarks = columnLabel.includes('¿') || columnLabel.includes('?');
  const hasQuestionPrefix = /^(p\d+|q\d+)/i.test(columnLabel);
  const isQuestionSheet = sheetRole === 'raw_responses' || sheetRole === 'question_catalog';
  const hasLikertSignals = contextText.includes('likert') || contextText.includes('escala') || contextText.includes('acuerdo');

  let questionSignalCount = 0;
  if (isLongText) { questionSignalCount++; detectedSignals.push('frase_larga'); }
  if (hasQuestionMarks) { questionSignalCount++; detectedSignals.push('signos_pregunta'); }
  if (hasQuestionPrefix) { questionSignalCount++; detectedSignals.push('prefijo_pregunta'); }
  if (isQuestionSheet) { questionSignalCount++; detectedSignals.push('hoja_respuestas'); }
  if (hasLikertSignals) { questionSignalCount++; detectedSignals.push('escala_likert'); }
  if (questionMatches.length > 0) {
    questionSignalCount += questionMatches.length;
    detectedSignals.push(...questionMatches);
  }

  if (questionSignalCount > 0) {
    return {
      role: 'question_candidate',
      confidence: questionSignalCount >= 2 ? 'high' : 'medium',
      classificationReason: 'Señales lingüísticas o contextuales indican que es una pregunta de encuesta.',
      detectedSignals
    };
  }

  // 4. Metrics / Aggregates (Evaluate after questions to prevent false positives)
  // Ensure we don't accidentally match long phrases that happen to have 'tipo' or 'score' if they didn't trigger question but still shouldn't be metrics.
  const isShortMetricLabel = columnLabel.split(' ').length <= 3;
  const metricKeywords = [
    'favorabilidad', 'participación', 'participacion', 'promedio', 'media',
    'score', 'puntaje', 'porcentaje', '%', 'n', 'total', 'respuestas',
    'respondidas', 'brecha', 'delta'
  ];

  // Only classify as metric if it doesn't look like a long phrase
  if (isShortMetricLabel) {
    const metricMatches = metricKeywords.filter(k => contextText.includes(k));
    if (metricMatches.length > 0) {
      detectedSignals.push(...metricMatches);
      return {
        role: 'metric_or_aggregate',
        confidence: metricMatches.length > 1 ? 'high' : 'medium',
        classificationReason: 'Presenta palabras clave cortas asociadas a métricas o resultados agregados.',
        detectedSignals
      };
    }
  }

  // 5. Demographics and Segments
  const demographicKeywords = [
    'área', 'area', 'gerencia', 'dirección', 'direccion', 'unidad', 'sede',
    'país', 'pais', 'ciudad', 'cargo', 'rol', 'nivel', 'género', 'genero',
    'edad', 'rango edad', 'antigüedad', 'antiguedad', 'departamento', 'equipo'
  ];
  const demographicMatches = demographicKeywords.filter(k => contextText.includes(k));

  const segmentKeywords = [
    'segmento', 'grupo', 'gerencia', 'área', 'area', 'unidad', 'equipo', 'sede'
  ];
  const segmentMatches = segmentKeywords.filter(k => contextText.includes(k));
  const isSegmentSheet = sheetRole === 'segment_summary';

  if (isSegmentSheet && segmentMatches.length > 0) {
    detectedSignals.push(...segmentMatches);
    return {
      role: 'segment_label',
      confidence: segmentMatches.length > 1 ? 'high' : 'medium',
      classificationReason: 'Etiqueta de segmento detectada en una hoja de resumen de segmentos.',
      detectedSignals
    };
  }

  if (demographicMatches.length > 0) {
    detectedSignals.push(...demographicMatches);
    return {
      role: 'demographic_candidate',
      confidence: demographicMatches.length > 1 ? 'high' : 'medium',
      classificationReason: 'El título de la columna coincide con atributos sociodemográficos comunes.',
      detectedSignals
    };
  }

  // 6. Fallback
  return {
    role: 'unknown',
    confidence: 'low',
    classificationReason: 'No se identificaron señales suficientes para clasificar esta columna.',
    detectedSignals: []
  };
}
