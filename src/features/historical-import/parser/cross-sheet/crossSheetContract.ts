export const CROSS_SHEET_RELATION_CONTRACT = {
  // RELATION_COLUMN_DERIVED_FROM_SYNTHETIC_FIXTURES
  answers: {
    sheetName: "answers",
    respondentIdColumn: "respondent_id",
    responseIdColumn: "response_id",
    metadataColumnCount: 14 // columns before questions
  },
  colaboradores: {
    sheetName: "colaboradores",
    collaboratorIdColumn: "collaborator_id",
    hierarchyNodeIdColumn: "hierarchy_leaf_id"
  },
  dimensions: {
    sheetName: "Dimensions",
    dimensionIdColumn: "canonical_question_id", // We need to check the identifier for duplicates
    sourceQuestionIdentifierColumn: "source_question_identifier"
  },
  hierarchy: {
    sheetName: "Jerarquía",
    nodeIdColumn: "hierarchy_node_id",
    parentNodeIdColumn: "parent_node_id"
  }
};
