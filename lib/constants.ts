// Affiliate/Referral System Constants

export const AFFILIATE_CONSTANTS = {
    // Pricing
    BASE_PRICE: 3000, // ETB

    // Discounts
    INFLUENCER_DISCOUNT: 0.20, // 20% off for influencer referrals

    // Commission
    COMMISSION_RATE: 0.20, // 20% of actual payment

    // Affiliate Code
    CODE_LENGTH: 6,
    CODE_PREFIX_LENGTH: 3,
} as const;

// Calculate discounted price based on referrer type
export function calculatePrice(referralCode?: string | null, isInfluencer?: boolean): number {
    if (referralCode && isInfluencer) {
        return Math.round(3000 * (1 - 0.20));
    }
    return 3000;
}

// Calculate commission based on actual amount paid
export function calculateCommission(actualAmount: number): number {
    return Math.round(actualAmount * AFFILIATE_CONSTANTS.COMMISSION_RATE);
}

// Format price with currency
export function formatPrice(amount: number): string {
    return `${amount.toLocaleString()} ETB`;
}
