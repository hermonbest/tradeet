import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, BarChart2, Calendar, Shield, Zap, LineChart, ArrowRight, CheckCircle2, Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
    {
        icon: LineChart,
        title: 'Equity Curve Analytics',
        desc: 'Visualise your cumulative P&L over time and spot drawdown periods before they spiral.',
        color: '#8b5cf6',
    },
    {
        icon: BarChart2,
        title: 'Daily P&L Breakdown',
        desc: 'Bar-by-bar breakdown of every session. See your best and worst days at a glance.',
        color: '#22c55e',
    },
    {
        icon: Calendar,
        title: 'Trade Calendar',
        desc: 'High-density monthly heatmap. Every session\'s result in one colour-coded view.',
        color: '#06b6d4',
    },
    {
        icon: Shield,
        title: 'Psychology Tags',
        desc: 'Tag each trade with what you were feeling — Revenge Trade, FOMO, Perfect Entry. Pattern your mindset.',
        color: '#f59e0b',
    },
    {
        icon: Zap,
        title: 'Trader Performance Score',
        desc: 'A single number that weighs your win rate, profit factor, consistency, and risk-reward ratio.',
        color: '#8b5cf6',
    },
    {
        icon: TrendingUp,
        title: 'ETB Currency Converter',
        desc: 'See every stat in both USD and Ethiopian Birr with a live-configurable exchange rate.',
        color: '#22c55e',
    },
]

const FREE_FEATURES = ['Up to 50 trades', 'Full dashboard & charts', 'Trade calendar', 'Psychology tags', 'ETB converter']
const PRO_FEATURES = ['Everything in Free', 'Unlimited trade logging', 'Trader Performance Score', 'Screenshot upload', 'Priority support', 'All future features']

