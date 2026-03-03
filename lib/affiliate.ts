// Affiliate/Referral System Business Logic

import { createClient } from '@/utils/supabase/server';
import { AFFILIATE_CONSTANTS, calculatePrice, calculateCommission } from './constants';

// Types
export interface AffiliateProfile {
    id: string;
    email: string;
    name?: string;
    affiliate_code: string | null;
    is_influencer: boolean;
    referred_by_id: string | null;
    role: string;
}

export interface Commission {
    id: string;
    affiliate_id: string;
    referred_user_id: string;
    referred_user?: AffiliateProfile;
    amount_due: number;
    status: 'pending' | 'paid';
    created_at: string;
}

export interface AffiliateStats {
    affiliateCode: string | null;
    isInfluencer: boolean;
    totalReferrals: number;
    pendingCommissions: number;
    paidCommissions: number;
    pendingEarnings: number;
    totalPaidEarnings: number;
    totalEarnings: number;
}

export interface ReferralValidationResult {
    valid: boolean;
    affiliate?: AffiliateProfile;
    isInfluencer: boolean;
    discountAmount: number;
    finalPrice: number;
    message?: string;
}

// Generate a unique affiliate code
export function generateAffiliateCode(name?: string): string {
    // Extract first 3 letters from name, or use 'REF'
    let prefix = 'REF';
    if (name) {
        const cleanName = name
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .slice(0, 3);
        if (cleanName.length >= 2) {
            prefix = cleanName.padEnd(3, 'X');
        }
    }

    // Generate random 3-digit number
    const randomNum = Math.floor(Math.random() * 3000).toString().padStart(3, '0');

    return `${prefix}${randomNum}`;
}

// Validate a referral code
export async function validateReferralCode(code: string): Promise<ReferralValidationResult> {
    if (!code || code.trim().length < 3) {
        return {
            valid: false,
            isInfluencer: false,
            discountAmount: 0,
            finalPrice: AFFILIATE_CONSTANTS.BASE_PRICE,
            message: 'Invalid referral code format'
        };
    }

    // Use admin client to bypass RLS — profiles are only visible to their own owner by default
    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminClient = createAdminClient();

    console.log(`[VALIDATE] Validating code: "${code.toUpperCase().trim()}"`);

    const { data: affiliate, error } = await adminClient
        .from('profiles')
        .select('id, email, affiliate_code, is_influencer, referred_by_id, role')
        .eq('affiliate_code', code.toUpperCase().trim())
        .single();

    if (error) {
        console.error(`[VALIDATE] Error looking up code "${code}":`, error.message);
    }

    if (!affiliate) {
        console.log(`[VALIDATE] No affiliate found for code: "${code}"`);
        return {
            valid: false,
            isInfluencer: false,
            discountAmount: 0,
            finalPrice: AFFILIATE_CONSTANTS.BASE_PRICE,
            message: 'Referral code not found'
        };
    }

    const isInfluencer = affiliate.is_influencer === true;
    const discountAmount = isInfluencer
        ? AFFILIATE_CONSTANTS.BASE_PRICE * AFFILIATE_CONSTANTS.INFLUENCER_DISCOUNT
        : 0;
    const finalPrice = AFFILIATE_CONSTANTS.BASE_PRICE - discountAmount;

    return {
        valid: true,
        affiliate,
        isInfluencer,
        discountAmount,
        finalPrice,
        message: isInfluencer
            ? `🎉 Influencer code! You get 20% off (${discountAmount} ETB discount)`
            : 'Referral code applied'
    };
}

// Get affiliate stats for a user
export async function getAffiliateStats(userId: string): Promise<AffiliateStats | null> {
    const supabase = await createClient();

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('affiliate_code, is_influencer')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        return null;
    }

    // Get all commissions for this affiliate
    const { data: commissions, error: commissionError } = await supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', userId);

    if (commissionError) {
        console.error('Error fetching commissions:', commissionError);
    }

    // Get referral count
    const { count: referralCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by_id', userId);

    if (countError) {
        console.error('Error counting referrals:', countError);
    }

    const commissionList = commissions || [];
    const pendingCommissions = commissionList.filter(c => c.status === 'pending');
    const paidCommissions = commissionList.filter(c => c.status === 'paid');

    const pendingEarnings = pendingCommissions.reduce((sum, c) => sum + (c.amount_due || 0), 0);
    const totalPaidEarnings = paidCommissions.reduce((sum, c) => sum + (c.amount_due || 0), 0);

    return {
        affiliateCode: profile.affiliate_code,
        isInfluencer: profile.is_influencer === true,
        totalReferrals: referralCount || 0,
        pendingCommissions: pendingCommissions.length,
        paidCommissions: paidCommissions.length,
        pendingEarnings,
        totalPaidEarnings,
        totalEarnings: pendingEarnings + totalPaidEarnings
    };
}

// Get all commissions with details
export async function getCommissions(userId: string): Promise<Commission[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('commissions')
        .select(`
            *,
            referred_user:referred_user_id (
                id,
                email,
                name
            )
        `)
        .eq('affiliate_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching commissions:', error);
        return [];
    }

    return data || [];
}

// Get all commissions for admin
export async function getAllCommissions(): Promise<Commission[]> {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return [];

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

    if (profile?.role !== 'admin') return [];

    const { data, error } = await supabase
        .from('commissions')
        .select(`
            *,
            affiliate:affiliate_id (
                id,
                email,
                name,
                affiliate_code
            ),
            referred_user:referred_user_id (
                id,
                email,
                name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all commissions:', error);
        return [];
    }

    return data || [];
}

// Create a commission record
export async function createCommission(
    affiliateId: string,
    referredUserId: string,
    actualAmount: number,
    paymentId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Check if user is trying to refer themselves
    if (affiliateId === referredUserId) {
        return { success: false, error: 'Cannot refer yourself' };
    }

    // Check if commission already exists for this referral
    const { data: existing } = await supabase
        .from('commissions')
        .select('id')
        .eq('affiliate_id', affiliateId)
        .eq('referred_user_id', referredUserId)
        .single();

    if (existing) {
        return { success: false, error: 'Commission already exists for this referral' };
    }

    const commissionAmount = calculateCommission(actualAmount);

    const { error } = await supabase
        .from('commissions')
        .insert({
            affiliate_id: affiliateId,
            referred_user_id: referredUserId,
            amount_due: commissionAmount,
            status: 'pending',
            payment_id: paymentId
        });

    if (error) {
        console.error('Error creating commission:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Mark commission as paid
export async function markCommissionPaid(commissionId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { success: false, error: 'Not authenticated' };

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .from('commissions')
        .update({ status: 'paid' })
        .eq('id', commissionId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Get all affiliates (for admin)
export async function getAllAffiliates(): Promise<AffiliateProfile[]> {
    const supabase = await createClient();

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return [];

    // Check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

    if (profileError || profile?.role !== 'admin') return [];

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, affiliate_code, is_influencer, referred_by_id, role')
        .not('affiliate_code', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching affiliates:', error);
        return [];
    }

    return (data || []) as AffiliateProfile[];
}

// Toggle influencer status
export async function toggleInfluencerStatus(userId: string, isInfluencer: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { success: false, error: 'Not authenticated' };

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .from('profiles')
        .update({ is_influencer: isInfluencer })
        .eq('id', userId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Re-export utility functions
export { calculatePrice, calculateCommission };
