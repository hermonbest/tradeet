'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OnboardingStep {
    title: string
    description: string
    icon: string
    action?: string
    tip?: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        title: 'Welcome to TradeET! 🎉',
        description: 'Your personal trading journal built for Ethiopian traders. Track, analyze, and improve your trading performance.',
        icon: '👋',
        action: 'Let\'s get you started with a quick tour',
        tip: 'TradeET helps you see your trades in both USD and ETB'
    },
    {
        title: 'Log Your First Trade 📊',
        description: 'Click the "+" button to add your first trade. Enter the pair, entry/exit prices, and any notes about your strategy.',
        icon: '✍️',
        action: 'Use the floating + button or the one in the header',
        tip: 'Be honest with your entries - this is YOUR learning tool'
    },
    {
        title: 'Track Your Performance 📈',
        description: 'Your dashboard shows key metrics: Win Rate, Profit Factor, Expectancy, and more. Watch your equity curve grow over time.',
        icon: '📊',
        action: 'Check your dashboard after each trade',
        tip: 'Green metrics are good! Red means there\'s room to improve'
    },
    {
        title: 'Analyze with Calendar 📅',
        description: 'See your winning and losing days at a glance. The calendar view helps you spot patterns in your trading.',
        icon: '📆',
        action: 'Visit the Calendar page to see your monthly performance',
        tip: 'Green days = profit, Red days = loss. Aim for more green!'
    },
    {
        title: 'Understand Your Psychology 🧠',
        description: 'Tag your trades with emotions (FOMO, Revenge Trade, Confident). Learn which mental states help or hurt your trading.',
        icon: '🎯',
        action: 'Add psychology tags when logging trades',
        tip: 'You\'ll be surprised what patterns you discover!'
    },
    {
        title: 'Set Exchange Rate 💱',
        description: 'Configure the ETB exchange rate to see your profits in Ethiopian Birr. Update it anytime to match the current market.',
        icon: '💵',
        action: 'Use the exchange rate input in the dashboard header',
        tip: 'Keep this updated for accurate ETB calculations'
    },
    {
        title: 'Upgrade to Premium ⭐',
        description: 'Unlock unlimited trades, performance score, screenshot uploads, and priority support. One-time payment of 3,000 ETB.',
        icon: '🚀',
        action: 'Visit the Upgrade page when you\'re ready',
        tip: 'You get a 7-day free trial with full access – make the most of it!'
    },
    {
        title: 'You\'re All Set! ✅',
        description: 'You now know the basics. Start logging your trades and building your path to consistent profitability.',
        icon: '🎓',
        action: 'Close this guide and make your first trade',
        tip: 'Review your journal every weekend to learn from your week'
    }
]

interface OnboardingGuideProps {
    onComplete: () => void
    onSkip: () => void
}

export function OnboardingGuide({ onComplete, onSkip }: OnboardingGuideProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isMounted, setIsMounted] = useState(false)
    const [completedSteps, setCompletedSteps] = useState<number[]>([])

    useEffect(() => {
        setIsMounted(true)
        // Load completed steps from localStorage
        const saved = localStorage.getItem('onboarding_completed_steps')
        if (saved) {
            setCompletedSteps(JSON.parse(saved))
        }
    }, [])

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            const newCompleted = [...completedSteps, currentStep]
            setCompletedSteps(newCompleted)
            localStorage.setItem('onboarding_completed_steps', JSON.stringify(newCompleted))
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = () => {
        const newCompleted = [...completedSteps, currentStep]
        setCompletedSteps(newCompleted)
        localStorage.setItem('onboarding_completed_steps', JSON.stringify(newCompleted))
        localStorage.setItem('onboarding_finished', 'true')
        onComplete()
    }

    const handleSkip = () => {
        localStorage.setItem('onboarding_skipped', 'true')
        onSkip()
    }

    const step = ONBOARDING_STEPS[currentStep]
    const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

    if (!isMounted) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <Card className="relative w-full max-w-lg animate-in zoom-in-95 duration-300 border-primary/20 shadow-2xl">
                {/* Progress Bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-muted rounded-t-2xl overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                        {currentStep + 1} / {ONBOARDING_STEPS.length}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={handleSkip}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <CardHeader className="pb-4 pt-8">
                    <div className="text-7xl mb-6 text-center animate-in zoom-in duration-500">
                        {step.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        {step.title}
                    </CardTitle>
                    <CardDescription className="text-base text-center leading-relaxed">
                        {step.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Action Item */}
                    {step.action && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground mb-1">What to do:</p>
                                    <p className="text-sm text-muted-foreground">{step.action}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pro Tip */}
                    {step.tip && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">💡 Pro Tip</p>
                            <p className="text-sm text-muted-foreground">{step.tip}</p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="flex-1"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                        
                        <Button
                            onClick={handleNext}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
                        >
                            {currentStep === ONBOARDING_STEPS.length - 1 ? (
                                <>
                                    Get Started
                                    <CheckCircle2 className="h-4 w-4 ml-1" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Skip Link */}
                    {currentStep < ONBOARDING_STEPS.length - 1 && (
                        <p className="text-center text-xs text-muted-foreground">
                            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd> to skip
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>,
        document.body
    )
}
