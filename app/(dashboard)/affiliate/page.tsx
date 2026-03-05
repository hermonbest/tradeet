import type { Metadata } from "next";
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    DollarSign,
    TrendingUp,
    Award,
    Share2,
    Wallet,
    Clock,
    CheckCircle2,
    Star
} from 'lucide-react'
import { getUserAffiliateStats } from '@/app/(dashboard)/actions'
import { formatPrice } from '@/lib/constants'
import { AffiliateCodeGenerator } from '@/components/affiliate-code-generator'
import { CopyButton } from '@/components/copy-button'

export const metadata: Metadata = {
    title: "Affiliate Program — Earn Rewards Sharing TradeET",
    description: "Join the TradeET affiliate program. Share your referral code and earn rewards when friends upgrade to Pro. Track your referrals and earnings.",
    alternates: {
        canonical: "https://tradeet.app/affiliate",
    },
};

export default async function AffiliatePage() {
    const supabase = await createClient()
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
        redirect('/login')
    }

    const result = await getUserAffiliateStats()

    if ('error' in result) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="tradeet-card p-8 text-center">
                    <p className="text-red-500">Error loading affiliate data: {result.error}</p>
                </div>
            </div>
        )
    }

    const stats = result.data

    if (!stats) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="tradeet-card p-8 text-center">
                    <p className="text-muted-foreground">No affiliate data found.</p>
                </div>
            </div>
        )
    }

    const hasAffiliateCode = !!stats.affiliateCode

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        {stats.isInfluencer
                            ? "Share TradeET Pro with your audience and give them a special discount"
                            : "Earn commissions by referring new users to TradeET Pro"}
                    </p>
                </div>
                {stats.isInfluencer && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 w-fit">
                        <Star className="w-3 h-3 mr-1" />
                        Influencer
                    </Badge>
                )}
            </div>

            {/* No Code State */}
            {!hasAffiliateCode && (
                <Card className="border-dashed border-2">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Share2 className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Start Earning Today</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mt-2">
                                Generate your unique affiliate code and share it with friends.
                                {stats.isInfluencer
                                    ? "Generate your unique creator code and share it with your audience. Give them 20% off when they upgrade to TradeET Pro!"
                                    : "Earn 20% commission when they upgrade to TradeET Pro!"}
                            </p>
                        </div>
                        <AffiliateCodeGenerator isInfluencer={stats.isInfluencer} />
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            {hasAffiliateCode && (
                <>
                    {/* Affiliate Code Card */}
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Your Affiliate Code</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <code className="text-3xl font-bold text-primary tracking-wider">
                                            {stats.affiliateCode}
                                        </code>
                                        <CopyButton text={stats.affiliateCode!} />
                                    </div>
                                </div>
                                {!stats.isInfluencer && (
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Commission Rate</p>
                                        <p className="text-2xl font-bold">20%</p>
                                    </div>
                                )}
                            </div>

                            {stats.isInfluencer && (
                                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                        <Star className="w-4 h-4 inline mr-1" />
                                        <strong>Influencer Benefit:</strong> Your referrals get 20% off their upgrade!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className={`grid ${stats.isInfluencer ? 'sm:grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-4`}>
                        <StatCard
                            icon={<Users className="w-5 h-5" />}
                            label="Total Referrals"
                            value={stats.totalReferrals.toString()}
                            color="blue"
                        />
                        {!stats.isInfluencer && (
                            <>
                                <StatCard
                                    icon={<DollarSign className="w-5 h-5" />}
                                    label="Total Earnings"
                                    value={formatPrice(stats.totalEarnings)}
                                    color="green"
                                />
                                <StatCard
                                    icon={<Wallet className="w-5 h-5" />}
                                    label="Pending Earnings"
                                    value={formatPrice(stats.pendingEarnings)}
                                    color="yellow"
                                />
                                <StatCard
                                    icon={<CheckCircle2 className="w-5 h-5" />}
                                    label="Paid Earnings"
                                    value={formatPrice(stats.totalPaidEarnings)}
                                    color="purple"
                                />
                            </>
                        )}
                    </div>

                    {/* Commissions Table */}
                    {!stats.isInfluencer && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Commission History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(stats.commissions || []).length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No commissions yet. Start sharing your code!</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Referred User</th>
                                                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                                                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(stats.commissions || []).map((commission: any) => (
                                                    <tr key={commission.id} className="border-b border-border/50">
                                                        <td className="py-3 px-4 text-sm">
                                                            {new Date(commission.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm">
                                                            {commission.referred_user?.email || 'Unknown'}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-right font-medium">
                                                            {formatPrice(commission.amount_due)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge
                                                                variant={commission.status === 'paid' ? 'default' : 'secondary'}
                                                                className={commission.status === 'paid'
                                                                    ? 'bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30'
                                                                    : 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30'
                                                                }
                                                            >
                                                                {commission.status === 'paid' ? (
                                                                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</>
                                                                ) : (
                                                                    <><Clock className="w-3 h-3 mr-1" /> Pending</>
                                                                )}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* How It Works */}
                    <Card>
                        <CardHeader>
                            <CardTitle>How It Works</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-3 gap-6">
                                <StepCard
                                    number={1}
                                    title="Share Your Code"
                                    description={stats.isInfluencer
                                        ? "Share your unique creator code with your friends and followers"
                                        : "Share your unique affiliate code with friends and followers"}
                                />
                                <StepCard
                                    number={2}
                                    title="They Upgrade"
                                    description={stats.isInfluencer
                                        ? "When someone uses your code to upgrade to Pro, they get a 20% discount"
                                        : "When someone uses your code to upgrade to Pro, you earn commission"}
                                />
                                <StepCard
                                    number={3}
                                    title={stats.isInfluencer ? "Build Influence" : "Get Paid"}
                                    description={stats.isInfluencer
                                        ? "Grow your community by sharing valuable content and helping others save"
                                        : "Earn 20% of what they pay. Commissions are paid out monthly"}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}

// Stat Card Component
function StatCard({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode
    label: string
    value: string
    color: 'blue' | 'green' | 'yellow' | 'purple'
}) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-500',
        green: 'bg-[#22c55e]/10 text-[#22c55e]',
        yellow: 'bg-yellow-500/10 text-yellow-600',
        purple: 'bg-purple-500/10 text-purple-500'
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Step Card Component
function StepCard({
    number,
    title,
    description
}: {
    number: number
    title: string
    description: string
}) {
    return (
        <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
                {number}
            </div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}

