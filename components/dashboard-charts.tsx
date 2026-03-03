'use client'

import {
    PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'
import { format } from 'date-fns'
import { TrendingUp } from 'lucide-react'

interface ChartProps {
    data: any[]
}

// ── Shared dark tooltip ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
    if (!active || !payload || !payload.length) return null
    return (
        <div style={{
            background: 'oklch(0.14 0 0)',
            border: '1px solid oklch(0.28 0 0)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
            fontSize: 12,
            minWidth: 100,
        }}>
            {label && (
                <div style={{ color: 'oklch(0.5 0 0)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {label}
                </div>
            )}
            {payload.map((entry: any, i: number) => (
                <div key={i} style={{ color: entry.color || 'oklch(0.985 0 0)', fontWeight: 700 }}>
                    {typeof entry.value === 'number'
                        ? `$${entry.value.toFixed(2)}`
                        : entry.value}
                </div>
            ))}
        </div>
    )
}

// ── Empty state helper ─────────────────────────────────────────────
function ChartEmptyState({ message }: { message: string }) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <TrendingUp className="w-8 h-8 opacity-20" />
            <p className="text-xs uppercase tracking-widest opacity-50">{message}</p>
        </div>
    )
}

// ── Win Rate Donut ────────────────────────────────────────────────
export function WinRateDonut({ data }: ChartProps) {
    const winners = data.filter(t => (t.profit_usd || 0) > 0).length
    const losers = data.filter(t => (t.profit_usd || 0) < 0).length
    const breakevens = data.filter(t => (t.profit_usd || 0) === 0).length

    const chartData = [
        { name: 'Winners', value: winners },
        { name: 'Losers', value: losers },
        { name: 'Breakeven', value: breakevens }
    ].filter(d => d.value > 0)

    const COLORS: Record<string, string> = {
        'Winners': '#22c55e',
        'Losers': '#ef4444',
        'Breakeven': '#9ca3af'
    }

    const decisiveTrades = winners + losers
    const winRate = decisiveTrades > 0 ? (winners / decisiveTrades) * 100 : 0

    if (data.length === 0) return <ChartEmptyState message="No trades yet" />

    return (
        <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={800}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold num">{winRate.toFixed(0)}%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Winrate</span>
            </div>
        </div>
    )
}

// ── Equity Curve Chart ─────────────────────────────────────────────
export function EquityCurveChart({ data }: ChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ChartEmptyState message="Add trades to see your equity curve" />
            </div>
        )
    }

    const sortedTrades = [...data].sort((a, b) =>
        new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    )

    let cumulative = 0
    const chartData = sortedTrades.map(t => {
        cumulative += (t.profit_usd || 0)
        return {
            date: format(new Date(t.trade_date), 'MM/dd'),
            pnl: parseFloat(cumulative.toFixed(2))
        }
    })

    const finalPnL = chartData[chartData.length - 1]?.pnl ?? 0
    const lineColor = finalPnL >= 0 ? '#22c55e' : '#ef4444'
    const gradientId = finalPnL >= 0 ? 'equityGradientGreen' : 'equityGradientRed'

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={lineColor} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#555' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#555' }}
                        tickFormatter={(value) => `$${value}`}
                        width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke={lineColor}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        strokeWidth={2}
                        isAnimationActive={true}
                        animationDuration={3000}
                        animationEasing="ease-out"
                        dot={false}
                        activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// ── Win Rate By Days Donut ─────────────────────────────────────────
export function WinRateByDaysDonut({ data }: ChartProps) {
    const dailyPnL: Record<string, number> = {}
    data.forEach(t => {
        const date = t.trade_date.split('T')[0]
        dailyPnL[date] = (dailyPnL[date] || 0) + (t.profit_usd || 0)
    })

    const days = Object.values(dailyPnL)
    const winners = days.filter(pnl => pnl > 0).length
    const losers = days.filter(pnl => pnl < 0).length
    const breakevens = days.filter(pnl => pnl === 0).length

    const chartData = [
        { name: 'Green Days', value: winners },
        { name: 'Red Days', value: losers },
        { name: 'Breakeven Days', value: breakevens }
    ].filter(d => d.value > 0)

    const COLORS: Record<string, string> = {
        'Green Days': '#22c55e',
        'Red Days': '#ef4444',
        'Breakeven Days': '#9ca3af'
    }

    const decisiveDays = winners + losers
    const winRate = decisiveDays > 0 ? (winners / decisiveDays) * 100 : 0

    if (data.length === 0) return <ChartEmptyState message="No trading days yet" />

    return (
        <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={800}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold num">{winRate.toFixed(0)}%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Daily Win%</span>
            </div>
        </div>
    )
}

// ── Daily P&L Bar Chart ───────────────────────────────────────────
export function DailyPnLChart({ data }: ChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                <ChartEmptyState message="No daily P&L data yet" />
            </div>
        )
    }

    const dailyPnL: Record<string, number> = {}
    data.forEach(t => {
        const date = t.trade_date.split('T')[0]
        dailyPnL[date] = (dailyPnL[date] || 0) + (t.profit_usd || 0)
    })

    const chartData = Object.entries(dailyPnL)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, amount]) => ({
            date: format(new Date(date), 'MM/dd'),
            amount: parseFloat(amount.toFixed(2))
        }))

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555' }} tickFormatter={(val) => `$${val}`} width={55} />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={700}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.amount > 0 ? '#22c55e' : entry.amount < 0 ? '#ef4444' : '#9ca3af'}
                                fillOpacity={0.85}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// ── Progress Heatmap ──────────────────────────────────────────────
export function ProgressHeatmap({ data }: ChartProps) {
    const tradeDates = new Set(data.map(t => t.trade_date.split('T')[0]))

    // Count trades per date for intensity
    const tradeCounts: Record<string, number> = {}
    data.forEach(t => {
        const d = t.trade_date.split('T')[0]
        tradeCounts[d] = (tradeCounts[d] || 0) + 1
    })

    const today = new Date()
    const days = []
    for (let i = 27; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        days.push({
            date: dateStr,
            active: tradeDates.has(dateStr),
            count: tradeCounts[dateStr] || 0,
        })
    }

    return (
        <div className="flex flex-wrap gap-1.5 p-2 justify-center">
            {days.map((day, i) => {
                const intensity = day.count === 0 ? 0 : Math.min(day.count / 5, 1)
                const bg = day.active
                    ? `rgba(139, 92, 246, ${0.25 + intensity * 0.65})`
                    : 'rgba(39, 39, 42, 0.5)'
                return (
                    <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-sm transition-opacity hover:opacity-80"
                        style={{ background: bg }}
                        title={`${day.date}${day.count > 0 ? ` — ${day.count} trade${day.count > 1 ? 's' : ''}` : ''}`}
                    />
                )
            })}
        </div>
    )
}

// ── Performance Radar Chart ───────────────────────────────────────
export function PerformanceRadarChart({ stats }: { stats: any }) {
    const chartData = [
        { subject: 'Win Rate', value: stats.winRate },
        { subject: 'Profit Factor', value: Math.min(stats.profitFactor * 20, 100) },
        { subject: 'Consistency', value: stats.consistency },
        { subject: 'Risk Reward', value: Math.min(stats.rrRatio * 30, 100) },
        { subject: 'Volume', value: Math.min(stats.tradeCount * 2, 100) },
    ]

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                    <PolarGrid stroke="#3f3f46" strokeOpacity={0.6} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.5}
                        isAnimationActive={true}
                        animationDuration={700}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
