# Nudge — Complete Codebase Walkthrough

> A beautiful, private-first, zero-based budgeting app built with **React 19**, **Vite**, **TypeScript**, **TailwindCSS**, and **Capacitor** for Android. 
> All data lives on-device (localStorage). No server. No cloud.

---

## Project Structure at a Glance

```
nudge/
├── index.html ← App shell, PWA meta tags, service worker
├── index.tsx ← React entry point, font loading
├── App.tsx ← Root component: state, logic, navigation, layout
├── types.ts ← All TypeScript interfaces and enums
├── index.css ← Global styles, TailwindCSS config, paper textures
├── vite.config.ts ← Build tool config, code splitting
├── capacitor.config.ts ← Android/iOS native app config
├── package.json ← Dependencies and scripts
│
├── components/
│ ├── Dashboard.tsx ← Financial overview, tips, charts, goal tracker
│ ├── Budget.tsx ← Envelope budgeting interface
│ ├── Transactions.tsx ← Transaction log, modal, recurring bills
│ ├── Settings.tsx ← App preferences: theme, security, goals
│ ├── Onboarding.tsx ← First-run wizard: name, PIN, currency
│ ├── Walkthrough.tsx ← Post-onboarding feature tour
│ ├── PaydayRitual.tsx ← Payday budget allocation modal
│ ├── MiniCalendar.tsx ← Reusable date selector
│ └── NudgeLogo.tsx ← App logo component
│
├── services/
│ ├── db.ts ← localStorage persistence layer
│ └── biometric.ts ← Fingerprint/Face ID authentication
│
├── hooks/
│ └── useHaptics.ts ← Vibration/haptic feedback wrapper
│
└── utils/
 └── categoryEmojis.ts ← Auto-emoji detection + emoji picker list
```

---

## Configuration & Entry Files

---

### `index.html`
**Role:** The HTML shell. Bootstraps the app in the browser and on Android.

| Feature | Implementation |
|---------|---------------|
| **Mobile PWA** | `mobile-web-app-capable`, `apple-mobile-web-app-capable` meta tags allow the app to run full-screen when added to the home screen |
| **Theme color** | Two `theme-color` meta tags — one for light (`#fffdf5` = warm cream), one for dark (`#0f172a` = slate-900) — dynamically updated via JS to control the Android status bar color |
| **PWA Manifest** | Links `/manifest.json` for installability; icons for 192px and 512px |
| **Service Worker** | Inline script registers `/sw.js` on `load` and listens for `updatefound`. Enables offline caching and update notification |
| **Dark mode body** | Body class uses `dark:bg-slate-900` so Tailwind's dark variant applies from the root |

---

### `index.tsx`
**Role:** The React entry point. Mounts the app, loads all fonts.

```tsx
// Loads 5 custom fonts from @fontsource (self-hosted Google Fonts)
import '@fontsource/patrick-hand'; // "hand" theme — default handwritten
import '@fontsource/playfair-display'; // "serif" theme — editorial
import '@fontsource/caveat'; // "casual" theme
import '@fontsource/indie-flower'; // "cursive" theme
import '@fontsource/inter'; // "sans" theme — clean modern
```

It mounts `<App />` inside `React.StrictMode` on the `#root` div.

---

### `package.json`
**Role:** Declares dependencies and build scripts.

**Key libraries:**

| Package | Purpose |
|---------|---------|
| `react@19` | UI framework |
| `vite@6` | Dev server + build tool |
| `@capacitor/core@5` | Native Android bridge |
| `@capacitor/haptics` | Vibration feedback |
| `@capacitor/status-bar` | Android status bar control |
| `capacitor-native-biometric` | Fingerprint/Face ID |
| `recharts@3` | Area/bar charts on Dashboard |
| `lucide-react` | Icon library (500+ SVG icons) |
| `canvas-confetti` | Goal achievement celebration effect |
| `tailwindcss@3` | Utility CSS framework |

Scripts: `dev` (Vite dev server on port 3000), `build` (production bundle), `preview`.

---

### `vite.config.ts`
**Role:** Build configuration.

