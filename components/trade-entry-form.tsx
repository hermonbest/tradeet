'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { addTrade } from '@/app/(dashboard)/actions'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

const tradeSchema = z.object({
    pair: z.string().min(1, 'Pair is required').max(20, 'Pair too long'),
    entry_price: z.string()
        .min(1, 'Entry price is required')
        .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be a positive number'),
    exit_price: z.string().optional().refine(v => !v || !isNaN(parseFloat(v)), 'Must be a valid number'),
    stop_loss: z.string().optional().refine(v => !v || !isNaN(parseFloat(v)), 'Must be a valid number'),
    take_profit: z.string().optional().refine(v => !v || !isNaN(parseFloat(v)), 'Must be a valid number'),
    lot_size: z.string().optional().refine(v => !v || !isNaN(parseFloat(v)), 'Must be a valid number'),
    profit_usd: z.string().optional().refine(v => !v || !isNaN(parseFloat(v)), 'Must be a valid number'),
    notes: z.string().optional(),
    trade_date: z.string().optional(),
    screenshot_url: z.string().optional(),
    tags: z.array(z.string()),
})

const PSYCHOLOGY_TAGS = [
    { label: '✅ Followed Plan', value: 'Followed Plan' },
    { label: '🤬 Revenge Trade', value: 'Revenge Trade' },
    { label: '😰 FOMO', value: 'FOMO' },
    { label: '🎉 Perfect Entry', value: 'Perfect Entry' },
]

export function TradeEntryForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const form = useForm<z.infer<typeof tradeSchema>>({
        resolver: zodResolver(tradeSchema),
        defaultValues: {
            pair: '',
            entry_price: '',
            exit_price: '',
            stop_loss: '',
            take_profit: '',
            lot_size: '',
            profit_usd: '',
            notes: '',
            trade_date: new Date().toISOString().split('T')[0],
            screenshot_url: '',
            tags: [],
        },
    })

    const profitValue = form.watch('profit_usd')
    const profitNum = parseFloat(profitValue || '0')
    const profitBorderColor = !profitValue
        ? ''
        : profitNum > 0
            ? 'border-green-500/60 focus:border-green-500'
            : profitNum < 0
                ? 'border-red-500/60 focus:border-red-500'
                : ''

    async function onSubmit(values: z.infer<typeof tradeSchema>) {
        setLoading(true)
        setError(null)

        // Sanitize pair
        const tradeData = {
            ...values,
            pair: values.pair.trim().toUpperCase(),
            screenshot_url: null,
        }

        try {
            const result = await addTrade(tradeData)
            if (result.error === 'TRADE_LIMIT_REACHED') {
                setError('Trade limit reached! Free accounts are limited to 50 trades. Please upgrade to Pro for unlimited logging.')
            } else if (result.error) {
                setError(result.error)
            } else {
                setSuccess(true)
                setTimeout(() => {
                    setSuccess(false)
                    form.reset({
                        ...form.formState.defaultValues,
                        trade_date: new Date().toISOString().split('T')[0],
                    })
                    if (onSuccess) onSuccess()
                }, 900)
            }
        } catch {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="pair"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pair</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="EUR/USD"
                                        {...field}
                                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="trade_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="entry_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Entry Price</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.00001" placeholder="1.3000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="exit_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Exit Price</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.00001" placeholder="1.1050" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="stop_loss"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stop Loss</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.00001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="take_profit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Take Profit</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.00001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lot_size"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lot Size</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Profit field with live colour preview */}
                <FormField
                    control={form.control}
                    name="profit_usd"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profit (USD)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="50.00 (use negative for loss)"
                                    className={`transition-colors ${profitBorderColor}`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Psychology Tags */}
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Psychology Tags</FormLabel>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {PSYCHOLOGY_TAGS.map((tag) => {
                                    const isSelected = field.value?.includes(tag.label)
                                    return (
                                        <Badge
                                            key={tag.value}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className={`cursor-pointer transition-all active:scale-95 py-1.5 select-none ${isSelected
                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30'
                                                : 'hover:border-primary/50 hover:text-primary'
                                                }`}
                                            onClick={() => {
                                                const current: string[] = field.value || []
                                                if (current.includes(tag.label)) {
                                                    field.onChange(current.filter((t: string) => t !== tag.label))
                                                } else {
                                                    field.onChange([...current, tag.label])
                                                }
                                            }}
                                        >
                                            {isSelected && <span className="mr-1">✓</span>}
                                            {tag.label}
                                        </Badge>
                                    )
                                })}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Screenshot — Coming Soon */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        Screenshot
                        <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-full px-2 py-0.5 font-semibold tracking-wide uppercase">
                            Coming Soon
                        </span>
                    </Label>
                    <div className="flex items-center gap-3 border border-dashed rounded-lg p-4 bg-muted/20 text-muted-foreground text-sm">
                        <span>📸</span>
                        <span>Screenshot upload will be available soon. Stay tuned!</span>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                    placeholder="Strategy notes, what went well, what to improve..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Inline error banner */}
                {error && (
                    <div className="error-banner">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-11 font-semibold transition-all"
                    disabled={loading || success}
                >
                    {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : success
                            ? <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> Trade Added!</>
                            : 'Add Trade'
                    }
                </Button>
            </form>
        </Form>
    )
}
