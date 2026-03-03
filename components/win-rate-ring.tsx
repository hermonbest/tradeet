'use client'

interface WinRateRingProps {
    winRate: number
    size?: number
    className?: string
}

export function WinRateRing({ winRate, size = 112, className = '' }: WinRateRingProps) {
    // Calculate the conic gradient percentages
    // Win rate is the green portion at the end
    // Loss rate is red at the beginning
    // Neutral is the middle (grey)
    const lossPercent = Math.max(0, Math.min(100, 100 - winRate - 10))
    const neutralPercent = Math.max(0, Math.min(100, 100 - winRate))
    
    const change = winRate >= 50 ? '+2.4%' : '-1.2%'
    const changeColor = winRate >= 50 ? 'text-[#10B981]' : 'text-[#EF4444]'

    return (
        <div 
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Conic gradient ring */}
            <div 
                className="absolute inset-0 rounded-full win-rate-ring"
                style={{ 
                    '--loss-percent': `${lossPercent}%`,
                    '--neutral-percent': `${neutralPercent}%`,
                    transform: 'rotate(180deg)'
                } as React.CSSProperties}
            />
            
            {/* Inner content */}
            <div className="relative z-10 text-center">
                <span className="text-xl font-bold block">{winRate}%</span>
                <span className={`text-[10px] font-bold ${changeColor}`}>{change}</span>
            </div>
        </div>
    )
}
