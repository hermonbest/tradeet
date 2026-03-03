'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateUserAffiliateCode } from '@/app/(dashboard)/actions'
import { Loader2, Sparkles, CheckCircle2, Copy } from 'lucide-react'

export function AffiliateCodeGenerator({ isInfluencer = false }: { isInfluencer?: boolean }) {
    const [customCode, setCustomCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        success?: boolean
        code?: string
        error?: string
    } | null>(null)

    const handleGenerate = async () => {
        setLoading(true)
        const response = await generateUserAffiliateCode()
        setResult(response)
        setLoading(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    if (result?.success && result.code) {
        const shareUrl = `${window.location.origin}/upgrade?ref=${result.code}`

        return (
            <div className="space-y-4">
                <div className="p-4 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg">
                    <div className="flex items-center gap-2 text-[#22c55e] mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Your code is ready!</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="text-2xl font-bold tracking-wider">{result.code}</code>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.code!)}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm">Share Link</Label>
                    <div className="flex gap-2">
                        <Input
                            value={shareUrl}
                            readOnly
                            className="bg-muted"
                        />
                        <Button
                            variant="secondary"
                            onClick={() => copyToClipboard(shareUrl)}
                        >
                            Copy
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {result?.error && !result.success && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-700">
                    {result.error}
                    {result.code && (
                        <div className="mt-2">
                            <span className="font-medium">Your existing code: </span>
                            <code className="font-bold">{result.code}</code>
                        </div>
                    )}
                </div>
            )}

            <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full"
                size="lg"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isInfluencer ? 'Generate My Creator Code' : 'Generate My Affiliate Code'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                {isInfluencer
                    ? 'Click above to generate your unique creator code and give your audience a 20% discount!'
                    : 'Click above to generate your unique referral code and start earning commissions!'}
            </p>
        </div>
    )
}
