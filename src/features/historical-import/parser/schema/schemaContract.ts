import type { SheetSchemaContract } from "./schemaTypes";

export const answersSheetContract: SheetSchemaContract = {
  sheetName: "answers",
  required: true,
  exactHeaderOrderRequired: true,
  expectedColumnCount: 31,
  expectedDataRowCount: {
    base: 18,
    comparison: 22
  },
  expectedHeaders: [
    { name: "response_id", required: true },
    { name: "respondent_id", required: true },
    { name: "survey_period_id", required: true },
    { name: "completion_status", required: true },
    { name: "submitted_at", required: true },
    { name: "org_unit_code", required: true },
    { name: "department_code", required: true },
    { name: "area_code", required: true },
    { name: "site_code", required: true },
    { name: "region_code", required: true },
    { name: "tenure_band", required: true },
    { name: "age_band", required: true },
    { name: "role_family", required: true },
    { name: "employment_type", required: true }
    // Only first 14 are strictly defined by name in contract, the rest are dynamic/physical questions
  ]
};

export const dimensionsSheetContract: SheetSchemaContract = {
  sheetName: "Dimensions",
  required: true,
  exactHeaderOrderRequired: true,
  expectedDataRowCount: {
    base: 17,
    comparison: 17
  },
  expectedHeaders: [
    { name: "source_question_identifier", required: true },
    { name: "canonical_question_id", required: true },
    { name: "dimension_id", required: true },
    { name: "dimension_label", required: true },
    { name: "question_label", required: true },
    { name: "question_type", required: true },
    { name: "is_required", required: true },
    { name: "survey_period_id", required: true },
    { name: "display_order", required: true },
    { name: "scale_min", required: true },
    { name: "scale_max", required: true },
    { name: "comparability_hint", required: true },
    { name: "active", required: true }
  ]
};

export const colaboradoresSheetContract: SheetSchemaContract = {
  sheetName: "colaboradores",
  required: true,
  exactHeaderOrderRequired: true,
  expectedDataRowCount: {
    base: 24,
    comparison: 28
  },
  expectedHeaders: [
    { name: "collaborator_id", required: true },
    { name: "survey_period_id", required: true },
    { name: "eligible", required: true },
    { name: "org_unit_code", required: true },
    { name: "department_code", required: true },
    { name: "area_code", required: true },
    { name: "site_code", required: true },
    { name: "region_code", required: true },
    { name: "tenure_band", required: true },
    { name: "age_band", required: true },
    { name: "role_family", required: true },
    { name: "employment_type", required: true },
    { name: "hierarchy_leaf_id", required: true }
  ]
};

export const jerarquiaSheetContract: SheetSchemaContract = {
  sheetName: "Jerarquía",
  required: true,
  exactHeaderOrderRequired: true,
  expectedDataRowCount: {
    base: 9,
    comparison: 11
  },
  expectedHeaders: [
    { name: "hierarchy_node_id", required: true },
    { name: "hierarchy_node_label", required: true },
    { name: "hierarchy_level", required: true },
    { name: "parent_node_id", required: true },
    { name: "org_unit_code", required: true },
    { name: "active", required: true },
    { name: "display_order", required: true }
  ]
};

export const WORKBOOK_SCHEMA_CONTRACT: SheetSchemaContract[] = [
  answersSheetContract,
  dimensionsSheetContract,
  colaboradoresSheetContract,
  jerarquiaSheetContract
];
