'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'

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
import { updateTrade } from '@/app/(dashboard)/actions'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, Loader2 } from 'lucide-react'

const tradeSchema = z.object({
    pair: z.string().min(1, 'Pair is required').max(20),
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

export function EditTradeModal({ trade, isOpen, onClose }: { trade: any; isOpen: boolean; onClose: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<z.infer<typeof tradeSchema>>({
        resolver: zodResolver(tradeSchema),
        defaultValues: {
            pair: '', entry_price: '', exit_price: '', stop_loss: '', take_profit: '',
            lot_size: '', profit_usd: '', notes: '',
            trade_date: new Date().toISOString().split('T')[0],
            screenshot_url: '', tags: [],
        },
    })

    useEffect(() => {
        if (trade && isOpen) {
            setError(null)
            form.reset({
                pair: trade.pair || '',
                entry_price: trade.entry_price?.toString() || '',
                exit_price: trade.exit_price?.toString() || '',
                stop_loss: trade.stop_loss?.toString() || '',
                take_profit: trade.take_profit?.toString() || '',
                lot_size: trade.lot_size?.toString() || '',
                profit_usd: trade.profit_usd?.toString() || '',
                notes: trade.notes || '',
                trade_date: trade.trade_date ? new Date(trade.trade_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                screenshot_url: trade.screenshot_url || '',
                tags: trade.tags || [],
            })
        }
    }, [trade, isOpen, form])

    // Profit colour preview
    const profitValue = form.watch('profit_usd')
    const profitNum = parseFloat(profitValue || '0')
    const profitBorderColor = !profitValue
        ? ''
        : profitNum > 0
            ? 'border-green-500/60'
            : profitNum < 0
                ? 'border-red-500/60'
                : ''

    async function onSubmit(values: z.infer<typeof tradeSchema>) {
        if (!trade?.id) return
        setLoading(true)
        setError(null)

        const tradeData = {
            ...values,
            pair: values.pair.trim().toUpperCase(),
            screenshot_url: trade.screenshot_url,
        }

        try {
            const result = await updateTrade(trade.id, tradeData)
            if (!result.success) {
                setError(result.message || 'Failed to update trade.')
            } else {
                form.reset()
                onClose()
            }
        } catch {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border-border/60">
                <DialogHeader className="pt-6 px-6 pb-2">
                    <DialogTitle>Edit Trade</DialogTitle>
                    <DialogDescription>Modify the details of your trade log below.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] px-6 pb-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="pair"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pair</FormLabel>
                                            <FormControl>
                                                <Input placeholder="EUR/USD" {...field}
                                                    onChange={e => field.onChange(e.target.value.toUpperCase())} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField control={form.control} name="trade_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="entry_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Entry Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.00001" placeholder="1.3000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField control={form.control} name="exit_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Exit Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.00001" placeholder="1.1050" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="stop_loss"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stop Loss</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.00001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField control={form.control} name="take_profit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Take Profit</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.00001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField control={form.control} name="lot_size"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lot Size</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                            </div>

                            <FormField control={form.control} name="profit_usd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profit (USD)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number" step="0.01" placeholder="50.00"
                                                className={`transition-colors ${profitBorderColor}`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <FormField control={form.control} name="tags"
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
                                )} />

                            <FormField control={form.control} name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <textarea
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                                placeholder="Strategy notes..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            {/* Inline error banner */}
                            {error && (
                                <div className="error-banner">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-4 border-t border-border mt-4">
                                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                                    disabled={loading}
                                >
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
