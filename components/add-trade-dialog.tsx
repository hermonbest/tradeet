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
import { Celebration } from '@/components/celebration'
import { useOnboarding } from '@/hooks/use-onboarding'

export function AddTradeDialog() {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showCelebration, setShowCelebration] = useState(false)
    const [celebrationType, setCelebrationType] = useState<'first_trade' | 'first_win' | 'comeback_win'>('first_trade')
    const { hasCompletedFirstTrade, hasCompletedFirstWin } = useOnboarding()

    useEffect(() => {
        setMounted(true)
    }, [hasCompletedFirstTrade, hasCompletedFirstWin])

    const handleSuccess = (data?: { isFirstTrade?: boolean; isFirstWin?: boolean; isComebackWin?: boolean }) => {
        setOpen(false)

        // Double-check with localStorage to prevent showing first_trade celebration repeatedly
        const hasShownFirstTradeCelebration = localStorage.getItem('has_shown_first_trade_celebration') === 'true'
        const hasShownFirstWinCelebration = localStorage.getItem('has_shown_first_win_celebration') === 'true'

        // Handle different celebration scenarios
        if (data?.isComebackWin) {
            // Comeback win takes priority - it's more meaningful
            setCelebrationType('comeback_win')
            setShowCelebration(true)
        } else if (data?.isFirstTrade && !hasShownFirstTradeCelebration) {
            // First trade AND it's a winner - show first trade celebration (more fundamental)
            localStorage.setItem('has_shown_first_trade_celebration', 'true')
            setCelebrationType('first_trade')
            setShowCelebration(true)
        } else if (data?.isFirstWin && !hasShownFirstWinCelebration) {
            // Not first trade, but first win (user had losses before)
            localStorage.setItem('has_shown_first_win_celebration', 'true')
            setCelebrationType('first_win')
            setShowCelebration(true)
        }
    }

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
        <>
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
                    <TradeEntryForm onSuccess={handleSuccess} />
                </DialogContent>
            </Dialog>

            {showCelebration && (
                <Celebration
                    type={celebrationType}
                    onClose={() => {
                        setShowCelebration(false)
                        // Reload page to update dashboard stats
                        window.location.reload()
                    }}
                />
            )}
        </>
    )
}
