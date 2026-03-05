'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateAffiliateCode } from '@/lib/affiliate'
import { calculateCommission } from '@/lib/constants'
import { z } from 'zod'
import type { Result } from '@/lib/types'

// Zod Schemas for Server Action Validation
const TradeSchema = z.object({
    pair: z.string().min(1).max(20),
    entry_price: z.string().min(1),
    exit_price: z.string().optional(),
    stop_loss: z.string().optional(),
    take_profit: z.string().optional(),
    lot_size: z.string().optional(),
    profit_usd: z.string().optional(),
    notes: z.string().optional(),
    trade_date: z.string().optional(),
    // screenshot_url may be a string, undefined, or null
    screenshot_url: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
})

const PaymentSchema = z.object({
    phone_number: z.string().min(1),
    screenshot_url: z.string().min(1),
    amount: z.number().optional(),
    referral_code: z.string().optional(),
})

const ExchangeRateSchema = z.object({
    rate: z.number().positive(),
})

const ReferralCodeSchema = z.object({
    code: z.string().min(3).max(20),
})

// ... existing actions (addTrade, deleteTrade, updateExchangeRate)

export async function addTrade(data: unknown): Promise<Result<{ isFirstTrade: boolean; isFirstWin: boolean; isComebackWin?: boolean }>> {
    const supabase = await createClient()

    // Validate input data
    const parseResult = TradeSchema.safeParse(data)
    if (!parseResult.success) {
        return { success: false, error: 'Invalid trade data: ' + parseResult.error.message }
    }

    const validatedData = parseResult.data

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Fetch profile data so we can enforce trial expiration rules as well
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, first_trade_completed, first_win_completed, trial_expires')
        .eq('id', userData.user.id)
        .single()

    // if the user is not pro/admin, verify that the 7‑day trial has not expired
    if (profile && profile.role === 'free' && profile.trial_expires) {
        const expires = new Date(profile.trial_expires).getTime()
        const now = Date.now()
        if (now > expires) {
            return {
                success: false,
                error: 'Your free trial has ended. Please upgrade to Premium to continue logging trades.',
                code: 'TRIAL_EXPIRED',
            }
        }
    }

    // previous 50-trade cap logic is no longer used; trial period limits access instead

    const profitUsd = validatedData.profit_usd ? parseFloat(validatedData.profit_usd) : 0
    const isFirstTrade = !profile?.first_trade_completed
    const isFirstWin = !profile?.first_win_completed && profitUsd > 0

    // Get trade count to detect comeback wins (first win after multiple losses)
    let tradeCount = 0
    let lossCount = 0
    if (!isFirstTrade) {
        const { count: totalTrades } = await supabase
            .from('trades')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userData.user.id)
        tradeCount = totalTrades || 0

        const { data: losingTrades } = await supabase
            .from('trades')
            .select('profit_usd')
            .eq('user_id', userData.user.id)
            .lt('profit_usd', 0)
        lossCount = losingTrades?.length || 0
    }

    const isComebackWin = isFirstWin && tradeCount >= 3 && lossCount >= 2

    const { error } = await supabase.from('trades').insert({
        user_id: userData.user.id,
        pair: validatedData.pair,
        entry_price: parseFloat(validatedData.entry_price),
        exit_price: validatedData.exit_price ? parseFloat(validatedData.exit_price) : null,
        stop_loss: validatedData.stop_loss ? parseFloat(validatedData.stop_loss) : null,
        take_profit: validatedData.take_profit ? parseFloat(validatedData.take_profit) : null,
        lot_size: validatedData.lot_size ? parseFloat(validatedData.lot_size) : null,
        notes: validatedData.notes || '',
        profit_usd: profitUsd,
        trade_date: validatedData.trade_date,
        screenshot_url: validatedData.screenshot_url || null,
        tags: validatedData.tags || [],
    })

    if (error) {
        console.error('Error adding trade:', error)
        return { success: false, error: error.message }
    }

    // Update onboarding flags if needed
    if (isFirstTrade || isFirstWin) {
        const updates: Record<string, boolean> = {}
        if (isFirstTrade) updates.first_trade_completed = true
        if (isFirstWin) updates.first_win_completed = true

        await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userData.user.id)
    }

    revalidatePath('/')
    revalidatePath('/calendar')
    revalidateTag('trades', {})
    return { success: true, data: { isFirstTrade, isFirstWin, isComebackWin } }
}

