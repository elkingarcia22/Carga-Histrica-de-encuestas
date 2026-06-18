import type { NormalizationInput } from "./normalizationTypes";

export const NormalizationContract = {
  validateInput(input: NormalizationInput): boolean {
    const isParserReady =
      input.parserResult.status === "PARSED" ||
      input.parserResult.status === "PARSED_WITH_WARNINGS";

    const isSchemaReady =
      input.schemaResult.status === "SCHEMA_VALID" ||
      input.schemaResult.status === "SCHEMA_VALID_WITH_WARNINGS";

    const isCrossSheetReady =
      input.crossSheetResult.status === "CROSS_SHEET_VALID" ||
      input.crossSheetResult.status === "CROSS_SHEET_VALID_WITH_WARNINGS";

    return isParserReady && isSchemaReady && isCrossSheetReady;
  },
};
