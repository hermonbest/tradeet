import { createClient } from '@/utils/supabase/server'
import { PaymentForm } from '@/components/payment-form'
import { Check, X, Zap, ShieldCheck, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const FREE_FEATURES = [
    { label: 'Up to 50 trades', available: true },
    { label: 'Net P&L Dashboard', available: true },
    { label: 'Win Rate & Charts', available: true },
    { label: 'Calendar View', available: true },
    { label: 'Exchange Rate Converter', available: true },
    { label: 'Zella Performance Score', available: false },
    { label: 'Unlimited Trade Logging', available: false },
    { label: 'Screenshot Upload', available: false },
]

const PRO_FEATURES = [
    { label: 'Everything in Free', available: true },
    { label: 'Unlimited Trade Logging', available: true },
    { label: 'Zella Performance Score', available: true },
    { label: 'Screenshot Upload', available: true },
    { label: 'Priority Support', available: true },
    { label: 'All Future Features', available: true },
]

export default async function UpgradePage() {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData?.user?.id).single()

    const isPro = profile?.role === 'pro' || profile?.role === 'admin'

    if (isPro) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
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
                    Unlock unlimited trade logging, your Zella performance score, and all future features — forever.
                </p>
                <div className="text-5xl font-bold num text-foreground">
                    1,000 <span className="text-2xl text-muted-foreground font-normal">ETB</span>
                </div>
                <p className="text-sm text-muted-foreground">One-time payment. No subscriptions. No hidden fees.</p>
            </div>

            {/* Feature Comparison */}
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
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">Pro</h2>
                            <Badge className="bg-primary/20 text-primary border-primary/40">Recommended</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">After Payment</p>
                    </div>
                    <ul className="space-y-3 relative">
                        {PRO_FEATURES.map(f => (
                            <li key={f.label} className="flex items-center gap-3 text-sm">
                                <Check className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-foreground">{f.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Payment Section */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Instructions */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">How to Pay</h2>
                        <p className="text-muted-foreground text-sm mt-1">Transfer 1,000 ETB to one of the accounts below, then upload your receipt.</p>
                    </div>

                    <div className="space-y-3">
                        <div className="tradeet-card p-5 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-foreground">Telebirr</h3>
                                <Badge variant="outline" className="text-xs">Mobile</Badge>
                            </div>
                            <p className="num text-2xl font-bold tracking-widest text-primary">0911 234 567</p>
                            <p className="text-xs text-muted-foreground">Account Name: <span className="text-foreground">Abebe Bikila</span></p>
                        </div>

                        <div className="tradeet-card p-5 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-foreground">CBE Birr</h3>
                                <Badge variant="outline" className="text-xs">Bank</Badge>
                            </div>
                            <p className="num text-2xl font-bold tracking-widest text-primary">1000 1234 5678</p>
                            <p className="text-xs text-muted-foreground">Account Name: <span className="text-foreground">Abebe Bikila</span></p>
                        </div>
                    </div>

                    <ol className="space-y-3">
                        {[
                            'Transfer exactly 1,000 ETB to one of the accounts above.',
                            'Take a screenshot of the successful transfer receipt.',
                            'Fill in your phone number and upload the screenshot.',
                            'We will verify and activate your Pro access within 24 hours.',
                        ].map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                                <span className="num w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Payment Form */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Submit Your Receipt</h2>
                    <PaymentForm />
                </div>
            </div>
        </div>
    )
}