export async function updateTrade(id: string, data: unknown): Promise<Result> {
    const supabase = await createClient()

    // Validate input data
    const parseResult = TradeSchema.safeParse(data)
    if (!parseResult.success) {
        return { success: false, error: 'Invalid trade data: ' + parseResult.error.message }
    }

    const validatedData = parseResult.data

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('trades')
        .update({
            pair: validatedData.pair,
            entry_price: parseFloat(validatedData.entry_price),
            exit_price: validatedData.exit_price ? parseFloat(validatedData.exit_price) : null,
            stop_loss: validatedData.stop_loss ? parseFloat(validatedData.stop_loss) : null,
            take_profit: validatedData.take_profit ? parseFloat(validatedData.take_profit) : null,
            lot_size: validatedData.lot_size ? parseFloat(validatedData.lot_size) : null,
            notes: validatedData.notes || '',
            profit_usd: validatedData.profit_usd ? parseFloat(validatedData.profit_usd) : 0,
            trade_date: validatedData.trade_date,
            screenshot_url: validatedData.screenshot_url || null,
            tags: validatedData.tags || [],
        })
        .eq('id', id)
        .eq('user_id', userData.user.id) // Ensure users can only edit their own trades

    if (error) {
        console.error('Error updating trade:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/calendar')
    revalidateTag('trades', {})
    return { success: true }
}

export async function deleteTrade(id: string): Promise<Result> {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
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
        return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
        return { success: false, error: 'Trade not found or you do not have permission to delete it. (It might belong to a different user if it was seeded data)' }
    }

    revalidatePath('/')
    revalidatePath('/calendar')
    revalidateTag('trades', {})
    return { success: true }
}

export async function updateExchangeRate(rate: unknown): Promise<Result> {
    const supabase = await createClient()

    // Validate input data
    const parseResult = ExchangeRateSchema.safeParse({ rate })
    if (!parseResult.success) {
        return { success: false, error: 'Invalid exchange rate: ' + parseResult.error.message }
    }

    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ exchange_rate: parseResult.data.rate })
        .eq('id', userData.user.id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidateTag('profile', {})
    return { success: true }
}

export async function submitPayment(data: unknown): Promise<Result> {
    const supabase = await createClient()

    // Validate input data
    const parseResult = PaymentSchema.safeParse(data)
    if (!parseResult.success) {
        return { success: false, error: 'Invalid payment data: ' + parseResult.error.message }
    }

    const validatedData = parseResult.data
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase.from('payments').insert({
        user_id: userData.user.id,
        phone_number: validatedData.phone_number,
        screenshot_url: validatedData.screenshot_url,
        amount: validatedData.amount || 3000,
        referral_code: validatedData.referral_code || null,
        status: 'pending'
    })

    if (error) {
        return { success: false, error: error.message }
    }

    // Email Notification logic
    console.log(`[PAYMENT_ALERT] New payment submitted by ${userData.user.email}. Amount: ${validatedData.amount || 3000} ETB. Receipt: ${validatedData.screenshot_url}. Alerting hermonbest@gmail.com`)

    revalidatePath('/upgrade')
    revalidatePath('/admin')
    return { success: true }
}

