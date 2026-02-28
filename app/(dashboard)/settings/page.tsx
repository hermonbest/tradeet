import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ExchangeRateInput } from '@/components/exchange-rate-input'
import { Settings, Zap, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userData?.user?.id).single()

    const isPro = profile?.role === 'pro' || profile?.role === 'admin'

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
                                <h4 className="text-sm font-bold text-foreground">Delete Account</h4>
                                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                                    Permanently delete your account and remove all your trading data. <span className="text-destructive font-medium">This cannot be undone.</span>
                                </p>
                            </div>
                            <form action={async () => {
                                "use server"
                                const { deleteAccount } = await import('@/app/(dashboard)/actions')
                                await deleteAccount()
                            }}>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                    className="font-bold shadow-lg shadow-destructive/25"
                                >
                                    Delete My Account
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
