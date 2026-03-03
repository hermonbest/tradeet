import type { Metadata } from "next";
import { createClient } from '@/utils/supabase/server'
import { TradeCalendar } from '@/components/trade-calendar'

export const metadata: Metadata = {
  title: "Trade Calendar — Visualize Your Trading Performance",
  description: "View your trading activity on a color-coded calendar. Track winning and losing days, identify patterns, and improve your trading consistency with TradeET's trade calendar.",
  alternates: {
    canonical: "https://tradeet.app/calendar",
  },
};

export default async function CalendarPage() {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()

    // Fetch trades
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userData?.user?.id)

    return (
        <div className="min-h-screen flex flex-col p-4 lg:p-8 max-w-5xl mx-auto">
            <div className="flex-grow">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-4">Trade Calendar</h1>
                <p className="text-sm text-muted-foreground mb-6 lg:mb-8">
                    View your daily performance and trading activity.
                </p>

                <div className="bg-card border rounded-xl overflow-hidden p-0 md:p-6">
                    <TradeCalendar trades={trades || []} />
                </div>
            </div>
        </div>
    )
}
