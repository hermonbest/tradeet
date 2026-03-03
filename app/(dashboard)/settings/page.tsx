import type { Metadata } from "next";
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ExchangeRateInput } from '@/components/exchange-rate-input'
import { AffiliateCodeGenerator } from '@/components/affiliate-code-generator'
import { Settings, Zap, ShieldAlert, Award, Star, Users, DollarSign, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getUserAffiliateStats } from '@/app/(dashboard)/actions'
import { formatPrice } from '@/lib/constants'

export const metadata: Metadata = {
  title: "Settings — Configure Your Trading Journal",
  description: "Manage your TradeET account settings, exchange rates, and preferences. Customize your trading journal experience.",
  alternates: {
    canonical: "https://tradeet.app/settings",
  },
};

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userData?.user?.id).single()

    const isPro = profile?.role === 'pro' || profile?.role === 'admin'

    // Get affiliate stats
    const affiliateStats = await getUserAffiliateStats()
    const hasAffiliateCode = 'affiliateCode' in affiliateStats && affiliateStats.affiliateCode

    return (
        <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Settings className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">App Configuration</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Account Status Card */}
                <Card className="tradeet-card overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold">Account Status</CardTitle>
                                <CardDescription className="text-xs mt-0.5">Manage your subscription and tier.</CardDescription>
                            </div>
                            {isPro ? (
                                <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 px-3 py-1">PRO MEMBER</Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground">FREE PLAN</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPro ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {isPro ? <Zap className="w-5 h-5 fill-primary" /> : <ShieldAlert className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{profile?.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isPro ? 'Full unrestricted access enabled.' : 'You are currently on the free limited tier.'}
                                    </p>
                                </div>
                            </div>
                            {!isPro && (
                                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25">
                                    <a href="/upgrade">Upgrade Now</a>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Affiliate Section */}
                <Card className="tradeet-card overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary" />
                                <CardTitle className="text-sm font-semibold">Affiliate Program</CardTitle>
                            </div>
                            {hasAffiliateCode && (
                                <Badge className="bg-primary/20 text-primary border-primary/40">Active</Badge>
                            )}
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                            Earn commissions by referring friends to TradeET Pro.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hasAffiliateCode ? (
                            <>
                                {/* Affiliate Code Display */}
                                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Your Referral Code</p>
                                            <code className="text-2xl font-bold tracking-wider text-primary">{affiliateStats.affiliateCode}</code>
                                        </div>
                                        {'isInfluencer' in affiliateStats && affiliateStats.isInfluencer && (
                                            <Badge className="bg-yellow-500/20 text-yellow-600">
                                                <Star className="w-3 h-3 mr-1" />
                                                Influencer
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className={`grid ${('isInfluencer' in affiliateStats && affiliateStats.isInfluencer) ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                                        <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                                        <p className="text-lg font-bold">{affiliateStats.totalReferrals}</p>
                                        <p className="text-xs text-muted-foreground">Referrals</p>
                                    </div>
                                    {!('isInfluencer' in affiliateStats && affiliateStats.isInfluencer) && (
                                        <div className="p-3 rounded-lg bg-muted/30 text-center">
                                            <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                                            <p className="text-lg font-bold">{formatPrice(affiliateStats.totalEarnings)}</p>
                                            <p className="text-xs text-muted-foreground">Earnings</p>
                                        </div>
                                    )}
                                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                                        <Award className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                                        <p className="text-lg font-bold">20%</p>
                                        <p className="text-xs text-muted-foreground">{('isInfluencer' in affiliateStats && affiliateStats.isInfluencer) ? 'Discount' : 'Commission'}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" className="flex-1">
                                        <a href="/affiliate">View Dashboard</a>
                                    </Button>
                                    <Button asChild className="flex-1 bg-primary">
                                        <a href="/upgrade">Share & Earn</a>
                                    </Button>
                                </div>

                                {'isInfluencer' in affiliateStats && affiliateStats.isInfluencer && (
                                    <p className="text-xs text-center text-[#22c55e]">
                                        🎉 Your referrals get 20% off their upgrade!
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Generate your unique affiliate code and start earning 20% commission on every referral who upgrades to Pro.
                                </p>
                                <AffiliateCodeGenerator isInfluencer={'isInfluencer' in affiliateStats && !!affiliateStats.isInfluencer} />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Trading Preferences */}
                <Card className="tradeet-card">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold">Trading Preferences</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                            Configure your default trading account settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2.5">
                            <Label className="stat-label">System-wide Exchange Rate (ETB)</Label>
                            <ExchangeRateInput initialRate={profile?.exchange_rate || 115} />
                            <p className="text-[10px] text-muted-foreground px-1 leading-relaxed">
                                This rate is used to instantly convert all USD profits to Ethiopian Birr across your entire dashboard.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/30 bg-destructive/5 tradeet-card">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                            Irreversible actions for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                            <div>
                                <p className="text-sm font-medium text-foreground">Delete Account</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all data.</p>
                            </div>
                            <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
