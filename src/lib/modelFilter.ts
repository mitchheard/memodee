/**
 * Human-readable label for a conversation's model string.
 * Multiple raw API variants that map to the same label share one Library filter row.
 */
export function modelDisplayLabel(model: string): string {
  const slug = model.toLowerCase()
  if (slug.includes('gpt-4o')) return 'GPT-4o'
  if (slug.includes('gpt-4')) return 'GPT-4'
  if (slug.includes('gpt-3.5') || slug.includes('gpt-3')) return 'GPT-3.5'
  if (slug.includes('o1')) return 'o1'
  return model.split('/').pop() ?? model
}

/** `selectedModels` in the filter store holds display labels, not raw model IDs. */
export function matchesModelFilter(
  conversationModel: string,
  selectedLabels: Set<string>
): boolean {
  if (selectedLabels.size === 0) return true
  return selectedLabels.has(modelDisplayLabel(conversationModel))
}

export function uniqueModelFilterLabels(models: Iterable<string>): string[] {
  const labels = new Set<string>()
  for (const m of models) labels.add(modelDisplayLabel(m))
  return Array.from(labels).sort((a, b) => a.localeCompare(b))
}
