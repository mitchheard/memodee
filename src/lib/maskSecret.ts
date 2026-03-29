/**
 * Mask a secret for display. At most the last four characters of the trimmed
 * value may appear; the rest is replaced with an ellipsis prefix.
 */
export function maskSecret(value: string): string {
  const t = value.trim()
  if (!t) return ''
  const tail = t.slice(-4)
  return `…${tail}`
}
