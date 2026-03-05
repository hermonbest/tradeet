'use client'

import { useEffect, useState } from 'react'
import { OnboardingGuide } from '@/components/onboarding-guide'
import { useOnboarding } from '@/hooks/use-onboarding'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

interface OnboardingWrapperProps {
    children: React.ReactNode
    serverOnboardingState?: {
        isFirstTimeUser: boolean
        hasCompletedFirstTrade: boolean
        hasCompletedFirstWin: boolean
        isOnboardingCompleted: boolean
    }
}

export function OnboardingWrapper({ children, serverOnboardingState }: OnboardingWrapperProps) {
    const {
        shouldShowGuide,
        isOnboardingCompleted,
        completeOnboarding,
        skipOnboarding,
        showGuide,
    } = useOnboarding(serverOnboardingState)
    
    const [showHelpButton, setShowHelpButton] = useState(false)

    useEffect(() => {
        // Show help button after onboarding is completed or skipped
        if (isOnboardingCompleted || localStorage.getItem('onboarding_skipped') === 'true') {
            setShowHelpButton(true)
        }
    }, [isOnboardingCompleted])

    return (
        <>
            {children}
            
            {/* Onboarding Guide Modal */}
            {shouldShowGuide && (
                <OnboardingGuide
                    onComplete={completeOnboarding}
                    onSkip={skipOnboarding}
                />
            )}

            {/* Help Button (shown after onboarding) */}
            {showHelpButton && (
                <Button
                    size="icon"
                    className="fixed bottom-28 right-6 z-40 h-12 w-12 rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                    onClick={showGuide}
                    title="Show onboarding guide"
                >
                    <HelpCircle className="h-5 w-5" />
                </Button>
            )}
        </>
    )
}
