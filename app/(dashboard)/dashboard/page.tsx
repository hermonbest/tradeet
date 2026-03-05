import type { Metadata } from "next";
import { unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { TradeList } from '@/components/trade-list'
import { AddTradeDialog } from '@/components/add-trade-dialog'
import { ExchangeRateInput } from '@/components/exchange-rate-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    calculateWinRate,
    calculateProfitFactor,
    calculateExpectancy,
    calculateDrawdown,
    calculateNetPnL,
    calculateAverageWin,
    calculateAverageLoss,
    calculatePerformanceScore,
} from '@/lib/calculations'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Plus, LayoutDashboard, Lock, Zap, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardStats } from '@/components/dashboard-stats'

import { WinRateDonut, EquityCurveChart, WinRateByDaysDonut, DailyPnLChart, ProgressHeatmap, PerformanceRadarChart } from '@/components/dashboard-charts'

// Cached data fetching functions
const getCachedTrades = unstable_cache(
    async (userId: string) => {
        const supabase = createAdminClient()
        const { data: trades } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', userId)
            .order('trade_date', { ascending: false })
            .order('created_at', { ascending: false })
        return trades || []
    },
    ['trades'],
    { revalidate: 60, tags: ['trades'] }
)

const getCachedProfile = unstable_cache(
    async (userId: string) => {
        const supabase = createAdminClient()
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        return profile
    },
    ['profile'],
    { revalidate: 300, tags: ['profile'] }
)

