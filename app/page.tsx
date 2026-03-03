import type { Metadata } from "next";
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, BarChart2, Calendar, Shield, Zap, LineChart, ArrowRight, CheckCircle2, Star, MapPin } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "#1 Trading Journal in Ethiopia | Track & Analyze Your Trades",
  description: "TradeET is Ethiopia's leading trading journal platform. Track forex, crypto, and stock trades with ETB currency support. Analyze performance, improve trading psychology, and become a profitable trader. Free plan available.",
  keywords: ["trading in ethiopia", "trade et", "trading journal", "forex trading ethiopia", "crypto trading ethiopia", "ethiopian traders"],
  alternates: {
    canonical: "https://tradeet.app",
  },
  openGraph: {
    title: "TradeET — Ethiopia's #1 Trading Journal Platform",
    description: "Track, analyze, and improve your trades with Ethiopia's premier trading journal. Multi-currency support including ETB.",
    url: "https://tradeet.app",
    type: "website",
  },
};

const FEATURES = [
    {
        icon: LineChart,
        title: 'Equity Curve Analytics',
        desc: 'Track your real account growth over time. Spot drawdowns the moment they start — before they spiral into account-killers.',
        color: '#8b5cf6',
    },
    {
        icon: BarChart2,
        title: 'Daily P&L Breakdown',
        desc: 'See every trading day at a glance. Instantly identify your strongest and weakest sessions so you can double down on what works.',
        color: '#22c55e',
    },
    {
        icon: Calendar,
        title: 'Trade Calendar',
        desc: 'A full month of trades at a glance. Green days, red days — your entire trading history in one colour-coded heatmap view.',
        color: '#06b6d4',
    },
    {
        icon: Shield,
        title: 'Psychology Tags',
        desc: 'Tag your emotional state on every trade. Reveal the feelings that cost you money — Revenge Trade, FOMO, Perfect Entry — and break the cycle.',
        color: '#f59e0b',
    },
    {
        icon: Zap,
        title: 'Trader Performance Score',
        desc: 'One score that tells the full story. Win rate, profit factor, consistency, and risk-reward — combined into a single actionable number.',
        color: '#8b5cf6',
    },
    {
        icon: TrendingUp,
        title: 'ETB Currency Converter',
        desc: 'All your stats in both USD and Ethiopian Birr with a configurable exchange rate. Finally see your P&L in numbers that feel real to you.',
        color: '#22c55e',
    },
]

const TESTIMONIALS = [
    {
        name: 'Dawit Mulugeta',
        role: 'Forex Trader',
        city: 'Dire Dawa',
        avatar: 'https://i.pravatar.cc/80?u=dawit-mulugeta-trader',
        quote: 'I went from a 47% win rate to 68% in just 3 months — purely from reviewing my equity curve every Sunday. TradeET makes it impossible to lie to yourself about your performance.',
        outcome: '+21% Win Rate',
        color: '#22c55e',
    },
    {
        name: 'Sara Bekele',
        role: 'Crypto Trader',
        city: 'Addis Ababa',
        avatar: 'https://i.pravatar.cc/80?u=sara-bekele-crypto',
        quote: 'The ETB converter is everything. I finally see my P&L in a number that actually makes sense to me. And 3,000 ETB for lifetime access? The best money I\'ve spent on my trading.',
        outcome: '3× Clearer P&L',
        color: '#06b6d4',
    },
    {
        name: 'Abebe Tadesse',
        role: 'Day Trader',
        city: 'Hawassa',
        avatar: 'https://i.pravatar.cc/80?u=abebe-tadesse-daytrader',
        quote: 'The psychology tags showed me I was revenge trading every Monday morning. I fixed that habit in two weeks. My monthly drawdowns are now 60% smaller.',
        outcome: '60% Less Drawdown',
        color: '#f59e0b',
    },
]

