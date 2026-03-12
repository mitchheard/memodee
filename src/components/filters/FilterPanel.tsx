import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useConversations } from '@/hooks/useConversations'
import {
  useFilterStore,
  type DateRangePreset,
} from '@/store/useFilterStore'

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: 'year', label: 'This year' },
]

interface FilterPanelProps {
  defaultOpen?: boolean
}

function modelLabel(model: string): string {
  const slug = model.toLowerCase()
  if (slug.includes('gpt-4o')) return 'GPT-4o'
  if (slug.includes('gpt-4')) return 'GPT-4'
  if (slug.includes('gpt-3.5') || slug.includes('gpt-3')) return 'GPT-3.5'
  if (slug.includes('o1')) return 'o1'
  return model.split('/').pop() ?? model
}

export function FilterPanel({
  defaultOpen = true,
}: FilterPanelProps) {
  const { conversations: allConversations } = useConversations()
  const uniqueModels = useMemo(
    () => Array.from(new Set(allConversations.map((c) => c.model))).sort(),
    [allConversations]
  )
  const datePreset = useFilterStore((s) => s.datePreset)
  const setDatePreset = useFilterStore((s) => s.setDatePreset)
  const selectedModels = useFilterStore((s) => s.selectedModels)
  const toggleModel = useFilterStore((s) => s.toggleModel)
  const clearModels = useFilterStore((s) => s.clearModels)
  const starredOnly = useFilterStore((s) => s.starredOnly)
  const setStarredOnly = useFilterStore((s) => s.setStarredOnly)
  const setHasCodeOnly = useFilterStore((s) => s.setHasCodeOnly)
  const hasCodeOnlyValue = useFilterStore((s) => s.hasCodeOnly)
  const minMessageCount = useFilterStore((s) => s.minMessageCount)
  const setMinMessageCount = useFilterStore((s) => s.setMinMessageCount)

  return (
    <Collapsible defaultOpen={defaultOpen} className="border-b border-border">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 rounded-md">
        Filters
        <ChevronDown className="size-4 data-[state=open]:rotate-180 transition-transform" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 space-y-4">
          {/* Date range */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Date</p>
            <div className="flex flex-wrap gap-1">
              {DATE_PRESETS.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={datePreset === value ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setDatePreset(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Model */}
          {uniqueModels.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-muted-foreground">Model</p>
                {selectedModels.size > 0 && (
                  <button
                    type="button"
                    onClick={clearModels}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {uniqueModels.map((model) => (
                  <label
                    key={model}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedModels.has(model)}
                      onCheckedChange={() => toggleModel(model)}
                    />
                    <span>{modelLabel(model)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Starred / Has code */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={starredOnly}
                onCheckedChange={(v) => setStarredOnly(Boolean(v))}
              />
              <span>Starred only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={hasCodeOnlyValue}
                onCheckedChange={(v) => setHasCodeOnly(Boolean(v))}
              />
              <span>Has code</span>
            </label>
          </div>

          {/* Min message count */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Min messages {minMessageCount > 0 && `(${minMessageCount})`}
            </p>
            <Slider
              min={0}
              max={100}
              value={[minMessageCount]}
              onValueChange={(v) => setMinMessageCount(Array.isArray(v) ? (v[0] ?? 0) : 0)}
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
