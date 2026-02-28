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


const tradeSchema = z.object({
    pair: z.string().min(1, 'Pair is required'),
    entry_price: z.string().min(1, 'Entry price is required'),
    exit_price: z.string().optional(),
    stop_loss: z.string().optional(),
    take_profit: z.string().optional(),
    lot_size: z.string().optional(),
    profit_usd: z.string().optional(),
    notes: z.string().optional(),
    trade_date: z.string().optional(),
    screenshot_url: z.string().optional(),
    tags: z.array(z.string()),
})

export function TradeEntryForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false)

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

    async function onSubmit(values: z.infer<typeof tradeSchema>) {
        setLoading(true)
        const tradeData = { ...values, screenshot_url: null }
        const result = await addTrade(tradeData)
        setLoading(false)

        if (result.error === 'TRADE_LIMIT_REACHED') {
            alert('Trade limit reached! Free accounts are limited to 50 trades. Please upgrade to Pro for unlimited logging.')
        } else if (result.error) {
            alert(result.error)
        } else {
            form.reset()
            if (onSuccess) onSuccess()
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
                                    <Input placeholder="EUR/USD" {...field} />
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
                                    <Input type="number" step="0.00001" placeholder="1.1000" {...field} />
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

                <FormField
                    control={form.control}
                    name="profit_usd"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profit (USD)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="50.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Psychology Tags</FormLabel>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {[
                                    { label: '✅ Followed Plan', value: 'Followed Plan' },
                                    { label: '🤬 Revenge Trade', value: 'Revenge Trade' },
                                    { label: '😰 FOMO', value: 'FOMO' },
                                    { label: '🎉 Perfect Entry', value: 'Perfect Entry' },
                                ].map((tag) => (
                                    <Badge
                                        key={tag.value}
                                        variant={field.value?.includes(tag.label) ? 'default' : 'outline'}
                                        className="cursor-pointer transition-all active:scale-95 py-1.5"
                                        onClick={() => {
                                            const current: string[] = field.value || []
                                            if (current.includes(tag.label)) {
                                                field.onChange(current.filter((t: string) => t !== tag.label))
                                            } else {
                                                field.onChange([...current, tag.label])
                                            }
                                        }}
                                    >
                                        {tag.label}
                                    </Badge>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Strategy notes..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Trade'}
                </Button>

            </form>
        </Form>
    )
}