const REGIONS = [
    { city: 'Addis Ababa', count: '32+', emoji: '🏙' },
    { city: 'Hawassa', count: '8+', emoji: '🌄' },
    { city: 'Bahir Dar', count: '6+', emoji: '🌊' },
    { city: 'Dire Dawa', count: '5+', emoji: '🌅' },
    { city: 'Mekele', count: '4+', emoji: '🏔' },
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

                    <p className="text-xs text-muted-foreground mt-5">
                        No credit card required &middot; Free forever plan &middot;{' '}
                        <span className="text-primary/80 font-medium">3,000 ETB lifetime Pro</span>
                    </p>
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

            {/* ── Region Trust Bar ──────────────────────────────── */}
            <section className="py-10 px-4 sm:px-6 border-b border-border/30">
                <div className="max-w-4xl mx-auto text-center reveal-fade">
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                            Trusted by active traders across Ethiopia
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {REGIONS.map(r => (
                            <div
                                key={r.city}
                                className="flex items-center gap-2 bg-card/60 border border-border/40 rounded-full px-4 py-2 text-sm hover:border-primary/30 transition-colors"
                            >
                                <span>{r.emoji}</span>
                                <span className="text-foreground/80 font-medium">{r.city}</span>
                                <span className="num text-xs text-primary font-bold">{r.count}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-medium">
                            + 3 more cities
                        </div>
                    </div>
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

            {/* ── Testimonials ──────────────────────────────────── */}
            <section className="py-24 px-4 sm:px-6 bg-card/20 border-y border-border/40">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 reveal-up">
                        <div className="inline-flex items-center gap-2 bg-muted/40 border border-border/40 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                            Testimonials
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                            What Ethiopian traders<br />
                            <span className="text-primary">are saying</span>
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Join 50+ traders who are already building their edge with TradeET.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={t.name}
                                className="group tradeet-card p-6 rounded-2xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 reveal-up flex flex-col"
                                style={{ borderTop: `2px solid ${t.color}40`, animationDelay: `${i * 80}ms` }}
                            >
                                {/* Stars + outcome badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, si) => (
                                            <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                        style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}
                                    >
                                        {t.outcome}
                                    </span>
                                </div>

                                {/* Quote */}
                                <blockquote className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                                    &ldquo;{t.quote}&rdquo;
                                </blockquote>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full border-2 border-border/40 w-10 h-10 object-cover"
                                    />
                                    <div>
                                        <div className="text-sm font-semibold text-foreground">{t.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {t.role} &middot; {t.city}
                                        </div>
                                    </div>
                                </div>
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
                        <div className="relative rounded-2xl overflow-hidden">
                            {/* Gradient border */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/50 via-purple-600/25 to-cyan-500/10 p-[1.5px]">
                                <div className="rounded-2xl h-full w-full bg-card" />
                            </div>

                            {/* Best Value badge */}
                            <div className="absolute top-0 right-6 -translate-y-1/2 z-10">
                                <div className="bg-gradient-to-r from-primary to-purple-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">
                                    Best Value
                                </div>
                            </div>

                            <div className="relative p-8 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-xs uppercase tracking-widest text-primary font-semibold">Pro</div>
                                        <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5 font-bold uppercase tracking-wide">Lifetime</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="num text-4xl font-extrabold">3,000</span>
                                        <span className="text-xl text-muted-foreground font-medium">ETB</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="num text-sm text-primary/80 font-semibold">≈ ~$22 USD</span>
                                        <span className="text-muted-foreground text-sm">· one-time</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">Pay once, own forever.</div>

                                    {/* Savings callout */}
                                    <div className="mt-3 flex items-start gap-2 bg-primary/8 border border-primary/15 rounded-lg px-3 py-2.5">
                                        <span className="text-primary text-xs mt-px shrink-0">💡</span>
                                        <span className="text-xs text-muted-foreground leading-relaxed">
                                            vs. $10/month elsewhere —{' '}
                                            <span className="text-foreground font-semibold">save $100+ per year</span>
                                        </span>
                                    </div>
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
                                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-px text-sm"
                                >
                                    <Zap className="w-4 h-4 fill-primary-foreground" />
                                    Get Lifetime Access
                                </Link>
                                <p className="text-center text-xs text-muted-foreground/60">
                                    No credit card to start &middot; Upgrade anytime
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ─────────────────────────────────────── */}
            <section className="relative py-28 px-4 sm:px-6 overflow-hidden reveal-fade">
                {/* Background glow */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-[100px]" />
                </div>
                <div className="relative max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        Your edge starts with <br />
                        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">knowing your numbers.</span>
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Join free today. Upgrade when you&apos;re ready.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-10 py-4 rounded-2xl text-base hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 hover:-translate-y-0.5 hover:shadow-primary/40"
                    >
                        Start for Free Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* ── SEO Content Section ───────────────────────────── */}
            <section className="py-20 px-4 sm:px-6 bg-card/20 border-y border-border/30">
                <div className="max-w-4xl mx-auto">
                    <article className="prose prose-sm max-w-none text-muted-foreground">
                        <h2 className="text-2xl font-bold text-foreground mb-6">The Best Trading Journal for Ethiopian Traders</h2>
                        
                        <p className="mb-4">
                            <strong className="text-foreground">TradeET</strong> is the premier <strong>trading journal</strong> platform designed specifically for <strong>trading in Ethiopia</strong>. Whether you're trading forex, cryptocurrencies, or stocks, our platform helps Ethiopian traders track their performance, analyze their trades, and improve their profitability with tools tailored to the local market.
                        </p>
                        
                        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Why Choose TradeET for Trading in Ethiopia?</h3>
                        <p className="mb-4">
                            Unlike generic trading journals, TradeET understands the unique needs of <strong>Ethiopian traders</strong>. We provide <strong>ETB currency conversion</strong>, allowing you to see your profits and losses in Ethiopian Birr alongside USD. This makes it easier to understand your real returns in the context of the local economy. Our platform supports traders across Addis Ababa and throughout Ethiopia who are looking to professionalize their trading activities.
                        </p>
                        
                        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Features That Make TradeET the #1 Trade ET Platform</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li><strong>Multi-Currency Support:</strong> Track trades in USD, ETB, and other currencies with live exchange rates</li>
                            <li><strong>Trading Psychology Tracking:</strong> Tag trades with emotions like FOMO, revenge trading, or perfect entry to identify behavioral patterns</li>
                            <li><strong>Performance Analytics:</strong> Visual equity curves, win rate analysis, and profit factor calculations</li>
                            <li><strong>Trade Calendar:</strong> Heatmap visualization of your trading performance over time</li>
                            <li><strong>Trader Score:</strong> A comprehensive metric combining win rate, profit factor, and consistency</li>
                        </ul>
                        
                        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Perfect for Forex, Crypto, and Stock Trading in Ethiopia</h3>
                        <p className="mb-4">
                            Whether you're day trading forex pairs, investing in cryptocurrencies, or trading international stocks, TradeET provides the analytics you need to succeed. Our <strong>trading journal</strong> helps you identify what strategies work best for your trading style and which ones to avoid. Join thousands of Ethiopian traders who have improved their performance by keeping a detailed trading journal.
                        </p>
                        
                        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Get Started with Trade ET Today</h3>
                        <p>
                            Start your journey to becoming a consistently profitable trader with Ethiopia's leading trading journal platform. Our free plan allows you to track up to 50 trades with full access to analytics and reporting. Upgrade to Pro for unlimited trades and advanced features. <strong>TradeET — Trade Smarter, Journal Better.</strong>
                        </p>
                    </article>
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
