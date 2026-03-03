'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Copy } from 'lucide-react'

interface CopyButtonProps {
    text: string
    className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className={`h-8 px-2 ${className}`}
        >
            {copied ? (
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </Button>
    )
}
