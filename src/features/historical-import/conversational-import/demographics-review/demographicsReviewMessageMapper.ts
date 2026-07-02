import type {
  DemographicReviewField,
  DemographicsReviewSummary,
  DemographicsReviewConversationViewModel,
  DemographicsConversationMessage,
} from './demographicsReviewTypes';
import {
  SYSTEM_PRELOADED_DEMOGRAPHICS,
  SAFE_ITEMS_PREVIEW_LIMIT,
} from './demographicsReviewTypes';
import {
  getDestinationText,
  normalizeName,
} from './demographicsReviewMapper';

function deriveSampleItemsPreview(items: string[]): string {
  if (items.length === 0) return 'Ninguno';
  if (items.length <= SAFE_ITEMS_PREVIEW_LIMIT) return items.join(', ');
  const preview = items.slice(0, SAFE_ITEMS_PREVIEW_LIMIT).join(', ');
  const remaining = items.length - SAFE_ITEMS_PREVIEW_LIMIT;
  return `${preview} y ${remaining} más`;
}

function formatFieldBlock(field: DemographicReviewField, index: number): string {
  const items = field.detectedItemCount > 0
    ? `Items detectados: ${deriveSampleItemsPreview(field.detectedItems)}`
    : 'Items detectados: Ninguno';
  const destination = getDestinationText(field);
  const reason = field.matchReason;
  return `${index}. ${field.detectedName}\n${items}\nDestino: ${destination}\nMotivo: ${reason}`;
}

export function createDemographicsReviewMainMessage(
  viewModel: DemographicsReviewConversationViewModel,
): DemographicsConversationMessage {
  const { title, intro, fields, syncWithSystem, surveyOnly, needsReview } = viewModel;

  const fieldBlocks = fields.map((f, i) => formatFieldBlock(f, i + 1));

  const summaryLines: string[] = [
    'Resumen:',
    `- Sincronizados con sistema: ${syncWithSystem.length}`,
    `- Creados solo en esta encuesta: ${surveyOnly.length}`,
    `- Por revisar: ${needsReview.length}`,
    `- Excluidos: ${fields.filter((f) => f.destination === 'excluded').length}`,
  ];

  const commands: string[] = [
    'Confirmar demográficos',
    'Revisar {nombre del demográfico}',
    'Cambiar destino de sincronización',
    'Excluir un demográfico',
    'Continuar sin cambios',
  ];

  const text = [
    title,
    '',
    intro,
    '',
    ...fieldBlocks,
    '',
    ...summaryLines,
    '',
    'Puedes responder:',
    ...commands.map((c, i) => `${i + 1}. ${c}`),
  ].join('\n');

  return { text, commands, status: 'info' };
}

export function createDemographicsReviewDetailMessage(
  field: DemographicReviewField,
): DemographicsConversationMessage {
  const itemsList = field.detectedItems.map((item) => `- ${item}`).join('\n');
  const destination = getDestinationText(field);
  const reason = field.matchReason;

  const hasSystemOptions = field.destination === 'create_in_survey_only' || field.destination === 'needs_user_decision';
  const hasSurveyOnlyOption = field.destination === 'sync_with_system' || field.destination === 'needs_user_decision';
  const hasExcludeOption = true;

  const commands: string[] = [];
  commands.push('Confirmar este demográfico');
  if (hasSurveyOnlyOption) {
    commands.push('Crear solo en encuesta');
  }
  if (hasSystemOptions) {
    commands.push('Sincronizar con demográfico del sistema');
  }
  if (hasExcludeOption) {
    commands.push('Excluir');
  }
  commands.push('Volver a la lista');

  const text = [
    `Detalle de ${field.detectedName}`,
    '',
    'Items detectados:',
    itemsList,
    '',
    'Destino actual:',
    destination,
    '',
    'Motivo:',
    reason,
    '',
    'Puedes responder:',
    ...commands.map((c, i) => `${i + 1}. ${c}`),
  ].join('\n');

  return { text, commands, status: 'info' };
}

