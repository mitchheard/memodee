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
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const MODEL_COLORS = ['#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#eab308']

function ActivityHeatmap({ data }: { data: Array<{ date: string; count: number }> }) {
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

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Activity (last year)</p>
      <div className="flex flex-col gap-0.5">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-0.5">
            {row.map((count, colIndex) => (
              <div
                key={colIndex}
                title={`${dateForKey[rowIndex][colIndex]}: ${count} messages`}
                className="rounded-sm transition-opacity hover:opacity-90"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: count === 0 ? 'var(--muted)' : `hsl(var(--primary) / ${0.2 + 0.8 * (count / max)})`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Analytics() {
  const { data, isLoading } = useAnalytics()

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
            Import a ChatGPT export to see conversation and usage analytics.
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Model usage */}
        <Card>
          <CardHeader>
            <CardTitle>Model usage</CardTitle>
            <CardDescription>Conversations by model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.modelCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {data.modelCounts.map((_, i) => (
                      <Cell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v ?? 0, 'Conversations']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Messages per month */}
        <Card>
          <CardHeader>
            <CardTitle>Messages per month</CardTitle>
            <CardDescription>Volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.messagesPerMonth} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Messages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...data.topConversationsByLength].reverse()}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="title" width={75} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [v ?? 0, 'Messages']} />
                <Bar dataKey="count" name="Messages" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
