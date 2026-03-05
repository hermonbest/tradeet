'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Check, X, Tag, Percent, Loader2 } from 'lucide-react'
// validation moved to server API to avoid bundling server-only code in client
import { AFFILIATE_CONSTANTS, formatPrice } from '@/lib/constants'

interface ReferralInputProps {
    onValidCode: (code: string, isInfluencer: boolean, finalPrice: number) => void
    onClear: () => void
}

export function ReferralInput({ onValidCode, onClear }: ReferralInputProps) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        valid: boolean
        isInfluencer: boolean
        discountAmount: number
        finalPrice: number
        message?: string
    } | null>(null)

    const handleValidate = async () => {
        if (!code.trim()) return
        
        setLoading(true)
        try {
            const res = await fetch('/api/validate-referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            })
            const validation = await res.json()
            setResult(validation)
            if (validation.valid) {
                onValidCode(code.trim().toUpperCase(), validation.isInfluencer, validation.finalPrice)
            }
        } catch (err) {
            console.error('Validation error', err)
            setResult({ valid: false, isInfluencer: false, discountAmount: 0, finalPrice: AFFILIATE_CONSTANTS.BASE_PRICE, message: 'Server error' })
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setCode('')
        setResult(null)
        onClear()
    }

    return (
        <div className="space-y-3">
            <Label className="stat-label flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Referral Code (Optional)
            </Label>
            
            <div className="flex gap-2">
                <Input
                    placeholder="e.g., JOE20"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={loading || result?.valid}
                    className="bg-background border-border uppercase"
                    maxLength={10}
                />
                {!result?.valid ? (
                    <Button 
                        onClick={handleValidate} 
                        disabled={loading || !code.trim()}
                        variant="secondary"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </Button>
                ) : (
                    <Button 
                        onClick={handleClear}
                        variant="ghost"
                        size="icon"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Result Message */}
            {result && (
                <div className={`p-3 rounded-lg text-sm ${
                    result.valid
                        ? 'bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]'
                        : 'bg-red-500/10 border border-red-500/30 text-red-500'
                }`}>
                    <div className="flex items-start gap-2">
                        {result.valid ? (
                            <Check className="w-4 h-4 mt-0.5 shrink-0" />
                        ) : (
                            <X className="w-4 h-4 mt-0.5 shrink-0" />
                        )}
                        <div className="space-y-1 w-full">
                            <p>{result.message}</p>
                            {result.valid && result.isInfluencer && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="border-[#22c55e]/40 text-[#22c55e]">
                                        <Percent className="w-3 h-3 mr-1" />
                                        20% OFF
                                    </Badge>
                                    <span className="text-xs">
                                        You save {formatPrice(result.discountAmount)}!
                                    </span>
                                </div>
                            )}
                            {result.valid && (
                                <div className="pt-2 mt-2 border-t border-[#22c55e]/20">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Original:</span>
                                        <span className="line-through">{formatPrice(AFFILIATE_CONSTANTS.BASE_PRICE)}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-semibold text-base mt-1">
                                        <span>Now Pay:</span>
                                        <span className="text-[#22c55e]">{formatPrice(result.finalPrice)} ETB</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Have a referral code? Enter it above to get a discount if it's from an influencer.
            </p>
        </div>
    )
}

// Price display component
interface PriceDisplayProps {
    originalPrice: number
    finalPrice: number
    discountAmount: number
    isInfluencer: boolean
}

export function PriceDisplay({ originalPrice, finalPrice, discountAmount, isInfluencer }: PriceDisplayProps) {
    const hasDiscount = discountAmount > 0

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Original Price</span>
                <span className={hasDiscount ? "line-through text-muted-foreground" : "font-semibold"}>
                    {formatPrice(originalPrice)}
                </span>
            </div>
            
            {hasDiscount && (
                <div className="flex items-center justify-between text-[#22c55e]">
                    <span className="flex items-center gap-1">
                        <Percent className="w-4 h-4" />
                        {isInfluencer ? 'Influencer Discount' : 'Referral Discount'}
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                </div>
            )}
            
            <div className="h-px bg-border" />
            
            <div className="flex items-center justify-between">
                <span className="font-semibold">Total to Pay</span>
                <span className="text-2xl font-bold text-primary">
                    {formatPrice(finalPrice)}
                </span>
            </div>
            
            {hasDiscount && (
                <p className="text-xs text-[#22c55e] text-center">
                    🎉 You save {formatPrice(discountAmount)} with this referral code!
                </p>
            )}
        </div>
    )
}
