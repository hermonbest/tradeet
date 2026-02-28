import { createClient } from '@/utils/supabase/server'
import { TradeCalendar } from '@/components/trade-calendar'

export default async function CalendarPage() {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()

    // Fetch trades
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userData?.user?.id)

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Trade Calendar</h1>
            <p className="text-muted-foreground mb-8">
                View your daily performance and trading activity.
            </p>

            <div className="bg-card border rounded-lg p-6 max-w-4xl">
                <TradeCalendar trades={trades || []} />
            </div>
        </div>
    )
}
