'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateAffiliateCode } from '@/lib/affiliate'
import { calculateCommission } from '@/lib/constants'

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

export async function submitPayment(data: {
    phone_number: string,
    screenshot_url: string,
    amount?: number,
    referral_code?: string
}) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return { error: 'Not authenticated' }

    const { error } = await supabase.from('payments').insert({
        user_id: userData.user.id,
        phone_number: data.phone_number,
        screenshot_url: data.screenshot_url,
        amount: data.amount || 3000,
        referral_code: data.referral_code || null,
        status: 'pending'
    })

    if (error) return { error: error.message }

    // Email Notification logic
    console.log(`[PAYMENT_ALERT] New payment submitted by ${userData.user.email}. Amount: ${data.amount || 3000} ETB. Receipt: ${data.screenshot_url}. Alerting hermonbest@gmail.com`)

    revalidatePath('/upgrade')
    revalidatePath('/admin')
    return { success: true }
}

export async function approvePayment(paymentId: string, userId: string, actualAmount?: number) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) return { error: 'Not authenticated' }

    // Check if admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    // Get payment details including referral code
    const { data: payment } = await supabase
        .from('payments')
        .select('referral_code, amount')
        .eq('id', paymentId)
        .single()

    // Update profile to pro
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'pro' })
        .eq('id', userId)

    if (profileError) return { error: profileError.message }

    // Set actual amount if provided
    const finalAmount = actualAmount || payment?.amount || 3000

    // Update payment status with actual amount
    const { error: paymentError } = await supabase
        .from('payments')
        .update({
            status: 'approved',
            actual_amount: finalAmount
        })
        .eq('id', paymentId)

    if (paymentError) return { error: paymentError.message }

    // Record commission if referral code was used
    if (payment?.referral_code) {
        const normalizedCode = payment.referral_code.toUpperCase().trim()
        console.log(`[COMMISSION] Referral code on payment: "${normalizedCode}", looking up affiliate...`)

        // Use admin client to bypass RLS — we need to read another user's profile row
        const adminClient = createAdminClient()
        const { data: affiliate, error: affiliateLookupError } = await adminClient
            .from('profiles')
            .select('id, email, is_influencer')
            .eq('affiliate_code', normalizedCode)
            .single()

        if (affiliateLookupError || !affiliate) {
            console.error('[COMMISSION] Affiliate not found for code:', normalizedCode, affiliateLookupError)
        } else if (affiliate.id === userId) {
            console.warn('[COMMISSION] Skipping: affiliate is the same as the paying user (self-referral). Affiliate ID:', affiliate.id)
        } else if (affiliate.is_influencer) {
            console.log(`[COMMISSION] Skipping: affiliate ${affiliate.email} is an influencer (influencers do not receive commissions).`)
        } else {
            console.log(`[COMMISSION] Affiliate found: ${affiliate.email} (${affiliate.id})`)

            // Check if commission already exists
            const { data: existingCommission } = await supabase
                .from('commissions')
                .select('id')
                .eq('affiliate_id', affiliate.id)
                .eq('referred_user_id', userId)
                .single()

            if (existingCommission) {
                console.warn('[COMMISSION] Commission already exists, skipping duplicate.')
            } else {
                const commissionAmount = calculateCommission(finalAmount)
                console.log(`[COMMISSION] Creating commission: ${commissionAmount} ETB for affiliate ${affiliate.email}`)

                // Create commission record
                const { error: commissionError } = await supabase
                    .from('commissions')
                    .insert({
                        affiliate_id: affiliate.id,
                        referred_user_id: userId,
                        amount_due: commissionAmount,
                        status: 'pending',
                        payment_id: paymentId
                    })

                if (commissionError) {
                    console.error('[COMMISSION] Failed to insert commission record:', commissionError)
                    // Return partial success with a warning so it's visible in admin
                    revalidatePath('/admin')
                    return { success: true, warning: `Commission could not be recorded: ${commissionError.message}` }
                } else {
                    console.log('[COMMISSION] Commission created successfully!')
                }
            }
        }
    } else {
        console.log('[COMMISSION] No referral code on this payment. No commission to record.')
    }

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

