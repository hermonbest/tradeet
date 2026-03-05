'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteTrade } from '@/app/(dashboard)/actions'
import { format } from 'date-fns'
import { Pencil, Trash2, TrendingUp, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TradeDetailsModal } from './trade-details-modal'
import { EditTradeModal } from './edit-trade-modal'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export function TradeList({ trades, isLoading }: { trades: any[]; isLoading?: boolean }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [selectedTrade, setSelectedTrade] = useState<any | null>(null)
    const [tradeToEdit, setTradeToEdit] = useState<any | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        setLoadingId(id)
        setConfirmDeleteId(null)
        setDeleteError(null)
        try {
            const result = await deleteTrade(id)
            if (result && 'error' in result) {
                setDeleteError(result.error ?? 'An unknown error occurred.')
            }
        } catch {
            setDeleteError('An unexpected error occurred while trying to delete the trade.')
        } finally {
            setLoadingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="mt-4 space-y-4">
                {/* Desktop Skeleton */}
                <div className="hidden md:block rounded-xl border border-border/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[700px]">
                            <TableHeader>
                                <TableRow className="border-b-primary/20">
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"><Skeleton className="h-3 w-12" /></TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"><Skeleton className="h-3 w-16" /></TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"><Skeleton className="h-3 w-20" /></TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"><Skeleton className="h-3 w-16" /></TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"><Skeleton className="h-3 w-8" /></TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right"><Skeleton className="h-3 w-16 ml-auto" /></TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right"><Skeleton className="h-3 w-12 ml-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/30">
                                        <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-16 mb-1" />
                                            <Skeleton className="h-3 w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-3 w-16 mb-1" />
                                            <Skeleton className="h-3 w-12" />
                                        </TableCell>
                                        <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-3 w-10" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Mobile Skeleton */}
                <div className="md:hidden space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-card border border-border/60">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <Skeleton className="h-3 w-20 mb-1" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                                <Skeleton className="h-8 flex-1 rounded-md" />
                                <Skeleton className="h-8 flex-1 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!trades || trades.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 border border-dashed border-border/60 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">No trades yet</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                        Add your first trade using the button above to start tracking your performance.
                    </p>
                </div>
            </div>
        )
    }

    const pnlClass = (profit: number) =>
        profit > 0 ? 'text-[#22c55e] font-medium num'
            : profit < 0 ? 'text-[#ef4444] font-medium num'
                : 'text-[#9ca3af] font-medium num'

    return (
        <div className="mt-4">
            {/* Inline delete error banner */}
            {deleteError && (
                <div className="error-banner mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <span>{deleteError}</span>
                    </div>
                    <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-300 text-xs ml-2 shrink-0">✕</button>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="rounded-xl border border-border/60 overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <Table className="min-w-[700px]">
                        <TableHeader>
                            <TableRow className="border-b-primary/20">
                                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Date</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Pair & Tags</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Entry / Exit</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">SL / TP</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Lot</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right">P&L (USD)</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trades.map((trade, idx) => (
                                <TableRow
                                    key={trade.id}
                                    className="cursor-pointer hover:bg-muted/30 transition-colors border-border/30"
                                    style={{ animationDelay: `${idx * 40}ms` }}
                                    onClick={() => {
                                        if (confirmDeleteId === trade.id) return
                                        setSelectedTrade(trade)
                                    }}
                                >
                                    <TableCell className="text-xs text-muted-foreground">
                                        {trade.trade_date ? format(new Date(trade.trade_date), 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="font-semibold text-sm">{trade.pair}</div>
                                        {trade.tags && trade.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {trade.tags.slice(0, 2).map((tag: string) => (
                                                    <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 h-4 bg-muted/30">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {trade.tags.length > 2 && (
                                                    <span className="text-[10px] text-muted-foreground">+{trade.tags.length - 2}</span>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="num text-sm">
                                        {trade.entry_price}
                                        <br />
                                        <span className="text-muted-foreground">{trade.exit_price || '—'}</span>
                                    </TableCell>
                                    <TableCell className="num text-sm text-muted-foreground">
                                        {trade.stop_loss || '—'} / {trade.take_profit || '—'}
                                    </TableCell>
                                    <TableCell className="num text-sm">{trade.lot_size || '—'}</TableCell>
                                    <TableCell className={`${pnlClass(trade.profit_usd)} text-right`}>
                                        {trade.profit_usd > 0 ? '+' : ''}{trade.profit_usd?.toFixed(2) ?? '0.00'}
                                    </TableCell>

                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        {confirmDeleteId === trade.id ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-xs text-muted-foreground mr-1">Sure?</span>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    disabled={loadingId === trade.id}
                                                    onClick={() => handleDelete(trade.id)}
                                                >
                                                    {loadingId === trade.id ? '...' : 'Yes'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => setConfirmDeleteId(null)}
                                                >
                                                    No
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 hover:border-primary/50 hover:text-primary transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setTradeToEdit(trade)
                                                    }}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                                                    disabled={loadingId === trade.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setConfirmDeleteId(trade.id)
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {trades.map((trade) => (
                    <div
                        key={trade.id}
                        className="p-4 rounded-xl bg-card border border-border/60 hover:border-primary/30 transition-all cursor-pointer"
                        style={{
                            borderLeft: `3px solid ${trade.profit_usd > 0 ? '#22c55e' : trade.profit_usd < 0 ? '#ef4444' : '#9ca3af'}`,
                        }}
                        onClick={() => setSelectedTrade(trade)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                    {trade.trade_date ? format(new Date(trade.trade_date), 'MMM d, yyyy') : 'N/A'}
                                </div>
                                <div className="text-base font-bold">{trade.pair}</div>
                            </div>
                            <div className={`${pnlClass(trade.profit_usd)} text-base`}>
                                {trade.profit_usd >= 0 ? '+' : ''}${Math.abs(trade.profit_usd || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-0.5">
                                <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Entry / Exit</span>
                                <div className="font-medium num">{trade.entry_price} / {trade.exit_price || '—'}</div>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Lot Size</span>
                                <div className="font-medium num">{trade.lot_size || '—'}</div>
                            </div>
                        </div>

                        {trade.tags && trade.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {trade.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-muted/40">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 flex-1 gap-1.5 text-xs hover:border-primary/50 hover:text-primary transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setTradeToEdit(trade)
                                }}
                            >
                                <Pencil className="w-3 h-3" /> Edit
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 flex-1 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                                disabled={loadingId === trade.id}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirmDeleteId === trade.id) {
                                        handleDelete(trade.id)
                                    } else {
                                        setConfirmDeleteId(trade.id)
                                    }
                                }}
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                {confirmDeleteId === trade.id ? 'Confirm' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <TradeDetailsModal
                trade={selectedTrade}
                isOpen={!!selectedTrade}
                onClose={() => setSelectedTrade(null)}
            />

            <EditTradeModal
                trade={tradeToEdit}
                isOpen={!!tradeToEdit}
                onClose={() => setTradeToEdit(null)}
            />
        </div>
    )
}
