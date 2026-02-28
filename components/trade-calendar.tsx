'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TradeDetailsModal } from './trade-details-modal'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function TradeCalendar({ trades }: { trades: any[] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedTrade, setSelectedTrade] = useState<any | null>(null)

    // Aggregate P&L by date
    const dailyPnL: Record<string, { amount: number, count: number }> = {}

    trades.forEach(trade => {
        if (!trade.trade_date) return
        const dateStr = trade.trade_date.split('T')[0]
        if (!dailyPnL[dateStr]) dailyPnL[dateStr] = { amount: 0, count: 0 }
        dailyPnL[dateStr].amount += trade.profit_usd
        dailyPnL[dateStr].count += 1
    })

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Monthly stats
    const monthlyTrades = trades.filter(t => t.trade_date && isSameMonth(new Date(t.trade_date), currentMonth))
    const monthlyPnL = monthlyTrades.reduce((sum, t) => sum + t.profit_usd, 0)
    const activeDays = new Set(monthlyTrades.map(t => t.trade_date.split('T')[0])).size

    // Calendar logic helpers
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const weeks: Date[][] = []
    let currentWeek: Date[] = []

    calendarDays.forEach((day, i) => {
        currentWeek.push(day)
        if (currentWeek.length === 7) {
            weeks.push(currentWeek)
            currentWeek = []
        }
    })

    return (
        <div className="space-y-6">
            {/* Monthly Stats Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                            className="p-1 hover:bg-muted rounded border"
                        >
                            &larr;
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                            className="p-1 hover:bg-muted rounded border"
                        >
                            &rarr;
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 items-center">
                    <div className="text-sm">
                        <span className="text-muted-foreground mr-2">Monthly stats:</span>
                        <span className={`font-bold ${monthlyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {monthlyPnL >= 0 ? '+' : ''}${monthlyPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="text-sm">
                        <span className="font-bold">{activeDays} days</span>
                        <span className="text-muted-foreground ml-1">| {monthlyTrades.length} trades</span>
                    </div>
                </div>
            </div>

            {/* High-Density Calendar Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[340px] md:min-w-[800px]">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 md:grid-cols-[repeat(7,1fr)_120px] mb-2 border-b pb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                        <div className="hidden md:block text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Weekly
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="space-y-1">
                        {weeks.map((week, weekIdx) => {
                            // Calculate weekly P&L
                            let weeklyPnL = 0
                            let weeklyDays = 0
                            week.forEach(day => {
                                const dateStr = format(day, 'yyyy-MM-dd')
                                if (dailyPnL[dateStr] && isSameMonth(day, currentMonth)) {
                                    weeklyPnL += dailyPnL[dateStr].amount
                                    weeklyDays += 1
                                }
                            })

                            return (
                                <div key={weekIdx} className="grid grid-cols-7 md:grid-cols-[repeat(7,1fr)_120px] gap-1 min-h-[60px] md:min-h-[100px]">
                                    {week.map((day, dayIdx) => {
                                        const dateStr = format(day, 'yyyy-MM-dd')
                                        const stats = dailyPnL[dateStr]
                                        const isOutside = !isSameMonth(day, currentMonth)

                                        let cellClass = "relative border rounded-lg p-1 md:p-2 transition-all flex flex-col justify-between "
                                        if (isOutside) {
                                            cellClass += "bg-muted/5 opacity-20 text-muted-foreground/30"
                                        } else if (stats) {
                                            cellClass += stats.amount >= 0
                                                ? "bg-green-500/10 border-green-500/20"
                                                : "bg-red-500/10 border-red-500/20"
                                        } else {
                                            cellClass += "bg-card/50 hover:bg-muted/20"
                                        }

                                        return (
                                            <div
                                                key={dayIdx}
                                                className={cellClass}
                                                onClick={() => {
                                                    // On mobile, if there are multiple trades, maybe we just show day details
                                                    // but for now, we'll let existing modal handle it if selectedTrade set
                                                }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-[9px] md:text-xs font-medium ${isOutside ? '' : 'text-muted-foreground'}`}>
                                                        {format(day, 'd')}
                                                    </span>
                                                </div>

                                                {!isOutside && stats ? (
                                                    <div className="flex flex-col items-center justify-center flex-1">
                                                        <div className={`text-[10px] md:text-sm font-bold ${stats.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {stats.amount >= 0 ? '+' : '-'}${Math.abs(stats.amount) >= 1000
                                                                ? `${(Math.abs(stats.amount) / 1000).toFixed(0)}K`
                                                                : Math.abs(stats.amount) >= 100
                                                                    ? Math.abs(stats.amount).toFixed(0)
                                                                    : Math.abs(stats.amount).toFixed(0)}
                                                        </div>
                                                        {/* On mobile, just a tiny indicator for multiple trades */}
                                                        <div className="hidden md:flex flex-col gap-1 w-full mt-1">
                                                            {trades
                                                                .filter(t => t.trade_date && t.trade_date.split('T')[0] === dateStr)
                                                                .map(trade => (
                                                                    <button
                                                                        key={trade.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setSelectedTrade(trade)
                                                                        }}
                                                                        className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${trade.profit_usd >= 0
                                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                                                            }`}
                                                                    >
                                                                        <span className="truncate">{trade.pair}</span>
                                                                        {trade.profit_usd >= 0 ? <TrendingUp size={8} className="ml-0.5 shrink-0" /> : <TrendingDown size={8} className="ml-0.5 shrink-0" />}
                                                                    </button>
                                                                ))
                                                            }
                                                        </div>
                                                        <div className="md:hidden mt-0.5">
                                                            {stats.count > 1 && <span className="text-[8px] text-muted-foreground">({stats.count})</span>}
                                                        </div>
                                                    </div>
                                                ) : !isOutside && (
                                                    <div className="flex-1" />
                                                )}
                                            </div>
                                        )
                                    })}

                                    {/* Weekly Stats Cell - Hidden on small mobile */}
                                    <div className="hidden md:flex bg-muted/20 border border-dashed rounded-lg p-2 flex-col justify-center items-center text-center">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Week {weekIdx + 1}</div>
                                        <div className={`text-sm font-bold ${weeklyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {weeklyPnL >= 0 ? '+' : '-'}${Math.abs(weeklyPnL) >= 1000
                                                ? `${(Math.abs(weeklyPnL) / 1000).toFixed(1)}K`
                                                : Math.abs(weeklyPnL).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {weeklyDays} day{weeklyDays !== 1 && 's'}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <TradeDetailsModal
                trade={selectedTrade}
                isOpen={!!selectedTrade}
                onClose={() => setSelectedTrade(null)}
            />
        </div>
    )
}
