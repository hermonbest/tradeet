'use client'

import { Calendar, Home, Settings, LogOut, TrendingUp, Zap, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
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
        { title: 'Dashboard', url: '/', icon: Home },
        { title: 'Calendar', url: '/calendar', icon: Calendar },
        { title: 'Settings', url: '/settings', icon: Settings },
    ]

    if (!isLoading && isAdmin) {
        navItems.push({ title: 'Admin Panel', url: '/admin', icon: ShieldCheck })
    }

    return (
        <Sidebar>
            {/* Brand Header */}
            <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-primary" />
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
                    <SidebarGroupLabel className="stat-label px-3 py-2">Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <a href={item.url} className="flex items-center gap-2.5 text-sm">
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {!isLoading && !isPro && (
                    <SidebarGroup>
                        <SidebarGroupContent className="px-2">
                            <a
                                href="/upgrade"
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all group"
                            >
                                <Zap className="w-4 h-4 fill-primary animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold leading-tight">Upgrade to Pro</span>
                                    <span className="text-[10px] opacity-70 leading-tight">Unlock Zella Score</span>
                                </div>
                            </a>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer with Logout */}
            <SidebarFooter className="border-t border-sidebar-border p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex flex-col gap-1">
                            <div className="px-3 py-2 text-[10px] text-muted-foreground truncate uppercase tracking-widest">
                                {profile?.email}
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