export function createDemographicsReviewConfirmationMessage(
  summary: DemographicsReviewSummary,
  nextSectionLabel?: string,
): DemographicsConversationMessage {
  const syncWithSystem = summary.fields.filter(
    (f) => f.destination === 'sync_with_system',
  );
  const surveyOnly = summary.fields.filter(
    (f) => f.destination === 'create_in_survey_only',
  );
  const needsReview = summary.fields.filter(
    (f) => f.destination === 'needs_user_decision',
  );
  const excluded = summary.fields.filter(
    (f) => f.destination === 'excluded',
  );

  const lines: string[] = [];
  lines.push('Sección 2/7 · Demográficos confirmada.');
  lines.push('');

  if (syncWithSystem.length > 0) {
    lines.push('Sincronizados con sistema:');
    syncWithSystem.forEach((f) => {
      lines.push(`- ${f.detectedName} → ${f.matchedSystemDemographic}`);
    });
    lines.push('');
  }

  if (surveyOnly.length > 0) {
    lines.push('Creados solo en esta encuesta:');
    surveyOnly.forEach((f) => {
      lines.push(`- ${f.detectedName}`);
    });
    lines.push('');
  }

  if (needsReview.length > 0) {
    lines.push('Por revisar:');
    needsReview.forEach((f) => {
      lines.push(`- ${f.detectedName}`);
    });
    lines.push('');
  }

  if (excluded.length > 0) {
    lines.push('Excluidos:');
    excluded.forEach((f) => {
      lines.push(`- ${f.detectedName}`);
    });
    lines.push('');
  }

  if (nextSectionLabel) {
    lines.push(`Avanzando a 3/7 · ${nextSectionLabel}.`);
  } else {
    lines.push('Avanzando a la siguiente sección.');
  }

  const commands: string[] = [
    'Confirmar demográficos',
    'Revisar un demográfico',
    'Cambiar destino de sincronización',
    'Continuar',
  ];

  return {
    text: lines.join('\n'),
    commands,
    status: 'ready',
  };
}

export function createDemographicsDestinationChangeMessage(
  field: DemographicReviewField,
  previousDestination: string,
): DemographicsConversationMessage {
  const currentDestination = getDestinationText(field);
  const reason = field.matchReason;

  const text = [
    `Listo. Actualicé el destino de ${field.detectedName}.`,
    '',
    field.detectedName,
    `Destino anterior: ${previousDestination}`,
    `Destino nuevo: ${currentDestination}`,
    '',
    'Motivo:',
    reason,
  ].join('\n');

  const commands: string[] = [
    'Confirmar demográficos',
    'Revisar otro demográfico',
    'Continuar',
  ];

  return { text, commands, status: 'info' };
}

export function createDemographicsInvalidSystemSyncMessage(
  fieldName: string,
): DemographicsConversationMessage {
  const systemList = SYSTEM_PRELOADED_DEMOGRAPHICS.map(
    (d, i) => `${i + 1}. ${d.label}`,
  ).join('\n');

  const text = [
    `No puedo sincronizar ${fieldName} con un demográfico del sistema llamado "${fieldName}" porque no está en la lista de precargados disponibles.`,
    '',
    'Opciones del sistema:',
    systemList,
    '',
    `También puedo crear ${fieldName} solo en esta encuesta.`,
  ].join('\n');

  const commands: string[] = [
    `Sincronizar con demográfico del sistema`,
    `Crear ${fieldName} solo en la encuesta`,
    'Volver a la lista',
  ];

  return { text, commands, status: 'error' };
}

export function createDemographicsUnknownCommandMessage(
  userInput: string,
): DemographicsConversationMessage {
  const text = [
    `No entendí "${userInput}".`,
    '',
    'Puedes responder con uno de estos comandos:',
    '1. Confirmar demográficos',
    '2. Revisar {nombre del demográfico}',
    '3. Cambiar destino de sincronización',
    '4. Excluir un demográfico',
    '5. Continuar sin cambios',
  ].join('\n');

  const commands: string[] = [
    'Confirmar demográficos',
    'Revisar {nombre del demográfico}',
    'Cambiar destino de sincronización',
    'Excluir un demográfico',
    'Continuar sin cambios',
  ];

  return { text, commands, status: 'needs_review' };
}

export function findFieldByIndexOrName(
  fields: DemographicReviewField[],
  input: string,
): DemographicReviewField | undefined {
  const numMatch = input.match(/^\d+$/);
  if (numMatch) {
    const index = parseInt(numMatch[0], 10) - 1;
    return fields[index];
  }
  return fields.find(
    (f) => normalizeName(f.detectedName) === normalizeName(input),
  );
}
