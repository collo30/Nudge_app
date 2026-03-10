import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LayoutDashboard, Wallet, ArrowRightLeft, Settings as SettingsIcon, Lock, Fingerprint, WifiOff } from 'lucide-react';
import NudgeLogo from './components/NudgeLogo';
import { View, Transaction, BudgetCategory, FinancialContext, READY_TO_ASSIGN_ID, UserStats, UserProfile, Notification, ThemeClasses, AccentColor, RecurringTransaction, CategoryGroup } from './types';
import { loadDB, saveDB, clearDB } from './services/db';
import { authenticateWithBiometric } from './services/biometric';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

import Dashboard from './components/Dashboard';
import Budget from './components/Budget';
import Transactions from './components/Transactions';
import Settings from './components/Settings';

// Generate unique IDs using crypto
const generateId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  // Fallback for older browsers
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Utils
const getMonthString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

// Color Definitions
const THEME_COLORS: Record<AccentColor, ThemeClasses> = {
  indigo: {
    primaryBg: 'bg-indigo-600',
    primaryText: 'text-indigo-700',
    border: 'border-indigo-600',
    lightBg: 'bg-indigo-50',
    hoverBg: 'hover:bg-indigo-700',
    hex: '#4f46e5'
  },
  emerald: {
    primaryBg: 'bg-emerald-600',
    primaryText: 'text-emerald-700',
    border: 'border-emerald-600',
    lightBg: 'bg-emerald-50',
    hoverBg: 'hover:bg-emerald-700',
    hex: '#059669'
  },
  rose: {
    primaryBg: 'bg-rose-500',
    primaryText: 'text-rose-600',
    border: 'border-rose-500',
    lightBg: 'bg-rose-50',
    hoverBg: 'hover:bg-rose-600',
    hex: '#f43f5e'
  },
  amber: {
    primaryBg: 'bg-amber-500',
    primaryText: 'text-amber-700',
    border: 'border-amber-500',
    lightBg: 'bg-amber-50',
    hoverBg: 'hover:bg-amber-600',
    hex: '#f59e0b'
  },
  violet: {
    primaryBg: 'bg-violet-600',
    primaryText: 'text-violet-700',
    border: 'border-violet-600',
    lightBg: 'bg-violet-50',
    hoverBg: 'hover:bg-violet-700',
    hex: '#7c3aed'
  },
  cyan: {
    primaryBg: 'bg-cyan-600',
    primaryText: 'text-cyan-700',
    border: 'border-cyan-600',
    lightBg: 'bg-cyan-50',
    hoverBg: 'hover:bg-cyan-700',
    hex: '#0891b2'
  },
  pink: {
    primaryBg: 'bg-pink-500',
    primaryText: 'text-pink-600',
    border: 'border-pink-500',
    lightBg: 'bg-pink-50',
    hoverBg: 'hover:bg-pink-600',
    hex: '#ec4899'
  }
};

// Default Groups Structure aligned with 50/30/20 Rule
const DEFAULT_GROUPS = [
  { id: 'needs', name: 'Needs (Bills & Living)' },
  { id: 'savings', name: 'Savings & Debt' },
  { id: 'wants', name: 'Wants (Fun & Lifestyle)' }
];

const INITIAL_CATEGORIES_TEMPLATE = [
  // Needs (50%)
  { groupId: 'needs', name: 'Rent/Mortgage', emoji: '🏠' },
  { groupId: 'needs', name: 'Groceries', emoji: '🛒' },
  { groupId: 'needs', name: 'Utilities (Elec/Water)', emoji: '⚡' },
  { groupId: 'needs', name: 'Internet & Phone', emoji: '📱' },
  { groupId: 'needs', name: 'Transportation', emoji: '🚗' },
  { groupId: 'needs', name: 'Medical & Insurance', emoji: '🏥' },

  // Savings & Debt (20%)
  { groupId: 'savings', name: 'Emergency Fund', emoji: '☂️' },
  { groupId: 'savings', name: 'Investments', emoji: '📈' },
  { groupId: 'savings', name: 'Debt Repayment', emoji: '💳' },

  // Wants (30%)
  { groupId: 'wants', name: 'Dining Out', emoji: '🍽️' },
  { groupId: 'wants', name: 'Entertainment', emoji: '🎉' },
  { groupId: 'wants', name: 'Shopping', emoji: '🛍️' },
  { groupId: 'wants', name: 'Subscriptions', emoji: '📺' },
  { groupId: 'wants', name: 'Vacation Fund', emoji: '✈️' }
];

const INITIAL_STATS: UserStats = {
  streakDays: 1,
  lastLoginDate: new Date().toISOString().split('T')[0]
};

const INITIAL_PROFILE: UserProfile = {
  name: '',
  currency: '$',
  currencyCode: 'USD',
  isOnboarded: false,
  startingBalance: 0,
  financialGoal: '',
  goalTarget: 0,
  goalDate: '',
  goalCategoryId: '',
  theme: {
    paper: 'dots',
    font: 'legible',
    accentColor: 'amber'
  }
};

