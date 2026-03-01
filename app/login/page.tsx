import { TrendingUp } from 'lucide-react'
import { LoginForm } from './login-form'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const resolvedParams = await searchParams

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-background">
            {/* Brand glow background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-purple-700/6 blur-[100px]" />
            </div>

            {/* Grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(oklch(0.5 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.5 0 0) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Card */}
            <div className="page-enter relative w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-2xl shadow-primary/40 mb-4">
                        <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">TradeET</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Ethiopian Trading Journal</p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/40 p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-foreground">Welcome back</h2>
                        <p className="text-sm text-muted-foreground mt-1">Sign in to your journal to continue.</p>
                    </div>

                    <LoginForm message={resolvedParams?.message} />

                    <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest">
                        New here? Use "Create Account" above.
                    </p>
                </div>
            </div>
        </div>
    )
}

