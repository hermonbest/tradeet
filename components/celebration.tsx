'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CelebrationProps {
    type: 'first_trade' | 'first_win' | 'comeback_win' | 'milestone' | 'onboarding_complete'
    message?: string
    onClose: () => void
}

export function Celebration({ type, message, onClose }: CelebrationProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [showConfetti, setShowConfetti] = useState(true)

    useEffect(() => {
        setIsMounted(true)
        // Auto-hide confetti after 3 seconds
        const timer = setTimeout(() => setShowConfetti(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    const getConfig = () => {
        switch (type) {
            case 'first_trade':
                return {
                    title: '🎉 First Trade Logged!',
                    subtitle: 'You\'ve taken the first step!',
                    description: 'Great job! Your first trade has been recorded. Every profitable trader started exactly where you are now. Keep building your journal and learning from each trade.',
                    color: 'from-violet-500 to-purple-600',
                    icon: '📊'
                }
            case 'first_win':
                return {
                    title: '🚀 First Win!',
                    subtitle: 'Congratulations on your first profitable trade!',
                    description: 'This is just the beginning! You\'ve proven you can make profitable trades. Keep tracking, keep learning, and let your winners run.',
                    color: 'from-green-500 to-emerald-600',
                    icon: '💰'
                }
            case 'comeback_win':
                return {
                    title: '🔥 Comeback Win!',
                    subtitle: 'This is what resilience looks like!',
                    description: 'Now THIS is impressive! After some tough trades, you\'ve turned it around and secured a win. This is the mindset that builds profitable traders. Keep grinding! 💪',
                    color: 'from-orange-500 to-red-600',
                    icon: '🔥'
                }
            case 'milestone':
                return {
                    title: '⭐ Milestone Reached!',
                    subtitle: 'Amazing progress!',
                    description: message || 'You\'ve reached an important milestone in your trading journey.',
                    color: 'from-amber-500 to-orange-600',
                    icon: '🏆'
                }
            case 'onboarding_complete':
                return {
                    title: '🎓 Welcome Aboard!',
                    subtitle: 'You\'re all set up!',
                    description: 'You\'ve completed the onboarding. Now you\'re ready to make the most of TradeET!',
                    color: 'from-blue-500 to-cyan-600',
                    icon: '✅'
                }
            default:
                return {
                    title: '🎉 Congratulations!',
                    subtitle: 'Well done!',
                    description: message || 'Keep up the great work!',
                    color: 'from-violet-500 to-purple-600',
                    icon: '✨'
                }
        }
    }

    const config = getConfig()

    if (!isMounted) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10px',
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-sm"
                                style={{
                                    backgroundColor: ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'][
                                        Math.floor(Math.random() * 5)
                                    ],
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Celebration Card */}
            <Card className="relative w-full max-w-md animate-in zoom-in-95 duration-300 border-primary/20 shadow-2xl shadow-primary/20">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.color} rounded-t-2xl`} />
                
                <CardHeader className="text-center pb-2">
                    <div className="text-6xl mb-4 animate-bounce">{config.icon}</div>
                    <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">{config.subtitle}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                        {config.description}
                    </p>
                    
                    <Button 
                        onClick={onClose}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                    >
                        Continue Trading
                    </Button>
                </CardContent>
            </Card>
        </div>,
        document.body
    )
}

// Confetti animation keyframes
const style = document.createElement('style')
style.textContent = `
    @keyframes confetti {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    .animate-confetti {
        animation: confetti linear forwards;
    }
`
if (typeof document !== 'undefined' && !document.getElementById('confetti-style')) {
    style.id = 'confetti-style'
    document.head.appendChild(style)
}
