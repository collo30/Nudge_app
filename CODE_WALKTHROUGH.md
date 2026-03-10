# Nudge -- Code Walkthrough

A complete technical guide to the Nudge budgeting application codebase. This document covers every file, component, type, and feature as it actually exists in the source code.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Entry Points](#entry-points)
5. [Type System](#type-system)
6. [Data Persistence](#data-persistence)
7. [Root Component -- App.tsx](#root-component----apptsx)
8. [Components](#components)
   - [Dashboard](#dashboard)
   - [Budget](#budget)
   - [Transactions](#transactions)
   - [Settings](#settings)
   - [Onboarding](#onboarding)
   - [Walkthrough](#walkthrough)
   - [PaydayRitual](#paydayritual)
   - [MiniCalendar (DateSelector)](#minicalendar-dateselector)
   - [NudgeLogo](#nudgelogo)
9. [Services](#services)
   - [Database Service (db.ts)](#database-service-dbts)
   - [Biometric Service (biometric.ts)](#biometric-service-biometricts)
10. [Hooks](#hooks)
    - [useHaptics](#usehaptics)
11. [Utilities](#utilities)
    - [Category Emojis](#category-emojis)
12. [Configuration Files](#configuration-files)
13. [Build and Development](#build-and-development)
14. [Key Features Deep Dive](#key-features-deep-dive)

---

## Project Overview

Nudge is a local-first, privacy-focused budgeting application built with React. It uses the envelope budgeting method, where users allocate income into categories (digital "envelopes") and track spending against those allocations. All data is stored exclusively on the user's device in `localStorage`. No servers, no cloud sync, no accounts.

**App ID:** `com.nudge.app`
**localStorage key:** `pocket_budget_data_v1`

---

## Technology Stack

### Core

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI framework |
| TypeScript | 5.8.2 | Type safety |
| Vite | 6.2.0 | Build tool and dev server |
| TailwindCSS | 3.4.19 | Utility-first CSS |

### Native (Capacitor)

| Package | Purpose |
|---|---|
| `@capacitor/core` | Capacitor runtime |
| `@capacitor/android` | Android platform |
| `@capacitor/app` | Deep links and app lifecycle |
| `@capacitor/status-bar` | Status bar style control |
| `@capacitor/haptics` | Vibration feedback |
| `@capacitor/filesystem` | File system access |
| `capacitor-native-biometric` | Fingerprint/face unlock |

### UI Libraries

| Package | Purpose |
|---|---|
| `lucide-react` | Icon library |
| `recharts` | Charts (area charts on Dashboard) |
| `canvas-confetti` | Celebration confetti effects |

### Fonts (via @fontsource)

| Font | Usage |
|---|---|
| Patrick Hand | "Handwritten" font option |
| Playfair Display | Serif display font |
| Caveat | "Casual" font option |
| Indie Flower | "Artsy/Cursive" font option |
| Inter | Clean sans-serif base |
| Lora | "Legible" serif font (loaded via Google Fonts in index.html) |

---

## Project Structure

```
nudge/
  index.html              -- HTML shell with meta tags, PWA config, service worker registration
  index.tsx               -- React entry point (mounts App into #root)
  index.css               -- Global styles, TailwindCSS directives, custom animations
  App.tsx                 -- Root component: state, routing, all business logic
  types.ts                -- All TypeScript interfaces and enums
  vite.config.ts          -- Vite build configuration
  capacitor.config.ts     -- Capacitor native app configuration
  tailwind.config.js      -- TailwindCSS theme extensions
  postcss.config.js       -- PostCSS config for TailwindCSS
  tsconfig.json           -- TypeScript compiler configuration
  package.json            -- Dependencies and scripts

  components/
    Dashboard.tsx          -- Financial overview, charts, budget ratios, tips
    Budget.tsx             -- Envelope budget planner with category management
    Transactions.tsx       -- Transaction log with recurring transactions
    Settings.tsx           -- App configuration, theming, goals, security
    Onboarding.tsx         -- First-run setup flow (4 steps)
    Walkthrough.tsx        -- Feature tour modal (9 steps)
    PaydayRitual.tsx       -- Post-income allocation modal
    MiniCalendar.tsx       -- Date picker component (DateSelector)
    NudgeLogo.tsx          -- Logo image component

  services/
    db.ts                  -- localStorage persistence (load, save, clear)
    biometric.ts           -- Native biometric authentication wrapper

  hooks/
    useHaptics.ts          -- Haptic feedback hook wrapping Capacitor Haptics

  utils/
    categoryEmojis.ts      -- Emoji mapping and selection for budget categories

  public/
    sw.js                  -- Service worker for PWA offline support
    manifest.json          -- PWA manifest
    (various icons and images)
```

---

## Entry Points

### index.html

The HTML shell for the application. Key aspects:

- Sets viewport with `viewport-fit=cover` for safe area support on mobile
- Title: "Nudge -- A nudge to financial independence"
- Two `theme-color` meta tags (light: `#fffdf5`, dark: `#0f172a`) for dynamic status bar theming
- PWA meta tags (`mobile-web-app-capable`, `apple-mobile-web-app-capable`)
- Loads the Lora font from Google Fonts
- Links to `index.css` for styled entry
- Registers a service worker (`sw.js`) for offline caching with update detection
- Body uses TailwindCSS classes: cream background (`bg-[#fffdf5]`), dark mode support, antialiased text

### index.tsx

The React entry point:

- Imports five `@fontsource` font packages (Patrick Hand, Playfair Display, Caveat, Indie Flower, Inter)
- Creates a React root on `#root` element
- Renders `<App />` inside `<React.StrictMode>`

---

## Type System

All types are defined in `types.ts`. This is the contract for the entire application.

### Core Domain Types

#### CategoryGroup

```typescript
interface CategoryGroup {
  id: string;       // e.g. 'needs', 'savings', 'wants'
  name: string;     // e.g. 'Needs (Bills & Living)'
}
```

Groups organize categories into high-level buckets. The app ships with three default groups aligned to the 50/30/20 budgeting rule.

#### BudgetCategory

```typescript
interface BudgetCategory {
  id: string;
  groupId: string;
  name: string;
  emoji?: string;
  assignments: Record<string, number>;  // key is "YYYY-MM", value is assigned amount
  activity: number;                     // calculated: spending in current month
  available: number;                    // calculated: cumulative balance
  assignedCurrent: number;             // calculated: assignment for current month
  isVice?: boolean;                    // enables Habit Nudge auto-transfer
}
```

The `assignments` map stores budget allocations per month (e.g., `{"2026-03": 500}`). The `activity`, `available`, and `assignedCurrent` fields are recalculated on every render via `useMemo` in `App.tsx` -- they are never stored in the database.

#### Transaction

```typescript
interface Transaction {
  id: string;
  date: string;              // "YYYY-MM-DD"
  payee: string;
  categoryId: string;
  amount: number;            // negative = expense, positive = income
  memo?: string;
  cleared: boolean;
  sentimentScore?: number;   // 1-10 "Love Score"
  isEssential?: boolean;     // marks transaction as a necessity
  isRecurring?: boolean;     // auto-generated from RecurringTransaction
  recurringId?: string;      // links back to parent recurring rule
}
```

Income transactions use `categoryId = 'ready_to_assign'` (the `READY_TO_ASSIGN_ID` constant).

#### RecurringTransaction

```typescript
interface RecurringTransaction {
  id: string;
  payee: string;
  categoryId: string;
  amount: number;
  memo?: string;
  frequency: 'monthly' | 'weekly' | 'biweekly' | 'yearly';
  dayOfMonth: number;       // for monthly/yearly: day of month (1-31)
                            // for weekly/biweekly: day of week (0=Sun, 6=Sat)
  monthOfYear?: number;     // 0-11, only for 'yearly' frequency
  isActive: boolean;
  nextDueDate: string;      // "YYYY-MM-DD"
  lastGeneratedDate?: string;
}
```

Recurring transactions auto-generate regular `Transaction` entries when their due date arrives. The generation logic runs in a `useEffect` in `App.tsx`.

#### UserProfile

```typescript
interface UserProfile {
  name: string;
  currency: string;          // symbol (e.g. "$")
  currencyCode: string;      // ISO code (e.g. "USD")
  isOnboarded: boolean;
  startingBalance: number;

  // Goal fields
  financialGoal: string;
  goalTarget: number;
  goalDate: string;          // "YYYY-MM-DD"
  goalCategoryId: string;

  // Theme
  theme?: {
    paper: 'dots' | 'lines' | 'grid' | 'plain';
    font: 'hand' | 'legible' | 'sans' | 'serif' | 'casual' | 'cursive';
    accentColor: 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan' | 'pink';
    darkMode?: boolean;
  };

  // Security
  pin?: string;
  biometricEnabled?: boolean;
  skipLockForWidget?: boolean;

  // Preferences
  preferences?: {
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    weekStart: 'sunday' | 'monday';
    showDecimals: boolean;
    compactMode: boolean;
    animationSpeed: 'none' | 'reduced' | 'normal';
    showRunningBalance: boolean;
    confirmBeforeDelete: boolean;
    autoBackupReminder: boolean;
    privacyMode?: boolean;         // blurs all money amounts
    blurAtStartup?: boolean;       // auto-enable privacyMode on launch
    viceTaxPercentage?: number;    // default 10%
    enableAnimations?: boolean;
  };

  nextPayday?: string;      // "YYYY-MM-DD"
}
```

#### FinancialContext

```typescript
interface FinancialContext {
  groups: CategoryGroup[];
  categories: BudgetCategory[];
  transactions: Transaction[];
  currentMonth: string;       // "YYYY-MM"
  totalBudgeted: number;
  totalActivity: number;
  totalAvailable: number;
  readyToAssign: number;
  userStats: UserStats;
  userProfile: UserProfile;
  notifications: Notification[];
  goalProgress: number;
  goalPercentage: number;     // 0-100
  daysToGoal: number;
  themeClasses: ThemeClasses;
}
```

This is the master context object computed in `App.tsx` via `useMemo` and passed as a prop to `Dashboard`, `Budget`, and `Settings`.

#### ThemeClasses

```typescript
interface ThemeClasses {
  primaryBg: string;      // e.g. 'bg-amber-500'
  primaryText: string;    // e.g. 'text-amber-700'
  border: string;         // e.g. 'border-amber-500'
  lightBg: string;        // e.g. 'bg-amber-50'
  hoverBg: string;        // e.g. 'hover:bg-amber-600'
  hex: string;            // e.g. '#f59e0b'
}
```

Seven accent color palettes are defined in `THEME_COLORS` in `App.tsx`: indigo, emerald, rose, amber (default), violet, cyan, and pink.

### Navigation

```typescript
enum View {
  DASHBOARD = 'DASHBOARD',
  BUDGET = 'BUDGET',
  TRANSACTIONS = 'TRANSACTIONS',
  SETTINGS = 'SETTINGS'
}
```

### Constants

```typescript
const READY_TO_ASSIGN_ID = 'ready_to_assign';
```

This sentinel value is used as the `categoryId` for income transactions. It marks money as unassigned.

---

## Data Persistence

### services/db.ts

All application data is persisted to `localStorage` under the key `pocket_budget_data_v1`.

```typescript
interface AppDatabase {
  groups: CategoryGroup[];
  categories: BudgetCategory[];
  transactions: Transaction[];
  userStats: UserStats;
  userProfile: UserProfile;
  notifications: Notification[];
  recurringTransactions?: RecurringTransaction[];
}
```

Three functions:

| Function | Purpose |
|---|---|
| `loadDB()` | Reads and parses `localStorage`. Returns `AppDatabase` or `null`. |
| `saveDB(data)` | Serializes and writes the full `AppDatabase` to `localStorage`. |
| `clearDB()` | Removes the `localStorage` entry entirely. |

All functions include `typeof window === 'undefined'` guards for SSR safety and try/catch error handling.

**Persistence trigger:** A `useEffect` in `App.tsx` watches all state arrays (`groups`, `categories`, `transactions`, `userStats`, `userProfile`, `notifications`, `recurringTransactions`) and calls `saveDB()` whenever any of them change.

---

## Root Component -- App.tsx

`App.tsx` is the heart of the application. It manages all state, computes derived financial data, handles routing, and orchestrates every feature.

### Utility Functions

- `generateId(prefix)` -- Creates unique IDs using `crypto.randomUUID()` with a fallback to `Date.now()` + random string
- `getMonthString(date)` -- Converts a `Date` to `"YYYY-MM"` format

### Theme Color Definitions

`THEME_COLORS` is a `Record<AccentColor, ThemeClasses>` mapping seven accent colors (indigo, emerald, rose, amber, violet, cyan, pink) to their respective TailwindCSS class sets.

### Initial Data Constants

| Constant | Description |
|---|---|
| `DEFAULT_GROUPS` | Three groups: "Needs (Bills & Living)", "Savings & Debt", "Wants (Fun & Lifestyle)" |
| `INITIAL_CATEGORIES_TEMPLATE` | 14 categories across the three groups (e.g., Rent/Mortgage, Groceries, Emergency Fund, Dining Out) |
| `INITIAL_STATS` | `{ streakDays: 1, lastLoginDate: today }` |
| `INITIAL_PROFILE` | Default profile with `isOnboarded: false`, USD currency, amber accent, legible font, dots paper |

### State Management

All state is managed with `useState` hooks at the top level of the `App` component:

| State | Type | Source |
|---|---|---|
| `groups` | `CategoryGroup[]` | DB or `[]` |
| `categories` | `BudgetCategory[]` | DB or `[]` |
| `transactions` | `Transaction[]` | DB or `[]` |
| `userStats` | `UserStats` | DB or `INITIAL_STATS` |
| `userProfile` | `UserProfile` | DB or `INITIAL_PROFILE` |
| `notifications` | `Notification[]` | DB or `[]` |
| `recurringTransactions` | `RecurringTransaction[]` | DB or `[]` |
| `activeView` | `View` | `View.DASHBOARD` |
| `showWalkthrough` | `boolean` | `false` |
| `isLocked` | `boolean` | `true` if PIN is set |
| `pinInput` | `string` | `''` |
| `pinError` | `boolean` | `false` |
| `showKeypad` | `boolean` | `false` |
| `isLoading` | `boolean` | `true` (cleared after init) |
| `isOffline` | `boolean` | `!navigator.onLine` |
| `quickAddType` | `'expense' \| 'income' \| null` | `null` |
| `currentMonth` | `string` | Current month as `"YYYY-MM"` |

### Financial Calculation Engine

The `financialContext` is computed via `useMemo` and recalculates whenever any input state changes. This is the core budgeting logic:

1. **Category Calculations**: For each category:
   - `assignedCurrent` = assignment for the selected month from `assignments` map
   - `activity` = sum of transaction amounts in the selected month
   - `available` = cumulative assignments + cumulative activity across all months up to and including current month (this is proper envelope budgeting -- leftover money rolls forward)

2. **Income Tracking**: Income transactions (categoryId = `READY_TO_ASSIGN_ID`) are summed cumulatively up to the current month.

3. **Ready to Assign (RTA)**: `lifetimeIncome - totalAssignedEverywhere`. This represents unallocated money.

4. **Goal Tracking**: If a goal category exists, `goalProgress` is the total lifetime assignments to that category, and `goalPercentage` is `(goalProgress / goalTarget) * 100`.

5. **Performance Optimization**: Transaction maps are pre-calculated via `useMemo` (`transactionsByCat` and `incomeTxns`) to avoid O(n*m) lookups.

### Recurring Transaction Engine

A `useEffect` runs on mount and whenever `currentMonth` changes. It:

1. Iterates all active recurring transactions
2. Compares `nextDueDate` against today
3. Generates `Transaction` entries for all due dates (including catch-up for missed periods)
4. Updates `nextDueDate` and `lastGeneratedDate` on the recurring rule
5. Uses UTC dates consistently to avoid timezone issues
6. Includes infinite loop protection and duplicate generation guards

The `calculateNextDue` helper handles all four frequency types (weekly, biweekly, monthly, yearly) with proper month-end clamping (e.g., setting day 31 in a 28-day month adjusts to 28).

### Deep Link Handling

The app responds to URL parameters and Capacitor app URL events for widget integration:

- `?action=add-expense` or URL containing `add-expense` -- opens Transaction modal in expense mode
- `?action=add-income` -- opens Transaction modal in income mode
- `?action=view-budget` -- navigates to Budget view
- `skipLockForWidget` allows bypassing the PIN lock for widget actions

### Vice Tax (Habit Nudge) Logic

When a transaction is added to a category marked as `isVice`:

1. Calculates tax amount: `|transactionAmount| * (viceTaxPercentage / 100)`
2. Auto-assigns that amount to the user's goal category for the current month
3. Shows an alert informing the user of the transfer

### Navigation and Rendering

`renderSpecificView()` is the view router, mapping `activeView` to components:

| View | Component |
|---|---|
| `DASHBOARD` | `<Dashboard />` |
| `BUDGET` | `<Budget />` |
| `TRANSACTIONS` | `<Transactions />` |
| `SETTINGS` | `<Settings />` |

Navigation uses a bottom tab bar with four items: Dashboard, Budget, Log, Settings. The tab bar uses `Lucide` icons with the active tab highlighted using the current accent color.

### Lock Screen

When `isLocked` is true, the app renders a full-screen lock overlay:

- Dark background with the Nudge logo
- Animated PIN dot display (4 dots that fill as digits are entered)
- On-screen number keypad with backspace
- PIN auto-submits when 4 digits are entered
- Biometric unlock auto-triggered on load if enabled
- Shake animation on incorrect PIN

### Loading Screen

A branded splash screen with:
- Nudge logo on a cream background with dot-grid texture
- Animated loading bar
- "A nudge to financial independence" tagline

### Theme Application

The app dynamically applies:

- **Paper background**: dots, lines, grid, or plain (CSS background patterns)
- **Font**: hand, legible, sans, serif, casual, or cursive
- **Dark mode**: toggles `dark` class on `<html>` element, updates `theme-color` meta tags, and calls Capacitor `StatusBar` API
- **Accent color**: propagated through `themeClasses` to all components

---

## Components

### Dashboard

**File:** `components/Dashboard.tsx`

The main financial overview screen. Read-only -- it displays data but does not modify it.

#### Key Data Structures

**FINANCIAL_TIPS**: An array of 41 financial tip objects (`title` and `text`). These range from practical advice ("The 24-Hour Rule") to contrarian takes ("Buy the Latte", "Emergency Funds are Dead"). A random subset is displayed in the tips carousel.

**BUDGET_RATIOS**: Six budgeting methodologies the user can compare their spending against:

| Ratio | Split | Description |
|---|---|---|
| 50/30/20 | 50% Needs, 30% Wants, 20% Savings | Elizabeth Warren's approach |
| 70/20/10 | 70% Living, 20% Savings, 10% Giving | Simple living focus |
| 80/20 | 80% Spending, 20% Savings | The simplest approach |
| 60% Solution | 60/10/10/10/10 | Richard Jenkins' buckets |
| 30/30/30/10 | 30% Housing, 30% Necessities, 30% Goals, 10% Wants | Balanced quarters |
| Pay Yourself First | 30% Savings, 50% Needs, 20% Lifestyle | Aggressive saver |

Each ratio maps its percentage categories to the app's group IDs (`needs`, `wants`, `savings`), enabling automatic calculation of how the user's actual spending compares to the target ratios.

#### Sections (Collapsible)

The Dashboard uses an `expanded` state object to track which sections are open:

1. **Total Contentment Card** -- Hero card showing total available balance and savings rate. Triggers confetti when savings rate exceeds 20%. Shows privacy blur when enabled.

2. **Goal Progress** -- Displays the user's financial goal with a progress bar, percentage, and days remaining.

3. **Spending Highlights** -- Categorized spending summary with:
   - Total income and expenses this month
   - Net change (income - expenses)
   - Average sentiment (Love Score) across expense transactions
   - Essential vs discretionary spending breakdown

4. **Budget Ratio Breakdown** -- Interactive dropdown to select a budgeting methodology. Shows a horizontal stacked bar comparing actual spending distribution against the selected ratio's targets. Each category shows actual percentage vs target with over/under indicators.

5. **Financial Tips Carousel** -- Horizontally scrollable cards showing financial wisdom. Tips rotate on a timer and can be manually scrolled.

6. **Cash Flow Trend** -- An area chart (using Recharts) showing income vs expenses over the last 6 months. Uses gradient fills and a custom tooltip component (`ComparisonTooltip`).

7. **Footer Quote** -- A rotating daily financial quote selected by `new Date().getDate() % 5`.

#### Custom Components

- `HandDrawnCoin` -- SVG component rendering a sketchy hand-drawn coin icon
- `ComparisonTooltip` -- Custom Recharts tooltip showing income and expense values

### Budget

**File:** `components/Budget.tsx`

The core budgeting interface where users assign money to categories.

#### BudgetInput Component

A performance-optimized input component for entering budget assignments:

- Uses local state (`localValue`) to avoid re-rendering the entire tree on every keystroke
- Only syncs with the prop value when not focused
- Triggers haptic feedback on save (medium for confirmation)
- Supports keyboard submission (Enter to blur/save)
- Prevents scroll-wheel value changes (`onWheel` blurs the input)

#### Main Budget Component

**Header**: Shows "Budget" title with "Envelope Planner" subtitle, and month navigation arrows. Past months show a lock icon and disable editing.

**Goal Highlight Card**: When a goal is set, displays a gradient card with goal name, current progress, target amount, and a progress bar.

**Ready to Assign (RTA) Card**: A prominent card showing unallocated money. Uses the user's accent color when positive, rose when negative (over-assigned). Supports privacy blur.

**Copy Last Month's Budget**: A button that appears when the current month has no assignments but the previous month did. Copies all previous month's assignments into the current month.

**Daily Rate Auto-Cycle**: When a `nextPayday` date is set, the Available column auto-cycles every 3 seconds between showing the total available balance and the $/day rate until payday.

**Category List**: Organized by groups with collapsible headers. Each category row shows:
- Emoji icon (tappable to change via emoji picker)
- Category name (tappable to expand actions)
- Vice badge (skull icon, shown if `isVice` is true)
- Assigned input (BudgetInput component)
- Available amount with color coding (green = funded, red = overspent)
- Progress bar background fill showing percentage remaining

**Expandable Actions Per Category**:
- Enable/Disable Habit Nudge (vice toggle) -- requires a goal to be set first
- Delete category (with confirmation modal)

**Haptic Feedback**: Fires `haptics.warning()` when a category transitions to overspent, and `haptics.heavy()` when fully funded.

**Modals**:
- New Category creation (with "washi tape" decorative element)
- Delete confirmation with warning about orphaned transactions
- Emoji picker grid with a curated set of emojis from `categoryEmojis`

### Transactions

**File:** `components/Transactions.tsx`

The transaction log and recurring transaction manager.

#### Tab System

Two tabs at the top:
- **Transactions** -- the main transaction list
- **Recurring** -- recurring transaction rules (shows count badge)

#### Transaction List

- Filtered by current month and optional search query
- Each transaction card shows:
  - Left: Icon (context-dependent: wallet for income, heart for high love score, ghost for low score, zap for essential, category emoji otherwise)
  - Center: Payee name, date, and category
  - Right: Amount (green for income) and badges (Love Score, Essential tag)
  - Background fill: width based on Love Score (or 100% for income), color based on category hash or sentiment

- Tapping a transaction expands Edit/Delete action buttons
- Running balance is calculated across all transactions sorted chronologically

#### Transaction Modal (Multi-Step)

The add/edit modal uses a step-based flow (`modalStep`):

| Step | Content |
|---|---|
| 0 | Type picker (Expense vs Income toggle) |
| 1 | Payee name input |
| 2 | Category selection (expenses only) |
| 3 | Amount, date, and memo |
| 4 | Love Score slider and Essential toggle (expenses only) |

**Smart Features**:

- **Payee History Matching**: When the user types a payee name that matches past transactions, the app auto-fills the category, amount (as a suggestion), Love Score, and Essential flag from the most recent match
- **Pause Nudge Warning**: If the average Love Score for a payee is 3 or below, a warning message appears: "Just a gentle nudge -- you historically rated purchases at [payee] a [score]/10. Still want to proceed?"
- **Category Frequency Sorting**: Categories are sorted by how frequently they're used in past transactions
- **Haptic Feedback**: Success vibration on save; warning vibration if the expense exceeds the category's available balance
- **Payday Ritual**: After logging an income transaction, the PaydayRitual modal is triggered to help allocate the new funds
- **Future Date Validation**: Transactions cannot be dated in the future

#### Recurring Transaction Management

Each recurring transaction card shows:
- Category emoji, payee name, frequency, day, next due date, and amount
- Tap to expand Edit/Delete actions

The recurring modal allows setting:
- Payee, amount, category, memo
- Frequency: monthly, weekly, biweekly, yearly
- Day of month (or day of week for weekly/biweekly)
- Month of year (for yearly only)

Smart next-due-date calculation handles month-end clamping, past dates rolling to next period, and leap years.

### Settings

**File:** `components/Settings.tsx`

App configuration organized into sections.

#### Currency List

Settings defines its own `ALL_CURRENCIES` array with 156 world currencies (code, symbol, name). This is a more comprehensive list than the 43 currencies in Onboarding's list.

#### Sections

**Appearance**:
- Accent Color: 7 color options (indigo, emerald, rose, amber, violet, cyan, pink)
- Dark Mode: Toggle with sun/moon icons
- Font Style: 6 options (Legible, Handwritten, Clean Sans, Elegant, Casual, Artsy)
- Paper Type: 4 background textures (Dots, Lines, Grid, Plain) with visual previews

**Identity**:
- Display Name: inline text input
- Currency: Opens a searchable modal with 156 currencies
- Next Payday: Date input (future dates only), clearable

**Privacy**:
- Privacy Blur: Hides all money amounts across the app
- Blur at Startup: Auto-enables privacy mode on each app launch

**Security**:
- PIN: 4-digit numeric input with Set/Update/Remove controls
- Fingerprint Unlock: Toggle (only visible when PIN is set, shows "RECOMMENDED" badge)

**Goals**:
- Goal name: Text input with 6 preset suggestions ("Pay off credit card debt", "Build an emergency fund", etc.)
- Tapping a suggestion fills the name and auto-focuses the amount input
- Target amount: Numeric input with currency prefix
- Target date: DateSelector component
- Habit Nudge Rate: Slider from 1% to 100% (default 10%) controlling the vice tax percentage. Labels: "1% (Light)", "50% (Firm)", "100% (Strong)"
- Edit/Save toggle to prevent accidental changes

**Data**:
- "Burn Journal": Destructive reset with confirmation dialog. Calls `clearDB()` and resets all state to defaults.

**About Section**:
- App logo with special Kenyan holiday variants (Madaraka June 1, Utamaduni Oct 10, Mashujaa Oct 20, Jamhuri Dec 12)
- Creator name: Collins Cheruiyot with email (copyable to clipboard)
- "About & Privacy" modal: Details local-first architecture, no cloud sync, no sign up, disclaimer about financial tips
- "View User Guide" button: Re-opens the Walkthrough

#### KenyanHolidayBadge Component

An internal component that alternates between displaying the Kenyan flag image and a holiday celebration image every 4 seconds with a crossfade transition.

### Onboarding

**File:** `components/Onboarding.tsx`

A 4-step first-run setup flow.

#### Currency List

Defines `ALL_CURRENCIES` with 43 major world currencies. The app attempts to auto-detect the user's currency via `Intl.NumberFormat().resolvedOptions().currency`.

#### Steps

| Step | Title | Content |
|---|---|---|
| 0 | Welcome (Hero) | App logo, "Why Nudge?" stats card (100% Private, 0 Servers, Infinity Free), "Get Started" button |
| 1 | Identity | Display name input (required). Color accent: indigo. |
| 2 | Security | Privacy notice, optional 4-digit PIN with confirmation. Color accent: violet. |
| 3 | Setup | Currency selection (searchable dropdown), starting balance input. Color accent: amber. |

On completion, calls `onComplete()` with the collected profile data. The starting balance is converted to a "Starting Balance" income transaction in `App.tsx`.

### Walkthrough

**File:** `components/Walkthrough.tsx`

A 9-step feature tour presented as a modal carousel.

| Step | Title | Description |
|---|---|---|
| 1 | Welcome to Nudge | Local-first budgeting companion introduction |
| 2 | The Envelope Method | Categories as digital envelopes |
| 3 | Give Every Dollar a Job | Log income, assign from RTA to categories |
| 4 | Check Before Spending | Check category balance before purchasing |
| 5 | Total Contentment | Dashboard's liquid cash position card |
| 6 | Mindful Spending | Love Score and Pause Nudge feature |
| 7 | The Habit Nudge | Vice categories with auto-transfer to goal |
| 8 | Recur & Automate | Recurring transactions setup |
| 9 | Your Private Vault | Privacy Mode and PIN/biometric security |

Each step has a unique accent color and Lucide icon. Navigation includes Back/Next buttons, clickable dot indicators, a segmented progress bar, and a skip (X) button. The modal uses exit animation (opacity fade + scale) before unmounting.

### PaydayRitual

**File:** `components/PaydayRitual.tsx`

A full-screen modal that triggers after logging income. It guides the user through allocating their "Ready to Assign" balance across categories.

**Features**:
- Shows current RTA balance and total allocated with a progress bar
- Categories organized by group (Needs, Savings & Debt, Wants) with collapsible groups
- Each category shows: name, current assignment, and an amount input
- "Fill" button on each category fills it with the remaining unallocated amount
- Over-allocation warning (progress bar turns red, alert icon)
- Fully-allocated celebration message
- Enter key advances focus to the next category input
- Confirm button applies all allocations by incrementing each category's `assignedCurrent`
- Success state shows "Money assigned! Every dollar has a job."

### MiniCalendar (DateSelector)

**File:** `components/MiniCalendar.tsx`

A three-dropdown date selector (Month, Day, Year).

- Generates year options from 5 years ago to 5 years in the future (or `maxDate` year)
- Dynamically calculates days in selected month
- Enforces `maxDate` constraint by disabling/capping options
- Auto-adjusts day when switching to a month with fewer days

Used in: Settings (Goal Target Date).

### NudgeLogo

**File:** `components/NudgeLogo.tsx`

A simple component that renders the app's logo image:

```tsx
<img src="/nudge_logo.png" alt="Nudge Logo" className={className} />
```

Accepts an optional `className` prop for sizing.

---

## Services

### Database Service (db.ts)

See [Data Persistence](#data-persistence) above.

### Biometric Service (biometric.ts)

**File:** `services/biometric.ts`

Wraps the `capacitor-native-biometric` plugin with two functions:

| Function | Purpose |
|---|---|
| `checkBiometricAvailability()` | Returns `{ isAvailable, biometryType, reason? }`. Catches errors and returns `isAvailable: false` gracefully. |
| `authenticateWithBiometric()` | Triggers the native biometric prompt with title "Unlock Nudge" and subtitle "Use your fingerprint to unlock". Returns `true` on success, `false` on failure. |

Both functions are safe to call on web (they catch errors from the missing native plugin).

---

## Hooks

### useHaptics

**File:** `hooks/useHaptics.ts`

A custom hook that wraps `@capacitor/haptics` with web-safe wrappers:

```typescript
const haptics = useHaptics();
haptics.light();    // ImpactStyle.Light
haptics.medium();   // ImpactStyle.Medium
haptics.heavy();    // ImpactStyle.Heavy
haptics.success();  // NotificationType.Success
haptics.warning();  // NotificationType.Warning
haptics.error();    // NotificationType.Error
```

Each method catches and silently ignores errors (no haptics engine on web).

**Used in**: `Budget.tsx` (assignment changes, overspent/funded transitions), `Transactions.tsx` (save confirmation, overbudget warning).

---

## Utilities

### Category Emojis

**File:** `utils/categoryEmojis.ts`

Three exports:

#### `getDefaultEmoji(categoryName: string): string`

Matches a category name against an `emojiMappings` array of keyword-to-emoji rules. Uses three matching strategies in priority order:
1. Exact multi-word phrase match (e.g., "credit card")
2. Exact word match (splitting on spaces, hyphens, underscores)
3. Partial match for keywords longer than 3 characters (avoids "fun" matching "fund")

Falls back to the clipboard emoji if no match is found.

#### `getCategoryDisplayEmoji(categoryName, customEmoji?): string`

Returns the custom emoji if set, otherwise delegates to `getDefaultEmoji`.

#### `categoryEmojis: string[]`

A curated array of 65 emojis organized by:
- Needs/Essentials (house, utilities, transport, health, groceries)
- Wants/Lifestyle (entertainment, food, fashion, fitness, travel)
- Savings & Finance (money, banking, investments, education, gifts)

Used in the Budget emoji picker modal for manual selection.

---

## Configuration Files

### vite.config.ts

- Dev server on port 3000, host `0.0.0.0`
- React plugin with `babel-plugin-react-compiler` for automatic memoization
- `process.env.GEMINI_API_KEY` injected from `.env` via `loadEnv`
- Path alias `@` maps to project root
- Production code splitting: vendor-react, vendor-charts (recharts), vendor-icons (lucide-react)

### capacitor.config.ts

```typescript
{
  appId: 'com.nudge.app',
  appName: 'Nudge',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  plugins: {
    StatusBar: { style: 'DARK', overlaysWebView: true, backgroundColor: '#00000000' },
    SplashScreen: {
      launchShowDuration: 0, launchAutoHide: true,
      backgroundColor: '#fffdf5',
      splashFullScreen: true, splashImmersive: true
    },
    Keyboard: { resize: 'body', resizeOnFullScreen: true }
  },
  android: { allowMixedContent: true, webContentsDebuggingEnabled: false }
}
```

### package.json

**Name:** `nudge`
**Scripts:** `dev` (vite), `build` (vite build), `preview` (vite preview)

---

## Build and Development

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Production build (output: dist/)
npm run build

# Preview production build
npm run preview
```

For Android development via Capacitor:

```bash
# Sync web assets to native project
npx cap sync

# Open in Android Studio
npx cap open android
```

---

## Key Features Deep Dive

### Envelope Budgeting

The core financial model. Users assign money from their "Ready to Assign" pool into category envelopes. The key formula:

```
Ready to Assign = Lifetime Income - Total Assignments (all months)
Category Available = Cumulative Assignments + Cumulative Activity (all months up to current)
```

Money rolls forward between months. If a category has leftover money, it stays in that envelope for next month. If a category is overspent, the negative balance carries forward.

### Privacy Mode

Two privacy controls work together:
- **Privacy Blur** (`privacyMode`): Immediately applies `blur-[6px]` or `blur-[8px]` CSS to all money amounts across Dashboard, Budget, and Transaction views
- **Blur at Startup** (`blurAtStartup`): A `useEffect` in `App.tsx` auto-enables `privacyMode` on every app launch, so the user must manually disable it each session

### Habit Nudge (Vice Tax)

A behavior-change feature:
1. User marks a category as "Vice" in the Budget view (requires a goal to be set)
2. User sets a Habit Nudge Rate in Settings (1-100%, default 10%)
3. When an expense transaction is added to a Vice category, the app automatically moves `amount * rate%` to the goal category
4. An alert notifies the user of the transfer amount

### Pause Nudge (Love Score Warning)

A mindful spending feature:
1. Every expense transaction can be rated with a "Love Score" (1-10)
2. When adding a new transaction, the app looks up past transactions for the same payee
3. If the average Love Score for that payee is 3 or below, a warning message appears
4. The warning is informational -- the user can still proceed

### Payday Ritual

An allocation workflow:
1. Triggered automatically after logging income
2. Shows all categories organized by group
3. User enters allocation amounts for each category
4. Real-time tracking of remaining vs allocated amounts
5. Quick-fill button to dump remaining balance into a category
6. On confirm, increments each category's current month assignment

### Recurring Transactions

Automated bill management:
1. User creates a recurring rule (payee, amount, category, frequency, day)
2. On app load and month change, the engine generates transactions for all due dates
3. Supports weekly, biweekly, monthly, and yearly frequencies
4. Handles month-end clamping (e.g., Feb with day 31 becomes Feb 28)
5. Catches up on missed periods (if app wasn't opened for a while)

### Deep Link / Widget Integration

The app handles URL-based actions for Android widget support:
- `?action=add-expense` -- Opens the Transaction modal pre-set to expense mode
- `?action=add-income` -- Opens the Transaction modal pre-set to income mode
- `?action=view-budget` -- Navigates to the Budget view
- `skipLockForWidget` setting allows bypassing PIN for widget-initiated actions

### Theming System

Four customization axes:
1. **Accent Color** (7 options): Applied globally through `ThemeClasses`
2. **Font** (6 options): Applied via CSS class on the app container
3. **Paper Texture** (4 options): CSS background patterns on the app container
4. **Dark Mode**: Toggles TailwindCSS `dark:` variant classes, updates meta theme-color, and calls Capacitor StatusBar API

### Notification System

Simple time-based notifications generated on app boot:
- **Month Start Reminder** (1st of each month): "It's the 1st of the month! Time to plan your budget."
- **Yearly Summary** (January 1st): "Happy New Year! Check out your financial summary for last year."

Notifications are stored in the database and have `read` states.
