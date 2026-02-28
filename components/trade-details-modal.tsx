'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { Calendar, DollarSign, TrendingUp, Notebook, ImageIcon, Activity, Pencil } from 'lucide-react'
import Image from 'next/image'

interface TradeDetailsModalProps {
    trade: any | null
    isOpen: boolean
    onClose: () => void
    onEdit?: () => void
}

export function TradeDetailsModal({ trade, isOpen, onClose, onEdit }: TradeDetailsModalProps) {
    if (!trade) return null

    const profit = trade.profit_usd || 0
    const isWin = profit > 0
    const isLoss = profit < 0
    const isBreakeven = profit === 0

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] overflow-hidden max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <Badge
                            variant={isWin ? 'default' : isLoss ? 'destructive' : 'secondary'}
                            className={isWin ? 'bg-green-600' : isBreakeven ? 'bg-gray-500 hover:bg-gray-600 text-white' : ''}
                        >
                            {isWin ? 'WIN' : isLoss ? 'LOSS' : 'BREAKEVEN'}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {trade.trade_date ? format(new Date(trade.trade_date), 'MMMM d, yyyy') : 'N/A'}
                        </span>
                    </div>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {trade.pair}
                        <span className={`text-xl ${isWin ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-500'}`}>
                            {isWin ? '+' : isLoss ? '-' : ''}${Math.abs(profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Trade breakdown and performance metrics.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-grow pr-4 -mr-4"> {/* Added pr-4 -mr-4 to offset scrollbar */}
                    <div className="grid grid-cols-2 gap-6 mt-4">
                        <div className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Entry Price</span>
                                    <span className="font-mono font-bold">{trade.entry_price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Exit Price</span>
                                    <span className="font-mono font-bold">{trade.exit_price || 'N/A'}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-sm">
                                    <span className="text-muted-foreground">Stop Loss</span>
                                    <span className="font-mono">{trade.stop_loss || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Take Profit</span>
                                    <span className="font-mono">{trade.take_profit || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Lot Size</span>
                                    <span className="font-bold">{trade.lot_size || 'N/A'}</span>
                                </div>
                            </div>

                            {trade.tags && trade.tags.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> Psychology
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {trade.tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[11px]">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {trade.screenshot_url ? (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" /> Screenshot
                                    </h4>
                                    <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted">
                                        <img
                                            src={trade.screenshot_url}
                                            alt="Trade screenshot"
                                            className="object-cover w-full h-full hover:scale-105 transition-transform cursor-zoom-in"
                                            onClick={() => window.open(trade.screenshot_url, '_blank')}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-muted/20 border border-dashed rounded-xl p-8 text-center">
                                    <div className="text-xs text-muted-foreground italic">No screenshot uploaded</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {trade.notes && (
                        <div className="mt-6 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <Notebook className="w-3 h-3" /> Notes
                            </h4>
                            <div className="bg-muted/20 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                                {trade.notes}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-4 border-t border-border mt-6">
                        {onEdit && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onClose() // Close details modal first
                                    onEdit()  // Open edit modal
                                }}
                                className="gap-2"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit Trade
                            </Button>
                        )}
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onClose}>
                            Close Details
                        </Button>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
