'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signup } from './actions'
import { AlertCircle, Loader2 } from 'lucide-react'

export function LoginForm({ message }: { message?: string }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [isSigningUp, setIsSigningUp] = useState(false)

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
        const fd = new FormData()
        fd.append('email', email)
        fd.append('password', password)
        await login(fd)
        setIsLoggingIn(false)
    }

    async function handleSignup(e: React.MouseEvent) {
        e.preventDefault()
        if (!validate()) return
        setIsSigningUp(true)
        const fd = new FormData()
        fd.append('email', email)
        fd.append('password', password)
        await signup(fd)
        setIsSigningUp(false)
    }

    const isLoading = isLoggingIn || isSigningUp

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
