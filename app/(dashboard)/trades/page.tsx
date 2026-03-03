import type { Metadata } from "next";
import { createClient } from '@/utils/supabase/server'
import { TradeList } from '@/components/trade-list'
import { AddTradeDialog } from '@/components/add-trade-dialog'
import { ExchangeRateInput } from '@/components/exchange-rate-input'
import { TrendingUp, List } from 'lucide-react'

export const metadata: Metadata = {
  title: "Trade History — Log and Track Your Trades",
  description: "View and manage your complete trade history. Log forex, crypto, and stock trades with detailed analytics. Track P&L in USD and ETB on TradeET.",
  alternates: {
    canonical: "https://tradeet.app/trades",
  },
};

export default async function TradesPage() {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userData?.user?.id).single()

    // Fetch trades
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userData?.user?.id)
        .order('trade_date', { ascending: false })
        .order('created_at', { ascending: false })

    const tradesList = trades || []
    const exchangeRate = profile?.exchange_rate || 115

    return (
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 min-h-screen pb-24 lg:pb-8">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <List className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Trade Log</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Full trade history</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="w-full sm:w-auto"><ExchangeRateInput initialRate={exchangeRate} /></div>
                    <div className="w-full sm:w-auto"><AddTradeDialog /></div>
                </div>
            </div>

            {/* ── Trade Log ── */}
            <div className="tradeet-card overflow-hidden">
                <div className="px-4 lg:px-6 pb-6 pt-6">
                    <TradeList trades={tradesList} />
                </div>
            </div>

        </div>
    )
}
