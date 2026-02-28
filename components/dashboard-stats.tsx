import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardStatsProps {
    title: string
    value: string | number
    subtitle?: string
    type?: 'profit' | 'loss' | 'neutral'
    icon?: React.ReactNode
    /** Apply the glow effect on the hero stat */
    glow?: boolean
}

export function DashboardStats({
    title,
    value,
    subtitle,
    type = 'neutral',
    icon,
    glow = false,
}: DashboardStatsProps) {
    const valueColor = {
        profit: 'text-[#22c55e]',
        loss: 'text-[#ef4444]',
        neutral: 'text-foreground',
    }[type]

    const glowClass = glow
        ? type === 'profit'
            ? 'profit-glow'
            : type === 'loss'
                ? 'loss-glow'
                : ''
        : ''

    return (
        <Card className="tradeet-card border-zinc-800 hover:border-zinc-700 transition-colors duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                {/* Label: small, uppercase, muted */}
                <span className="stat-label text-[10px] lg:text-xs">{title}</span>
                {icon && (
                    <span className={cn('opacity-60 scale-75 lg:scale-100', valueColor)}>{icon}</span>
                )}
            </CardHeader>
            <CardContent className="px-3 pb-3">
                {/* Value: large, bold, monospace */}
                <div
                    className={cn(
                        'num text-xl lg:text-2xl font-bold leading-none',
                        valueColor,
                        glowClass
                    )}
                >
                    {value}
                </div>
                {subtitle && (
                    <p className="text-[10px] text-muted-foreground mt-1 num truncate">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    )
}
