
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = 'sb_secret_QXff5PP7Ttv5dA5Fl-sQ8Q_rTbOokxW'

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    // Get the first profile
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1)

    if (pError || !profiles || profiles.length === 0) {
        console.error('No profiles found to seed trades for. Please sign up first.')
        return
    }

    const userId = profiles[0].id
    console.log(`Seeding trades for user: ${userId}`)

    const trades = [
        {
            user_id: userId,
            pair: 'EUR/USD',
            entry_price: 1.0850,
            exit_price: 1.0920,
            stop_loss: 1.0820,
            take_profit: 1.0950,
            lot_size: 0.5,
            profit_usd: 350.00,
            notes: 'Trend following on H4. Breaking previous resistance.',
            trade_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            user_id: userId,
            pair: 'GBP/JPY',
            entry_price: 185.50,
            exit_price: 184.20,
            stop_loss: 186.00,
            take_profit: 183.00,
            lot_size: 0.1,
            profit_usd: 85.50,
            notes: 'Short on supply zone retest.',
            trade_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            user_id: userId,
            pair: 'XAU/USD',
            entry_price: 2025.50,
            exit_price: 2015.00,
            stop_loss: 2030.00,
            take_profit: 2000.00,
            lot_size: 0.05,
            profit_usd: -52.50,
            notes: 'Hit stop loss on news volatility.',
            trade_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            user_id: userId,
            pair: 'BTC/USD',
            entry_price: 52000,
            exit_price: 51200,
            stop_loss: 51500,
            take_profit: 54000,
            lot_size: 0.01,
            profit_usd: -8.00,
            notes: 'Premature entry on a weekend.',
            trade_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            user_id: userId,
            pair: 'USD/JPY',
            entry_price: 150.20,
            exit_price: 151.80,
            stop_loss: 149.50,
            take_profit: 152.50,
            lot_size: 1.0,
            profit_usd: 1060.00,
            notes: 'Long ride on DXY strength.',
            trade_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            user_id: userId,
            pair: 'EUR/GBP',
            entry_price: 0.8550,
            exit_price: 0.8565,
            stop_loss: 0.8540,
            take_profit: 0.8580,
            lot_size: 2.0,
            profit_usd: 38.00,
            notes: 'Scalping the range.',
            trade_date: new Date().toISOString().split('T')[0]
        }
    ]

    const { error: tError } = await supabase.from('trades').insert(trades)

    if (tError) {
        console.error('Error seeding trades:', tError)
    } else {
        console.log('Successfully seeded 6 demo trades!')
    }
}

seed()
