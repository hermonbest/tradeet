import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { approvePayment, rejectPayment, revokePro, payCommission, toggleInfluencerStatusAction } from '@/app/(dashboard)/actions'
import { ExternalLink, Users, Clock, CheckCircle, ShieldCheck, ShieldOff, Wallet, Star, Award, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { formatPrice } from '@/lib/constants'
import { getAffiliatesAdmin } from '@/app/(dashboard)/actions'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData?.user?.id).single()

    if (profile?.role !== 'admin') redirect('/')

    // Pending payments
    const { data: pendingPayments, error: pendingError } = await supabase
        .from('payments')
        .select('*, profiles(email, affiliate_code, is_influencer)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (pendingError) {
        console.error('Error fetching pending payments:', pendingError)
    }

    // All pro users with affiliate info
    const { data: proUsers } = await supabase
        .from('profiles')
        .select('id, email, created_at, role, affiliate_code, is_influencer, referred_by_id')
        .in('role', ['pro'])
        .order('created_at', { ascending: false })

    // Stats
    const { count: totalApproved } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

    // Commissions
    const { data: commissions } = await supabase
        .from('commissions')
        .select('*, affiliate:affiliate_id(email, affiliate_code), referred_user:referred_user_id(email)')
        .order('created_at', { ascending: false })

    // Get affiliates with stats
    const affiliatesData = await getAffiliatesAdmin()
    const affiliates = ('affiliates' in affiliatesData && affiliatesData.affiliates) ? affiliatesData.affiliates : []

    // Calculate commission stats
    const pendingCommissions = (commissions || []).filter(c => c.status === 'pending')
    const paidCommissions = (commissions || []).filter(c => c.status === 'paid')
    const totalPendingAmount = pendingCommissions.reduce((sum, c) => sum + (c.amount_due || 0), 0)
    const totalPaidAmount = paidCommissions.reduce((sum, c) => sum + (c.amount_due || 0), 0)

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Payment & Affiliate Management</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="tradeet-card p-4">
                    <div className="stat-label">Pending Approval</div>
                    <div className="num text-3xl font-bold text-[#ef4444] mt-1">{pendingPayments?.length ?? 0}</div>
                </div>
                <div className="tradeet-card p-4">
                    <div className="stat-label">Total Pro Users</div>
                    <div className="num text-3xl font-bold text-primary mt-1">{proUsers?.length ?? 0}</div>
                </div>
                <div className="tradeet-card p-4">
                    <div className="stat-label">Pending Commissions</div>
                    <div className="num text-3xl font-bold text-yellow-500 mt-1">{formatPrice(totalPendingAmount)}</div>
                </div>
                <div className="tradeet-card p-4">
                    <div className="stat-label">Total Paid Commissions</div>
                    <div className="num text-3xl font-bold text-[#22c55e] mt-1">{formatPrice(totalPaidAmount)}</div>
                </div>
            </div>

            {/* Pending Payments */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#ef4444]" />
                    Pending Payments
                    {(pendingPayments?.length ?? 0) > 0 && (
                        <Badge variant="destructive" className="ml-1 text-xs">{pendingPayments!.length}</Badge>
                    )}
                </h2>

                {(!pendingPayments || pendingPayments.length === 0) ? (
                    <div className="tradeet-card p-8 text-center text-muted-foreground">
                        ✅ No pending payments. All caught up!
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {pendingPayments.map(payment => (
                            <div key={payment.id} className="tradeet-card overflow-hidden flex flex-col">
                                {/* Receipt Preview */}
                                <div className="h-44 bg-muted relative border-b border-border overflow-hidden">
                                    {payment.screenshot_url ? (
                                        <>
                                            <a
                                                href={payment.screenshot_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors z-10"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <img
                                                src={payment.screenshot_url}
                                                alt="Payment Receipt"
                                                className="w-full h-full object-cover"
                                            />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                                            No receipt uploaded
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground truncate">{payment.profiles?.email}</p>
                                        <p className="text-xs text-muted-foreground">Phone: <span className="num">{payment.phone_number}</span></p>
                                        {payment.amount && (
                                            <p className="text-xs text-muted-foreground">Amount Claimed: <span className="num font-medium">{formatPrice(payment.amount)}</span></p>
                                        )}
                                        {payment.referral_code && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    Ref: {payment.referral_code}
                                                </Badge>
                                                {payment.profiles?.is_influencer && (
                                                    <Badge className="bg-yellow-500/20 text-yellow-600 text-xs">
                                                        <Star className="w-3 h-3 mr-1" />
                                                        Influencer
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Submitted: {payment.created_at ? format(new Date(payment.created_at), 'MMM d, yyyy · HH:mm') : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <form action={async (formData: FormData) => {
                                            'use server'
                                            const actualAmount = parseFloat(formData.get('actualAmount') as string) || payment.amount || 3000
                                            await approvePayment(payment.id, payment.user_id, actualAmount)
                                        }} className="flex-1 space-y-2">
                                            <Input
                                                name="actualAmount"
                                                type="number"
                                                placeholder={`Actual amount (${payment.amount || 3000})`}
                                                className="text-xs h-8"
                                            />
                                            <Button type="submit" className="w-full bg-[#22c55e]/20 hover:bg-[#22c55e]/30 text-[#22c55e] border border-[#22c55e]/40" variant="ghost" size="sm">
                                                ✅ Approve
                                            </Button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            await rejectPayment(payment.id)
                                        }} className="flex-1">
                                            <Button type="submit" className="w-full mt-8" variant="destructive" size="sm">
                                                ❌ Reject
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Commissions Section */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    Commissions
                    <Badge variant="secondary" className="ml-1">{commissions?.length || 0}</Badge>
                </h2>

                {(!commissions || commissions.length === 0) ? (
                    <div className="tradeet-card p-8 text-center text-muted-foreground">
                        No commissions recorded yet.
                    </div>
                ) : (
                    <div className="tradeet-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 stat-label">Affiliate</th>
                                    <th className="text-left px-4 py-3 stat-label">Referred User</th>
                                    <th className="text-right px-4 py-3 stat-label">Amount</th>
                                    <th className="text-center px-4 py-3 stat-label">Status</th>
                                    <th className="text-right px-4 py-3 stat-label">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.map(commission => (
                                    <tr key={commission.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="text-foreground">{commission.affiliate?.email}</div>
                                            {commission.affiliate?.affiliate_code && (
                                                <div className="text-xs text-muted-foreground">{commission.affiliate.affiliate_code}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {commission.referred_user?.email}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatPrice(commission.amount_due)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge
                                                variant={commission.status === 'paid' ? 'default' : 'secondary'}
                                                className={commission.status === 'paid'
                                                    ? 'bg-[#22c55e]/20 text-[#22c55e]'
                                                    : 'bg-yellow-500/20 text-yellow-600'
                                                }
                                            >
                                                {commission.status === 'paid' ? 'Paid' : 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {commission.status === 'pending' && (
                                                <form action={async () => {
                                                    'use server'
                                                    await payCommission(commission.id)
                                                }}>
                                                    <Button type="submit" variant="ghost" size="sm" className="text-[#22c55e] hover:bg-[#22c55e]/10 text-xs">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Mark Paid
                                                    </Button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Affiliates Section */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Affiliates
                    <Badge variant="secondary" className="ml-1">{affiliates.length}</Badge>
                </h2>

                {affiliates.length === 0 ? (
                    <div className="tradeet-card p-8 text-center text-muted-foreground">
                        No affiliates yet.
                    </div>
                ) : (
                    <div className="tradeet-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 stat-label">User</th>
                                    <th className="text-left px-4 py-3 stat-label">Code</th>
                                    <th className="text-center px-4 py-3 stat-label">Influencer</th>
                                    <th className="text-right px-4 py-3 stat-label">Referrals</th>
                                    <th className="text-right px-4 py-3 stat-label">Earnings</th>
                                    <th className="text-center px-4 py-3 stat-label">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {affiliates.map(affiliate => (
                                    <tr key={affiliate.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="text-foreground">{affiliate.email}</div>
                                            {affiliate.name && <div className="text-xs text-muted-foreground">{affiliate.name}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{affiliate.affiliate_code}</code>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {affiliate.is_influencer ? (
                                                <Badge className="bg-yellow-500/20 text-yellow-600">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">No</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right num">
                                            {affiliate.totalReferrals}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-medium">{formatPrice(affiliate.totalEarnings)}</div>
                                            {affiliate.pendingEarnings > 0 && (
                                                <div className="text-xs text-yellow-600">{formatPrice(affiliate.pendingEarnings)} pending</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <form action={async () => {
                                                'use server'
                                                await toggleInfluencerStatusAction(affiliate.id, !affiliate.is_influencer)
                                            }}>
                                                <Button type="submit" variant="ghost" size="sm" className="text-xs">
                                                    {affiliate.is_influencer ? 'Remove Influencer' : 'Make Influencer'}
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pro Users Table */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Pro Users
                </h2>

                {(!proUsers || proUsers.length === 0) ? (
                    <div className="tradeet-card p-8 text-center text-muted-foreground">No Pro users yet.</div>
                ) : (
                    <div className="tradeet-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-4 py-3 stat-label">Email</th>
                                    <th className="text-left px-4 py-3 stat-label">Status</th>
                                    <th className="text-left px-4 py-3 stat-label">Affiliate Code</th>
                                    <th className="text-left px-4 py-3 stat-label">Since</th>
                                    <th className="text-right px-4 py-3 stat-label">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proUsers.map(user => (
                                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 text-foreground">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <Badge className="bg-primary/20 text-primary border-primary/40 text-xs">PRO</Badge>
                                            {user.is_influencer && (
                                                <Badge className="bg-yellow-500/20 text-yellow-600 text-xs ml-1">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Influencer
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.affiliate_code ? (
                                                <code className="text-xs bg-muted px-2 py-1 rounded">{user.affiliate_code}</code>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground num text-xs">
                                            {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <form action={async () => {
                                                'use server'
                                                await revokePro(user.id)
                                            }}>
                                                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs gap-1">
                                                    <ShieldOff className="w-3 h-3" />
                                                    Revoke
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    )
}
