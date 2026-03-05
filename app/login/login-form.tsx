'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signup, googleLogin } from './actions'
import { AlertCircle, Loader2 } from 'lucide-react'

export function LoginForm({ message }: { message?: string }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [isSigningUp, setIsSigningUp] = useState(false)
    const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false)

    // Reset loading states when message arrives (after redirect)
    useEffect(() => {
        setIsLoggingIn(false)
        setIsSigningUp(false)
        setIsGoogleLoggingIn(false)
    }, [message])

    function validate() {
        const errs: { email?: string; password?: string } = {}
        if (!email || !email.includes('@')) errs.email = 'Enter a valid email address.'
        if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters.'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return
        setIsLoggingIn(true)
        try {
            const fd = new FormData()
            fd.append('email', email)
            fd.append('password', password)
            await login(fd)
        } finally {
            setIsLoggingIn(false)
        }
    }

    async function handleSignup(e: React.MouseEvent) {
        e.preventDefault()
        if (!validate()) return
        setIsSigningUp(true)
        try {
            const fd = new FormData()
            fd.append('email', email)
            fd.append('password', password)
            await signup(fd)
        } finally {
            setIsSigningUp(false)
        }
    }

    async function handleGoogleLogin(e: React.MouseEvent) {
        e.preventDefault()
        setIsGoogleLoggingIn(true)
        try {
            await googleLogin()
        } finally {
            setIsGoogleLoggingIn(false)
        }
    }

    const isLoading = isLoggingIn || isSigningUp || isGoogleLoggingIn

    return (
        <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                    disabled={isLoading}
                    className={`h-11 bg-background/60 border-border/60 focus:border-primary/60 transition-colors ${errors.email ? 'border-red-500/60' : ''}`}
                    autoComplete="email"
                />
                {errors.email && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Password
                </Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                    disabled={isLoading}
                    className={`h-11 bg-background/60 border-border/60 focus:border-primary/60 transition-colors ${errors.password ? 'border-red-500/60' : ''}`}
                    autoComplete="current-password"
                />
                {errors.password && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.password}
                    </p>
                )}
            </div>

            {message && (
                <div className={message.toLowerCase().includes('check email') || message.toLowerCase().includes('applied') ? 'success-banner' : 'error-banner'}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{message}</span>
                </div>
            )}

            <div className="flex flex-col gap-2.5 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                    className="w-full h-11 border-border/60 hover:bg-muted/50 font-semibold transition-all flex items-center justify-center gap-2"
                >
                    {isGoogleLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </>
                    )}
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all"
                >
                    {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleSignup}
                    className="w-full h-11 border-border/60 hover:bg-muted/50 font-semibold transition-all"
                >
                    {isSigningUp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </Button>
            </div>
        </form>
    )
}
