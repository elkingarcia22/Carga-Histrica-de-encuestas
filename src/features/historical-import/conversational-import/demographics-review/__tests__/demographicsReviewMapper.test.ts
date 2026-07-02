import { describe, it, expect } from 'vitest';
import {
  mapDetectedFieldToReviewField,
  mapFieldsToReviewSummary,
  mapReviewSummaryToConversationViewModel,
  matchDemographicToSystem,
  countUniqueItems,
  normalizeName,
  findSystemDemographicByLabel,
  findSystemDemographicByAlias,
} from '../demographicsReviewMapper';
import type { DemographicReviewField } from '../demographicsReviewTypes';

function createField(
  id: string,
  name: string,
  items: string[],
): DemographicReviewField {
  const match = matchDemographicToSystem(name, items);
  return {
    id,
    detectedName: name,
    normalizedName: normalizeName(name),
    sourceLabel: name,
    detectedItems: items,
    detectedItemCount: items.length,
    sampleItemsPreview: items.slice(0, 5).join(', '),
    systemMatchStatus: match.systemMatchStatus,
    matchedSystemDemographic: match.matchedSystemDemographic,
    matchConfidence: match.matchConfidence,
    matchReason: match.matchReason,
    destination: match.systemMatchStatus === 'matched_system_demographic'
      ? 'sync_with_system'
      : match.systemMatchStatus === 'survey_only'
        ? 'create_in_survey_only'
        : 'needs_user_decision',
    reviewStatus: match.reviewStatus,
    warnings: match.warnings,
  };
}

