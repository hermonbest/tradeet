import { createClient } from '@/utils/supabase/server'
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
import { TrendingUp, TrendingDown, Plus, LayoutDashboard, Lock, Zap } from 'lucide-react'
import { DashboardStats } from '@/components/dashboard-stats'

import { WinRateDonut, EquityCurveChart, WinRateByDaysDonut, DailyPnLChart, ProgressHeatmap, PerformanceRadarChart } from '@/components/dashboard-charts'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userData?.user?.id).single()

    const isPro = profile?.role === 'pro' || profile?.role === 'admin'
    const isAdmin = profile?.role === 'admin'

    // Fetch trades
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userData?.user?.id)
        .order('trade_date', { ascending: false })
        .order('created_at', { ascending: false })

    const tradesList = trades || []
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
        <div className="p-6 lg:p-8 space-y-8 min-h-screen">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Hero stat with glow */}
                <DashboardStats
                    title="Total Net P&L"
                    value={`$${netPnLUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    subtitle={`≈ ETB ${netPnLEtb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    type={netPnLType}
                    glow={true}
                    icon={netPnLUsd >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                />

                <DashboardStats
                    title="Profit Factor"
                    value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
                    subtitle="Gross wins / Gross losses"
                    type={profitFactor >= 1 ? 'profit' : 'loss'}
                />

                <DashboardStats
                    title="Avg. Winning Trade"
                    value={`$${avgWin.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    subtitle={`From ${winnersCount} winners`}
                    type="profit"
                />

                <DashboardStats
                    title="Avg. Losing Trade"
                    value={`-$${Math.abs(avgLoss).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    subtitle={`From ${losersCount} losers`}
                    type="loss"
                />
            </div>

            {/* ── Grid: Left Metrics + Right Charts ── */}
            <div className="grid gap-6 lg:grid-cols-4">
                {/* Left Column: Metrics & Tracker */}
                <div className="space-y-4 lg:col-span-1">
                    <Card className="tradeet-card">
                        <CardHeader className="pb-2 px-4 pt-4">
                            <CardTitle className="text-xs font-semibold flex items-center justify-between text-foreground">
                                Trade Score
                                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">PRO</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 relative">
                            {!isPro && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[3px] rounded-xl p-4 text-center">
                                    <Lock className="w-8 h-8 text-primary mb-2 opacity-80" />
                                    <h3 className="text-sm font-bold text-foreground">Unlock Zella Score</h3>
                                    <p className="text-[10px] text-muted-foreground mt-1 mb-3 px-4">
                                        Advanced performance metrics are reserved for Pro members.
                                    </p>
                                    <Button asChild size="sm" className="h-7 px-3 text-[10px] rounded-lg">
                                        <a href="/upgrade">Upgrade Now</a>
                                    </Button>
                                </div>
                            )}
                            <div className={!isPro ? 'opacity-20 grayscale' : ''}>
                                <PerformanceRadarChart stats={radarStats} />
                            </div>
                            <div className="mt-4 text-center">
                                <span className="stat-label">Performance Score</span>
                                <div className="num text-2xl font-bold text-primary mt-1">
                                    {isPro ? `${performanceScore} / 100` : '?? / 100'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="tradeet-card">
                        <CardHeader className="pb-2 px-4 pt-4 flex flex-row items-center justify-between">
                            <CardTitle className="stat-label">Progress Tracker</CardTitle>
                            <Badge className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/30 text-[9px] h-4">BETA</Badge>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <ProgressHeatmap data={tradesList} />
                            <div className="mt-4 flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                                <span>Today</span>
                                <span className="font-bold text-foreground num">0/3 Trades</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4">
                        <DashboardStats
                            title="Expectancy"
                            value={`$${expectancy.toFixed(2)}`}
                            type={expectancy >= 0 ? 'profit' : 'loss'}
                        />
                        <DashboardStats
                            title="Max Drawdown"
                            value={`-$${Math.abs(maxDrawdown).toFixed(2)}`}
                            type="loss"
                        />
                    </div>
                </div>

                {/* Center/Right Column: Charts */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="tradeet-card overflow-hidden">
                            <CardHeader className="border-b border-border px-4 pt-4 pb-3">
                                <CardTitle className="text-sm font-semibold text-foreground">Winning % By Trades</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 px-4 pb-4">
                                <WinRateDonut data={tradesList} />
                                <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                                        <span className="text-muted-foreground">{winnersCount} winners</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                                        <span className="text-muted-foreground">{losersCount} losers</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]" />
                                        <span className="text-muted-foreground">{breakevensCount} breakevens</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="tradeet-card overflow-hidden">
                            <CardHeader className="border-b border-border px-4 pt-4 pb-3">
                                <CardTitle className="text-sm font-semibold text-foreground">Winning % By Days</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 px-4 pb-4">
                                <WinRateByDaysDonut data={tradesList} />
                                <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                                        <span className="text-muted-foreground">{dailyWinners} winners</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                                        <span className="text-muted-foreground">{dailyLosers} losers</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]" />
                                        <span className="text-muted-foreground">{dailyBreakevens} breakevens</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="tradeet-card">
                            <CardHeader className="border-b border-border px-4 pt-4 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-foreground">Performance History</CardTitle>
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className="text-[9px] py-0 cursor-pointer bg-primary/20 text-primary border-primary/30">Daily Cumulative</Badge>
                                        <Badge variant="outline" className="text-[9px] py-0 cursor-pointer text-muted-foreground border-border">Net P&L</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <EquityCurveChart data={tradesList} />
                            </CardContent>
                        </Card>

                        <Card className="tradeet-card">
                            <CardHeader className="border-b border-border px-4 pt-4 pb-3">
                                <CardTitle className="stat-label">Net Daily P&L</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <DailyPnLChart data={tradesList} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

        </div>
    )
}
