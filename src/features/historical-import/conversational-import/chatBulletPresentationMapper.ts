export function formatAsBulletList(items: string[], icon: string = '•'): string {
  if (!items || items.length === 0) return '';
  return items.map(item => `${icon} ${item}`).join('\n');
}

export function formatRiskBullets(risks: string[]): string {
  return formatAsBulletList(risks, '⚠️');
}

export function formatFindingBullets(findings: string[]): string {
  return formatAsBulletList(findings, '🔍');
}

export function formatRecommendationBullets(recs: string[]): string {
  return formatAsBulletList(recs, '💡');
}

export function formatActionBullets(actions: string[]): string {
  return formatAsBulletList(actions, '🚫');
}