export async function approvePayment(
    paymentId: string,
    userId: string,
    actualAmount?: number
): Promise<Result> {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized' }
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .eq('status', 'pending')
        .single()

    if (paymentError || !payment) {
        return { success: false, error: 'Payment not found or already processed' }
    }

    const finalAmount = actualAmount || payment.amount || 3000

    // Update payment status
    const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
            status: 'approved',
            amount: finalAmount
        })
        .eq('id', paymentId)

    if (updatePaymentError) {
        return { success: false, error: updatePaymentError.message }
    }

    // Update user role to pro
    const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
            role: 'pro'
        })
        .eq('id', userId)

    if (updateProfileError) {
        return { success: false, error: updateProfileError.message }
    }

    // Handle commission if referral code exists
    if (payment.referral_code) {
        // Find the affiliate
        const { data: affiliate } = await supabase
            .from('profiles')
            .select('id')
            .eq('affiliate_code', payment.referral_code)
            .single()

        if (affiliate) {
            // Set referred_by_id on the user's profile if not already set
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('referred_by_id')
                .eq('id', userId)
                .single()

            if (!userProfile?.referred_by_id) {
                await supabase
                    .from('profiles')
                    .update({ referred_by_id: affiliate.id })
                    .eq('id', userId)
            }

            const commissionAmount = finalAmount * 0.20 // 20% commission

            const { error: commissionError } = await supabase
                .from('commissions')
                .insert({
                    affiliate_id: affiliate.id,
                    referred_user_id: userId,
                    payment_id: paymentId,
                    amount_due: commissionAmount,
                    status: 'pending'
                })

            if (commissionError) {
                console.error('Error creating commission:', commissionError)
                // Don't fail the whole operation for commission errors
            }
        }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function rejectPayment(paymentId: string): Promise<Result> {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized' }
    }

    // Update payment status
    const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId)

    if (paymentError) {
        return { success: false, error: paymentError.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function revokePro(userId: string): Promise<Result> {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: 'free' })
        .eq('id', userId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function deleteAccount(): Promise<Result> {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Call the secure Postgres function to delete the auth.users record
    const { error } = await supabase.rpc('delete_own_account')

    if (error) {
        console.error('Error deleting account:', error)
        return { success: false, error: 'Failed to delete account. Please contact support.' }
    }

    // Sign out to clear local session cookies
    await supabase.auth.signOut()
    redirect('/login')
}

// ==================== AFFILIATE SYSTEM ACTIONS ====================

// Generate affiliate code for current user
export async function generateUserAffiliateCode(): Promise<Result<{ code: string }>> {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Use the database function to atomically generate unique code
    const { data: code, error } = await supabase.rpc('generate_unique_affiliate_code', {
        p_user_id: userData.user.id
    })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/settings')
    revalidatePath('/affiliate')
    return { success: true, data: { code } }
}

// Apply referral code to current user
export async function applyReferralCode(code: unknown): Promise<Result<{ isInfluencer: boolean; message: string }>> {
    const supabase = await createClient()

    // Validate input data
    const parseResult = ReferralCodeSchema.safeParse({ code })
    if (!parseResult.success) {
        return { success: false, error: 'Invalid referral code: ' + parseResult.error.message }
    }

    const validatedCode = parseResult.data.code
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Validate code — use admin client to bypass RLS on profiles table
    const adminClient = createAdminClient()
    const { data: affiliate, error: affiliateError } = await adminClient
        .from('profiles')
        .select('id, is_influencer, affiliate_code')
        .eq('affiliate_code', validatedCode.toUpperCase().trim())
        .single()

    if (affiliateError || !affiliate) {
        return { success: false, error: 'Invalid referral code' }
    }

    // Prevent self-referral
    if (affiliate.id === userData.user.id) {
        return { success: false, error: 'Cannot use your own referral code' }
    }

    // Apply referral
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ referred_by_id: affiliate.id })
        .eq('id', userData.user.id)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    return {
        success: true,
        data: {
            isInfluencer: affiliate.is_influencer,
            message: affiliate.is_influencer
                ? '🎉 Influencer code applied! You get 20% off.'
                : 'Referral code applied!'
        }
    }
}

