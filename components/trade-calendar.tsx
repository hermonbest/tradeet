'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from 'date-fns'
import { TradeDetailsModal } from './trade-details-modal'
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'

export function TradeCalendar({ trades }: { trades: any[] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedTrade, setSelectedTrade] = useState<any | null>(null)

    // FIX: avoid mutating existing Date — always create fresh Date objects
    const goToPrev = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    const goToNext = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

    // Aggregate P&L by date
    const dailyPnL: Record<string, { amount: number, count: number }> = {}
    trades.forEach(trade => {
        if (!trade.trade_date) return
        const dateStr = trade.trade_date.split('T')[0]
        if (!dailyPnL[dateStr]) dailyPnL[dateStr] = { amount: 0, count: 0 }
        dailyPnL[dateStr].amount += trade.profit_usd || 0
        dailyPnL[dateStr].count += 1
    })

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)

    // Monthly stats
    const monthlyTrades = trades.filter(t => t.trade_date && isSameMonth(new Date(t.trade_date), currentMonth))
    const monthlyPnL = monthlyTrades.reduce((sum, t) => sum + (t.profit_usd || 0), 0)
    const activeDays = new Set(monthlyTrades.map(t => t.trade_date.split('T')[0])).size

    // Build calendar weeks
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const weeks: Date[][] = []
    let currentWeek: Date[] = []
    calendarDays.forEach(day => {
        currentWeek.push(day)
        if (currentWeek.length === 7) {
            weeks.push(currentWeek)
            currentWeek = []
        }
    })

    return (
        <div className="space-y-5">
            {/* Monthly Stats Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/20 px-5 py-4 rounded-xl border border-border/60">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold tracking-tight">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-1">
                        <button
                            onClick={goToPrev}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/40 transition-all"
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/40 transition-all"
                            aria-label="Next month"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-5 items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">Monthly P&L</span>
                        <span className={`num text-base font-bold ${monthlyPnL >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                            {monthlyPnL >= 0 ? '+' : ''}${monthlyPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">Active Days</span>
                        <span className="num text-base font-bold">{activeDays}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">Trades</span>
                        <span className="num text-base font-bold">{monthlyTrades.length}</span>
                    </div>
                </div>
            </div>

            {/* High-Density Calendar Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[340px] md:min-w-[800px]">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 md:grid-cols-[repeat(7,1fr)_120px] mb-2 border-b border-border/30 pb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                        <div className="hidden md:block text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Weekly
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="space-y-1">
                        {weeks.map((week, weekIdx) => {
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

                                        let cellClass = 'relative border rounded-lg p-1 md:p-2 transition-all flex flex-col justify-between '
                                        if (isOutside) {
                                            cellClass += 'border-border/10 bg-muted/5 opacity-20'
                                        } else if (stats) {
                                            cellClass += stats.amount >= 0
                                                ? 'bg-green-500/8 border-green-500/25 hover:border-green-500/40'
                                                : 'bg-red-500/8 border-red-500/25 hover:border-red-500/40'
                                        } else {
                                            cellClass += 'bg-card/40 border-border/40 hover:bg-muted/20 hover:border-border/60'
                                        }

                                        return (
                                            <div key={dayIdx} className={cellClass} title={dateStr}>
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-[9px] md:text-[11px] font-semibold ${isOutside ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}>
                                                        {format(day, 'd')}
                                                    </span>
                                                </div>

                                                {!isOutside && stats ? (
                                                    <div className="flex flex-col items-center justify-center flex-1 min-h-0">
                                                        <div className={`text-[10px] md:text-sm font-bold num ${stats.amount >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                            {stats.amount >= 0 ? '+' : '-'}${Math.abs(stats.amount) >= 1000
                                                                ? `${(Math.abs(stats.amount) / 1000).toFixed(1)}K`
                                                                : Math.abs(stats.amount).toFixed(0)}
                                                        </div>
                                                        {/* Desktop: clickable trade pills */}
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
                                                                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                                                            : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                                                            }`}
                                                                    >
                                                                        <span className="truncate">{trade.pair}</span>
                                                                        {trade.profit_usd >= 0
                                                                            ? <TrendingUp size={8} className="ml-0.5 shrink-0" />
                                                                            : <TrendingDown size={8} className="ml-0.5 shrink-0" />}
                                                                    </button>
                                                                ))
                                                            }
                                                        </div>
                                                        {/* Mobile: trade count */}
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

                                    {/* Weekly Stats Cell */}
                                    <div className="hidden md:flex bg-muted/10 border border-dashed border-border/40 rounded-lg p-2 flex-col justify-center items-center text-center">
                                        <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">Wk {weekIdx + 1}</div>
                                        {weeklyDays > 0 ? (
                                            <>
                                                <div className={`num text-sm font-bold ${weeklyPnL >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                    {weeklyPnL >= 0 ? '+' : '-'}${Math.abs(weeklyPnL) >= 1000
                                                        ? `${(Math.abs(weeklyPnL) / 1000).toFixed(1)}K`
                                                        : Math.abs(weeklyPnL).toFixed(0)}
                                                </div>
                                                <div className="text-[9px] text-muted-foreground mt-0.5">
                                                    {weeklyDays} day{weeklyDays !== 1 && 's'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-[9px] text-muted-foreground/40">—</div>
                                        )}
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
