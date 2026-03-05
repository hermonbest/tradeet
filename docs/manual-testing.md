# Manual Testing Checklist for TradeEt Application

This document outlines the manual testing procedures and checks for the TradeEt app. It covers features and user interactions for various user roles (admin, normal, pro, affiliate, influencer) and walks through core processes like payments.

---

## 📌 General Walkthrough & Setup

1. **Environment Setup**
   - Install dependencies: `npm install`.
   - Run the application locally using `npm run dev`.
   - Seed demo users and trades (where applicable).
   - Ensure test accounts exist for every user role.

2. **Navigation**
   - Verify main navigation elements load.
   - Test sidebar collapse/expand on desktop and mobile viewports.
   - Check mobile bottom navigation functionality.

---

## 👤 User Roles & Common Features

### Normal User

- [x] Registration flow
- [x] Login with correct/incorrect credentials
- [ ] Forgot password (if available)
- [x] Dashboard overview: account stats, trade summary
- [ ] Trade entry form: input validation, submit/cancel
- [ ] Trade list: pagination, sort, filter, search
- [ ] Trade details modal: open/close, view data
- [ ] Edit trade: changes persist, validation
- [ ] Delete trade: confirmation dialog
- [ ] Calendar view: view trades by date
- [ ] Analytics charts: correct data display
- [ ] Referral input: valid/invalid codes
- [ ] Payment form (upgrade)

### Pro User

- [ ] All normal user tests
- [ ] Access to pro-specific analytics & calendar
- [ ] Upgrade flow: link from dashboard, form submission
- [ ] Verify pro features unlocked after upgrade

### Affiliate / Influencer User

- [ ] Affiliate dashboard: view generated codes
- [ ] Code generation: create new code, copy
- [ ] Referral tracking: verify referral counts
- [ ] Payout/process flow (if implemented) 

### Admin User

- [ ] Admin login and dashboard access
- [ ] View/manage users (normal/pro/affiliate/influencer)
- [ ] Seed/demo user creation via tools (mjs scripts)
- [ ] Ability to suspend/enable accounts
- [ ] View analytics across platform
- [ ] Access site-wide settings

---

## 🔁 Core Workflows & Interactions

### Payment Process (Upgrade)

1. [ ] Navigate to upgrade page from dashboard
2. [ ] Fill out payment form with valid/invalid details
3. [ ] Handle success and failure responses
4. [ ] Verify post-payment status change to Pro

### Onboarding Flow

- [ ] First-time login prompts for tours or guides
- [ ] Check onboarding wrapper/pop-ups
- [ ] Skip/complete onboarding steps

### Trade Entry & Analytics

- [ ] Enter trade with various input combinations
- [ ] Ensure calculation functions (ROI, P/L) display correctly
- [ ] Validate charts update after new trade entry

### Calendar Interaction

- [ ] Navigate months, select dates
- [ ] Check trade details on date click
- [ ] Add trade from calendar view (if available)

### Mobile Responsiveness

- [ ] Validate key interactions on mobile sizes
- [ ] Ensure modals and dialogs operate on touch
- [ ] Bottom navigation and sidebar behaviors

---

## ✅ Additional Checks

- **Error handling:** Unexpected inputs, server errors, network failures
- **Security:** Ensure role-based access control for routes/features
- **Performance:** Dashboard load times with many trades
- **Accessibility:** Tab navigation, contrast ratios, aria labels

---

## 📁 Notes & References

- Use `playwright.config.ts` for automated tests reference
- Check `components/` for UI element coverage
- Admin tools: `create-demo-users.mjs`, `debug-users.mjs`, `seed-trades.mjs`

---

> This checklist should be expanded as new features are added. Adjust accordingly for platform updates.
