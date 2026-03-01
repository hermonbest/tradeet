'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { TradeEntryForm } from '@/components/trade-entry-form'

export function AddTradeDialog() {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl font-semibold opacity-50"
                disabled
            >
                <Plus className="w-4 h-4" />
                Add Trade
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    Add Trade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card border-border overflow-y-auto max-h-[95vh]">
                <DialogHeader>
                    <DialogTitle className="text-foreground">New Trade</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Enter the details of your trade to add it to your journal.
                    </DialogDescription>
                </DialogHeader>
                <TradeEntryForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
