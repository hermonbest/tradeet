import type { Metadata } from "next";
import { createClient } from '@/utils/supabase/server'
import { PaymentForm } from '@/components/payment-form'
import { PriceDisplay } from '@/components/referral-input'
import { ReferralInputWrapper } from '@/components/referral-input-client'
import { Check, X, Zap, ShieldCheck, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AFFILIATE_CONSTANTS, calculatePrice } from '@/lib/constants'

export const metadata: Metadata = {
  title: "Upgrade — Unlock Pro Trading Features",
  description: "Upgrade to TradeET Pro for unlimited trade logging, advanced analytics, Trader Performance Score, and screenshot uploads. One-time payment of 3,000 ETB.",
  alternates: {
    canonical: "https://tradeet.app/upgrade",
  },
};

const FREE_FEATURES = [
    { label: 'Up to 50 trades', available: true },
    { label: 'Net P&L Dashboard', available: true },
    { label: 'Win Rate & Charts', available: true },
    { label: 'Calendar View', available: true },
    { label: 'Exchange Rate Converter', available: true },
    { label: 'Trader Performance Score', available: false },
    { label: 'Unlimited Trade Logging', available: false },
    { label: 'Screenshot Upload', available: false },
]

const PRO_FEATURES = [
    { label: 'Everything in Free', available: true },
    { label: 'Unlimited Trade Logging', available: true },
    { label: 'Trader Performance Score', available: true },
    { label: 'Screenshot Upload', available: true },
    { label: 'Priority Support', available: true },
    { label: 'All Future Features', available: true },
]

interface UpgradePageProps {
    searchParams: Promise<{ ref?: string }>
}

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
    const resolvedParams = await searchParams
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role, referred_by_id, is_influencer').eq('id', userData?.user?.id).single()

    const isPro = profile?.role === 'pro' || profile?.role === 'admin'

    // Check for referral code from URL or user's profile
    const urlReferralCode = resolvedParams.ref
    let referralCode = urlReferralCode
    let isInfluencer = false
    let finalPrice: number = AFFILIATE_CONSTANTS.BASE_PRICE
    let discountAmount: number = 0

    // If no URL code but user was referred, use that
    if (!referralCode && profile?.referred_by_id) {
        const { data: referrer } = await supabase
            .from('profiles')
            .select('affiliate_code, is_influencer')
            .eq('id', profile.referred_by_id)
            .single()
        if (referrer?.affiliate_code) {
            referralCode = referrer.affiliate_code
            isInfluencer = referrer.is_influencer || false
        }
    }

    // Validate referral code if provided
    if (referralCode) {
        const { data: affiliate } = await supabase
            .from('profiles')
            .select('is_influencer')
            .eq('affiliate_code', referralCode.toUpperCase())
            .single()

        if (affiliate) {
            isInfluencer = affiliate.is_influencer || false
            finalPrice = calculatePrice(referralCode, isInfluencer)
            discountAmount = AFFILIATE_CONSTANTS.BASE_PRICE - finalPrice
        }
    }

    if (isPro) {
        return (
            <div className="p-8 max-w-2xl mx-auto pb-24 lg:pb-8">
                <div className="tradeet-card p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-8 h-8 text-[#22c55e]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#22c55e]">You're a Pro!</h1>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        You have full access to all TradeET features. Thank you for your support!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {PRO_FEATURES.map(f => (
                            <Badge key={f.label} variant="outline" className="border-[#22c55e]/40 text-[#22c55e]">
                                <Check className="w-3 h-3 mr-1" />{f.label}
                            </Badge>
                        ))}
                    </div>
                </div>

            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-10">

            {/* Hero */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    One-Time Lifetime Access
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Upgrade to <span className="text-primary">TradeET Pro</span></h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Unlock unlimited trade logging, your Trader performance score, and all future features — forever.
                </p>
            </div>

            {/* Price Display */}
            <Card className="max-w-md mx-auto border-primary/20">
                <CardContent className="p-6">
                    <PriceDisplay
                        originalPrice={AFFILIATE_CONSTANTS.BASE_PRICE}
                        finalPrice={finalPrice}
                        discountAmount={discountAmount}
                        isInfluencer={isInfluencer}
                    />
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Feature Comparison */}
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free */}
                        <div className="tradeet-card p-6 space-y-4">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Free</h2>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Current Plan</p>
                            </div>
                            <ul className="space-y-3">
                                {FREE_FEATURES.map(f => (
                                    <li key={f.label} className="flex items-center gap-3 text-sm">
                                        {f.available
                                            ? <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
                                            : <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                        }
                                        <span className={f.available ? 'text-foreground' : 'text-muted-foreground/50 line-through'}>
                                            {f.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className="tradeet-card p-6 space-y-4 border-primary/60 relative overflow-hidden">
                            {/* Glow effect on Pro card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground">Pro</h2>
                                        <p className="text-xs text-primary uppercase tracking-wider mt-0.5">Recommended</p>
                                    </div>
                                    <Badge className="bg-primary text-primary-foreground">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Unlock
                                    </Badge>
                                </div>
                            </div>
                            <ul className="space-y-3 relative">
                                {PRO_FEATURES.map(f => (
                                    <li key={f.label} className="flex items-center gap-3 text-sm">
                                        <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
                                        <span className="text-foreground font-medium">{f.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-[#22c55e]" />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-[#22c55e]" />
                            <span>24hr Activation</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-[#22c55e]" />
                            <span>Lifetime Access</span>
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="space-y-6">
                    {/* Referral Code Input */}
                    <div className="tradeet-card p-6">
                        <h3 className="font-semibold text-foreground mb-4">Have a Referral Code?</h3>
                        <ReferralInputWrapper
                            initialCode={referralCode}
                            initialIsInfluencer={isInfluencer}
                        />
                    </div>

                    {/* Payment Form */}
                    <PaymentForm
                        amount={finalPrice}
                        referralCode={referralCode}
                    />

                    {/* Payment Instructions */}
                    <div className="tradeet-card p-6 space-y-4">
                        <h4 className="font-semibold text-foreground">How to Pay</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-medium">1</div>
                                <p className="text-muted-foreground">Transfer <strong className="text-foreground">{finalPrice.toLocaleString()} ETB</strong> via Telebirr/CBE to <strong className="text-foreground">0988509039/1000646330231</strong></p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-medium">2</div>
                                <p className="text-muted-foreground">Take a screenshot of the payment confirmation</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-medium">3</div>
                                <p className="text-muted-foreground">Fill in your phone number and upload the screenshot above</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