const STATS = [
    { value: '50+', label: 'Traders Journaling' },
    { value: '1,000+', label: 'Trades Logged' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Data Privacy' },
]

export default async function RootPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
            {/* ── Navbar ────────────────────────────────────────── */}
            <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">TradeET</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
                {/* Glow orbs */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute bottom-0 left-[-15%] w-[500px] h-[400px] rounded-full bg-purple-700/8 blur-[100px]" />
                    <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[80px]" />
                </div>

                {/* Grid texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: 'linear-gradient(oklch(0.6 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0 0) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />

                <div className="relative max-w-4xl mx-auto text-center reveal-zoom">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Built for Ethiopian Traders
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
                        Trade Smarter.<br />
                        <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Journal Better.
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        TradeET is the trading journal built for the Ethiopian market —
                        multi-currency P&L, psychology tracking, and powerful analytics
                        to help you become a consistently profitable trader.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl text-base hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 hover:-translate-y-0.5"
                        >
                            Start Journaling — Free
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="#features"
                            className="inline-flex items-center justify-center gap-2 border border-border/60 text-foreground font-semibold px-8 py-4 rounded-2xl text-base hover:bg-muted/40 hover:border-border transition-all"
                        >
                            See Features
                        </a>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">No credit card required · Free forever plan · 1,000 ETB lifetime Pro</p>
                </div>

                {/* Dashboard preview card */}
                <div className="relative max-w-5xl mx-auto mt-20 reveal-up">
                    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden">
                        {/* Fake browser bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-card/80">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                            </div>
                            <div className="flex-1 mx-4 h-5 rounded-md bg-muted/40 flex items-center px-2">
                                <span className="text-[11px] text-muted-foreground/60">tradeet.app/dashboard</span>
                            </div>
                        </div>

                        {/* Dashboard mockup */}
                        <div className="p-4 sm:p-6 bg-background/70">
                            {/* Stats row */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {[
                                    { label: 'Net P&L', value: '+$2,840', color: '#22c55e' },
                                    { label: 'Win Rate', value: '68%', color: '#8b5cf6' },
                                    { label: 'Profit Factor', value: '2.14', color: '#06b6d4' },
                                    { label: 'Total Trades', value: '47', color: '#f59e0b' },
                                ].map(s => (
                                    <div key={s.label} className="tradeet-card p-3 rounded-xl" style={{ borderTop: `2px solid ${s.color}60` }}>
                                        <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{s.label}</div>
                                        <div className="num font-bold text-base" style={{ color: s.color }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart area */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 tradeet-card rounded-xl p-4 h-40 flex flex-col">
                                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">Equity Curve</div>
                                    <EquityMockup />
                                </div>
                                <div className="tradeet-card rounded-xl p-4 h-40 flex flex-col items-center justify-center gap-2">
                                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Win Rate</div>
                                    <DonutMockup />
                                    <div className="num text-xl font-bold text-[#22c55e]">68%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Bar ─────────────────────────────────────── */}
            <section className="border-y border-border/40 bg-card/30 py-8 px-4 reveal-fade">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {STATS.map(s => (
                        <div key={s.label}>
                            <div className="num text-3xl font-extrabold text-foreground mb-1">{s.value}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────── */}
            <section id="features" className="py-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 reveal-up">
                        <div className="inline-flex items-center gap-2 bg-muted/40 border border-border/40 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                            Features
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                            Everything you need to<br />
                            <span className="text-primary">level up your trading</span>
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            No fluff. Just the tools that actually matter for building consistency and protecting your capital.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.title}
                                className="group tradeet-card p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/8 reveal-up"
                                style={{ borderTop: `2px solid ${f.color}40`, animationDelay: `${i * 50}ms` }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                                >
                                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                                </div>
                                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ───────────────────────────────────────── */}
            <section id="pricing" className="py-24 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14 reveal-up">
                        <div className="inline-flex items-center gap-2 bg-muted/40 border border-border/40 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                            Pricing
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                            Honest, simple pricing
                        </h2>
                        <p className="text-muted-foreground">One-time payment. No subscriptions. No hidden fees. Ever.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 reveal-up">
                        {/* Free */}
                        <div className="tradeet-card p-8 rounded-2xl space-y-6">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Free</div>
                                <div className="num text-4xl font-extrabold">$0</div>
                                <div className="text-sm text-muted-foreground mt-1">Forever free, no card needed</div>
                            </div>
                            <ul className="space-y-3">
                                {FREE_FEATURES.map(f => (
                                    <li key={f} className="flex items-center gap-3 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/login"
                                className="block text-center border border-border/60 hover:bg-muted/40 hover:border-border text-foreground font-semibold px-6 py-3 rounded-xl transition-all text-sm"
                            >
                                Get Started Free
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="relative rounded-2xl overflow-hidden group">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/40 via-purple-600/20 to-transparent p-[1px]">
                                <div className="rounded-2xl h-full w-full bg-card" />
                            </div>
                            <div className="relative p-8 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-xs uppercase tracking-widest text-primary font-semibold">Pro</div>
                                        <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5 font-bold uppercase tracking-wide">Lifetime</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="num text-4xl font-extrabold">1,000</span>
                                        <span className="text-xl text-muted-foreground font-medium">ETB</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">One-time. Pay once, own forever.</div>
                                </div>
                                <ul className="space-y-3">
                                    {PRO_FEATURES.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-sm"
                                >
                                    <Zap className="w-4 h-4 fill-primary-foreground" />
                                    Upgrade to Pro
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ─────────────────────────────────────── */}
            <section className="relative py-28 px-4 sm:px-6 overflow-hidden reveal-fade">
                <div className="relative max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">
                        Your edge starts with <br />
                        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">knowing your numbers.</span>
                    </h2>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-10 py-4 rounded-2xl text-base hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30"
                    >
                        Start for Free Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <footer className="border-t border-border/40 py-8 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-foreground">TradeET</span>
                    </div>
                    <p>© {new Date().getFullYear()} TradeET — Ethiopian Trading Journal</p>
                </div>
            </footer>
        </div>
    )
}

function EquityMockup() {
    return (
        <svg viewBox="0 0 100 90" className="flex-1 w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d="M0 80 L15 70 L25 55 L35 60 L50 40 L60 30 L75 20 L90 15 L100 5 L100 90 L0 90 Z" fill="url(#heroGrad)" />
            <path d="M0 80 L15 70 L25 55 L35 60 L50 40 L60 30 L75 20 L90 15 L100 5" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function DonutMockup() {
    return (
        <svg viewBox="0 0 40 40" className="w-14 h-14">
            <circle cx="20" cy="20" r="14" fill="none" stroke="#27272a" strokeWidth="6" />
            <circle cx="20" cy="20" r="14" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="60 40" strokeDashoffset="25" strokeLinecap="round" />
        </svg>
    )
}
