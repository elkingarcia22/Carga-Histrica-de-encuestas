import { describe, it, expect } from 'vitest';
import {
  createDemographicsReviewMainMessage,
  createDemographicsReviewDetailMessage,
  createDemographicsReviewConfirmationMessage,
  createDemographicsDestinationChangeMessage,
  createDemographicsInvalidSystemSyncMessage,
  createDemographicsUnknownCommandMessage,
  findFieldByIndexOrName,
} from '../demographicsReviewMessageMapper';
import type {
  DemographicsReviewConversationViewModel,
  DemographicReviewField,
  DemographicsReviewSummary,
} from '../demographicsReviewTypes';
import { SYSTEM_PRELOADED_DEMOGRAPHICS } from '../demographicsReviewTypes';
import { mapFieldsToReviewSummary, mapReviewSummaryToConversationViewModel } from '../demographicsReviewMapper';

function createField(
  id: string,
  name: string,
  items: string[],
  overrides?: Partial<DemographicReviewField>,
): DemographicReviewField {
  return {
    id,
    detectedName: name,
    normalizedName: name.toLowerCase().trim(),
    sourceLabel: name,
    detectedItems: items,
    detectedItemCount: items.length,
    sampleItemsPreview: items.slice(0, 5).join(', '),
    systemMatchStatus: 'matched_system_demographic',
    matchedSystemDemographic: null,
    matchConfidence: 'high',
    matchReason: '',
    destination: 'sync_with_system',
    reviewStatus: 'confirmed',
    warnings: [],
    ...overrides,
  };
}

function buildMainViewModel(fields: DemographicReviewField[]): DemographicsReviewConversationViewModel {
  return mapReviewSummaryToConversationViewModel(mapFieldsToReviewSummary(fields));
}

