# Pocket Budget Implementation Plan

## 1. Visual & UI Polish (Immediate Priority)
- [ ] **Fix Input Focus:** Remove annoying blue box default outline, replace with custom theme-aware focus ring.
- [ ] **Fix Status Bar/Cream Bar:** Ensure status bar/top area matches theme (especially dark mode/onboarding).
- [ ] **Dark Mode 'Plain' Paper:** Fix background color not switching to dark when 'plain' is selected.
- [ ] **Transaction Colors:** Distinctly differentiate Inflow (Green/Teal) vs Outflow (Red/Orange/Text color) in the transaction list.
- [ ] **Modal Scrolling:** Ensure all modals (especially Recurring Transaction) are fully scrollable and inputs aren't cut off.
- [ ] **App Icon:** Generate a new high-res, centered notebook icon on black background.
- [ ] **Loading Animation:** Create a custom loading screen consistent with the "hand-drawn/notebook" style.

## 2. Core Functional Improvements
- [ ] **Budgeting Workflow:**
    - [ ] Remove "Copy to Next Month" button.
    - [ ] Add "Typing Suggestions" for amounts based on history.
    - [ ] Add "One-Click Auto Budget" button (using historical averages/suggestions).
- [ ] **Transaction Logic:**
    - [ ] Prevent logging transactions with future dates.
    - [ ] **Recurrent Transactions:**
        - [ ] Fix bug where "1" in date cannot be deleted.
        - [ ] Add proper feedback/toast when saved.
        - [ ] Ensure modal fits screen.
- [ ] **Category Management:** Allow categories to be deleted (with confirmation/reassignment handling).

## 3. Onboarding & Security
- [ ] **Enhanced Onboarding:**
    - [ ] Add PIN/Fingerprint verification setup (Local Auth).
    - [ ] Remove "Goal Setting" from initial onboarding (move to later/dashboard).
    - [ ] Add "Walkthrough" (skippable) and User Guide.
    - [ ] Redirect: First setup -> Budget View. Subsequent logins -> Dashboard.
- [ ] **Goal Friction:** Add a "puzzle" or challenge when trying to change/delete a goal to prevent impulse changes.

## 4. Widget & External Interaction
- [ ] **Widget UI:** significant overhaul to match app aesthetic.
- [ ] **Quick Logging:** Optimize the "Add Transaction" deep link/intent to look like a standalone modal/dialog if possible, or fast-load specific view.

## 5. Trust, Content & Personality
- [ ] **New Pages:** Add About, Privacy Policy, Terms pages.
- [ ] **Personality:** Add more quotes, animations, and a "Character" (e.g., a doodle mascot).
- [ ] **Multilingual Support:** Basic i18n structure (English default, detect system language).

## 6. Technical, Performance & Fixes
- [ ] **Fix Export:** Debug and fix the "Export Backup" functionality.
- [ ] **Notifications:** Implement local notifications for:
    - [ ] Start of month budgeting reminder.
    - [ ] Yearly summary.
- [ ] **Accessibility:** Audit generic labels, contrast ratios, and screen reader support.
- [ ] **Performance:** Optimize re-renders and large list handling.

## 7. Research
- [ ] Research similar apps for additional "delight" features.
