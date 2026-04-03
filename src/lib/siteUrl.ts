/**
 * Normalizes the public site URL (no trailing slash).
 */
export function normalizeSiteUrl(raw: string | undefined | null): string {
  if (raw == null) return ''
  const t = String(raw).trim()
  if (!t) return ''
  return t.replace(/\/$/, '')
}