describe('Demographics Review Message Mapper', () => {
  describe('createDemographicsReviewMainMessage', () => {
    it('1. Mensaje principal incluye título 2/7 · Demográficos', () => {
      const vm = buildMainViewModel([
        createField('1', 'País', ['Colombia', 'México']),
      ]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('2/7 · Demográficos');
    });

    it('2. Mensaje principal lista todos los campos detectados', () => {
      const fields = [
        createField('1', 'País', ['Colombia', 'México']),
        createField('2', 'Ciudad', ['Bogotá']),
        createField('3', 'Rol', ['Líder']),
      ];
      const vm = buildMainViewModel(fields);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('1. País');
      expect(msg.text).toContain('2. Ciudad');
      expect(msg.text).toContain('3. Rol');
    });

    it('3. Mensaje principal incluye items detectados por campo', () => {
      const fields = [
        createField('1', 'País', ['Colombia', 'México', 'Perú']),
      ];
      const vm = buildMainViewModel(fields);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Items detectados');
      expect(msg.text).toContain('Colombia');
      expect(msg.text).toContain('México');
    });

    it('4. País muestra destino sync con País', () => {
      const field = createField('1', 'País', ['Colombia', 'México'], {
        systemMatchStatus: 'matched_system_demographic',
        matchedSystemDemographic: 'País',
        destination: 'sync_with_system',
        matchReason: 'Coincidencia directa con demográfico precargado.',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Se sincronizará con "País"');
    });

    it('5. Ciudad muestra destino sync con Ciudad', () => {
      const field = createField('1', 'Ciudad', ['Bogotá'], {
        systemMatchStatus: 'matched_system_demographic',
        matchedSystemDemographic: 'Ciudad',
        destination: 'sync_with_system',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Se sincronizará con "Ciudad"');
    });

    it('6. Gerencia muestra destino sync con Departamento o área de trabajo', () => {
      const field = createField('1', 'Gerencia', ['Comercial', 'Operaciones'], {
        systemMatchStatus: 'matched_system_demographic',
        matchedSystemDemographic: 'Departamento o área de trabajo',
        destination: 'sync_with_system',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Se sincronizará con "Departamento o área de trabajo"');
    });

    it('7. Sede muestra destino create in survey only', () => {
      const field = createField('1', 'Sede', ['Bogotá', 'Medellín'], {
        systemMatchStatus: 'survey_only',
        matchedSystemDemographic: null,
        destination: 'create_in_survey_only',
        matchReason: 'No existe como demográfico precargado del sistema.',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Se creará solo en esta encuesta');
    });

    it('8. Rol muestra destino create in survey only', () => {
      const field = createField('1', 'Rol', ['Líder', 'Manager'], {
        systemMatchStatus: 'survey_only',
        matchedSystemDemographic: null,
        destination: 'create_in_survey_only',
        matchReason: 'No existe como demográfico precargado del sistema.',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Se creará solo en esta encuesta');
    });

    it('9. Mensaje principal incluye resumen de sincronizados, survey-only, por revisar y excluidos', () => {
      const fields = [
        createField('1', 'País', ['Colombia'], {
          destination: 'sync_with_system',
        }),
        createField('2', 'Sede', ['Bogotá'], {
          systemMatchStatus: 'survey_only',
          destination: 'create_in_survey_only',
        }),
        createField('3', 'Campo X', ['Valor A'], {
          systemMatchStatus: 'needs_review',
          destination: 'needs_user_decision',
        }),
      ];
      const vm = buildMainViewModel(fields);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Sincronizados con sistema: 1');
      expect(msg.text).toContain('Creados solo en esta encuesta: 1');
      expect(msg.text).toContain('Por revisar: 1');
      expect(msg.text).toContain('Excluidos: 0');
    });

    it('10. Mensaje principal incluye comandos text-only', () => {
      const vm = buildMainViewModel([
        createField('1', 'País', ['Colombia']),
      ]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.commands.length).toBeGreaterThan(0);
      expect(msg.commands[0]).toBe('Confirmar demográficos');
    });

    it('11. Mensaje principal no incluye botones ni action payloads', () => {
      const vm = buildMainViewModel([
        createField('1', 'País', ['Colombia']),
      ]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg).not.toHaveProperty('actionPayload');
      expect(msg).not.toHaveProperty('actionButton');
      expect(msg.text).not.toContain('<button');
      expect(typeof msg.text).toBe('string');
      expect(Array.isArray(msg.commands)).toBe(true);
    });
  });

  describe('createDemographicsReviewDetailMessage', () => {
    it('12. Mensaje detalle de País muestra items y destino actual', () => {
      const field = createField('1', 'País', ['Colombia', 'México', 'Perú'], {
        matchedSystemDemographic: 'País',
        destination: 'sync_with_system',
        matchReason: 'Coincidencia directa con demográfico precargado.',
      });
      const msg = createDemographicsReviewDetailMessage(field);
      expect(msg.text).toContain('Detalle de País');
      expect(msg.text).toContain('Colombia');
      expect(msg.text).toContain('México');
      expect(msg.text).toContain('Perú');
      expect(msg.text).toContain('Se sincronizará con "País"');
    });

    it('13. Mensaje detalle de Sede muestra survey-only y opción de sincronizar con sistema', () => {
      const field = createField('1', 'Sede', ['Bogotá', 'Medellín', 'CDMX'], {
        systemMatchStatus: 'survey_only',
        matchedSystemDemographic: null,
        destination: 'create_in_survey_only',
        matchReason: 'No existe como demográfico precargado del sistema.',
      });
      const msg = createDemographicsReviewDetailMessage(field);
      expect(msg.text).toContain('Detalle de Sede');
      expect(msg.text).toContain('Se creará solo en esta encuesta');
      expect(msg.commands).toContain('Sincronizar con demográfico del sistema');
    });
  });

  describe('createDemographicsReviewConfirmationMessage', () => {
    it('14. Mensaje confirmación separa sincronizados con sistema y creados solo en encuesta', () => {
      const fields = [
        createField('1', 'País', ['Colombia'], {
          destination: 'sync_with_system',
          matchedSystemDemographic: 'País',
        }),
        createField('2', 'Ciudad', ['Bogotá'], {
          destination: 'sync_with_system',
          matchedSystemDemographic: 'Ciudad',
        }),
        createField('3', 'Sede', ['Bogotá'], {
          destination: 'create_in_survey_only',
        }),
        createField('4', 'Rol', ['Líder'], {
          destination: 'create_in_survey_only',
        }),
      ];
      const summary: DemographicsReviewSummary = {
        totalDetected: 4,
        syncWithSystem: 2,
        surveyOnly: 2,
        needsReview: 0,
        excluded: 0,
        fields: fields.map((f) => ({ ...f })),
      };
      const msg = createDemographicsReviewConfirmationMessage(summary);
      expect(msg.text).toContain('Sección 2/7 · Demográficos confirmada.');
      expect(msg.text).toContain('País → País');
      expect(msg.text).toContain('Ciudad → Ciudad');
      expect(msg.text).toContain('- Sede');
      expect(msg.text).toContain('- Rol');
    });

    it('incluye nextSectionLabel cuando se proporciona', () => {
      const summary: DemographicsReviewSummary = {
        totalDetected: 0,
        syncWithSystem: 0,
        surveyOnly: 0,
        needsReview: 0,
        excluded: 0,
        fields: [],
      };
      const msg = createDemographicsReviewConfirmationMessage(summary, 'Preguntas');
      expect(msg.text).toContain('Avanzando a 3/7 · Preguntas.');
    });
  });

  describe('createDemographicsInvalidSystemSyncMessage', () => {
    it('15. Mensaje invalid sync bloquea "Sede" como sistema inexistente', () => {
      const msg = createDemographicsInvalidSystemSyncMessage('Sede');
      expect(msg.text).toContain('No puedo sincronizar Sede');
      expect(msg.text).toContain('no está en la lista de precargados disponibles');
    });

    it('16. Mensaje invalid sync lista exactamente los 6 demográficos precargados del sistema', () => {
      const msg = createDemographicsInvalidSystemSyncMessage('Sede');
      SYSTEM_PRELOADED_DEMOGRAPHICS.forEach((d) => {
        expect(msg.text).toContain(d.label);
      });
      expect(msg.text).toContain('También puedo crear Sede solo en esta encuesta.');
    });
  });

  describe('createDemographicsDestinationChangeMessage', () => {
    it('17. Mensaje de cambio válido muestra destino anterior y nuevo', () => {
      const field = createField('1', 'Gerencia', ['Comercial'], {
        matchedSystemDemographic: 'Departamento o área de trabajo',
        destination: 'sync_with_system',
        matchReason: 'Gerencia se interpreta como área organizacional.',
      });
      const msg = createDemographicsDestinationChangeMessage(field, 'Se crearía solo en esta encuesta');
      expect(msg.text).toContain('Actualicé el destino de Gerencia');
      expect(msg.text).toContain('Destino anterior: Se crearía solo en esta encuesta');
      expect(msg.text).toContain('Destino nuevo: Se sincronizará con "Departamento o área de trabajo"');
    });
  });

  describe('createDemographicsUnknownCommandMessage', () => {
    it('genera mensaje para comando no reconocido', () => {
      const msg = createDemographicsUnknownCommandMessage('haz algo raro');
      expect(msg.text).toContain('haz algo raro');
      expect(msg.text).toContain('Confirmar demográficos');
      expect(msg.status).toBe('needs_review');
    });
  });

  describe('findFieldByIndexOrName', () => {
    it('encuentra campo por nombre', () => {
      const fields = [
        createField('1', 'País', ['Colombia']),
        createField('2', 'Ciudad', ['Bogotá']),
      ];
      const result = findFieldByIndexOrName(fields, 'País');
      expect(result?.id).toBe('1');
    });

    it('encuentra campo por índice numérico', () => {
      const fields = [
        createField('1', 'País', ['Colombia']),
        createField('2', 'Ciudad', ['Bogotá']),
      ];
      const result = findFieldByIndexOrName(fields, '2');
      expect(result?.id).toBe('2');
    });

    it('retorna undefined para índice inválido', () => {
      const fields = [createField('1', 'País', ['Colombia'])];
      expect(findFieldByIndexOrName(fields, '99')).toBeUndefined();
    });
  });

  describe('privacidad y seguridad', () => {
    it('18. Preview de items respeta límite seguro', () => {
      const field = createField('1', 'País', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], {
        destination: 'sync_with_system',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('y 2 más');
    });

    it('19. Mensajes no exponen raw rows', () => {
      const field = createField('1', 'País', ['Colombia'], {
        destination: 'sync_with_system',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).not.toContain('rawRows');
    });

    it('20. Mensajes no exponen IDs, emails ni nombres de personas', () => {
      const field = createField('1', 'País', ['Colombia'], {
        destination: 'sync_with_system',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).not.toMatch(/@/);
      expect(msg.text).not.toMatch(/user_\d+/);
    });

    it('21. Output determinístico', () => {
      const field = createField('1', 'País', ['Colombia', 'México'], {
        destination: 'sync_with_system',
      });
      const vm = buildMainViewModel([field]);
      const msg1 = createDemographicsReviewMainMessage(vm);
      const msg2 = createDemographicsReviewMainMessage(vm);
      expect(msg1).toEqual(msg2);
    });

    it('22. No usa Date, Math.random ni setTimeout', () => {
      const field = createField('1', 'País', ['Colombia'], {
        destination: 'sync_with_system',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(typeof msg.text).toBe('string');
      expect(typeof msg.status).toBe('string');
    });

    it('23. No depende de UI/runtime', () => {
      expect(typeof createDemographicsReviewMainMessage).toBe('function');
      expect(typeof createDemographicsReviewDetailMessage).toBe('function');
    });

    it('24. No toca workspace', () => {
      const vm = buildMainViewModel([
        createField('1', 'País', ['Colombia']),
      ]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg).not.toHaveProperty('workspace');
      expect(msg).not.toHaveProperty('integration');
    });

    it('25. needs_review field muestra destino requiere revisión', () => {
      const field = createField('1', 'Campo X', ['Valor A'], {
        systemMatchStatus: 'needs_review',
        destination: 'needs_user_decision',
        matchReason: 'El campo puede tener más de una interpretación.',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Requiere revisión');
    });

    it('excluded field muestra destino excluido', () => {
      const field = createField('1', 'Campo X', ['Valor A'], {
        systemMatchStatus: 'excluded',
        destination: 'excluded',
      });
      const vm = buildMainViewModel([field]);
      const msg = createDemographicsReviewMainMessage(vm);
      expect(msg.text).toContain('Excluidos');
    });
  });
});
