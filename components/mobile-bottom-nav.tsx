'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListTodo, CalendarDays, Settings, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  className?: string
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/trades', label: 'Trades', icon: ListTodo },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 glass-effect px-6 py-4 pb-8 safe-area-bottom shadow-none border-none md:hidden",
      className
    )}>
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors duration-200",
                isActive ? "text-[#7C3AED]" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>

    </nav>
  )
}
