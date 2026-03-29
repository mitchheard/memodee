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
import { uniqueModelFilterLabels } from '@/lib/modelFilter'
import {
  activePanelFilterDimensions,
} from '@/lib/panelFiltersActive'
import {
  useFilterStore,
  type DateRangePreset,
} from '@/store/useFilterStore'
import { cn } from '@/lib/utils'

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: 'year', label: 'This year' },
]

export function FilterPanel() {
  const { conversations: allConversations } = useConversations()
  const modelFilterLabels = useMemo(
    () => uniqueModelFilterLabels(allConversations.map((c) => c.model)),
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
  const filtersPanelExpanded = useFilterStore((s) => s.filtersPanelExpanded)
  const setFiltersPanelExpanded = useFilterStore((s) => s.setFiltersPanelExpanded)

  const activeDimensions = useFilterStore((s) =>
    activePanelFilterDimensions({
      datePreset: s.datePreset,
      selectedModels: s.selectedModels,
      starredOnly: s.starredOnly,
      hasCodeOnly: s.hasCodeOnly,
      minMessageCount: s.minMessageCount,
    })
  )

  const filterTriggerLabel =
    activeDimensions > 0
      ? `Filters, ${activeDimensions} active`
      : 'Filters'

  return (
    <Collapsible
      open={filtersPanelExpanded}
      onOpenChange={setFiltersPanelExpanded}
      className="flex min-h-0 shrink-0 flex-col border-b border-border"
    >
      <CollapsibleTrigger
        aria-label={filterTriggerLabel}
        className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-sm font-medium hover:bg-muted/50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate">Filters</span>
          {activeDimensions > 0 && (
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold tabular-nums text-primary"
              aria-hidden
            >
              {activeDimensions}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform',
            filtersPanelExpanded && 'rotate-180'
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="min-h-0">
        <div className="max-h-[40vh] overflow-y-auto px-3 pb-2">
          <div className="space-y-2 py-1">
            {/* Date range */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Date</p>
              <div className="flex flex-wrap gap-1">
                {DATE_PRESETS.map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={datePreset === value ? 'default' : 'outline'}
                    size="xs"
                    className="h-6 px-2 py-0 text-xs leading-none"
                    onClick={() => setDatePreset(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Model */}
            {modelFilterLabels.length > 0 && (
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Model</p>
                  {selectedModels.size > 0 && (
                    <button
                      type="button"
                      onClick={() => clearModels()}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="max-h-24 space-y-0 overflow-y-auto">
                  {modelFilterLabels.map((label) => (
                    <label
                      key={label}
                      className="flex cursor-pointer items-center gap-2 py-0.5 text-xs leading-tight"
                    >
                      <Checkbox
                        checked={selectedModels.has(label)}
                        onCheckedChange={() => toggleModel(label)}
                      />
                      <span className="min-w-0 truncate">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Starred / Has code */}
            <div className="space-y-0">
              <label className="flex cursor-pointer items-center gap-2 py-0.5 text-xs leading-tight">
                <Checkbox
                  checked={starredOnly}
                  onCheckedChange={(v) => setStarredOnly(Boolean(v))}
                />
                <span>Starred only</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 py-0.5 text-xs leading-tight">
                <Checkbox
                  checked={hasCodeOnlyValue}
                  onCheckedChange={(v) => setHasCodeOnly(Boolean(v))}
                />
                <span>Has code</span>
              </label>
            </div>

            {/* Min message count */}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