describe('Demographics Review Mapper', () => {
  it('14. Mapper calcula total detectados', () => {
    const fields = [
      createField('1', 'País', ['Colombia']),
      createField('2', 'Ciudad', ['Bogotá']),
      createField('3', 'Rol', ['Líder']),
    ];
    const summary = mapFieldsToReviewSummary(fields);
    expect(summary.totalDetected).toBe(3);
  });

  it('15. Mapper calcula sincronizados con sistema', () => {
    const fields = [
      createField('1', 'País', ['Colombia']),
      createField('2', 'Ciudad', ['Bogotá']),
      createField('3', 'Rol', ['Líder']),
    ];
    const summary = mapFieldsToReviewSummary(fields);
    expect(summary.syncWithSystem).toBe(2);
  });

  it('16. Mapper calcula creados solo en encuesta', () => {
    const fields = [
      createField('1', 'País', ['Colombia']),
      createField('2', 'Sede', ['Bogotá']),
      createField('3', 'Rol', ['Líder']),
    ];
    const summary = mapFieldsToReviewSummary(fields);
    expect(summary.surveyOnly).toBe(2);
  });

  it('17. Mapper calcula por revisar', () => {
    const fields = [
      createField('1', 'País', ['Colombia']),
      createField('2', 'UnknownXYZ', ['Valor A']),
    ];
    const summary = mapFieldsToReviewSummary(fields);
    expect(summary.needsReview).toBe(1);
  });

  it('18. Preview de items no excede límite seguro', () => {
    const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const field = mapDetectedFieldToReviewField('1', 'País', 'País', items);
    expect(field.sampleItemsPreview).toContain('y 2 más');
  });

  it('19. No expone raw rows', () => {
    const result = createField('1', 'País', ['Colombia']);
    expect(result).not.toHaveProperty('rawRows');
  });

  it('20. No expone IDs, emails ni nombres de personas', () => {
    const result = createField('1', 'País', ['Colombia']);
    expect(result.detectedName).not.toMatch(/@/);
    expect(result.sourceLabel).not.toMatch(/@/);
  });

  it('21. Output determinístico', () => {
    const field1 = mapDetectedFieldToReviewField('1', 'País', 'País', ['Colombia']);
    const field2 = mapDetectedFieldToReviewField('1', 'País', 'País', ['Colombia']);
    expect(field1).toEqual(field2);
  });

  it('22. No crea action buttons ni payloads de UI', () => {
    const viewModel = mapReviewSummaryToConversationViewModel(
      mapFieldsToReviewSummary([
        createField('1', 'País', ['Colombia']),
      ]),
    );
    expect(viewModel).not.toHaveProperty('actionPayload');
    expect(viewModel).not.toHaveProperty('actionButton');
    expect(viewModel.commands).toBeDefined();
    expect(Array.isArray(viewModel.commands)).toBe(true);
  });

  it('mapReviewSummaryToConversationViewModel genera título e intro', () => {
    const summary = mapFieldsToReviewSummary([]);
    const vm = mapReviewSummaryToConversationViewModel(summary);
    expect(vm.title).toBe('2/7 · Demográficos');
    expect(vm.intro).toContain('0 campos');
  });

  it('findSystemDemographicByLabel encuentra País', () => {
    const d = findSystemDemographicByLabel('País');
    expect(d).toBeDefined();
    expect(d?.id).toBe('system_demo_country');
  });

  it('findSystemDemographicByAlias encuentra Área', () => {
    const d = findSystemDemographicByAlias('Área');
    expect(d).toBeDefined();
    expect(d?.id).toBe('system_demo_dept_area');
  });

  it('findSystemDemographicByAlias encuentra Nivel', () => {
    const d = findSystemDemographicByAlias('Nivel');
    expect(d).toBeDefined();
    expect(d?.id).toBe('system_demo_level');
  });

  it('Pais (sin acento) hace alias a País', () => {
    const result = matchDemographicToSystem('Pais', ['Colombia']);
    expect(result.matchedSystemDemographic).toBe('País');
    expect(result.matchConfidence).toBe('high');
  });

  it('countUniqueItems cuenta items únicos entre campos', () => {
    const fields = [
      createField('1', 'País', ['Colombia', 'México']),
      createField('2', 'Ciudad', ['Bogotá', 'Medellín']),
    ];
    expect(countUniqueItems(fields)).toBe(4);
  });

  it('countUniqueItems no cuenta duplicados entre campos', () => {
    const fields = [
      createField('1', 'País', ['Colombia', 'México']),
      createField('2', 'Sede', ['Bogotá', 'Colombia']),
    ];
    expect(countUniqueItems(fields)).toBe(3);
  });

  it('survey_only para Antigüedad', () => {
    const result = matchDemographicToSystem('Antigüedad', ['0-1 años']);
    expect(result.systemMatchStatus).toBe('survey_only');
  });

  it('survey_only para Unidad', () => {
    const result = matchDemographicToSystem('Unidad', ['Unidad A']);
    expect(result.systemMatchStatus).toBe('survey_only');
  });

  it('survey_only para Equipo', () => {
    const result = matchDemographicToSystem('Equipo', ['Equipo A']);
    expect(result.systemMatchStatus).toBe('survey_only');
  });

  it('needs_review para campo completamente desconocido', () => {
    const result = matchDemographicToSystem('ZZCampoInventado', ['Valor']);
    expect(result.systemMatchStatus).toBe('needs_review');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('viewModel tiene syncWithSystem separado', () => {
    const fields = [
      createField('1', 'País', ['Colombia']),
      createField('2', 'Sede', ['Bogotá']),
    ];
    const summary = mapFieldsToReviewSummary(fields);
    const vm = mapReviewSummaryToConversationViewModel(summary);
    expect(vm.syncWithSystem).toHaveLength(1);
    expect(vm.surveyOnly).toHaveLength(1);
  });

  it('viewModel tiene needsReview', () => {
    const fields = [
      createField('1', 'País', ['Colombia']),
      createField('2', 'UnknownField', ['Valor']),
    ];
    const summary = mapFieldsToReviewSummary(fields);
    const vm = mapReviewSummaryToConversationViewModel(summary);
    expect(vm.needsReview.length).toBeGreaterThanOrEqual(1);
  });
});
