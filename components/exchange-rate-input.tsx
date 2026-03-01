'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateExchangeRate } from '@/app/(dashboard)/actions'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function ExchangeRateInput({ initialRate }: { initialRate: number }) {
    const [rate, setRate] = useState(initialRate.toString())
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const validate = (value: string) => {
        const num = parseFloat(value)
        if (isNaN(num) || num <= 0) return 'Rate must be a positive number.'
        if (num > 100000) return 'Rate seems unrealistically high.'
        return null
    }

    const handleSave = async () => {
        const validationError = validate(rate)
        if (validationError) {
            setStatus('error')
            setErrorMsg(validationError)
            return
        }

        setSaving(true)
        setStatus('idle')
        try {
            const result = await updateExchangeRate(parseFloat(rate))
            if (result && 'error' in result && result.error) {
                setStatus('error')
                setErrorMsg(result.error)
            } else {
                setStatus('success')
                setTimeout(() => setStatus('idle'), 2500)
            }
        } catch {
            setStatus('error')
            setErrorMsg('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const isDirty = rate !== initialRate.toString()

    return (
        <div className="space-y-1.5">
            <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-border/60 hover:border-border/80 transition-colors">
                <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">ETB Rate:</span>
                <Input
                    type="number"
                    value={rate}
                    onChange={(e) => {
                        setRate(e.target.value)
                        setStatus('idle')
                    }}
                    className="w-24 h-8 text-sm num bg-transparent border-border/40"
                    step="0.01"
                    min="0.01"
                    aria-label="USD to ETB exchange rate"
                />
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className="h-8 text-xs font-semibold shrink-0"
                >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                </Button>
                {status === 'success' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 animate-in fade-in" />
                )}
            </div>
            {status === 'error' && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-400 px-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    )
}
