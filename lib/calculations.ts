export function calculateWinRate(trades: any[]) {
    if (!trades || trades.length === 0) return 0
    const winningTrades = trades.filter((t) => t.profit_usd > 0).length
    return (winningTrades / trades.length) * 100
}

export function calculateProfitFactor(trades: any[]) {
    if (!trades || trades.length === 0) return 0

    let grossProfit = 0
    let grossLoss = 0

    trades.forEach((t) => {
        if (t.profit_usd > 0) grossProfit += t.profit_usd
        if (t.profit_usd < 0) grossLoss += Math.abs(t.profit_usd)
    })

    if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
    return grossProfit / grossLoss
}

export function calculateExpectancy(trades: any[]) {
    if (!trades || trades.length === 0) return 0

    const winningTrades = trades.filter((t) => t.profit_usd > 0)
    const losingTrades = trades.filter((t) => t.profit_usd < 0)

    const winRate = winningTrades.length / trades.length
    const lossRate = losingTrades.length / trades.length

    const avgWin = winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.profit_usd, 0) / winningTrades.length
        : 0

    const avgLoss = losingTrades.length > 0
        ? losingTrades.reduce((sum, t) => sum + Math.abs(t.profit_usd), 0) / losingTrades.length
        : 0

    return (winRate * avgWin) - (lossRate * avgLoss)
}

export function calculateDrawdown(trades: any[]) {
    if (!trades || trades.length === 0) return 0

    // Drawdown needs sequential ordering to simulate equity curve
    const sortedTrades = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime() || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    let maxDrawdown = 0
    let peak = 0
    let currentEquity = 0

    sortedTrades.forEach((t) => {
        currentEquity += t.profit_usd
        if (currentEquity > peak) {
            peak = currentEquity
        }

        // Drawdown from peak
        const currentDrawdown = peak - currentEquity
        if (currentDrawdown > maxDrawdown) {
            maxDrawdown = currentDrawdown
        }
    })

    return maxDrawdown
}

export function calculateNetPnL(trades: any[]) {
    if (!trades || trades.length === 0) return 0
    return trades.reduce((sum, t) => sum + (t.profit_usd || 0), 0)
}

export function calculateAverageWin(trades: any[]) {
    const winners = trades.filter((t) => (t.profit_usd || 0) > 0)
    if (winners.length === 0) return 0
    return winners.reduce((sum, t) => sum + t.profit_usd, 0) / winners.length
}

export function calculateAverageLoss(trades: any[]) {
    const losers = trades.filter((t) => (t.profit_usd || 0) < 0)
    if (losers.length === 0) return 0
    return losers.reduce((sum, t) => sum + t.profit_usd, 0) / losers.length
}
