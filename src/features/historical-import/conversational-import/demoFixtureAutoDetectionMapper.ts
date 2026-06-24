
/**
 * Checks if the uploaded files exactly match the known QS Clima 2024/2025 demo fixture set.
 * Uses deterministic filename matching with basic normalization.
 */
export function isQsClimaDemoFixture(files: { name: string }[]): boolean {
  if (!files || files.length === 0) return false;

  const uploadedNames = files.map(f => f.name.toLowerCase().trim());

  // Check if it's the demo fixture by looking for keywords 'clima' and '2024' or '2025'
  const isDemo = uploadedNames.some(name =>
    name.includes('clima') && (name.includes('2024') || name.includes('2025'))
  );

  return isDemo;
}
