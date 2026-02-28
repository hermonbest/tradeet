'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateExchangeRate } from '@/app/(dashboard)/actions'

export function ExchangeRateInput({ initialRate }: { initialRate: number }) {
    const [rate, setRate] = useState(initialRate.toString())
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        await updateExchangeRate(parseFloat(rate))
        setSaving(false)
    }

    return (
        <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg border">
            <span className="text-sm font-medium whitespace-nowrap">Exchange Rate (ETB):</span>
            <Input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-24 h-8 text-sm"
                step="0.01"
            />
            <Button size="sm" onClick={handleSave} disabled={saving || rate === initialRate.toString()}>
                {saving ? 'Saving...' : 'Save'}
            </Button>
        </div>
    )
}
