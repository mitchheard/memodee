import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/useThemeStore'
import {
  formatModelUsagePercent,
  getHeatmapCellBorder,
  getHeatmapCellColor,
  getHeatmapLegendSwatches,
  truncateChartLabel,
} from '@/lib/analyticsCharts'
import { trackAnalyticsViewed } from '@/lib/analytics'

const MODEL_COLORS = ['#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#eab308']

type PieTooltipProps = {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; payload?: { name?: string; value?: number } }>
  total: number
}

function ModelPieTooltip({ active, payload, total }: PieTooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  const name = String(p.name ?? p.payload?.name ?? '')
  const v = Number(p.value ?? p.payload?.value ?? 0)
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-sm text-popover-foreground shadow-md">
      <p className="font-medium leading-snug break-words">{name}</p>
      <p className="text-muted-foreground text-xs tabular-nums">
        {v.toLocaleString()} conversations · {formatModelUsagePercent(v, total)}
      </p>
    </div>
  )
}

type MonthTooltipProps = {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
}

function MessagesPerMonthTooltip({ active, payload, label }: MonthTooltipProps) {
  if (!active || !payload?.length) return null
  const count = Number(payload[0].value ?? 0)
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{label ?? ''}</p>
      <p className="text-muted-foreground text-xs tabular-nums">
        {count.toLocaleString()} messages
      </p>
    </div>
  )
}

type ConversationBarTooltipProps = {
  active?: boolean
  payload?: Array<{ payload?: { title: string; count: number } }>
}

function ConversationLengthTooltip({ active, payload }: ConversationBarTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  if (!row) return null
  return (
    <div className="max-w-xs rounded-md border border-border bg-popover px-2.5 py-1.5 text-sm text-popover-foreground shadow-md">
      <p className="font-medium leading-snug break-words">{row.title}</p>
      <p className="text-muted-foreground text-xs tabular-nums">
        {row.count.toLocaleString()} messages
      </p>
    </div>
  )
}

type LongestBarRow = { id: string; title: string; count: number }

function LongestConversationYAxisTick({
  x,
  y,
  payload,
  index,
  barData,
}: {
  x: number | string
  y: number | string
  payload?: { value?: unknown }
  index: number
  barData: LongestBarRow[]
}) {
  const navigate = useNavigate()
  const row = barData[index]
  const id = row?.id
  const full = String(payload?.value ?? '')
  const display = truncateChartLabel(full, 36)
  const go = () => {
    if (id) navigate(`/library?c=${encodeURIComponent(id)}`)
  }
  const nx = typeof x === 'number' ? x : Number(x)
  const ny = typeof y === 'number' ? y : Number(y)
  return (
    <text
      x={nx}
      y={ny}
      dy={3}
      textAnchor="end"
      className={
        id
          ? 'fill-foreground text-[11px] cursor-pointer hover:fill-primary outline-none focus-visible:fill-primary'
          : 'fill-foreground text-[11px]'
      }
      onClick={id ? go : undefined}
      onKeyDown={
        id
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                go()
              }
            }
          : undefined
      }
      tabIndex={id ? 0 : undefined}
      role={id ? 'link' : undefined}
    >
      <title>{id ? `${full} — Click to open` : full}</title>
      {display}
    </text>
  )
}

const HEATMAP_WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const

