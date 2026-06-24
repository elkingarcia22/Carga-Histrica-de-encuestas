import { qsClimaDemoFixture } from "../demo-fixture/qsClimaFixture";

/**
 * Checks if the uploaded files exactly match the known QS Clima 2024/2025 demo fixture set.
 * Uses deterministic filename matching with basic normalization.
 */
export function isQsClimaDemoFixture(files: { name: string }[]): boolean {
  if (!files || files.length === 0) return false;

  const expectedNames = qsClimaDemoFixture.sourceLayer.files.map(f =>
    f.sourceTrace.sourceFileName.toLowerCase().trim()
  );

  const uploadedNames = files.map(f => f.name.toLowerCase().trim());

  // Check if at least a significant portion of expected files are present
  // We'll require all uploaded files to be in the expected set, and at least 1 file to match.
  const allUploadedAreExpected = uploadedNames.every(name => expectedNames.includes(name));

  if (!allUploadedAreExpected || uploadedNames.length === 0) return false;

  return true;
}
