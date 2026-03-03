'use client'

import Link from 'next/link'
import {
    LayoutDashboard,
    Calendar,
    Settings,
    TrendingUp,
    List,
    LogOut,
    ChevronDown,
    Zap,
    Shield,
    BarChart2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setProfile(data)
            }
            setIsLoading(false)
        }
        fetchProfile()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const isPro = profile?.role === 'pro' || profile?.role === 'admin'
    const isAdmin = profile?.role === 'admin'

    const navItems = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Trades', url: '/trades', icon: List },
        { title: 'Calendar', url: '/calendar', icon: Calendar },
        { title: 'Settings', url: '/settings', icon: Settings },
    ]

    if (!isLoading && isAdmin) {
        navItems.push({ title: 'Admin Panel', url: '/admin', icon: Shield })
    }

    // Avatar initials from email
    const initials = profile?.email
        ? profile.email.slice(0, 2).toUpperCase()
        : '??'

    return (
        <Sidebar>
            {/* Brand Header */}
            <SidebarHeader className="px-3 py-4 border-b border-sidebar-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                            <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-foreground tracking-tight">TradeET</span>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Trading Journal</p>
                        </div>
                    </div>
                    {!isLoading && isPro && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] h-4 px-1">PRO</Badge>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="stat-label px-3 py-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Navigation</SidebarGroupLabel>
                    <SidebarGroupContent className="px-1">
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <Link
                                            href={item.url}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-300 group relative",
                                                isActive
                                                    ? "bg-primary/10 text-primary font-semibold"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full animate-in fade-in slide-in-from-left duration-500" />
                                            )}
                                            <item.icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {!isLoading && !isPro && (
                    <SidebarGroup>
                        <SidebarGroupContent className="px-2">
                            <Link
                                href="/upgrade"
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all group"
                            >
                                <Zap className="w-4 h-4 fill-primary animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold leading-tight">Upgrade to Pro</span>
                                    <span className="text-[10px] opacity-70 leading-tight">Unlock Trader Score</span>
                                </div>
                            </Link>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer with Avatar + Logout */}
            <SidebarFooter className="border-t border-sidebar-border p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2.5 px-2 py-1.5">
                                {/* Avatar circle */}
                                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-primary">{initials}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground truncate uppercase tracking-widest flex-1 min-w-0">
                                    {profile?.email || '—'}
                                </span>
                            </div>
                            <SidebarMenuButton
                                onClick={handleLogout}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
