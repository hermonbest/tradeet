'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface ChartProps {
    data: any[]
}

export function WinRateDonut({ data }: ChartProps) {
    const winners = data.filter(t => (t.profit_usd || 0) > 0).length
    const losers = data.filter(t => (t.profit_usd || 0) < 0).length

    const chartData = [
        { name: 'Winners', value: winners },
        { name: 'Losers', value: losers }
    ]

    const COLORS = ['#22c55e', '#ef4444']
    const winRate = data.length > 0 ? (winners / (winners + losers)) * 100 : 0

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
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{winRate.toFixed(0)}%</span>
                <span className="text-[10px] text-muted-foreground uppercase">Winrate</span>
            </div>
        </div>
    )
}

export function EquityCurveChart({ data }: ChartProps) {
    // Sort trades by date
    const sortedTrades = [...data].sort((a, b) =>
        new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    )

    let cumulative = 0
    const chartData = sortedTrades.map(t => {
        cumulative += (t.profit_usd || 0)
        return {
            date: format(new Date(t.trade_date), 'MM/dd'),
            pnl: cumulative
        }
    })

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#888' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#888' }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: number | undefined) => [value !== undefined ? `$${value.toFixed(2)}` : '$0.00', 'Cumulative P&L']}
                    />
                    <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke="#22c55e"
                        fillOpacity={1}
                        fill="url(#colorPnl)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export function WinRateByDaysDonut({ data }: ChartProps) {
    // Aggregate P&L by day
    const dailyPnL: Record<string, number> = {}
    data.forEach(t => {
        const date = t.trade_date.split('T')[0]
        dailyPnL[date] = (dailyPnL[date] || 0) + (t.profit_usd || 0)
    })

    const days = Object.values(dailyPnL)
    const winners = days.filter(pnl => pnl > 0).length
    const losers = days.filter(pnl => pnl < 0).length

    const chartData = [
        { name: 'Green Days', value: winners },
        { name: 'Red Days', value: losers }
    ]

    const COLORS = ['#22c55e', '#ef4444']
    const winRate = days.length > 0 ? (winners / (winners + losers)) * 100 : 0

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
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{winRate.toFixed(0)}%</span>
                <span className="text-[10px] text-muted-foreground uppercase">Daily Winrate</span>
            </div>
        </div>
    )
}

export function DailyPnLChart({ data }: ChartProps) {
    const dailyPnL: Record<string, number> = {}
    data.forEach(t => {
        const date = t.trade_date.split('T')[0]
        dailyPnL[date] = (dailyPnL[date] || 0) + (t.profit_usd || 0)
    })

    const chartData = Object.entries(dailyPnL)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, amount]) => ({
            date: format(new Date(date), 'MM/dd'),
            amount
        }))

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.amount >= 0 ? '#22c55e' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export function ProgressHeatmap({ data }: ChartProps) {
    const tradeDates = new Set(data.map(t => t.trade_date.split('T')[0]))
    const today = new Date()
    const days = []
    for (let i = 27; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        days.push({ date: dateStr, active: tradeDates.has(dateStr) })
    }

    return (
        <div className="flex flex-wrap gap-1.5 p-2 justify-center">
            {days.map((day, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-sm ${day.active ? 'bg-primary' : 'bg-muted/50'}`} title={day.date} />
            ))}
        </div>
    )
}

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
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#3f3f46" strokeOpacity={0.6} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                        isAnimationActive={false}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
