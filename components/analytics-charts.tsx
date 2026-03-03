'use client'

import { TrendingUp, TrendingDown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WinRateRingProps {
    data: any[]
    winRateChange?: number
}

export function WinRateRing({ data, winRateChange = 0 }: WinRateRingProps) {
    const winners = data.filter(t => (t.profit_usd || 0) > 0).length
    const losers = data.filter(t => (t.profit_usd || 0) < 0).length
    const breakevens = data.filter(t => (t.profit_usd || 0) === 0).length

    const decisiveTrades = winners + losers
    const winRate = decisiveTrades > 0 ? (winners / decisiveTrades) * 100 : 0

    // Calculate segments for conic gradient
    // Order: Loss (red) -> Breakeven (gray) -> Win (green)
    const lossPercent = decisiveTrades > 0 ? (losers / decisiveTrades) * 100 : 0
    const breakevenPercent = decisiveTrades > 0 ? (breakevens / decisiveTrades) * 100 : 0
    const winPercent = decisiveTrades > 0 ? (winners / decisiveTrades) * 100 : 0

    // Build conic gradient - starting from top (rotate 180 in CSS)
    // Loss starts at 0%, breakeven continues, win finishes
    const gradientStops = [
        `#ef4444 0% ${lossPercent}%`,
        `#3f3f46 ${lossPercent}% ${lossPercent + breakevenPercent}%`,
        `#22c55e ${lossPercent + breakevenPercent}% 100%`
    ]

    return (
        <>
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `conic-gradient(${gradientStops.join(', ')})`,
                    mask: 'radial-gradient(transparent 62%, black 63%)',
                    WebkitMask: 'radial-gradient(transparent 62%, black 63%)',
                }}
            />
            <div className="text-center relative z-10">
                <span className="text-xl font-bold num block">{winRate.toFixed(0)}%</span>
                {data.length > 0 && (
                    <span className={cn(
                        "text-[10px] font-bold",
                        winRateChange >= 0 ? "text-profit" : "text-loss"
                    )}>
                        {winRateChange >= 0 ? '+' : ''}{winRateChange.toFixed(1)}%
                    </span>
                )}
            </div>
        </>
    )
}

interface TradeScoreRadarProps {
    stats: {
        winRate: number
        profitFactor: number
        consistency: number
        rrRatio: number
        tradeCount: number
    }
    isPro: boolean
}

export function TradeScoreRadar({ stats, isPro }: TradeScoreRadarProps) {
    // Calculate performance score (0-100)
    const winRateScore = Math.min(stats.winRate, 100) * 0.3
    const pfScore = Math.min(stats.profitFactor / 5 * 100, 100) * 0.3
    const consistencyScore = Math.min(stats.consistency, 100) * 0.2
    const rrScore = Math.min(stats.rrRatio / 4 * 100, 100) * 0.2

    let totalScore = winRateScore + pfScore + consistencyScore + rrScore

    // Penalty for very low trade count
    if (stats.tradeCount < 5) totalScore *= 0.5
    else if (stats.tradeCount < 10) totalScore *= 0.8

    const performanceScore = Math.round(totalScore)

    // Generate radar polygon points based on stats
    // Pentagon with 5 axes: Win Rate (top), Profit Factor (top-right), Consistency (bottom-right),
    // Risk Reward (bottom-left), Volume (top-left)
    const centerX = 50
    const centerY = 50
    const outerRadius = 40
    const innerRadius = 20

    // Angle for each axis (pentagon = 72 degrees apart, starting from top = -90 degrees)
    const angles = [-90, -18, 54, 126, 198] // degrees

    // Normalize values to 0-1 scale
    const values = [
        stats.winRate / 100,
        Math.min(stats.profitFactor / 5, 1),
        stats.consistency / 100,
        Math.min(stats.rrRatio / 4, 1),
        Math.min(stats.tradeCount / 50, 1)
    ]

    // Calculate points for the data polygon
    const dataPoints = angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const r = innerRadius + (outerRadius - innerRadius) * values[i]
        const x = centerX + r * Math.cos(rad)
        const y = centerY + r * Math.sin(rad)
        return `${x},${y}`
    }).join(' ')

    // Grid polygons (outer and inner pentagons)
    const outerPoints = angles.map(angle => {
        const rad = (angle * Math.PI) / 180
        const x = centerX + outerRadius * Math.cos(rad)
        const y = centerY + outerRadius * Math.sin(rad)
        return `${x},${y}`
    }).join(' ')

    const innerGridPoints = angles.map(angle => {
        const rad = (angle * Math.PI) / 180
        const x = centerX + innerRadius * Math.cos(rad)
        const y = centerY + innerRadius * Math.sin(rad)
        return `${x},${y}`
    }).join(' ')

    // Axis lines from center to each vertex
    const axisLines = angles.map(angle => {
        const rad = (angle * Math.PI) / 180
        const x = centerX + outerRadius * Math.cos(rad)
        const y = centerY + outerRadius * Math.sin(rad)
        return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="currentColor" stroke-width="0.5" />`
    }).join('')

    return (
        <>
            <svg className="w-full h-full text-muted-foreground/30" viewBox="0 0 100 100">
                {/* Outer grid */}
                <polygon fill="none" points={outerPoints} stroke="currentColor" strokeWidth="1" />
                {/* Inner grid */}
                <polygon fill="none" points={innerGridPoints} stroke="currentColor" strokeWidth="0.5" />
                {/* Axis lines */}
                <g dangerouslySetInnerHTML={{ __html: axisLines }} />
            </svg>

            {/* Data polygon */}
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                <polygon
                    fill="rgba(124, 58, 237, 0.4)"
                    points={dataPoints}
                    stroke="#7C3AED"
                    strokeWidth="1.5"
                />
            </svg>

            {/* Score in center */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary num">{performanceScore}</span>
            </div>
        </>
    )
}
