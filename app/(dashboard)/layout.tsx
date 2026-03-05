import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { OnboardingWrapper } from '@/components/onboarding-wrapper'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Fetch user's onboarding state
    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, first_trade_completed, first_win_completed')
        .eq('id', user.id)
        .single()

    const serverOnboardingState = {
        isFirstTimeUser: !profile?.onboarding_completed,
        hasCompletedFirstTrade: profile?.first_trade_completed || false,
        hasCompletedFirstWin: profile?.first_win_completed || false,
        isOnboardingCompleted: profile?.onboarding_completed || false,
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex-1 min-h-screen pb-24">
                <div className="hidden md:flex sticky top-0 z-10 items-center h-10 px-3 border-b border-border/40 bg-background/80 backdrop-blur-sm">
                    <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
                </div>
                <OnboardingWrapper serverOnboardingState={serverOnboardingState}>
                    <div className="page-enter">
                        {children}
                    </div>
                    {/* mobile bottom navigation shared across dashboard pages */}
                    <MobileBottomNav />
                </OnboardingWrapper>
            </main>
        </SidebarProvider>
    )
}
