
// Domain Types

export interface CategoryGroup {
  id: string;
  name: string;
}

export interface BudgetCategory {
  id: string;
  groupId: string;
  name: string;
  emoji?: string; // Custom emoji icon for the category
  // assignments: Key is "YYYY-MM", Value is amount
  assignments: Record<string, number>;
  // Calculated fields (not stored)
  activity: number; // Activity for the CURRENT selected month
  available: number; // Cumulative available balance up to end of current month
  assignedCurrent: number; // Assigned amount for the CURRENT selected month
  isVice?: boolean; // If true, spending here triggers "Vice Tax" to goal
}

export interface Transaction {
  id: string;
  sentimentScore?: number; // 1-10
  isEssential?: boolean;
  date: string; // ISO Date YYYY-MM-DD
  payee: string;
  categoryId: string;
  amount: number; // Negative for outflow, Positive for inflow
  memo?: string;
  cleared: boolean;
  isRecurring?: boolean; // Flag for auto-generated recurring transactions
  recurringId?: string; // Link to parent recurring rule
}

export type RecurrenceFrequency = 'monthly' | 'weekly' | 'biweekly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  payee: string;
  categoryId: string;
  amount: number;
  memo?: string;
  frequency: RecurrenceFrequency;
  // For 'monthly' and 'yearly': day of month (1-31, will auto-adjust for shorter months)
  // For 'weekly' and 'biweekly': day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  dayOfMonth: number;
  monthOfYear?: number; // 0-11 for Yearly frequency
  isActive: boolean;
  nextDueDate: string; // YYYY-MM-DD
  lastGeneratedDate?: string; // YYYY-MM-DD - last time we created a transaction
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  read?: boolean;
}

export type PaperType = 'dots' | 'lines' | 'grid' | 'plain';
export type FontType = 'hand' | 'legible' | 'sans' | 'serif' | 'casual' | 'cursive';
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan' | 'pink';
export type DateFormatType = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type WeekStartType = 'sunday' | 'monday';
export type AnimationSpeedType = 'none' | 'reduced' | 'normal';

export interface UserProfile {
  name: string;
  currency: string; // Symbol (e.g. $)
  currencyCode: string; // ISO Code (e.g. USD)
  isOnboarded: boolean;
  startingBalance: number;

  // Goal Oriented Fields
  financialGoal: string; // Name of the goal
  goalTarget: number;    // Target amount
  goalDate: string;      // YYYY-MM-DD
  goalCategoryId: string; // ID of the budget category tracking this

  // Customization
  theme?: {
    paper: PaperType;
    font: FontType;
    accentColor: AccentColor;
    darkMode?: boolean;
  };
  pin?: string; // encrypted or simple pin
  biometricEnabled?: boolean; // Enable fingerprint/face unlock
  skipLockForWidget?: boolean; // Skip lock screen for widget quick-add

  // Preferences
  preferences?: {
    dateFormat: DateFormatType;
    weekStart: WeekStartType;
    showDecimals: boolean;
    compactMode: boolean;
    animationSpeed: AnimationSpeedType;
    showRunningBalance: boolean;
    confirmBeforeDelete: boolean;
    autoBackupReminder: boolean;
    privacyMode?: boolean;
    blurAtStartup?: boolean;
    viceTaxPercentage?: number; // Default 10%
    enableAnimations?: boolean;
  };

  // Payday
  nextPayday?: string; // YYYY-MM-DD
}

export interface UserStats {
  streakDays: number;
  lastLoginDate: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface ThemeClasses {
  primaryBg: string;    // Main button backgrounds
  primaryText: string;  // Main text highlights
  border: string;       // Borders
  lightBg: string;      // Subtle backgrounds
  hoverBg: string;      // Hover states
  hex: string;          // Hex code for charts
}

export interface FinancialContext {
  groups: CategoryGroup[];
  categories: BudgetCategory[];
  transactions: Transaction[];
  currentMonth: string; // YYYY-MM
  totalBudgeted: number;
  totalActivity: number;
  totalAvailable: number;
  readyToAssign: number;
  userStats: UserStats;
  userProfile: UserProfile;
  notifications: Notification[];

  // Goal Calculated Context
  goalProgress: number; // Current amount saved
  goalPercentage: number; // 0-100
  daysToGoal: number;

  // Visual Theme Context
  themeClasses: ThemeClasses;
}

export const READY_TO_ASSIGN_ID = 'ready_to_assign';

// Navigation Types
export enum View {
  DASHBOARD = 'DASHBOARD',
  BUDGET = 'BUDGET',
  TRANSACTIONS = 'TRANSACTIONS',
  SETTINGS = 'SETTINGS'
}
