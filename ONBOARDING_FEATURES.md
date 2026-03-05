# Onboarding & Celebrations Feature

This document describes the new user onboarding and celebration features added to TradeET.

## Overview

Two major features have been added to improve the first-time user experience:

1. **Customer Celebrations** - Confetti animations and congratulatory messages for key milestones
2. **Interactive Onboarding Guide** - Step-by-step tutorial for new users

## Features

### 🎉 Customer Celebrations

Celebrations are triggered automatically for:

- **First Trade Logged** - When a user adds their first trade to the journal
- **First Win** - When a user logs their first profitable trade
- **Milestone Reached** - For future milestone celebrations (10 trades, etc.)
- **Onboarding Complete** - When user finishes the onboarding guide

**Visual Elements:**
- Colorful confetti animation
- Large emoji icon
- Congratulatory message
- Action button to continue trading

### 📖 Onboarding Guide

An 8-step interactive tour that covers:

1. **Welcome** - Introduction to TradeET
2. **Log First Trade** - How to add trades
3. **Track Performance** - Understanding dashboard metrics
4. **Analyze with Calendar** - Using the calendar view
5. **Psychology Tags** - Tagging emotional states
6. **Exchange Rate** - Setting ETB conversion rate
7. **Upgrade to Pro** - Premium features overview
8. **Completion** - Ready to start trading

**Features:**
- Progress bar showing completion status
- Skip option (available anytime)
- Keyboard shortcut (Esc to skip)
- Pro tips on each step
- Can be reopened via help button (?)

## Technical Implementation

### Database Changes

Run this SQL migration in your Supabase SQL Editor:

```sql
-- File: plans/onboarding-migration.sql
```

This adds the following columns to the `profiles` table:
- `onboarding_completed` (boolean)
- `first_trade_completed` (boolean)
- `first_win_completed` (boolean)
- `onboarding_step` (integer)
- `last_onboarding_step` (integer)

### New Components

1. **`components/celebration.tsx`**
   - Confetti animation component
   - Celebration modal with messages
   - Portal-based rendering (z-index 50)

2. **`components/onboarding-guide.tsx`**
   - Step-by-step tutorial modal
   - Progress tracking
   - Navigation controls

3. **`components/onboarding-wrapper.tsx`**
   - Wrapper component for dashboard
   - Manages onboarding state
   - Shows help button after completion

### New Hooks

**`hooks/use-onboarding.ts`**
- Manages client-side onboarding state
- LocalStorage persistence
- Methods: `completeOnboarding`, `skipOnboarding`, `showGuide`, `resetOnboarding`

### Server Actions

Added to `app/(dashboard)/actions.ts`:

- `completeOnboardingStep()` - Mark onboarding as complete
- `markFirstTradeComplete()` - Mark first trade milestone
- `markFirstWinComplete()` - Mark first win milestone
- `getOnboardingState()` - Get user's current onboarding state
- `resetOnboarding()` - Reset all onboarding progress

### Updated Components

- **`AddTradeDialog`** - Triggers celebrations for first trade/win
- **`TradeEntryForm`** - Passes celebration data to parent
- **`Dashboard Layout`** - Wraps content with OnboardingWrapper

## User Flow

### First-Time User

1. User signs up and logs in
2. Onboarding guide automatically appears
3. User can follow through 8 steps or skip
4. After completing/skipping, help button (?) appears
5. User adds first trade → Celebration! 🎉
6. User logs first winning trade → Celebration! 🚀

### Returning User

1. User logs in
2. If onboarding was skipped/incomplete, guide appears
3. If completed, user sees normal dashboard
4. Help button available to retake tour

## Customization

### Changing Celebration Messages

Edit `components/celebration.tsx`:
```typescript
const getConfig = () => {
    switch (type) {
        case 'first_trade':
            return {
                title: '🎉 First Trade Logged!',
                // Customize message here
            }
        // ... other cases
    }
}
```

### Modifying Onboarding Steps

Edit `components/onboarding-guide.tsx`:
```typescript
const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        title: 'Welcome to TradeET! 🎉',
        description: 'Your custom message here',
        icon: '👋',
        action: 'What the user should do',
        tip: 'Pro tip for users',
    },
    // Add/remove steps as needed
]
```

### Adding New Celebration Types

1. Add type to `CelebrationProps` in `celebration.tsx`
2. Add configuration in `getConfig()`
3. Trigger from appropriate component

## Testing

### Test First Trade Celebration

1. Create a new test account
2. Complete or skip onboarding
3. Add your first trade
4. Celebration should appear

### Test First Win Celebration

1. Use test account with no winning trades
2. Add a trade with positive profit (e.g., 50.00)
3. Celebration should appear

### Test Onboarding Guide

1. Clear localStorage or use new account
2. Refresh dashboard
3. Guide should appear automatically
4. Test navigation (Next/Back)
5. Test skip functionality
6. Test help button after completion

### Test Help Button

1. Complete or skip onboarding
2. Click the floating ? button
3. Guide should reopen

## LocalStorage Keys

- `onboarding_skipped` - User skipped the guide
- `onboarding_finished` - User completed the guide
- `onboarding_completed_steps` - Array of completed step indices

## Database Triggers

Two automatic triggers detect milestones:

1. **`trigger_mark_first_trade`** - Fires on first trade insert
2. **`trigger_mark_first_win`** - Fires on first winning trade

These ensure celebrations only happen once per user.

## Accessibility

- Keyboard navigation (Tab, Enter, Esc)
- Screen reader friendly
- Focus management in modals
- High contrast colors

## Performance

- Components are lazy-loaded
- Confetti uses CSS animations (GPU accelerated)
- LocalStorage for client-side state (fast)
- Database flags for server-side state

## Future Enhancements

Potential additions:

- [ ] More celebration types (10 trades, 50 trades, etc.)
- [ ] Streak celebrations (7 days of logging)
- [ ] Achievement badges
- [ ] Social sharing of milestones
- [ ] Customizable celebration preferences
- [ ] Video tutorials in onboarding
- [ ] Interactive tooltips on first visit

## Troubleshooting

### Celebration not showing

1. Check browser console for errors
2. Verify database triggers are installed
3. Check if `first_trade_completed` is already true
4. Clear localStorage and refresh

### Onboarding not appearing

1. Check if `onboarding_completed` is true in database
2. Check localStorage for `onboarding_finished` or `onboarding_skipped`
3. Clear both and refresh
4. Use `resetOnboarding()` action to reset

### Confetti not animating

1. Check browser supports CSS animations
2. Verify `confetti-style` element in document head
3. Check for CSS conflicts

## Support

For issues or questions, contact the TradeET team or open an issue on GitHub.
