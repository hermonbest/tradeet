'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { deleteTrade } from '@/app/(dashboard)/actions'
import { useState } from 'react'
import { format } from 'date-fns'

import { ExternalLink, Tag, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TradeDetailsModal } from './trade-details-modal'
import { EditTradeModal } from './edit-trade-modal'

export function TradeList({ trades }: { trades: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [selectedTrade, setSelectedTrade] = useState<any | null>(null)
    const [tradeToEdit, setTradeToEdit] = useState<any | null>(null)

    const handleDelete = async (id: string) => {
        setLoadingId(id)
        setConfirmDeleteId(null)
        try {
            const result = await deleteTrade(id)
            if (result && 'error' in result) {
                alert(`Error: ${result.error}`)
            }
        } catch (err) {
            alert('An unexpected error occurred while trying to delete the trade.')
        } finally {
            setLoadingId(null)
        }
    }

    if (!trades || trades.length === 0) {
        return <div className="text-center p-8 border rounded-lg text-muted-foreground mt-4">No trades found. Add one to get started!</div>
    }

    return (
        <div className="mt-4">
            {/* Desktop Table View */}
            <div className="rounded-md border overflow-hidden hidden md:block">
                <div className="overflow-x-auto whitespace-nowrap">
                    <Table className="min-w-[700px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Pair & Tags</TableHead>
                                <TableHead>Entry/Exit</TableHead>
                                <TableHead>SL/TP</TableHead>
                                <TableHead>Lot Size</TableHead>
                                <TableHead className="text-right">Profit (USD)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trades.map((trade) => (
                                <TableRow
                                    key={trade.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => {
                                        // Don't open modal if we're confirming a delete on this row
                                        if (confirmDeleteId === trade.id) return
                                        setSelectedTrade(trade)
                                    }}
                                >
                                    <TableCell>{trade.trade_date ? format(new Date(trade.trade_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="font-medium">
                                        <div>{trade.pair}</div>
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
                                    <TableCell>
                                        {trade.entry_price} <br />
                                        <span className="text-muted-foreground text-xs">{trade.exit_price || '-'}</span>
                                    </TableCell>
                                    <TableCell>
                                        {trade.stop_loss || '-'} / {trade.take_profit || '-'}
                                    </TableCell>
                                    <TableCell>{trade.lot_size || '-'}</TableCell>
                                    <TableCell className={
                                        trade.profit_usd > 0
                                            ? 'text-[#22c55e] font-medium text-right num'
                                            : trade.profit_usd < 0
                                                ? 'text-[#ef4444] font-medium text-right num'
                                                : 'text-[#9ca3af] font-medium text-right num'
                                    }>
                                        ${trade.profit_usd?.toFixed(2) || '0.00'}
                                    </TableCell>

                                    {/* Actions cell — clicks here must NOT open the detail modal */}
                                    <TableCell
                                        className="text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {confirmDeleteId === trade.id ? (
                                            // Inline confirmation — no window.confirm() needed
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
                                                    className="h-8 w-8"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setTradeToEdit(trade)
                                                    }}
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 px-3"
                                                    disabled={loadingId === trade.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setConfirmDeleteId(trade.id)
                                                    }}
                                                >
                                                    Delete
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
            <div className="md:hidden space-y-4">
                {trades.map((trade) => (
                    <div
                        key={trade.id}
                        className="p-4 rounded-xl bg-card border hover:border-primary/40 transition-all cursor-pointer"
                        onClick={() => setSelectedTrade(trade)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                    {trade.trade_date ? format(new Date(trade.trade_date), 'MMM d, yyyy') : 'N/A'}
                                </div>
                                <div className="text-lg font-bold">{trade.pair}</div>
                            </div>
                            <div className={
                                trade.profit_usd > 0
                                    ? 'text-[#22c55e] font-bold num text-lg'
                                    : trade.profit_usd < 0
                                        ? 'text-[#ef4444] font-bold num text-lg'
                                        : 'text-[#9ca3af] font-bold num text-lg'
                            }>
                                {trade.profit_usd >= 0 ? '+' : ''}${Math.abs(trade.profit_usd || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                                <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Entry / Exit</span>
                                <div className="font-medium">{trade.entry_price} / {trade.exit_price || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Lot Size</span>
                                <div className="font-medium">{trade.lot_size || '-'}</div>
                            </div>
                        </div>

                        {trade.tags && trade.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {trade.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-muted/40">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 flex-1 gap-2 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setTradeToEdit(trade)
                                }}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 flex-1 text-xs"
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
