'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddTradeDialog } from '@/components/add-trade-dialog'

interface FloatingActionButtonProps {
  className?: string
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  return (
    <div className={cn("fixed bottom-24 right-6 z-40 md:hidden", className)}>
      <AddTradeDialog />
    </div>
  )
}
