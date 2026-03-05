'use client'

import { useState, useEffect, useCallback } from 'react'

interface OnboardingState {
    shouldShowGuide: boolean
    isFirstTimeUser: boolean
    hasCompletedFirstTrade: boolean
    hasCompletedFirstWin: boolean
    isOnboardingCompleted: boolean
}

interface ServerOnboardingState {
    isFirstTimeUser: boolean
    hasCompletedFirstTrade: boolean
    hasCompletedFirstWin: boolean
    isOnboardingCompleted: boolean
}

export function useOnboarding(serverState?: ServerOnboardingState) {
    const [state, setState] = useState<OnboardingState>({
        shouldShowGuide: false,
        isFirstTimeUser: false,
        hasCompletedFirstTrade: false,
        hasCompletedFirstWin: false,
        isOnboardingCompleted: false,
    })

    const [isLoading, setIsLoading] = useState(true)

    // Load onboarding state from localStorage and server
    useEffect(() => {
        const loadOnboardingState = async () => {
            try {
                // Check localStorage first (client-side tracking)
                const skipped = localStorage.getItem('onboarding_skipped') === 'true'
                const finished = localStorage.getItem('onboarding_finished') === 'true'
                const completedSteps = localStorage.getItem('onboarding_completed_steps')
                
                // Server state takes precedence for new users
                // If server says user hasn't completed onboarding, show it regardless of localStorage
                const shouldShowBasedOnServer = serverState ? !serverState.isOnboardingCompleted : false
                const shouldShowBasedOnClient = !skipped && !finished
                
                setState(prev => ({
                    ...prev,
                    shouldShowGuide: shouldShowBasedOnServer || shouldShowBasedOnClient,
                    isOnboardingCompleted: serverState ? serverState.isOnboardingCompleted : finished,
                    isFirstTimeUser: serverState ? serverState.isFirstTimeUser : false,
                    hasCompletedFirstTrade: serverState ? serverState.hasCompletedFirstTrade : false,
                    hasCompletedFirstWin: serverState ? serverState.hasCompletedFirstWin : false,
                }))
            } catch (error) {
                console.error('Error loading onboarding state:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadOnboardingState()
    }, [serverState])

    const completeOnboarding = useCallback(() => {
        localStorage.setItem('onboarding_finished', 'true')
        setState(prev => ({
            ...prev,
            shouldShowGuide: false,
            isOnboardingCompleted: true,
        }))
    }, [])

    const skipOnboarding = useCallback(() => {
        localStorage.setItem('onboarding_skipped', 'true')
        setState(prev => ({
            ...prev,
            shouldShowGuide: false,
        }))
    }, [])

    const showGuide = useCallback(() => {
        localStorage.removeItem('onboarding_skipped')
        setState(prev => ({
            ...prev,
            shouldShowGuide: true,
        }))
    }, [])

    const markStepComplete = useCallback((stepIndex: number) => {
        const saved = localStorage.getItem('onboarding_completed_steps')
        const completedSteps = saved ? JSON.parse(saved) : []
        if (!completedSteps.includes(stepIndex)) {
            completedSteps.push(stepIndex)
            localStorage.setItem('onboarding_completed_steps', JSON.stringify(completedSteps))
        }
    }, [])

    const resetOnboarding = useCallback(() => {
        localStorage.removeItem('onboarding_skipped')
        localStorage.removeItem('onboarding_finished')
        localStorage.removeItem('onboarding_completed_steps')
        setState(prev => ({
            ...prev,
            shouldShowGuide: true,
            isOnboardingCompleted: false,
        }))
    }, [])

    return {
        ...state,
        isLoading,
        completeOnboarding,
        skipOnboarding,
        showGuide,
        markStepComplete,
        resetOnboarding,
    }
}

// Server-side helper to get onboarding state
export async function getOnboardingState(userId: string) {
    // This would be called from a server component
    // For now, we'll return a basic structure
    return {
        isFirstTimeUser: true,
        hasCompletedFirstTrade: false,
        hasCompletedFirstWin: false,
        isOnboardingCompleted: false,
    }
}