- **Dev server:** `host: 0.0.0.0` — accessible on local network (useful for testing on a phone)
- **API key injection:** `process.env.GEMINI_API_KEY` is injected at build time from `.env`
- **Code splitting:** The production bundle is manually chunked into:
 - `vendor-react` — React + ReactDOM
 - `vendor-charts` — Recharts
 - `vendor-icons` — Lucide React
 - This prevents one giant bundle and gives better caching behaviour

---

### `capacitor.config.ts`
**Role:** Configures the Capacitor native layer that wraps this web app for Android.

| Setting | Value | Why |
|---------|-------|-----|
| `appId` | `com.nudge.app` | Android package identifier |
| `webDir` | `dist` | Points to the Vite build output |
| `androidScheme` | `https` | Uses HTTPS for local assets to avoid mixed content |
| `StatusBar.overlaysWebView` | `true` | Status bar is transparent; web content draws behind it |
| `SplashScreen.launchShowDuration` | `0` | No splash screen delay |
| `Keyboard.resize` | `body` | When the soft keyboard opens, the body resizes instead of the viewport clipping content |
| `android.webContentsDebuggingEnabled` | `false` | Disabled in production (enable during dev to use Chrome DevTools on device) |

---

## `types.ts` — The Data Model

**Role:** Single source of truth for every TypeScript type in the app. Contains no logic — pure type definitions.

### Core Domain Types

#### `CategoryGroup`
```ts
{ id: string; name: string; }
```
A top-level budget group (e.g., "Needs", "Savings & Debt", "Wants"). Groups contain categories.

#### `BudgetCategory`
The central data structure for envelope budgeting.
```ts
{
 id: string;
 groupId: string;
 name: string;
 emoji?: string; // Custom icon (overrides auto-generated)
 assignments: Record<string, number>; // { "2025-01": 500, "2025-02": 600 }
 // Derived/calculated at runtime — NOT stored:
 activity: number; // Spending in the selected month
 available: number; // Cumulative balance (rollover from prev months)
 assignedCurrent: number; // Amount assigned THIS month
 isVice?: boolean; // If true, triggers "Vice Tax" penalty
}
```
The `assignments` object is the key to zero-based budgeting: money is allocated per month per category.

#### `Transaction`
```ts
{
 id: string;
 date: string; // "YYYY-MM-DD"
 payee: string;
 categoryId: string; // Links to BudgetCategory.id
 amount: number; // NEGATIVE = expense, POSITIVE = income
 memo?: string;
 cleared: boolean;
 sentimentScore?: number; // 1-10 (Love Score — how much user valued the purchase)
 isEssential?: boolean; // Essential bills are excluded from regret analysis
 isRecurring?: boolean; // Auto-generated from a RecurringTransaction rule
 recurringId?: string; // Links back to parent RecurringTransaction
}
```

#### `RecurringTransaction`
Defines a rule for auto-generating future transactions (bills, subscriptions, etc.).
```ts
{
 frequency: 'monthly' | 'weekly' | 'biweekly' | 'yearly';
 dayOfMonth: number; // For monthly/yearly: day 1-31; for weekly: 0=Sun, 6=Sat
 monthOfYear?: number; // For yearly: 0-11
 nextDueDate: string; // "YYYY-MM-DD" — when the next transaction will be generated
 lastGeneratedDate?: string; // Prevents double-generation
 isActive: boolean;
}
```

#### `UserProfile`
All user settings stored as a single object.
```ts
{
 name, currency, currencyCode, isOnboarded, startingBalance,
 // Goal System:
 financialGoal, goalTarget, goalDate, goalCategoryId,
 // Theme:
 theme: { paper, font, accentColor, darkMode },
 // Security:
 pin, biometricEnabled, skipLockForWidget,
 // Preferences:
 preferences: {
 dateFormat, weekStart, showDecimals, compactMode,
 animationSpeed, showRunningBalance, confirmBeforeDelete,
 autoBackupReminder, privacyMode, blurAtStartup,
 viceTaxPercentage // Default 10%
 },
 nextPayday
}
```

#### `FinancialContext`
The "computed state" object derived from all raw data. Passed to every view component.
```ts
{
 groups, categories, transactions, currentMonth,
 totalBudgeted, totalActivity, totalAvailable, readyToAssign,
 userStats, userProfile, notifications,
 goalProgress, goalPercentage, daysToGoal,
 themeClasses // Pre-computed CSS class strings for the current theme color
}
```