export const metadata: Metadata = {
    title: "Dashboard — Your Trading Performance Analytics",
    description: "View your trading performance metrics, equity curve, win rate analysis, and P&L tracking. Track your progress with ETB currency support on TradeET.",
    alternates: {
        canonical: "https://tradeet.app/dashboard",
    },
};

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
        redirect('/login')
    }

    // Use cached data fetching
    const [profile, tradesList] = await Promise.all([
        getCachedProfile(userData.user.id),
        getCachedTrades(userData.user.id)
    ])

    const isPro = profile?.role === 'pro' || profile?.role === 'admin'
    const isAdmin = profile?.role === 'admin'
    const exchangeRate = profile?.exchange_rate || 115

    const winRate = calculateWinRate(tradesList)
    const profitFactor = calculateProfitFactor(tradesList)
    const expectancy = calculateExpectancy(tradesList)
    const maxDrawdown = calculateDrawdown(tradesList)
    const netPnLUsd = calculateNetPnL(tradesList)
    const netPnLEtb = netPnLUsd * exchangeRate
    const avgWin = calculateAverageWin(tradesList)
    const avgLoss = calculateAverageLoss(tradesList)

    // Winners vs Losers count
    const winnersCount = tradesList.filter(t => t.profit_usd > 0).length
    const losersCount = tradesList.filter(t => t.profit_usd < 0).length
    const breakevensCount = tradesList.filter(t => t.profit_usd === 0).length

    // Daily winners vs losers
    const dailyPnLMap: Record<string, number> = {}
    tradesList.forEach(t => {
        const date = t.trade_date.split('T')[0]
        dailyPnLMap[date] = (dailyPnLMap[date] || 0) + (t.profit_usd || 0)
    })
    const dailyWinners = Object.values(dailyPnLMap).filter(v => v > 0).length
    const dailyLosers = Object.values(dailyPnLMap).filter(v => v < 0).length
    const dailyBreakevens = Object.values(dailyPnLMap).filter(v => v === 0).length

    // Dummy consistency/RR for radar
    const radarStats = {
        winRate,
        profitFactor: profitFactor === Infinity ? 5 : profitFactor,
        consistency: Math.min(Object.keys(dailyPnLMap).length * 10, 100),
        rrRatio: avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 1,
        tradeCount: tradesList.length
    }

    const performanceScore = calculatePerformanceScore(radarStats)

    const netPnLType = netPnLUsd >= 0 ? 'profit' : 'loss'

    return (
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 min-h-screen">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Trading Overview</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="w-full sm:w-auto"><ExchangeRateInput initialRate={exchangeRate} /></div>
                    <div className="w-full sm:w-auto"><AddTradeDialog /></div>
                </div>
            </div>

            {/* ── Main Stats Row ── */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* Hero stat with glow */}
                <DashboardStats
                    title="Total Net P&L"
                    value={`$${netPnLUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    subtitle={`≈ ETB ${netPnLEtb.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    type={netPnLType}
                    glow={true}
                    icon={netPnLUsd >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                />

                <DashboardStats
                    title="Profit Factor"
                    value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
                    subtitle="Wins / Losses"
                    type={profitFactor >= 1 ? 'profit' : 'loss'}
                />

                <DashboardStats
                    title="Expectancy"
                    value={`$${expectancy.toFixed(2)}`}
                    subtitle="Per trade"
                    type={expectancy >= 0 ? 'profit' : 'loss'}
                />

                <DashboardStats
                    title="Max Drawdown"
                    value={`-$${Math.abs(maxDrawdown).toFixed(2)}`}
                    subtitle="Peak to trough"
                    type="loss"
                />

                <DashboardStats
                    title="Avg. Win"
                    value={`$${avgWin.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                    subtitle={`${winnersCount} wins`}
                    type="profit"
                />

                <DashboardStats
                    title="Avg. Loss"
                    value={`-$${Math.abs(avgLoss).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                    subtitle={`${losersCount} losses`}
                    type="loss"
                />
            </div>

            {/* ── Grid: Left Metrics + Right Charts ── */}
            <div className="grid gap-6 lg:grid-cols-4">
                {/* Left Column: Metrics & Tracker */}
                <div className="space-y-4 lg:col-span-1">
                    {/* Win Rate (Moved up and shrunk) */}
                    <Card className="tradeet-card">
                        <CardHeader className="pb-1 px-3 pt-3">
                            <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Win Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <div className="h-[120px]">
                                <WinRateDonut data={tradesList} />
                            </div>
                            <div className="mt-2 text-center text-xl font-bold num text-green-500">
                                {winRate.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trade Score (Refined size) */}
                    <Card className="tradeet-card">
                        <CardHeader className="pb-1 px-3 pt-3">
                            <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center justify-between">
                                Trade Score
                                <Badge variant="outline" className="text-[8px] border-primary/40 text-primary h-3">PRO</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-2 relative">
                            {!isPro && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl p-2 text-center">
                                    <Lock size={16} className="text-primary mb-1 opacity-80" />
                                    <h3 className="text-[10px] font-bold text-foreground">Unlock Score</h3>
                                    <Button asChild size="sm" className="h-6 px-2 text-[8px] rounded mt-1">
                                        <a href="/upgrade">Upgrade</a>
                                    </Button>
                                </div>
                            )}
                            <div className={cn("h-[140px]", !isPro ? 'opacity-20 grayscale' : '')}>
                                <PerformanceRadarChart stats={radarStats} />
                            </div>
                            <div className="mt-2 text-center">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Performance</span>
                                <div className="num text-lg font-bold text-primary mt-0.5">
                                    {isPro ? `${performanceScore}/100` : '??/100'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="tradeet-card">
                        <CardHeader className="pb-1 px-3 pt-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tracker</CardTitle>
                            <Badge className="bg-amber-500/20 text-amber-400 border-none text-[8px] h-3">BETA</Badge>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <ProgressHeatmap data={tradesList} />
                        </CardContent>
                    </Card>
                </div>

                {/* Center/Right Column: Charts */}
                <div className="lg:col-span-3 space-y-4 lg:space-y-6">
                    {/* High-Density Chart Grid */}
                    <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2">
                        {/* Cumulative P&L / Equity Curve */}
                        <Card className="tradeet-card md:col-span-2">
                            <CardHeader className="pb-1 px-3 pt-3">
                                <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Performance History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 h-[180px] lg:h-[300px]">
                                <EquityCurveChart data={tradesList} />
                            </CardContent>
                        </Card>

                        {/* Net Daily P&L Bar Chart */}
                        <Card className="tradeet-card md:col-span-2">
                            <CardHeader className="pb-1 px-3 pt-3">
                                <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Net Daily P&L</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 h-[180px] lg:h-[300px]">
                                <DailyPnLChart data={tradesList} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

        </div>
    )
}
