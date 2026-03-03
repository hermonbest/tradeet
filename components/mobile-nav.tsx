'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileNavProps {
    activeTab?: 'dashboard' | 'trades' | 'analytics' | 'calendar' | 'settings'
}

export function MobileNav({ activeTab }: MobileNavProps) {
    const pathname = usePathname()

    const getActiveTab = () => {
        if (activeTab) return activeTab
        if (pathname.includes('/dashboard')) return 'dashboard'
        if (pathname.includes('/trades')) return 'trades'
        if (pathname.includes('/analytics')) return 'analytics'
        if (pathname.includes('/calendar')) return 'calendar'
        if (pathname.includes('/settings')) return 'settings'
        return 'dashboard'
    }

    const currentTab = getActiveTab()

    const navItems = [
        { id: 'dashboard' as const, label: 'Dashboard', icon: 'grid_view' },
        { id: 'trades' as const, label: 'Trades', icon: 'list_alt' },
        { id: 'analytics' as const, label: 'Analytics', icon: 'analytics' },
        { id: 'calendar' as const, label: 'Calendar', icon: 'calendar_today' },
        { id: 'settings' as const, label: 'Settings', icon: 'settings' },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/80 dark:bg-background/80 backdrop-blur-xl border-t border-border/40 px-8 py-4 pb-8 flex justify-between items-center z-50 lg:hidden">
            {navItems.map((item) => {
                const isActive = currentTab === item.id
                return (
                    <Link
                        key={item.id}
                        href={`/${item.id === 'dashboard' ? 'dashboard' : item.id}`}
                        className={cn(
                            "flex flex-col items-center gap-1 group transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <span className={cn(
                            "material-icons-round transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )}>
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