// ==================== AFFILIATE SYSTEM ACTIONS ====================

// Generate affiliate code for current user
export async function generateUserAffiliateCode() {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    // Check if user already has a code
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('affiliate_code, name')
        .eq('id', userData.user.id)
        .single()

    if (existingProfile?.affiliate_code) {
        return { error: 'You already have an affiliate code', code: existingProfile.affiliate_code }
    }

    // Generate unique code
    let code: string
    let attempts = 0
    const maxAttempts = 10

    do {
        code = generateAffiliateCode(existingProfile?.name || userData.user.email?.split('@')[0])

        // Check if code is unique
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('affiliate_code', code)
            .single()

        if (!existing) break
        attempts++
    } while (attempts < maxAttempts)

    if (attempts >= maxAttempts) {
        return { error: 'Could not generate unique code. Please try again.' }
    }

    // Save code to profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ affiliate_code: code })
        .eq('id', userData.user.id)

    if (updateError) {
        return { error: updateError.message }
    }

    revalidatePath('/settings')
    revalidatePath('/affiliate')
    return { success: true, code }
}

// Apply referral code to current user
export async function applyReferralCode(code: string) {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    // Validate code — use admin client to bypass RLS on profiles table
    const adminClient = createAdminClient()
    const { data: affiliate, error: affiliateError } = await adminClient
        .from('profiles')
        .select('id, is_influencer, affiliate_code')
        .eq('affiliate_code', code.toUpperCase().trim())
        .single()

    if (affiliateError || !affiliate) {
        return { error: 'Invalid referral code' }
    }

    // Prevent self-referral
    if (affiliate.id === userData.user.id) {
        return { error: 'Cannot use your own referral code' }
    }

    // Apply referral
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ referred_by_id: affiliate.id })
        .eq('id', userData.user.id)

    if (updateError) {
        return { error: updateError.message }
    }

    return {
        success: true,
        isInfluencer: affiliate.is_influencer,
        message: affiliate.is_influencer
            ? '🎉 Influencer code applied! You get 20% off.'
            : 'Referral code applied!'
    }
}

// Get affiliate stats for current user
export async function getUserAffiliateStats() {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    // Get profile with affiliate info
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('affiliate_code, is_influencer, referred_by_id')
        .eq('id', userData.user.id)
        .single()

    if (profileError) {
        return { error: profileError.message }
    }

    // Get commissions
    const { data: commissions, error: commissionError } = await supabase
        .from('commissions')
        .select('*')
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
        affiliateCode: profile?.affiliate_code,
        isInfluencer: profile?.is_influencer,
        referredById: profile?.referred_by_id,
        totalReferrals: referralCount || 0,
        pendingCommissions: pendingCommissions.length,
        paidCommissions: paidCommissions.length,
        pendingEarnings,
        totalPaidEarnings,
        totalEarnings: pendingEarnings + totalPaidEarnings,
        commissions: commissionList
    }
}

// Toggle influencer status (admin only)
export async function toggleInfluencerStatusAction(userId: string, isInfluencer: boolean) {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profileError || profile?.role !== 'admin') {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_influencer: isInfluencer })
        .eq('id', userId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Mark commission as paid (admin only)
export async function payCommission(commissionId: string) {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profileError || profile?.role !== 'admin') {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('commissions')
        .update({ status: 'paid' })
        .eq('id', commissionId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Get all affiliates with stats (admin only)
export async function getAffiliatesAdmin() {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        return { error: 'Not authenticated' }
    }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

    if (profileError || profile?.role !== 'admin') {
        return { error: 'Unauthorized' }
    }

    // Get all affiliates
    const { data: affiliates, error: affiliatesError } = await supabase
        .from('profiles')
        .select('id, email, name, affiliate_code, is_influencer, created_at')
        .not('affiliate_code', 'is', null)
        .order('created_at', { ascending: false })

    if (affiliatesError) {
        return { error: affiliatesError.message }
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

    return { affiliates: affiliatesWithStats }
}
