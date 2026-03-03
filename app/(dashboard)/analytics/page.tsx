'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    calculateWinRate,
    calculateProfitFactor,
    calculateNetPnL,
    calculateAverageWin,
    calculateAverageLoss,
    calculatePerformanceScore,
} from '@/lib/calculations'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { WinRateRing, TradeScoreRadar } from '@/components/analytics-charts'
import { FloatingActionButton } from '@/components/floating-action-button'
import { format } from 'date-fns'

export default function AnalyticsPage() {
    const [tradesList, setTradesList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    // Fetch data on mount
    useEffect(() => {
        async function fetchData() {
            const supabase = await createClient()
            const { data: userData } = await supabase.auth.getUser()
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userData?.user?.id).single()
            setProfile(profileData)

            const { data: trades } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', userData?.user?.id)
                .order('trade_date', { ascending: false })
                .order('created_at', { ascending: false })

            setTradesList(trades || [])
            setLoading(false)
        }
        fetchData()
    }, [])

    const exchangeRate = profile?.exchange_rate || 115
    const isPro = profile?.role === 'pro' || profile?.role === 'admin'

    // Calculate metrics
    const winRate = calculateWinRate(tradesList)
    const profitFactor = calculateProfitFactor(tradesList)
    const netPnLUsd = calculateNetPnL(tradesList)
    const avgWin = calculateAverageWin(tradesList)
    const avgLoss = calculateAverageLoss(tradesList)

    // Trade counts
    const activeDays = new Set(tradesList.map(t => t.trade_date.split('T')[0])).size

    // Performance score radar stats
    const dailyPnLMap: Record<string, number> = {}
    tradesList.forEach(t => {
        const date = t.trade_date.split('T')[0]
        dailyPnLMap[date] = (dailyPnLMap[date] || 0) + (t.profit_usd || 0)
    })

    const radarStats = {
        winRate,
        profitFactor: profitFactor === Infinity ? 5 : profitFactor,
        consistency: Math.min(Object.keys(dailyPnLMap).length * 10, 100),
        rrRatio: avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 1,
        tradeCount: tradesList.length
    }

    const performanceScore = calculatePerformanceScore(radarStats)

    // Win rate change (dummy for now - could be calculated from previous period)
    const winRateChange = 2.4

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pb-24">
                <header className="px-5 pt-2 pb-4 flex justify-between items-center">
                    <div>
                        <div className="h-7 w-40 bg-zinc-800 rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse"></div>
                    </div>
                </header>
                <main className="px-5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-40 bg-zinc-800/50 rounded-3xl animate-pulse"></div>
                        <div className="h-40 bg-zinc-800/50 rounded-3xl animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 bg-zinc-800/50 rounded-2xl animate-pulse"></div>
                        <div className="h-20 bg-zinc-800/50 rounded-2xl animate-pulse"></div>
                        <div className="h-20 bg-zinc-800/50 rounded-2xl animate-pulse"></div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pb-24">
            <header className="px-5 pt-2 pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Trade Analytics</h1>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                        {format(new Date(), 'MMMM')} Performance
                    </p>
                </div>
                <button 
                    className="bg-[#7C3AED] text-white p-2.5 rounded-full shadow-lg shadow-[#7C3AED]/20 flex items-center justify-center hover:bg-[#7C3AED]/90 transition-colors"
                >
                    <TrendingUp className="w-5 h-5" />
                </button>
            </header>

            {/* Main Content */}
            <main className="px-5 space-y-6">
                {/* Win Rate & Trade Score Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Win Rate Card */}
                    <Card className="bg-[#121212] border-[#27272A] rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                        <span className="absolute top-3 left-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Win Rate</span>
                        <div className="relative w-28 h-28 flex items-center justify-center mt-4">
                            <WinRateRing data={tradesList} winRateChange={winRateChange} />
                        </div>
                    </Card>

                    {/* Trade Score Card */}
                    <Card className="bg-[#121212] border-[#27272A] rounded-3xl p-4 flex flex-col items-center justify-center relative">
                        <div className="absolute top-3 left-4 flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Trade Score</span>
                            {isPro && (
                                <Badge className="bg-[#7C3AED]/20 text-[#7C3AED] text-[8px] px-1.5 py-0.5 rounded font-black uppercase border-[#7C3AED]/30">Pro</Badge>
                            )}
                        </div>
                        <div className="w-28 h-28 mt-4 relative flex items-center justify-center">
                            <TradeScoreRadar stats={radarStats} isPro={isPro} />
                        </div>
                    </Card>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-[#121212] border-[#27272A] rounded-2xl p-3">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Total P&L</p>
                        <p className={`font-mono font-bold num ${netPnLUsd >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {netPnLUsd >= 0 ? '+' : ''}${netPnLUsd.toFixed(2)}
                        </p>
                    </Card>
                    <Card className="bg-[#121212] border-[#27272A] rounded-2xl p-3">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Active</p>
                        <p className="text-white font-mono font-bold num">{activeDays} Days</p>
                    </Card>
                    <Card className="bg-[#121212] border-[#27272A] rounded-2xl p-3">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Trades</p>
                        <p className="text-white font-mono font-bold num">{tradesList.length}</p>
                    </Card>
                </div>

                {/* Trade History Section */}
                <section className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">History</h2>
                        <a href="/trades" className="text-xs text-[#7C3AED] font-semibold hover:underline">View all</a>
                    </div>
                    <div className="space-y-3">
                        {tradesList.slice(0, 5).map((trade, index) => {
                            const isProfit = trade.profit_usd > 0
                            const isLoss = trade.profit_usd < 0
                            const isBreakeven = trade.profit_usd === 0

                            return (
                                <div
                                    key={trade.id || index}
                                    className={`bg-card border border-border rounded-3xl p-4 flex items-center justify-between ${isBreakeven ? 'opacity-80' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                            isProfit ? 'bg-[#10B981]/10' : isLoss ? 'bg-[#EF4444]/10' : 'bg-zinc-800/10'
                                        }`}>
                                            {isProfit ? (
                                                <TrendingUp className="w-5 h-5 text-[#10B981]" />
                                            ) : isLoss ? (
                                                <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                                            ) : (
                                                <Minus className="w-5 h-5 text-zinc-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-white">{trade.pair}</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium">
                                                {format(new Date(trade.trade_date), 'MMM d, HH:mm')} • {trade.position_type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-mono font-bold ${
                                            isProfit ? 'text-[#10B981]' : isLoss ? 'text-[#EF4444]' : 'text-zinc-500'
                                        }`}>
                                            {isProfit ? '+' : isLoss ? '-' : ''}${Math.abs(trade.profit_usd).toFixed(2)}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">{trade.entry_price?.toFixed(5)}</p>
                                    </div>
                                </div>
                            )
                        })}
                        {tradesList.length === 0 && (
                            <Card className="bg-[#121212] border-[#27272A] rounded-3xl p-8 text-center">
                                <TrendingUp className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-400">No trades yet</p>
                                <p className="text-xs text-zinc-500 mt-1">Start by adding your first trade</p>
                            </Card>
                        )}
                    </div>
                </section>
            </main>

            {/* Floating Action Button */}
            <FloatingActionButton />

            {/* Mobile Navigation */}
        </div>
    )}
