import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

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

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex-1">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}
