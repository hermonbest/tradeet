'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReferralInput } from '@/components/referral-input'

interface ReferralInputWrapperProps {
    initialCode?: string
    initialIsInfluencer?: boolean
}

export function ReferralInputWrapper({ initialCode, initialIsInfluencer }: ReferralInputWrapperProps) {
    const router = useRouter()
    const [code, setCode] = useState(initialCode || '')
    const [isInfluencer, setIsInfluencer] = useState(initialIsInfluencer || false)

    const handleValidCode = (validCode: string, influencer: boolean, finalPrice: number) => {
        setCode(validCode)
        setIsInfluencer(influencer)
        // Update URL with referral code
        router.push(`/upgrade?ref=${validCode}`)
        // Refresh to update server component data (price display)
        router.refresh()
    }

    const handleClear = () => {
        setCode('')
        setIsInfluencer(false)
        router.push('/upgrade')
        // Refresh to reset server component data (price back to original)
        router.refresh()
    }

    return (
        <ReferralInput 
            onValidCode={handleValidCode} 
            onClear={handleClear}
        />
    )
}