#### `ThemeClasses`
Maps an accent color choice to actual Tailwind classes:
```ts
{ primaryBg, primaryText, border, lightBg, hoverBg, hex }
```

### Enum
```ts
enum View { DASHBOARD, BUDGET, TRANSACTIONS, SETTINGS }
```

### Type Aliases
- `PaperType` — `'dots' | 'lines' | 'grid' | 'plain'`
- `FontType` — `'hand' | 'sans' | 'serif' | 'casual' | 'cursive'`
- `AccentColor` — `'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan'`
- `DateFormatType` — `'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'`

---

## `services/db.ts` — Persistence Layer

**Role:** Thin wrapper around `localStorage` for reading/writing the entire app database.

```ts
const DB_KEY = 'pocket_budget_data_v1';

loadDB(): AppDatabase | null // Reads + JSON.parses from localStorage
saveDB(data: AppDatabase): void // JSON.stringifies + writes to localStorage 
clearDB(): void // Removes the key (used for "Reset All Data")
```

**Design decisions:**
- The `_v1` suffix allows future schema migrations without conflicts
- All operations are wrapped in `try/catch` — a corrupt localStorage entry doesn't crash the app
- `typeof window === 'undefined'` guard makes it SSR-safe (never runs on a Node.js server)
- The entire database is one serialized JSON blob — no SQL, no IndexedDB complexity

**Database schema (`AppDatabase`):**
```ts
{
 groups: CategoryGroup[];
 categories: BudgetCategory[];
 transactions: Transaction[];
 userStats: UserStats;
 userProfile: UserProfile;
 notifications: Notification[];
 recurringTransactions?: RecurringTransaction[];
}
```

---

## `services/biometric.ts` — Native Biometric Auth

**Role:** Wraps the `capacitor-native-biometric` plugin to authenticate via fingerprint, face, or iris.

### `checkBiometricAvailability(): Promise<BiometricResult>`
Calls `NativeBiometric.isAvailable()` and maps the native `BiometryType` enum to a friendly string:
- `BiometryType.FINGERPRINT` → `'fingerprint'`
- `BiometryType.FACE_AUTHENTICATION` → `'face'`
- `BiometryType.IRIS_AUTHENTICATION` → `'iris'`

Returns `{ isAvailable: false, biometryType: 'none' }` silently on error (web/emulator).

### `authenticateWithBiometric(): Promise<boolean>`
1. Checks availability first
2. Calls `NativeBiometric.verifyIdentity()` with a system dialog:
 - Title: "Unlock Nudge"
 - Fallback button: "Use PIN"
 - Max attempts: 3
3. Returns `true` if the user authenticates, `false` if they cancel or fail

On web (no native plugin), `verifyIdentity()` throws and the `catch` returns `false` — safe to call anywhere.

---

## `hooks/useHaptics.ts` — Haptic Feedback

**Role:** Semantic wrapper around `@capacitor/haptics` that maps the 6 impact/notification types to meaningful action names. Safe on web (all calls silently no-op).

```ts
const { light, medium, heavy, success, warning, error } = useHaptics();

// Usage in components:
// light() → confirms minor interaction (tap a chip)
// medium() → confirms significant action (assign budget amount)
// heavy() → marks a major milestone (category fully funded)
// success() → goal reached, transaction logged cleanly
// warning() → category overspent, budget exceeded
// error() → invalid input, destructive action
```

The `safe()` helper catches any thrown error from the native layer (so web usage is always silent):
```ts
const safe = (fn: () => Promise<void>) => {
 fn().catch(() => { /* no-op on web */ });
};
```

---

## `utils/categoryEmojis.ts` — Emoji Intelligence

**Role:** Automatically assigns meaningful emojis to budget categories based on their names.

### `getDefaultEmoji(categoryName: string): string`
Implements a 3-priority keyword matching system:
1. **Exact phrase match** (for multi-word keywords like `"credit card"`)
2. **Exact word match** (splits the category name into words)
3. **Partial match** (only for keywords > 3 chars, to avoid matching "fun" inside "fund")

Falls back to `` if no match is found.

