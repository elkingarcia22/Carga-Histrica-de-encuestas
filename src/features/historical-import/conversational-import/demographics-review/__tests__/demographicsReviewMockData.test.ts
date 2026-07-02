import { describe, it, expect } from 'vitest';
import {
  SYSTEM_PRELOADED_DEMOGRAPHICS,
} from '../demographicsReviewTypes';
import {
  MOCK_DETECTED_DEMOGRAPHIC_FIELDS,
  createDemographicReviewField,
  createDemographicsReviewMockData,
} from '../demographicsReviewMockData';
import { matchDemographicToSystem, normalizeName } from '../demographicsReviewMapper';
import type { DemographicReviewField } from '../demographicsReviewTypes';

describe('Demographics Review Mock Data Contract', () => {
  it('1. Define exactamente 6 demográficos precargados del sistema', () => {
    expect(SYSTEM_PRELOADED_DEMOGRAPHICS).toHaveLength(6);
  });

  it('2. País hace match directo con País', () => {
    const result = matchDemographicToSystem('País', ['Colombia', 'México', 'Perú']);
    expect(result.systemMatchStatus).toBe('matched_system_demographic');
    expect(result.matchedSystemDemographic).toBe('País');
    expect(result.matchConfidence).toBe('high');
  });

  it('3. Ciudad hace match directo con Ciudad', () => {
    const result = matchDemographicToSystem('Ciudad', ['Bogotá']);
    expect(result.systemMatchStatus).toBe('matched_system_demographic');
    expect(result.matchedSystemDemographic).toBe('Ciudad');
    expect(result.matchConfidence).toBe('high');
  });

  it('4. Departamento hace alias a Departamento o área de trabajo', () => {
    const result = matchDemographicToSystem('Departamento', ['Comercial', 'Operaciones']);
    expect(result.systemMatchStatus).toBe('matched_system_demographic');
    expect(result.matchedSystemDemographic).toBe('Departamento o área de trabajo');
  });

  it('5. Área hace alias a Departamento o área de trabajo', () => {
    const result = matchDemographicToSystem('Área', ['Comercial', 'Operaciones']);
    expect(result.systemMatchStatus).toBe('matched_system_demographic');
    expect(result.matchedSystemDemographic).toBe('Departamento o área de trabajo');
  });

  it('6. Gerencia hace alias a Departamento o área de trabajo', () => {
    const result = matchDemographicToSystem('Gerencia', ['Comercial', 'Operaciones', 'Tecnología']);
    expect(result.systemMatchStatus).toBe('matched_system_demographic');
    expect(result.matchedSystemDemographic).toBe('Departamento o área de trabajo');
    expect(result.matchConfidence).toBe('medium');
  });

  it('7. Nivel hace alias a Nivel jerárquico en la empresa', () => {
    const result = matchDemographicToSystem('Nivel', ['Directivo', 'Manager']);
    expect(result.systemMatchStatus).toBe('matched_system_demographic');
    expect(result.matchedSystemDemographic).toBe('Nivel jerárquico en la empresa');
    expect(result.matchConfidence).toBe('high');
  });

  it('8. Sede se crea solo en encuesta', () => {
    const result = matchDemographicToSystem('Sede', ['Bogotá', 'Medellín']);
    expect(result.systemMatchStatus).toBe('survey_only');
    expect(result.matchedSystemDemographic).toBeNull();
    expect(result.destination).toBe('create_in_survey_only');
  });

  it('9. Rol se crea solo en encuesta', () => {
    const result = matchDemographicToSystem('Rol', ['Líder', 'Manager']);
    expect(result.systemMatchStatus).toBe('survey_only');
    expect(result.matchedSystemDemographic).toBeNull();
    expect(result.destination).toBe('create_in_survey_only');
  });

  it('10. Antigüedad se crea solo en encuesta', () => {
    const result = matchDemographicToSystem('Antigüedad', ['0-1 años', '1-3 años']);
    expect(result.systemMatchStatus).toBe('survey_only');
    expect(result.matchedSystemDemographic).toBeNull();
    expect(result.destination).toBe('create_in_survey_only');
  });

  it('11. Columna A hace match directo con Columna A', () => {
    const result = matchDemographicToSystem('Columna A', ['Segmento A']);
    expect(result.systemMatchStatus).toBe('matched_system_demographic');
    expect(result.matchedSystemDemographic).toBe('Columna A');
    expect(result.matchConfidence).toBe('high');
  });

  it('12. Columna B hace match directo con Columna B', () => {
    const result = matchDemographicToSystem('Columna B', ['Grupo 1']);
    expect(result.systemMatchStatus).toBe('matched_system_demographic');
    expect(result.matchedSystemDemographic).toBe('Columna B');
    expect(result.matchConfidence).toBe('high');
  });

  it('13. Campo ambiguo queda needs_review', () => {
    const result = matchDemographicToSystem('Campo desconocido', ['Valor A', 'Valor B']);
    expect(result.systemMatchStatus).toBe('needs_review');
    expect(result.matchedSystemDemographic).toBeNull();
    expect(result.reviewStatus).toBe('ambiguous');
    expect(result.destination).toBe('needs_user_decision');
  });

  it('14. Mock data incluye al menos 7 campos detectados', () => {
    expect(MOCK_DETECTED_DEMOGRAPHIC_FIELDS.length).toBeGreaterThanOrEqual(7);
  });

  it('15. createDemographicReviewField genera sampleItemsPreview', () => {
    const field: DemographicReviewField = createDemographicReviewField(
      'test-1', 'Test', 'Test', ['A', 'B'], 'survey_only', null, 'high' as const, 'reason', 'create_in_survey_only', 'confirmed',
    );
    expect(field.detectedItemCount).toBe(2);
    expect(field.sampleItemsPreview).toContain('A');
    expect(field.sampleItemsPreview).toContain('B');
  });

  it('16. No expone raw rows', () => {
    for (const field of MOCK_DETECTED_DEMOGRAPHIC_FIELDS) {
      expect(field).not.toHaveProperty('rawRows');
    }
  });

  it('17. No expone IDs, emails ni nombres de personas', () => {
    for (const field of MOCK_DETECTED_DEMOGRAPHIC_FIELDS) {
      for (const item of field.detectedItems) {
        expect(item).not.toMatch(/@/);
      }
    }
  });

  it('18. Output de createDemographicsReviewMockData es determinístico', () => {
    const data1 = createDemographicsReviewMockData();
    const data2 = createDemographicsReviewMockData();
    expect(data1).toEqual(data2);
  });

  it('19. normalizeName es determinístico', () => {
    expect(normalizeName('País')).toBe('país');
    expect(normalizeName('  Pais  ')).toBe('pais');
  });

  it('20. Items detectados no contienen valores reales de clientes', () => {
    const allItems = MOCK_DETECTED_DEMOGRAPHIC_FIELDS.flatMap((f) => f.detectedItems);
    const forbidden = ['juan', 'maría', 'pedro', '@empresa.com', 'user_'];
    for (const item of allItems) {
      for (const f of forbidden) {
        expect(item.toLowerCase()).not.toContain(f);
      }
    }
  });

  it('21. Gerencia match tiene matchConfidence medium', () => {
    const gerencia = MOCK_DETECTED_DEMOGRAPHIC_FIELDS.find(
      (f: DemographicReviewField) => f.detectedName === 'Gerencia',
    );
    expect(gerencia?.matchConfidence).toBe('medium');
  });

  it('22. No hay action buttons ni payloads de UI', () => {
    for (const field of MOCK_DETECTED_DEMOGRAPHIC_FIELDS) {
      expect(field).not.toHaveProperty('actionPayload');
      expect(field).not.toHaveProperty('actionButton');
    }
  });
});