function ActivityHeatmap({ data }: { data: Array<{ date: string; count: number }> }) {
  const theme = useThemeStore((s) => s.theme)
  const byDate = new Map(data.map((d) => [d.date, d.count]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // 7 rows (Sun–Sat) x 53 columns (weeks)
  const grid: number[][] = Array.from({ length: 7 }, () => Array(53).fill(0))
  const dateForKey: string[][] = Array.from({ length: 7 }, () => Array(53).fill(''))
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - (364 - i))
    const key = d.toISOString().slice(0, 10)
    const count = byDate.get(key) ?? 0
    const dayOfWeek = d.getDay()
    const weekIndex = Math.floor(i / 7)
    if (weekIndex < 53) {
      grid[dayOfWeek][weekIndex] = count
      dateForKey[dayOfWeek][weekIndex] = key
    }
  }
  const max = Math.max(1, ...data.map((d) => d.count))
  const cellSize = 10
  const gap = 2
  const border = getHeatmapCellBorder(theme)
  const legendSwatches = getHeatmapLegendSwatches(theme)

  const columnWeekStart = (col: number): Date => {
    const d = new Date(today)
    d.setDate(d.getDate() - (364 - col * 7))
    return d
  }

  const monthTicks = Array.from({ length: 53 }, (_, col) => {
    const start = columnWeekStart(col)
    const prev = col > 0 ? columnWeekStart(col - 1) : null
    const show =
      col === 0 || (prev !== null && start.getMonth() !== prev.getMonth())
    return show
      ? start.toLocaleDateString(undefined, { month: 'short' })
      : null
  })

  const gridWidthPx = 53 * cellSize + 52 * gap

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Activity (last year)</p>
      <p className="text-muted-foreground text-xs leading-relaxed max-w-xl">
        Each cell is one day. Rows are weekday (Sunday at the top, Saturday at the bottom); columns run
        from older on the left to more recent on the right. Brighter green means more messages that day.
        Color is scaled to your busiest day in this period, not an absolute count.
      </p>
      <div className="flex gap-2 min-w-0">
        <div className="flex shrink-0 flex-col gap-0.5 pt-[22px] text-[10px] leading-none text-muted-foreground w-9">
          {HEATMAP_WEEKDAY_LABELS.map((label, i) => (
            <span
              key={i}
              className="flex h-[10px] shrink-0 items-center justify-end tabular-nums"
            >
              {label}
            </span>
          ))}
        </div>
        <div className="min-w-0 overflow-x-auto pb-1">
          <div className="relative mb-1" style={{ width: gridWidthPx, height: 18 }}>
            {monthTicks.map((label, col) =>
              label ? (
                <span
                  key={col}
                  className="absolute top-0 text-[10px] leading-none text-muted-foreground whitespace-nowrap"
                  style={{ left: col * (cellSize + gap) }}
                >
                  {label}
                </span>
              ) : null
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-0.5">
                {row.map((count, colIndex) => (
                  <div
                    key={colIndex}
                    title={`${dateForKey[rowIndex][colIndex]} · ${count.toLocaleString()} message${count === 1 ? '' : 's'}`}
                    className="rounded-sm shrink-0 transition-opacity hover:opacity-90"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getHeatmapCellColor(count, max, theme),
                      boxShadow: `inset 0 0 0 1px ${border}`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          {legendSwatches.map((color, i) => (
            <div
              key={i}
              className="rounded-sm shrink-0"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: color,
                boxShadow: `inset 0 0 0 1px ${border}`,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export function Analytics() {
  const { data, isLoading } = useAnalytics()
  const navigate = useNavigate()
  const analyticsViewedSent = useRef(false)

  const handleLongestBarClick = useCallback(
    (rect: { payload?: unknown }) => {
      const row = rect.payload as LongestBarRow | undefined
      const id = row?.id
      if (id) navigate(`/library?c=${encodeURIComponent(id)}`)
    },
    [navigate]
  )

  useEffect(() => {
    if (isLoading || !data) return
    if (data.totalConversations === 0 && data.totalMessages === 0) return
    if (analyticsViewedSent.current) return
    analyticsViewedSent.current = true
    trackAnalyticsViewed()
  }, [isLoading, data])

  const modelTotal = useMemo(() => {
    if (!data?.modelCounts.length) return 0
    return data.modelCounts.reduce((s, m) => s + m.value, 0)
  }, [data?.modelCounts])

  const longestConversationsBarData = useMemo((): LongestBarRow[] => {
    if (!data?.topConversationsByLength.length) return []
    return [...data.topConversationsByLength].reverse()
  }, [data?.topConversationsByLength])

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <BarChart3 className="size-10 animate-pulse" />
        <p className="text-sm">Loading analytics…</p>
      </div>
    )
  }

  if (!data || (data.totalConversations === 0 && data.totalMessages === 0)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-8 animate-in fade-in duration-200">
        <div className="rounded-full bg-muted p-4">
          <BarChart3 className="size-10 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">No data yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Import your conversation history to see analytics.
          </p>
        </div>
        <Link to="/">
          <Button>Go to Import</Button>
        </Link>
      </div>
    )
  }

  const daysSinceFirst = data.firstConversationDate
    ? Math.floor((Date.now() - data.firstConversationDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Usage stats from your imported conversations.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.totalConversations.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total messages</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.totalMessages.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Est. tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.estimatedTokens.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Using ChatGPT</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {daysSinceFirst > 0 ? `${daysSinceFirst} days` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Messages per day (GitHub-style)</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={data.messagesPerDay} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 md:items-stretch gap-6">
        {/* Model usage — card fills grid row height; chart area grows so it matches the taller sibling */}
        <Card className="h-full min-h-0">
          <CardHeader>
            <CardTitle>Model usage</CardTitle>
            <CardDescription>Conversations by model</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="min-h-[13rem] w-full min-w-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.modelCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="72%"
                    label={false}
                  >
                    {data.modelCounts.map((_, i) => (
                      <Cell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ModelPieTooltip total={modelTotal} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul
              className="max-h-32 space-y-1.5 overflow-y-auto pr-1 text-sm"
              aria-label="Model usage breakdown"
            >
              {data.modelCounts.map((m, i) => (
                <li key={`${m.name}-${i}`} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 size-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 break-words" title={m.name}>
                    {m.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {m.value.toLocaleString()} ({formatModelUsagePercent(m.value, modelTotal)})
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Messages per month */}
        <Card className="h-full min-h-0">
          <CardHeader>
            <CardTitle>Messages per month</CardTitle>
            <CardDescription>Volume over time</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-56 w-full min-w-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.messagesPerMonth}
                  margin={{ top: 8, right: 24, left: 8, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickMargin={4} />
                  <YAxis tick={{ fontSize: 11 }} width={44} tickLine={false} axisLine={false} />
                  <Tooltip content={<MessagesPerMonthTooltip />} />
                  <Bar dataKey="count" name="Messages" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top conversation lengths */}
      <Card>
        <CardHeader>
          <CardTitle>Longest conversations</CardTitle>
          <CardDescription>Top 10 by message count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 min-h-[18rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={longestConversationsBarData}
                layout="vertical"
                margin={{ top: 8, right: 28, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={228}
                  interval={0}
                  tick={(props) => (
                    <LongestConversationYAxisTick {...props} barData={longestConversationsBarData} />
                  )}
                />
                <Tooltip content={<ConversationLengthTooltip />} cursor={{ fill: 'var(--muted)', fillOpacity: 0.35 }} />
                <Bar
                  dataKey="count"
                  name="Messages"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                  className="cursor-pointer"
                  onClick={handleLongestBarClick}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