**Coverage includes 80+ keyword mappings across 10 categories:**
- Housing & Utilities (rent, internet, gas, electric…)
- Transportation (car, bus, uber, fuel…)
- Food (groceries, restaurant, coffee, pizza…)
- Health (doctor, pharmacy, gym, dental…)
- Insurance
- Entertainment (Netflix, Spotify, gaming, movies…)
- Shopping & Personal Care
- Travel
- Savings & Finance (emergency fund, debt, investments…)
- Gifts & Donations

### `getCategoryDisplayEmoji(name, customEmoji?): string`
If the user set a custom emoji, return it; otherwise fall back to `getDefaultEmoji`.

### `categoryEmojis: string[]`
A curated array of 65 emojis organized into 3 groups (Needs, Wants, Savings) for the emoji picker UI in the Budget screen.

---

## `App.tsx` — The Brain

**Role:** Root component. Owns ALL application state, computes `FinancialContext`, orchestrates navigation, and renders the layout shell.

### State

| State | Type | Purpose |
|-------|------|---------|
| `groups` | `CategoryGroup[]` | Budget group definitions |
| `categories` | `BudgetCategory[]` | All envelope categories |
| `transactions` | `Transaction[]` | Every transaction ever recorded |
| `userStats` | `UserStats` | Streak days, last login |
| `userProfile` | `UserProfile` | All user settings |
| `notifications` | `Notification[]` | In-app alerts |
| `recurringTransactions` | `RecurringTransaction[]` | Recurring bill rules |
| `activeView` | `View` | Currently displayed screen |
| `currentMonth` | `string` | "YYYY-MM" — selected month for all views |
| `isLocked` | `boolean` | Lock screen shown? |
| `pinInput` | `string` | Digits entered on lock keypad |
| `isLoading` | `boolean` | Splash screen shown? |
| `isOffline` | `boolean` | Browser offline? |
| `showWalkthrough` | `boolean` | Feature tour overlay shown? |
| `quickAddType` | `'expense'|'income'|null` | Widget deep link action |

### Theme System

```ts
const THEME_COLORS: Record<AccentColor, ThemeClasses> = {
 indigo: { primaryBg: 'bg-indigo-600', primaryText: 'text-indigo-700', hex: '#4f46e5', ... },
 emerald: { ... },
 rose: { ... },
 amber: { ... },
 violet: { ... },
 cyan: { ... }
};
```

The active theme is derived at render time: 
`themeClasses = THEME_COLORS[userProfile.theme?.accentColor || 'amber']`

### Default Categories (50/30/20 Structure)

On first launch the app seeds 13 categories aligned with the 50/30/20 budgeting rule:
- **Needs (50%):** Rent, Groceries, Utilities, Internet & Phone, Transportation, Medical
- **Savings (20%):** Emergency Fund, Investments, Debt Repayment
- **Wants (30%):** Dining Out, Entertainment, Shopping, Subscriptions, Vacation Fund

### Key `useEffect` Hooks

#### 1. Dark Mode & Status Bar
```ts
useEffect(() => {
 if (isDark) {
 document.documentElement.classList.add('dark');
 StatusBar.setStyle({ style: Style.Dark });
 StatusBar.setBackgroundColor({ color: '#00000000' }); // transparent
 } else {
 document.documentElement.classList.remove('dark');
 }
}, [userProfile.theme?.darkMode]);
```
Keeps the Android status bar in sync with the app theme. Uses transparent background so web content draws behind it.

#### 2. Auto-Persistence
```ts
useEffect(() => {
 saveDB({ groups, categories, transactions, userStats, userProfile, notifications, recurringTransactions });
}, [groups, categories, transactions, ...]);
```
Every state change automatically saves to localStorage. No explicit "save" button needed.

#### 3. Recurring Transaction Engine
Runs on mount and when `currentMonth` changes. Loops through all `RecurringTransaction` rules and generates `Transaction` records for any past-due dates. Uses UTC dates throughout to avoid timezone-shift bugs. Calculates next due date using `calculateNextDue()` which correctly handles month-end overflow (e.g., Jan 31 → Feb 28).

#### 4. Smart Notifications
On mount, automatically pushes:
- A "1st of the month" budget reminder every month
- A "Happy New Year" summary message on January 1st