// Get affiliate stats for current user
export async function getUserAffiliateStats(): Promise<Result<{
    affiliateCode: string | null;
    isInfluencer: boolean;
    referredById: string | null;
    totalReferrals: number;
    pendingCommissions: number;
    paidCommissions: number;
    pendingEarnings: number;
    totalPaidEarnings: number;
    totalEarnings: number;
    commissions: any[];
}>> {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Get profile with affiliate info
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('affiliate_code, is_influencer, referred_by_id')
        .eq('id', userData.user.id)
        .single()

    if (profileError) {
        return { success: false, error: profileError.message }
    }

    // Get commissions with referred user details
    const { data: commissions, error: commissionError } = await supabase
        .from('commissions')
        .select(`
            *,
            referred_user:profiles!referred_user_id (
                id,
                email
            )
        `)
        .eq('affiliate_id', userData.user.id)

    if (commissionError) {
        console.error('Error fetching commissions:', commissionError)
    }

    // Get referral count
    const { count: referralCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by_id', userData.user.id)

    if (countError) {
        console.error('Error counting referrals:', countError)
    }

    const commissionList = commissions || []
    const pendingCommissions = commissionList.filter(c => c.status === 'pending')
    const paidCommissions = commissionList.filter(c => c.status === 'paid')

    const pendingEarnings = pendingCommissions.reduce((sum, c) => sum + (c.amount_due || 0), 0)
    const totalPaidEarnings = paidCommissions.reduce((sum, c) => sum + (c.amount_due || 0), 0)

    return {
        success: true,
        data: {
            affiliateCode: profile?.affiliate_code || null,
            isInfluencer: profile?.is_influencer || false,
            referredById: profile?.referred_by_id || null,
            totalReferrals: referralCount || 0,
            pendingCommissions: pendingCommissions.length,
            paidCommissions: paidCommissions.length,
            pendingEarnings,
            totalPaidEarnings,
            totalEarnings: pendingEarnings + totalPaidEarnings,
            commissions: commissionList
        }
    }
}

// Toggle influencer status (admin only)
export async function toggleInfluencerStatusAction(userId: string, isInfluencer: boolean): Promise<Result> {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profileError || profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_influencer: isInfluencer })
        .eq('id', userId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Mark commission as paid (admin only)
export async function payCommission(commissionId: string): Promise<Result> {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profileError || profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('commissions')
        .update({ status: 'paid' })
        .eq('id', commissionId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Get all affiliates with stats (admin only)
export async function getAffiliatesAdmin(): Promise<Result<{ affiliates: unknown[] }>> {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profileError || profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized' }
    }

    // Get all affiliates
    const { data: affiliates, error: affiliatesError } = await supabase
        .from('profiles')
        .select('id, email, name, affiliate_code, is_influencer, created_at')
        .not('affiliate_code', 'is', null)
        .order('created_at', { ascending: false })

    if (affiliatesError) {
        return { success: false, error: affiliatesError.message }
    }

    // Get commissions for all affiliates
    const { data: commissions, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')

    if (commissionsError) {
        console.error('Error fetching commissions:', commissionsError)
    }

    // Get referral counts
    const { data: referrals, error: referralsError } = await supabase
        .from('profiles')
        .select('referred_by_id')
        .not('referred_by_id', 'is', null)

    if (referralsError) {
        console.error('Error fetching referrals:', referralsError)
    }

    // Calculate stats for each affiliate
    const affiliatesWithStats = (affiliates || []).map(affiliate => {
        const affiliateCommissions = (commissions || []).filter(c => c.affiliate_id === affiliate.id)
        const referralCount = (referrals || []).filter(r => r.referred_by_id === affiliate.id).length

        return {
            ...affiliate,
            totalReferrals: referralCount,
            totalCommissions: affiliateCommissions.length,
            pendingCommissions: affiliateCommissions.filter(c => c.status === 'pending').length,
            paidCommissions: affiliateCommissions.filter(c => c.status === 'paid').length,
            totalEarnings: affiliateCommissions.reduce((sum, c) => sum + (c.amount_due || 0), 0),
            pendingEarnings: affiliateCommissions
                .filter(c => c.status === 'pending')
                .reduce((sum, c) => sum + (c.amount_due || 0), 0)
        }
    })

    return { success: true, data: { affiliates: affiliatesWithStats } }
}

// ============================================
// ONBOARDING ACTIONS
// ============================================

/**
 * Complete onboarding step
 */
export async function completeOnboardingStep() {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            onboarding_completed: true,
            last_onboarding_step: 999
        })
        .eq('id', userData.user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Mark first trade as completed
 */
export async function markFirstTradeComplete() {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ first_trade_completed: true })
        .eq('id', userData.user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Mark first win as completed
 */
export async function markFirstWinComplete() {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ first_win_completed: true })
        .eq('id', userData.user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Get user's onboarding state
 */
export async function getOnboardingState() {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed, first_trade_completed, first_win_completed, onboarding_step')
        .eq('id', userData.user.id)
        .single()

    if (profileError) {
        return { error: profileError.message }
    }

    // Get trade count to determine if user is truly a beginner
    const { count } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)

    return {
        onboarding_completed: profile?.onboarding_completed || false,
        first_trade_completed: profile?.first_trade_completed || false,
        first_win_completed: profile?.first_win_completed || false,
        onboarding_step: profile?.onboarding_step || 0,
        trade_count: count || 0,
    }
}

/**
 * Reset onboarding (for testing or if user wants to retake tour)
 */
export async function resetOnboarding(): Promise<Result> {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            onboarding_completed: false,
            first_trade_completed: false,
            first_win_completed: false,
            onboarding_step: 0,
            last_onboarding_step: 0,
        })
        .eq('id', userData.user.id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
