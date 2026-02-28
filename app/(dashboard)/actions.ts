'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ... existing actions (addTrade, deleteTrade, updateExchangeRate)

export async function addTrade(data: any) {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    // Check free user trade limit (50 trades max)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profile?.role === 'free') {
        const { count } = await supabase
            .from('trades')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userData.user.id)

        if ((count ?? 0) >= 50) {
            return { error: 'TRADE_LIMIT_REACHED' }
        }
    }

    const { error } = await supabase.from('trades').insert({
        user_id: userData.user.id,
        pair: data.pair,
        entry_price: parseFloat(data.entry_price),
        exit_price: data.exit_price ? parseFloat(data.exit_price) : null,
        stop_loss: data.stop_loss ? parseFloat(data.stop_loss) : null,
        take_profit: data.take_profit ? parseFloat(data.take_profit) : null,
        lot_size: data.lot_size ? parseFloat(data.lot_size) : null,
        notes: data.notes || '',
        profit_usd: data.profit_usd ? parseFloat(data.profit_usd) : 0,
        trade_date: data.trade_date,
        screenshot_url: data.screenshot_url || null,
        tags: data.tags || [],
    })

    if (error) {
        console.error('Error adding trade:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/calendar')
    return { success: true }
}

export async function updateTrade(id: string, data: any) {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('trades')
        .update({
            pair: data.pair,
            entry_price: parseFloat(data.entry_price),
            exit_price: data.exit_price ? parseFloat(data.exit_price) : null,
            stop_loss: data.stop_loss ? parseFloat(data.stop_loss) : null,
            take_profit: data.take_profit ? parseFloat(data.take_profit) : null,
            lot_size: data.lot_size ? parseFloat(data.lot_size) : null,
            notes: data.notes || '',
            profit_usd: data.profit_usd ? parseFloat(data.profit_usd) : 0,
            trade_date: data.trade_date,
            screenshot_url: data.screenshot_url || null,
            tags: data.tags || [],
        })
        .eq('id', id)
        .eq('user_id', userData.user.id) // Ensure users can only edit their own trades

    if (error) {
        console.error('Error updating trade:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/calendar')
    return { success: true }
}

export async function deleteTrade(id: string) {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    // Attempt to delete and return the deleted row to verify it actually happened
    const { data, error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select()

    if (error) {
        console.error('Error deleting trade:', error)
        return { error: error.message }
    }

    if (!data || data.length === 0) {
        return { error: 'Trade not found or you do not have permission to delete it. (It might belong to a different user if it was seeded data)' }
    }

    revalidatePath('/')
    revalidatePath('/calendar')
    return { success: true }
}

export async function updateExchangeRate(rate: number) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({ exchange_rate: rate })
        .eq('id', userData.user.id)

    if (error) return { error: error.message }

    revalidatePath('/')
    return { success: true }
}

export async function submitPayment(data: { phone_number: string, screenshot_url: string }) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return { error: 'Not authenticated' }

    const { error } = await supabase.from('payments').insert({
        user_id: userData.user.id,
        phone_number: data.phone_number,
        screenshot_url: data.screenshot_url,
        status: 'pending'
    })

    if (error) return { error: error.message }

    // Email Notification logic
    console.log(`[PAYMENT_ALERT] New payment submitted by ${userData.user.email}. Receipt: ${data.screenshot_url}. Alerting hermonbest@gmail.com`)

    // Note: To send a real email, install 'resend' and use:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... });

    revalidatePath('/upgrade')
    revalidatePath('/admin')
    return { success: true }
}

export async function approvePayment(paymentId: string, userId: string) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return { error: 'Not authenticated' }

    // Check if admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    // Update profile
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'pro' })
        .eq('id', userId)

    if (profileError) return { error: profileError.message }

    // Update payment status
    const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'approved' })
        .eq('id', paymentId)

    if (paymentError) return { error: paymentError.message }

    revalidatePath('/admin')
    return { success: true }
}

export async function rejectPayment(paymentId: string) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return { error: 'Not authenticated' }

    // Check if admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    // Update payment status
    const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId)

    if (paymentError) return { error: paymentError.message }

    revalidatePath('/admin')
    return { success: true }
}

export async function revokePro(userId: string) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update({ role: 'free' })
        .eq('id', userId)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

export async function deleteAccount() {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return { error: 'Not authenticated' }

    // Call the secure Postgres function to delete the auth.users record
    const { error } = await supabase.rpc('delete_own_account')

    if (error) {
        console.error('Error deleting account:', error)
        return { error: 'Failed to delete account. Please contact support.' }
    }

    // Sign out to clear local session cookies
    await supabase.auth.signOut()
    redirect('/login')
}