const App = () => {
  // Load Database on init
  const initialDB = useMemo(() => loadDB(), []);

  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Initialize State from DB or Defaults
  const [groups, setGroups] = useState<CategoryGroup[]>(initialDB?.groups || []);
  const [categories, setCategories] = useState<BudgetCategory[]>(initialDB?.categories || []);
  const [transactions, setTransactions] = useState<Transaction[]>(initialDB?.transactions || []);
  const [userStats, setUserStats] = useState<UserStats>(initialDB?.userStats || INITIAL_STATS);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialDB?.userProfile || INITIAL_PROFILE);
  const [notifications, setNotifications] = useState<Notification[]>(initialDB?.notifications || []);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(initialDB?.recurringTransactions || []);
  const [isLocked, setIsLocked] = useState(!!initialDB?.userProfile?.pin);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);



  // Auto-Blur at Startup
  useEffect(() => {
    if (userProfile.preferences?.blurAtStartup) {
      setUserProfile(prev => ({
        ...prev,
        preferences: { ...(prev.preferences || {} as any), privacyMode: true }
      }));
    }
  }, []);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Offline Status
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);





  // Apply Dark Mode & Theme Color
  useEffect(() => {
    const isDark = userProfile.theme?.darkMode;
    const root = document.documentElement;

    // Find ALL theme-color meta tags to ensure we override media queries
    const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');

    const updateStatusBar = async () => {
      try {
        if (isDark) {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
          metaThemeColors.forEach(meta => meta.setAttribute('content', '#0f172a'));

          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
          await StatusBar.setOverlaysWebView({ overlay: true });
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
          metaThemeColors.forEach(meta => meta.setAttribute('content', '#fffdf5'));

          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
          await StatusBar.setOverlaysWebView({ overlay: true });
        }
      } catch (e) {
        console.log('StatusBar plugin not available or failed', e);
      }
    };

    updateStatusBar();
  }, [userProfile.theme?.darkMode]);

  // Set status bar color for lock screen (to avoid cream bar)
  useEffect(() => {
    if (isLocked) {
      const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');
      metaThemeColors.forEach(meta => meta.setAttribute('content', '#0f172a'));
    }
  }, [isLocked]);

  // Widget/Quick Add State
  const [quickAddType, setQuickAddType] = useState<'expense' | 'income' | null>(null);

  // Handle Deep Links (Widget & Shortcuts)
  const handleUrl = (url: string) => {
    try {
      const u = new URL(url);
      let action = u.searchParams.get('action');

      if (!action && url.includes('add-expense')) action = 'add-expense';
      if (!action && url.includes('add-income')) action = 'add-income';

      if (action === 'add-expense' || action === 'add-transaction') {
        setActiveView(View.TRANSACTIONS);
        setQuickAddType('expense');
      } else if (action === 'add-income') {
        setActiveView(View.TRANSACTIONS);
        setQuickAddType('income');
      } else if (action === 'view-budget') {
        setActiveView(View.BUDGET);
      }
    } catch (e) { console.error(e); }
  };

  // Initialization & Notifications
  useEffect(() => {
    // 1. Handle URL and check for widget action
    let isWidgetAction = false;
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      isWidgetAction = params.get('action')?.includes('add-') || false;
      handleUrl(window.location.href);
      window.history.replaceState({}, '', window.location.pathname);
    }
    CapacitorApp.addListener('appUrlOpen', (data) => handleUrl(data.url));
    CapacitorApp.getLaunchUrl().then(l => { if (l?.url) handleUrl(l.url); });

    // 2. Check Lock - Skip for widget if enabled
    if (userProfile.pin) {
      // Skip lock screen for widget quick-add if user enabled it
      if (isWidgetAction && userProfile.skipLockForWidget) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    }

    // 3. Notifications Logic
    const today = new Date();
    const day = today.getDate();
    const monthIndex = today.getMonth();

    setNotifications(prev => {
      const newNotes = [...prev];

      // Month Start Reminder
      if (day === 1) {
        const id = `budget-remind-${today.getFullYear()}-${monthIndex}`;
        if (!newNotes.find(n => n.id === id)) {
          newNotes.push({
            id,
            date: today.toISOString().split('T')[0],
            message: "It's the 1st of the month! Time to plan your budget.",
            read: false,
            type: 'info'
          });
        }
      }

      // Yearly Summary (Jan 1st)
      if (day === 1 && monthIndex === 0) {
        const id = `year-summary-${today.getFullYear()}`;
        if (!newNotes.find(n => n.id === id)) {
          newNotes.push({
            id,
            date: today.toISOString().split('T')[0],
            message: "Happy New Year! Check out your financial summary for last year.",
            read: false,
            type: 'success'
          });
        }
      }
      return newNotes;
    });

    // 4. App Ready
    setIsLoading(false);

  }, []); // Run once on mount

  const handleUnlock = () => {
    if (pinInput === userProfile.pin) {
      setIsLocked(false);
      setPinError(false);
      // If a quick add action was pending, trigger it after unlock
      if (quickAddType) {
        setActiveView(View.TRANSACTIONS); // Ensure we are on transactions view
      }
    } else {
      setPinError(true);
      setPinInput('');
      setTimeout(() => setPinError(false), 300);
    }
  };

  // Native Biometric Authentication (Android Fingerprint/Face)
  const handleBiometricUnlock = async () => {
    if (!userProfile.biometricEnabled) return;

    try {
      const success = await authenticateWithBiometric();

      if (success) {
        setIsLocked(false);
        setPinError(false);
        if (quickAddType) {
          setActiveView(View.TRANSACTIONS);
        }
      }
    } catch (error) {
      console.log('Biometric auth failed:', error);
      // Silently fail - user can use PIN
    }
  };

  // Auto-trigger biometric on load if enabled
  useEffect(() => {
    if (isLocked && userProfile.biometricEnabled && userProfile.pin) {
      const timer = setTimeout(() => {
        handleBiometricUnlock();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLocked, userProfile.biometricEnabled]);

  // Time State
  const [currentMonth, setCurrentMonth] = useState<string>(getMonthString(new Date()));



  // Persistence Effect: Save to DB whenever state changes
  useEffect(() => {
    saveDB({
      groups,
      categories,
      transactions,
      userStats,
      userProfile,
      notifications,
      recurringTransactions
    });
  }, [groups, categories, transactions, userStats, userProfile, notifications, recurringTransactions]);

  // Recurring Transactions: Auto-generate pending transactions on app load and month change
  useEffect(() => {
    if (!userProfile.isOnboarded || recurringTransactions.length === 0) return;

    // Use absolute today (local midnight) but convert to UTC for consistent comparison with DB dates
    const now = new Date();
    // Create a date that represents midnight of local date in UTC
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const newTransactions: Transaction[] = [];

    // Helper: Calculate next due date using pure UTC to avoid timezone shifts
    const calculateNextDue = (currentDue: Date, frequency: string, originalDay: number): Date => {
      const newNextDue = new Date(currentDue);

      switch (frequency) {
        case 'weekly':
          newNextDue.setUTCDate(newNextDue.getUTCDate() + 7);
          break;
        case 'biweekly':
          newNextDue.setUTCDate(newNextDue.getUTCDate() + 14);
          break;
        case 'monthly': {
          const currentMonth = newNextDue.getUTCMonth();
          const nextMonth = currentMonth + 1;
          const nextYear = newNextDue.getUTCFullYear() + (nextMonth > 11 ? 1 : 0);
          const actualNextMonth = nextMonth % 12;

          // Set to 1st of next month UTC first to avoid overflow
          newNextDue.setUTCFullYear(nextYear);
          newNextDue.setUTCMonth(actualNextMonth);
          newNextDue.setUTCDate(1);

          // Get last day of the target month in UTC
          const lastDayOfNextMonth = new Date(Date.UTC(nextYear, actualNextMonth + 1, 0)).getUTCDate();
          const targetDay = Math.min(originalDay, lastDayOfNextMonth);

          newNextDue.setUTCDate(targetDay);
          break;
        }
        case 'yearly': {
          const nextYear = newNextDue.getUTCFullYear() + 1;
          const month = newNextDue.getUTCMonth();

          newNextDue.setUTCFullYear(nextYear);
          newNextDue.setUTCDate(1);

          const lastDayOfMonth = new Date(Date.UTC(nextYear, month + 1, 0)).getUTCDate();
          const targetDay = Math.min(originalDay, lastDayOfMonth);

          newNextDue.setUTCDate(targetDay);
          break;
        }
      }

      return newNextDue;
    };

    const updatedRecurring = recurringTransactions.map(rt => {
      if (!rt.isActive) return rt;

      // Parse nextDueDate as UTC midnight (standard YYYY-MM-DD parsing)
      let nextDue = new Date(rt.nextDueDate);
      let lastGenerated = rt.lastGeneratedDate;

      // Generate transactions for all past due dates
      while (nextDue <= today) {
        const nextDueStr = nextDue.toISOString().split('T')[0];

        // Prevent duplicate generation for same day (double safety)
        if (lastGenerated === nextDueStr) {
          // If we somehow got stuck, force move to next period
          const forcedNext = calculateNextDue(nextDue, rt.frequency, rt.dayOfMonth);
          if (forcedNext <= nextDue) break; // Infinite loop protection
          nextDue = forcedNext;
          continue;
        }

        // Generate the transaction for this due date
        const txn: Transaction = {
          id: generateId('txn-rec'),
          date: nextDueStr,
          payee: rt.payee,
          categoryId: rt.categoryId,
          amount: rt.amount,
          memo: rt.memo ? `${rt.memo} (recurring)` : '(recurring)',
          cleared: false,
          isRecurring: true,
          recurringId: rt.id
        };
        newTransactions.push(txn);
        lastGenerated = nextDueStr;

        // Calculate the next due date
        nextDue = calculateNextDue(nextDue, rt.frequency, rt.dayOfMonth);
      }

      // Only return updated if we actually generated transactions
      if (lastGenerated !== rt.lastGeneratedDate) {
        return {
          ...rt,
          nextDueDate: nextDue.toISOString().split('T')[0],
          lastGeneratedDate: lastGenerated
        };
      }

      return rt;
    });

    if (newTransactions.length > 0) {
      setTransactions(prev => [...newTransactions, ...prev]);
      setRecurringTransactions(updatedRecurring);
    }
  }, [userProfile.isOnboarded, currentMonth]);

  // Initialize data based on profile currency when onboarding finishes
  useEffect(() => {
    if (userProfile.isOnboarded && categories.length === 0) {

      setGroups(DEFAULT_GROUPS);

      let catsToCreate = [...INITIAL_CATEGORIES_TEMPLATE];
      let goalCatId = '';

      // Add a specific category for the user's goal
      if (userProfile.financialGoal) {
        // Optimization: Deduplicate goal from template
        const normalizedGoal = userProfile.financialGoal.toLowerCase();
        catsToCreate = catsToCreate.filter(c => !normalizedGoal.includes(c.name.toLowerCase()));

        const goalName = userProfile.financialGoal.length > 20 ? 'Goal Fund' : userProfile.financialGoal;
        goalCatId = generateId('cat-goal');
      }

      const newCats: BudgetCategory[] = catsToCreate.map((c, idx) => ({
        id: generateId('cat'),
        groupId: c.groupId,
        name: c.name,
        assignments: {},
        activity: 0,
        available: 0,
        assignedCurrent: 0
      }));

      // Append goal category if exists
      if (userProfile.financialGoal) {
        newCats.push({
          id: goalCatId,
          groupId: 'savings',
          name: `Goal: ${userProfile.financialGoal}`,
          assignments: {},
          activity: 0,
          available: 0,
          assignedCurrent: 0
        });
        setUserProfile(prev => ({ ...prev, goalCategoryId: goalCatId }));
      }

      setCategories(newCats);
    }
  }, [userProfile.isOnboarded, categories.length]);

  // Clean up any test data from previous versions
  useEffect(() => {
    setTransactions(prev => {
      if (prev.some(t => t.payee.startsWith('[TEST]'))) {
        return prev.filter(t => !t.payee.startsWith('[TEST]'));
      }
      return prev;
    });
  }, []);

  // Performance Optimization: Pre-calculate transaction maps
  const { transactionsByCat, incomeTxns } = useMemo(() => {
    const byCat = new Map<string, Transaction[]>();
    const income: Transaction[] = [];

    transactions.forEach(t => {
      if (t.categoryId === READY_TO_ASSIGN_ID) {
        income.push(t);
      } else {
        if (!byCat.has(t.categoryId)) byCat.set(t.categoryId, []);
        byCat.get(t.categoryId)!.push(t);
      }
    });

    return { transactionsByCat: byCat, incomeTxns: income };
  }, [transactions]);

  // Main Financial Logic
  const financialContext: FinancialContext = useMemo(() => {
    const calculatedCategories = categories.map(cat => {
      const assignedCurrent = cat.assignments[currentMonth] || 0;

      // Use pre-calculated map for performance
      const catTxns = transactionsByCat.get(cat.id) || [];

      const activityCurrent = catTxns
        .filter(t => t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

      // Cumulative Available: Roll over balances from all previous months
      // This is proper envelope budgeting: leftover money stays in the category
      const cumulativeAssigned = Object.entries(cat.assignments)
        .filter(([month]) => month <= currentMonth)
        .reduce((sum, [_, amount]) => sum + (amount as number), 0);

      const cumulativeActivity = catTxns
        .filter(t => t.date.slice(0, 7) <= currentMonth)
        .reduce((sum, t) => sum + t.amount, 0);

      const available = cumulativeAssigned + cumulativeActivity;

      return {
        ...cat,
        assignedCurrent,
        activity: activityCurrent,
        available
      };
    });

    const lifetimeIncome = incomeTxns
      .filter(t => t.date.slice(0, 7) <= currentMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAssignedEverywhere = calculatedCategories.reduce((sum, cat) => {
      const catLifetimeAssigned = Object.entries(cat.assignments)
        .filter(([month, _]) => month <= currentMonth)
        .reduce((s, [_, a]) => s + (a as number), 0);
      return sum + catLifetimeAssigned;
    }, 0);

    // RTA Logic: Income (Transactions including Start Balance) - All Assignments
    const readyToAssign = lifetimeIncome - totalAssignedEverywhere;

    const totalBudgeted = calculatedCategories.reduce((sum, c) => sum + c.assignedCurrent, 0);
    const totalActivity = calculatedCategories.reduce((sum, c) => sum + c.activity, 0);
    const totalAvailable = calculatedCategories.reduce((sum, c) => sum + c.available, 0);

    let goalProgress = 0;
    let goalPercentage = 0;
    let daysToGoal = 0;

    if (userProfile.goalCategoryId) {
      const goalCat = calculatedCategories.find(c => c.id === userProfile.goalCategoryId);
      if (goalCat) {
        // Goal progress is based on TOTAL lifetime assignments to the goal category
        // (not just current month's available balance)
        const lifetimeGoalAssigned: number = Object.values(goalCat.assignments || {})
          .reduce<number>((sum, a) => sum + (a as number), 0);
        goalProgress = lifetimeGoalAssigned;
        if (userProfile.goalTarget > 0) {
          goalPercentage = Math.min(100, Math.max(0, (goalProgress / userProfile.goalTarget) * 100));
        }
      }
    }

    if (userProfile.goalDate) {
      const targetDate = new Date(userProfile.goalDate);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      daysToGoal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      groups,
      categories: calculatedCategories,
      transactions,
      currentMonth,
      totalBudgeted,
      totalActivity,
      totalAvailable,
      readyToAssign,
      userStats,
      userProfile,
      notifications,
      goalProgress,
      goalPercentage,
      daysToGoal,
      themeClasses: THEME_COLORS[userProfile.theme?.accentColor || 'amber']
    };
  }, [groups, categories, transactionsByCat, incomeTxns, userStats, userProfile, currentMonth, notifications]);

  const { themeClasses } = financialContext;

  // Actions
  const handleOnboardingComplete = (profileData: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profileData, isOnboarded: true }));
    setShowWalkthrough(true);
    setActiveView(View.BUDGET);

    // Create starting balance transaction so it appears in list and counts as income
    if (profileData.startingBalance && profileData.startingBalance > 0) {
      const startTxn: Transaction = {
        id: generateId('txn-start'),
        date: new Date().toISOString().split('T')[0],
        payee: 'Starting Balance',
        categoryId: READY_TO_ASSIGN_ID,
        amount: Number(profileData.startingBalance),
        cleared: true
      };
      setTransactions(prev => [startTxn, ...prev]);
    }
  };

  const handleUpdateCategory = (id: string, updates: Partial<BudgetCategory>) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newCat = { ...c, ...updates };
      if (updates.assignedCurrent !== undefined) {
        newCat.assignments = {
          ...c.assignments,
          [currentMonth]: updates.assignedCurrent
        };
      }
      return newCat;
    }));
  };

  // Validate Transaction Date
  const isFutureDate = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day);

    return inputDate > today;
  };

  const validateTransaction = (t: Omit<Transaction, 'id'>): boolean => {
    if (isFutureDate(t.date)) {
      alert("We can't predict the future! Please enter a date today or earlier.");
      return false;
    }
    return true;
  };

  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    if (!validateTransaction(t)) return;
    const newTxn = { ...t, id: generateId('txn') };
    setTransactions(prev => [newTxn, ...prev]);

    // Vice Tax Logic
    if (t.amount < 0 && t.categoryId) {
      const category = categories.find(c => c.id === t.categoryId);
      if (category?.isVice && userProfile.goalCategoryId) {
        const taxRate = userProfile.preferences?.viceTaxPercentage || 10; // Default 10%
        const taxAmount = Math.abs(t.amount) * (taxRate / 100);

        if (taxAmount > 0) {
          // Move money from RTA to Goal Category by increasing Goal Category's assignment
          // We don't need to 'deduct' from RTA explicitly; assigning money naturally reduces RTA.

          setCategories(prev => prev.map(c => {
            if (c.id === userProfile.goalCategoryId) {
              const currentAssigned = c.assignments[currentMonth] || 0;
              return {
                ...c,
                assignments: {
                  ...c.assignments,
                  [currentMonth]: currentAssigned + taxAmount
                }
              };
            }
            return c;
          }));

          // Notify User
          alert(`Habit Nudge Applied!\nWe moved ${userProfile.currency}${taxAmount.toFixed(2)} to your Goal.`);
        }
      }
    }
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    // If date is being updated, validate it
    if (updates.date) {
      if (isFutureDate(updates.date)) {
        alert("We can't predict the future! Please enter a date today or earlier.");
        return;
      }
    }
    setTransactions(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };



  const handleAddCategory = (groupId: string, name: string) => {
    const newCat: BudgetCategory = {
      id: generateId('cat'),
      groupId,
      name,
      assignments: {},
      activity: 0,
      available: 0,
      assignedCurrent: 0
    };
    setCategories(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = (id: string) => {
    // If deleting the goal category, clear ALL goal-related fields and inform user
    if (id === userProfile.goalCategoryId) {
      setUserProfile(prev => ({
        ...prev,
        goalCategoryId: undefined,
        financialGoal: '',
        goalTarget: 0,
        goalDate: ''
      }));
      alert('Goal category deleted. Your goal settings have been cleared.');
    }

    // Clean up transactions: Set their category to empty (Uncategorized)
    setTransactions(prev => prev.map(t =>
      t.categoryId === id ? { ...t, categoryId: '' } : t
    ));

    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleToggleVice = (id: string) => {
    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, isVice: !c.isVice } : c
    ));
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    // Check if a goal name is being changed
    if (updates.financialGoal !== undefined && updates.financialGoal !== userProfile.financialGoal) {
      const newGoalName = updates.financialGoal.trim();

      if (newGoalName) {
        // Check if a goal category already exists
        const existingGoalCat = categories.find(c => c.id === userProfile.goalCategoryId);

        if (existingGoalCat) {
          // UPDATE the existing goal category name
          const updatedName = newGoalName.length > 20
            ? 'Goal Fund'
            : `Goal: ${newGoalName}`;

          setCategories(prev => prev.map(c =>
            c.id === userProfile.goalCategoryId
              ? { ...c, name: updatedName }
              : c
          ));
        } else {
          // CREATE a new goal category
          const goalCatId = generateId('cat-goal');
          const goalName = newGoalName.length > 20
            ? 'Goal Fund'
            : `Goal: ${newGoalName}`;

          const newGoalCat: BudgetCategory = {
            id: goalCatId,
            groupId: 'savings', // Put in savings group
            name: goalName,
            assignments: {},
            activity: 0,
            available: 0,
            assignedCurrent: 0
          };

          setCategories(prev => [...prev, newGoalCat]);

          // Also update the goalCategoryId in the profile
          updates.goalCategoryId = goalCatId;
        }
      }
    }

    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const handleMonthChange = (offset: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newDate = new Date(year, month - 1 + offset);
    setCurrentMonth(getMonthString(newDate));
  };

  // Copy Last Month's Budget: replicate previous month's assignments into the current month
  const handleCopyLastMonthBudget = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2); // month is 1-indexed, Date constructor is 0-indexed
    const prevMonth = getMonthString(prevDate);

    setCategories(prev => prev.map(cat => {
      const prevAssignment = cat.assignments[prevMonth];
      const currentAssignment = cat.assignments[currentMonth];

      // Only copy if previous month had an assignment AND current month has none
      if (prevAssignment && prevAssignment > 0 && (!currentAssignment || currentAssignment === 0)) {
        return {
          ...cat,
          assignments: {
            ...cat.assignments,
            [currentMonth]: prevAssignment
          }
        };
      }
      return cat;
    }));
  };

  // Recurring Transaction Handlers
  const handleAddRecurring = (rt: Omit<RecurringTransaction, 'id'>) => {
    const newRt: RecurringTransaction = {
      ...rt,
      id: generateId('rec')
    };
    setRecurringTransactions(prev => [...prev, newRt]);
  };

  const handleUpdateRecurring = (id: string, updates: Partial<RecurringTransaction>) => {
    setRecurringTransactions(prev => prev.map(rt =>
      rt.id === id ? { ...rt, ...updates } : rt
    ));
  };

  const handleDeleteRecurring = (id: string) => {
    setRecurringTransactions(prev => prev.filter(rt => rt.id !== id));
  };



  // Lazy load Onboarding component
  const Onboarding = React.lazy(() => import('./components/Onboarding'));
  const Walkthrough = React.lazy(() => import('./components/Walkthrough'));
  // Navigation items
  const navItems = [
    { view: View.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { view: View.BUDGET, icon: Wallet, label: 'Budget' },
    { view: View.TRANSACTIONS, icon: ArrowRightLeft, label: 'Log' },
    { view: View.SETTINGS, icon: SettingsIcon, label: 'Settings' },
  ];

  const renderSpecificView = (viewToRender: View) => {
    switch (viewToRender) {
      case View.DASHBOARD:
        return <Dashboard context={financialContext} />;
      case View.BUDGET:
        return <Budget
          context={financialContext}
          onUpdateCategory={handleUpdateCategory}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onMonthChange={handleMonthChange}
          onUpdateProfile={handleUpdateProfile}
          onCopyLastMonthBudget={handleCopyLastMonthBudget}
          onToggleVice={handleToggleVice}
        />;
      case View.TRANSACTIONS:
        return <Transactions
          isActive={activeView === View.TRANSACTIONS}
          transactions={transactions}
          categories={financialContext.categories}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onUpdateCategory={handleUpdateCategory}
          onDeleteTransaction={handleDeleteTransaction}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          themeClasses={themeClasses}
          currencySymbol={userProfile.currency}
          quickAddType={quickAddType}
          onClearQuickAdd={() => setQuickAddType(null)}
          readyToAssign={financialContext.readyToAssign}
          recurringTransactions={recurringTransactions}
          onAddRecurring={handleAddRecurring}
          onUpdateRecurring={handleUpdateRecurring}
          onDeleteRecurring={handleDeleteRecurring}
          isPrivacyMode={userProfile.preferences?.privacyMode}
          fontClass={fontClass}
        />;
      case View.SETTINGS:
        return <Settings
          context={financialContext}
          onUpdateProfile={handleUpdateProfile}
          onShowGuide={() => setShowWalkthrough(true)}
          onResetData={() => {
            clearDB();
            setGroups([]);
            setCategories([]);
            setTransactions([]);
            setUserProfile(INITIAL_PROFILE);
            setNotifications([]);
            setUserStats(INITIAL_STATS);
            setRecurringTransactions([]);
            setActiveView(View.BUDGET);
          }}
        />;
      default:
        return <Dashboard context={financialContext} />;
    }
  };

  // Background style based on theme
  const paperClass =
    userProfile.theme?.paper === 'lines' ? 'bg-paper-lines' :
      userProfile.theme?.paper === 'grid' ? 'bg-paper-grid' :
        userProfile.theme?.paper === 'plain' ? 'bg-paper-plain' :
          'bg-paper-dots';

  const fontClass =
    userProfile.theme?.font === 'hand' ? 'font-hand' :
      userProfile.theme?.font === 'sans' ? 'font-sans' :
        userProfile.theme?.font === 'serif' ? 'font-serif' :
          userProfile.theme?.font === 'casual' ? 'font-casual' :
            userProfile.theme?.font === 'cursive' ? 'font-cursive' :
              'font-legible';
  const darkClass = userProfile.theme?.darkMode ? 'dark' : '';









  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#fffdf5] overflow-hidden relative select-none">

        {/* Subtle dot-grid paper texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #d1c9a8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5
        }} />

        {/* Warm vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(210,195,160,0.25) 100%)'
        }} />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-6 animate-splash-in">

          {/* Logo — plain, no dark card */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-amber-300/30 blur-2xl scale-110" />
            <div className="relative w-24 h-24 rounded-2xl bg-white/80 shadow-xl border border-amber-100 flex items-center justify-center p-2">
              <NudgeLogo className="w-full h-full drop-shadow-sm" />
            </div>
          </div>

          {/* App name — handwritten style */}
          <div className="text-center">
            <h1 className="font-hand text-4xl font-bold text-slate-800 tracking-tight leading-none">
              Nudge
            </h1>
            <p className="mt-1.5 text-slate-400 text-sm font-medium tracking-wide">
              A nudge to financial independence
            </p>
          </div>

          {/* Minimal loading bar */}
          <div className="w-32 h-0.5 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-amber-400 rounded-full animate-loading-bar" />
          </div>
        </div>

        <style>{`
          @keyframes splash-in {
            0%   { opacity: 0; transform: translateY(16px) scale(0.97); }
            100% { opacity: 1; transform: translateY(0)   scale(1); }
          }
          .animate-splash-in {
            animation: splash-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          @keyframes loading-bar {
            0%   { width: 0%;   margin-left: 0; }
            50%  { width: 60%;  margin-left: 0; }
            100% { width: 0%;   margin-left: 100%; }
          }
          .animate-loading-bar {
            animation: loading-bar 1.4s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Handle keypad input
  const handleKeypadPress = (digit: string) => {
    if (digit === 'backspace') {
      setPinInput(prev => prev.slice(0, -1));
      return;
    }
    if (pinInput.length >= 4) return;

    const newPin = pinInput + digit;
    setPinInput(newPin);

    // Auto-submit when 4 digits
    if (newPin.length === 4) {
      setTimeout(() => {
        if (newPin === userProfile.pin) {
          setIsLocked(false);
          setPinInput('');
          setPinError(false);
          setShowKeypad(false);
        } else {
          setPinError(true);
          setPinInput('');
          setTimeout(() => setPinError(false), 400);
        }
      }, 100);
    }
  };

  const isDarkMode = userProfile.theme?.darkMode;

  if (isLocked) {
    return (
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center p-6 overflow-hidden ${isDarkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-b from-slate-100 via-white to-slate-100'
          }`}
        onClick={() => setShowKeypad(true)}
      >
        {/* Decorative background pattern */}
        <div className={`absolute inset-0 opacity-10 pointer-events-none`} style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? '#94a3b8' : '#64748b'} 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>

        {/* Decorative corner flourishes */}
        <div className={`absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 rounded-tl-lg opacity-50 ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}></div>
        <div className={`absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 rounded-tr-lg opacity-50 ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}></div>
        <div className={`absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 rounded-bl-lg opacity-50 ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}></div>
        <div className={`absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 rounded-br-lg opacity-50 ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}></div>

        {/* Main Content Wrapper - Shifts up when keypad is shown */}
        <div className={`flex flex-col items-center z-10 transition-transform duration-300 ${showKeypad ? '-translate-y-32 scale-90' : ''}`}>
          {/* Lock Icon */}
          <div className="relative mb-8">
            <div className={`p-6 rounded-2xl shadow-xl border-2 ${isDarkMode
              ? 'bg-slate-800 border-slate-600'
              : 'bg-white border-slate-200 shadow-hard'
              }`}>
              <Lock className={`w-12 h-12 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h2>
          <p className={`font-bold text-sm mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter your 4-digit PIN to unlock</p>

          {/* 4 Box PIN Input */}
          <div
            className={`flex gap-4 mb-6 ${pinError ? 'animate-shake' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowKeypad(true); }}
          >
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-all shadow-lg ${pinError
                  ? isDarkMode
                    ? 'border-rose-500 bg-rose-900/30'
                    : 'border-rose-500 bg-rose-100'
                  : pinInput.length > i
                    ? isDarkMode
                      ? 'border-emerald-500 bg-emerald-900/30 shadow-emerald-900/20'
                      : 'border-emerald-500 bg-emerald-100 shadow-emerald-200'
                    : isDarkMode
                      ? 'border-slate-600 bg-slate-800'
                      : 'border-slate-300 bg-white'
                  }`}
              >
                <span className={
                  pinInput.length > i
                    ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    : isDarkMode ? 'text-slate-600' : 'text-slate-300'
                }>
                  {pinInput.length > i ? '●' : '○'}
                </span>
              </div>
            ))}
          </div>

          {pinError && (
            <p className={`text-sm font-bold mb-4 px-4 py-2 rounded-lg border ${isDarkMode
              ? 'text-rose-400 bg-rose-900/30 border-rose-800'
              : 'text-rose-600 bg-rose-100 border-rose-300'
              }`}>
              Incorrect PIN. Please try again.
            </p>
          )}

          {/* Tap hint - only show when keypad is hidden */}
          {!showKeypad && (
            <p className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Tap to enter PIN</p>
          )}

          {/* Biometric option */}
          {userProfile.biometricEnabled && !showKeypad && (
            <button
              onClick={(e) => { e.stopPropagation(); handleBiometricUnlock(); }}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-xl border-2 border-emerald-500 mt-4"
            >
              <Fingerprint className="w-6 h-6" />
              <span>Use Fingerprint</span>
            </button>
          )}
        </div>

        {/* Custom Numeric Keypad */}
        {showKeypad && (
          <div
            className={`fixed bottom-0 left-0 right-0 border-t-2 p-4 pb-8 z-50 animate-slide-up ${isDarkMode
              ? 'bg-slate-800 border-slate-600'
              : 'bg-white border-slate-200 shadow-lg'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-xs mx-auto">
              {/* Number Grid */}
              <div className="grid grid-cols-3 gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'].map((key, idx) => (
                  key === '' ? (
                    <div key={idx} className="h-14"></div>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => handleKeypadPress(key)}
                      className={`h-14 rounded-xl font-bold text-2xl transition-all active:scale-95 border-2 ${isDarkMode
                        ? key === 'backspace'
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
                          : 'bg-slate-700 text-white hover:bg-slate-600 border-slate-600'
                        : key === 'backspace'
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                          : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-200'
                        }`}
                    >
                      {key === 'backspace' ? '⌫' : key}
                    </button>
                  )
                ))}
              </div>

              {/* Close keypad button */}
              <button
                onClick={() => setShowKeypad(false)}
                className={`w-full mt-4 py-3 font-bold text-sm transition-colors ${isDarkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Hide Keypad
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-8px); }
            80% { transform: translateX(8px); }
          }
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-full flex flex-col overflow-hidden ${fontClass} ${darkClass} transition-colors duration-500 ${darkClass ? 'bg-slate-950' : 'bg-[#334155]'}`}>

      {!userProfile.isOnboarded ? (
        <React.Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-xl font-bold">Loading...</div>
          </div>
        }>
          <Onboarding onComplete={handleOnboardingComplete} />
        </React.Suspense>
      ) : (
        <div className={`app-container ${darkClass} animate-app-entrance`}>
          {showWalkthrough && (
            <React.Suspense fallback={null}>
              <Walkthrough
                onComplete={() => {
                  setShowWalkthrough(false);
                  setUserProfile(prev => ({ ...prev, hasCompletedOnboarding: true }));
                }}
                onNavigate={(view) => setActiveView(view)}
              />
            </React.Suspense>
          )}

          {/* Offline Indicator */}
          {isOffline && (
            <div className="bg-amber-500 text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold shrink-0">
              <WifiOff className="w-4 h-4" />
              <span>You're offline — Changes are saved locally</span>
            </div>
          )}

          {/* Notebook Content Area */}
          <main
            className={`flex-1 overflow-hidden relative ${paperClass} ${darkClass} w-full flex flex-col`}
            role="main"
            aria-label="Budget content area"
          >
            {/* Spine shadow/binding effect */}
            <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-[11]" aria-hidden="true"></div>
            <div className="relative z-10 w-full flex-1 min-h-0">
              <div
                className="flex w-[400%] h-full transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform"
                style={{ transform: `translate3d(-${navItems.findIndex(i => i.view === activeView) * 25}%, 0, 0)` }}
              >
                {navItems.map((item) => (
                  <div key={item.view} className="w-1/4 h-full shrink-0 overflow-y-auto overflow-x-hidden relative pb-28 [scrollbar-gutter:stable]">
                    {renderSpecificView(item.view)}
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Bottom Navigation - 4 tabs */}
          <nav
            className={`bg-white dark:bg-slate-900 border-t-2 border-slate-900 dark:border-slate-600 px-2 py-2 pb-safe-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative z-20 shrink-0`}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="grid grid-cols-4 gap-1">
              {navItems.map(({ view, icon: Icon, label }) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  aria-label={label}
                  aria-current={activeView === view ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeView === view
                    ? `${themeClasses.primaryText} ${themeClasses.lightBg} border-2 ${themeClasses.border} translate-y-[-2px] shadow-sm`
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-2 border-transparent'
                    }`}
                >
                  <Icon className="w-6 h-6 mb-1" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
                </button>
              ))}
            </div>
          </nav>

        </div>
      )}
    </div>
  );
};

export default App;