#### 5. Deep Link Handler (`handleUrl`)
Parses Capacitor app URL open events to support Android widget shortcuts:
- `?action=add-expense` → opens Transactions modal in expense mode
- `?action=add-income` → opens Transactions modal in income mode
- `?action=view-budget` → navigates to Budget

#### 6. Biometric Auto-Trigger
If the user has biometrics enabled, automatically invokes fingerprint scan 100ms after the lock screen appears (so they don't have to manually tap).

### Core Financial Logic: `financialContext` (useMemo)

This is the heart of the app — a memoized computation that derives all financial numbers from the raw state:

**For each category:**
```
activityCurrent = sum of transactions THIS month for this category
cumulativeAssigned = sum of all assignments UP THROUGH this month
cumulativeActivity = sum of all spending UP THROUGH this month
available = cumulativeAssigned + cumulativeActivity
 (negative spending reduces this balance)
```

**Envelope rollover:** money left over from previous months stays in the category's `available` balance. This is proper zero-based budgeting.

**Ready to Assign:**
```
lifetimeIncome = all income transactions up through selected month
totalAssigned = all category assignments up through selected month
readyToAssign = lifetimeIncome - totalAssigned
```

### Action Handlers

#### `handleAddTransaction`
1. Validates the date is not in the future
2. Adds the transaction
3. **Vice Tax Logic:** If the transaction is an expense and the category is marked `isVice`, automatically calculates a tax (default 10%, configurable) and assigns that amount to the user's Goal category

#### `handleUpdateCategory`
Stores `assignedCurrent` into the category's `assignments[currentMonth]` record, preserving historical data.

#### `handleCopyLastMonthBudget`
Copies previous month's assignment amounts into the current month for all categories that are currently unassigned. Useful at the start of each month.

#### `handleUpdateProfile` (Goal Management)
When the user changes `financialGoal`:
- If a goal category already exists → renames it
- If no goal category exists → creates a new `BudgetCategory` in the "savings" group

### Lock Screen
A PIN-based lock screen with:
- 4 visual boxes that fill with `●` as digits are typed
- Shake animation (`animate-shake`) on wrong PIN
- A numeric keypad drawer that slides up from the bottom
- Fingerprint unlock button (only shown with biometrics enabled)
- Auto-submit when 4th digit is entered

### Background (Paper Theme)
```ts
const paperClass =
 paper === 'lines' ? 'bg-paper-lines' :
 paper === 'grid' ? 'bg-paper-grid' :
 paper === 'dots' ? 'bg-paper-dots' : 'bg-paper-plain';
```
These CSS classes are defined in `index.css` as repeating SVG/gradient patterns that give the app its distinctive "notebook paper" aesthetic.

### Layout Shell
After onboarding, the app renders a 3-layer layout:
```
┌─────────────────────────┐
│ [Offline Banner] │ ← amber bar, only when navigator.onLine = false
├─────────────────────────┤
│ │
│ <main> (scrollable) │ ← paper texture, left spine shadow effect
│ ├── Spine shadow │
│ └── Active View │
│ │
├─────────────────────────┤
│ Bottom Nav (4 tabs) │ ← Dashboard | Budget | Log | Settings
└─────────────────────────┘
```

---

## `components/Dashboard.tsx` — Financial Overview

**Role:** Read-only analytics view. Shows cash position, goals, spending habits, tips, budget breakdown, and trend charts.

### Financial Tips System
- `FINANCIAL_TIPS` array contains **42 curated tips** covering everything from debt snowball to "buy the latte"
- Tips auto-rotate every **10 seconds** with a fade-out/fade-in transition
- User can manually navigate with prev/next chevrons
- Progress bar shows position in the tip reel

### Budget Ratio Analyzer
6 selectable budgeting frameworks:
- **50/30/20** — Elizabeth Warren (Needs / Wants / Savings)
- **70/20/10** — Simple (Living / Savings / Giving)
- **80/20** — Pay Yourself First (simplified)
- **60% Solution** — Richard Jenkins (5 buckets)
- **30/30/30/10** — Quarter-based
- **Pay Yourself First** — Aggressive saver (30% savings first)

### Key Cards

#### Total Contentment Hero Card
- Shows `totalCash = totalAvailable + readyToAssign` (your actual liquid net worth)
- Rotates -2° with hover-to-0° transform for a tactile "card" feel
- Privacy Mode blurs the amount with CSS `blur-xl`
- Sub-row shows "To Assign" and real-time "Savings Rate" for the month

#### Goal Progress Card
- Collapsible (click header to expand/collapse)
- Animated progress bar with striped overlay pattern
- Shows days remaining to goal date
- Triggers confetti celebration + `canvas-confetti` when `goalPercentage >= 100`

#### Spending Highlights (Sentiment Analysis)
Two columns powered by `sentimentScore` on transactions:
- **Top Value** — Transactions with `sentimentScore >= 8` (green, sorted by score then amount)
- **Review List** — Transactions with `sentimentScore <= 4` and `!isEssential` (red)

#### Budget Breakdown (Needs / Wants / Savings)
Stacked bar charts showing:
- Light pastel bar = allocated budget (proportional to total budget)
- Dark inner bar = actual spending (proportional to allocated)
- Overspending turns the bar rose-red

#### Income vs Expense Trend Chart
- Uses Recharts `AreaChart` with two `Area` series (Income = emerald, Expense = rose)
- Covers last 6 months relative to `currentMonth`
- Custom `ComparisonTooltip` component shows formatted dollar amounts

#### Celebration Notification
Toast-style overlay that appears on:
- Goal 100% completion
- New Year's Day (January 1st)

Fires `canvas-confetti` from both sides of the screen for 3 seconds.

---

## `components/Budget.tsx` — Envelope Budgeting

**Role:** The core budgeting interface. Shows all categories grouped by group, lets users assign money, manage categories, and use productivity shortcuts.

### `BudgetInput` Sub-Component
A performance-optimized inline input for typing budget amounts:
- Uses **local string state** (not the parent's number state) to avoid cursor-jump issues
- `handleFocus` → selects all text so the user can immediately type a new value
- `handleBlur` → parses the string to float, calls `onSave(val)`, updates the category
- `onWheel` → blurs the input to prevent accidental scroll-to-change
- `onKeyDown` → Enter key confirms the value

### Budget Screen Features
- **Month navigator** — `< Feb 2025 >` arrows call `onMonthChange(offset)`
- **Ready to Assign badge** — large number at the top showing unallocated money
- **Copy Last Month** button — one-tap to clone last month's assignments to this month
- **Category groups** — expandable/collapsible sections (uses a `Set<string>` for collapsed group IDs)
- **Inline assignment** — each category row has an amount input, `Activity` and `Available` labels
- **Overspent highlighting** — categories with negative `available` display in rose
- **Vice Tax indicator** — categories flagged `isVice` show a skull icon
- **Emoji picker** — modal grid of 65 emojis to customize category icons
- **Add category** — inline form within each group header
- **Delete category** — trash icon with confirmation
- **Toggle Vice** — marks a category for the Vice Tax system

### Available Balance Color Coding
```
available > 0 → emerald (money left in envelope)
available === 0 → slate (perfectly spent)
available < 0 → rose (overspent — money owed)
```

---

## `components/Transactions.tsx` — Transaction Log

**Role:** Two-tab view: Transaction list + Recurring Bills management. Contains the main transaction entry modal.

### Transaction Modal Features
The add/edit modal (rendered via `createPortal` to `document.body`) contains:

- **Type switcher** — "Expense" / "Transfer" / "Income" tabs with a sliding indicator
- **Amount field** — large number input with currency prefix
- **Date field** — uses `DateSelector` component (MiniCalendar)
- **Payee field** — text input with content-based suggestions
- **Category carousel** — horizontal scrollable list of category chips sorted by usage frequency
 - Most-used categories appear first based on transaction history count
 - Includes a search bar to filter categories by name
- **Memo field** — optional note
- **Love Score (sentimentScore)** — 5 emoji buttons () that record how satisfied the user felt
- **Essential toggle** — marks a transaction as essential
- **Edit mode** — pre-populates all fields when editing an existing transaction

### Recurring Transactions Tab
A separate sheet for managing standing orders/subscriptions:
- Create rules with: payee, category, amount, frequency, day of month
- Toggle active/inactive without deleting
- Preview the next due date
- Saved recurring transactions are processed by the engine in `App.tsx` on load

### Payday Ritual Integration
When `readyToAssign > 0`, a glowing "Payday?" button appears. Tapping it opens the `PaydayRitual` modal.

### Month Navigator
Same `< Month >` pattern as Budget view — keeps both views in sync via `currentMonth` prop.

### Transaction List Features
- Date-grouped by day with relative labels ("Today", "Yesterday")
- Each row shows: emoji + category, payee, amount, optional sentiment score
- Swipe/tap to edit (opens the modal in edit mode)
- Delete with optional confirmation (respects `preferences.confirmBeforeDelete`)
- Monthly summary footer showing total income and expenses
- Privacy Mode blurs all amounts

---

## `components/Settings.tsx` — App Configuration

**Role:** Complete settings panel covering profile, goals, security, display, preferences, and data management.

### Sections

#### Profile
- Display name editing
- Currency selection — a searchable dropdown listing **168+ world currencies** (alphabetically sorted by code)
- Starting balance adjustment

#### Financial Goal
- Goal name, target amount, and target date fields
- Auto-creates/renames a dedicated Goal category in the Budget
- Goal date uses the `DateSelector` component

#### Security
- Set/change/remove 4-digit PIN
- Toggle biometric unlock (Fingerprint/Face)
- "Skip lock for widget" toggle (allows quick-add from Android widget without unlocking)

#### Display & Theme
- **Paper background:** Dots | Lines | Grid | Plain
- **Font:** Handwritten | Sans-Serif | Serif | Casual | Cursive
- **Accent color:** 6 swatches (Indigo, Emerald, Rose, Amber, Violet, Cyan)
- **Dark Mode toggle**

#### Preferences
- Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Week start (Sunday / Monday)
- Show decimals
- Compact mode
- Animation speed (None / Reduced / Normal)
- Running balance in transaction list
- Confirm before delete
- Auto backup reminder
- **Privacy Mode** — blurs all financial figures
- **Blur at startup** — auto-enables privacy mode on launch

#### Vice Tax
- Set the Vice Tax percentage (1%-50%, default 10%)

#### Data Management
- Export Data — downloads the entire database as a JSON file (`nudge-export.json`)
- Import Data — uploads and merges a previously exported JSON
- Reset All Data — clears localStorage and returns to onboarding

#### About
- Shows app version, "View Guide" button (re-opens Walkthrough), links

---

## `components/Onboarding.tsx` — First-Run Wizard

**Role:** 4-step wizard shown only on first launch. Collects the minimal data needed to start budgeting.

### Steps

| Step | Content | Accent |
|------|---------|--------|
| 0 — Hero | Logo, tagline, "3 stats" card (100% Private, 0 Servers, ∞ Free), Get Started CTA | Emerald |
| 1 — Identity | Display name text input with animated underline border. Enter key proceeds | Indigo |
| 2 — Security | Privacy notice card, toggle for 4-digit PIN, dual PIN input with match validation (green if match, red if mismatch) | Violet |
| 3 — Currency & Balance | Searchable currency dropdown (52 currencies), starting balance input, "Start Budgeting" CTA | Amber |

**Auto-detect currency:** Uses `Intl.NumberFormat().resolvedOptions().currency` to pre-select the user's locale currency.

**Completion:** Calls `onComplete(profile)` which in App.tsx:
1. Saves the profile
2. Creates a "Starting Balance" income transaction
3. Seeds the 13 default categories
4. Navigates to Budget and shows the Walkthrough

---

## `components/Walkthrough.tsx` — Feature Tour

**Role:** A 9-step modal carousel that introduces key app features right after onboarding.

### Steps (in order)

| # | Title | Concept | Accent |
|---|-------|---------|--------|
| 1 | Welcome to Nudge | Local-first, private | Emerald |
| 2 | The Envelope Method | Digital envelope system | Indigo |
| 3 | Give Every Dollar a Job | Zero-based budgeting | Blue |
| 4 | Check Before Spending | Using category balances | Rose |
| 5 | Total Contentment | Dashboard cash position | Amber |
| 6 | Mindful Spending | Love Score | Purple |
| 7 | The Vice Tax | Habit change through penalty | Rose-dark |
| 8 | Recur & Automate | Recurring transactions | Violet |
| 9 | Your Private Vault | PIN, biometrics, privacy mode | Slate |

### UI Mechanics
- **Colored header strip** — changes color per step to match the concept being taught
- **Segmented progress bar** — 9 clickable segments at the top (skip to any step)
- **Dot indicators** — current step dot expands to a pill; clicking any dot navigates there
- **Exit animation** — when closing, the card fades out + scales down (`isExiting` state)
- **Backdrop** — semi-opaque blur overlay; clicking it also closes the tour

---

## `components/PaydayRitual.tsx` — Budget Allocation Modal

**Role:** A guided "put every dollar to work" flow triggered from the Transactions screen on payday.

**Rendered via `createPortal`** — mounts directly in `document.body` to escape stacking context.

### Features

**Header Banner** — Shows "Ready to Assign" remaining balance and "Allocated so far" total.

**Live Progress Bar** — Fills as allocations are made:
- Theme color while allocating
- Emerald when fully allocated (triggers "every dollar has a job" message)
- Rose when over-allocated (shows by-how-much error)

**Category List** — All budget categories grouped by group, each with:
- Current assigned amount displayed
- Preview of what the new total will be (if user enters an amount)
- **Quick-fill button** — one tap to dump all remaining unallocated money into this category
- Number input for the allocation amount

**Collapsible Groups** — Groups can be collapsed to hide their categories (state in `Set<string>`).

**Confirm Button** — Disabled unless at least one allocation > 0 and not over-allocated. On confirm:
1. Applies all allocations to their categories via `onUpdateCategory`
2. Shows a "Money assigned!" success state with a sparkle icon and "Done" button

---

## `components/MiniCalendar.tsx` — Date Selector

**Role:** A reusable 3-dropdown date picker (Month, Day, Year) used in the transaction modal and goal date field.

### Props
```ts
{
 value: string; // "YYYY-MM-DD"
 onChange: (date: string) => void;
 maxDate?: string; // Optional ceiling — disables future dates
}
```

### Features
- **Year range** — current year `±5` (or capped at `maxDate`'s year)
- **Days in month** — computed via `new Date(year, month, 0).getDate()`, correctly handles leap years
- **Max date enforcement** — months and days beyond the max are `disabled` in the select options
- **Day overflow guard** — if user changes month to one with fewer days, the selected day is clamped to the last valid day
- **Styled selects** — custom `appearance-none` dropdowns with a `ChevronDown` icon overlay for consistent cross-platform look

---

## `components/NudgeLogo.tsx` — Logo Component

**Role:** Minimal wrapper that renders the app's icon image.

```tsx
<img src="/icon-512.png?v=3" alt="Nudge logo" />
```

The `?v=3` cache-busting query param ensures the latest icon is loaded after updates. Used in the splash screen, onboarding, and lock screen.

---

## Architecture Summary

```
 ┌─────────────────────────────────────────────────────────────┐
 │ App.tsx │
 │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
 │ │ State │ │ useMemo │ │ Effects │ │ Handlers │ │
 │ │ groups │ │financial │ │autosave │ │addTransaction│ │
 │ │ cats │ │ Context │ │recurring │ │updateCategory│ │
 │ │ txns │ │ (derived)│ │darkMode │ │copyBudget │ │
 │ │ profile │ │ │ │biometric │ │viceTax │ │
 │ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
 │ │ passes context down │
 │ ┌──────────┬──────────┴─────────┬──────────┐ │
 │ │Dashboard │ Budget │Transactions│Settings │
 │ │ charts │ BudgetInput │ │ modal │ │ prefs │
 │ │ tips │ emoji picker │ │ recurring│ │ security │
 │ │ goal │ vice tax │ │ ritual │ │ theme │
 │ └──────────┴───────────────────┴──────────┴─┘ │
 └─────────────────────────────────────────────────────────────┘
 │ │
 services/db.ts services/biometric.ts
 (localStorage) (Native Android)
 │
 hooks/useHaptics.ts
 utils/categoryEmojis.ts
```

### Data Flow
1. **User action** (e.g., adds a transaction)
2. **Handler** in `App.tsx` validates + updates state
3. **`saveDB` effect** fires automatically → persists to localStorage
4. **`financialContext` memo** recomputes derived values
5. **View component** re-renders with fresh data

This single-direction data flow (no Redux, no Zustand) keeps the architecture simple and the app fast.

---

