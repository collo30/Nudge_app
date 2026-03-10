
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Transaction, BudgetCategory, READY_TO_ASSIGN_ID, ThemeClasses, RecurringTransaction } from '../types';
import { Plus, Search, Calendar, Wallet, ChevronLeft, ChevronRight, X, Pencil, Trash2, AlertTriangle, ArrowUpRight, RefreshCw, Zap, Sparkles, Ghost, Heart } from 'lucide-react';
import { getCategoryDisplayEmoji } from '../utils/categoryEmojis';
import PaydayRitual from './PaydayRitual';
import { useHaptics } from '../hooks/useHaptics';

interface TransactionsProps {
  transactions: Transaction[];
  categories: BudgetCategory[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
  onUpdateCategory?: (id: string, updates: Partial<BudgetCategory>) => void;
  onDeleteTransaction?: (id: string) => void;
  currentMonth: string;
  onMonthChange: (offset: number) => void;
  themeClasses?: ThemeClasses;
  currencySymbol: string;
  quickAddType?: 'expense' | 'income' | null;
  onClearQuickAdd?: () => void;
  readyToAssign?: number;
  // Recurring transaction props
  recurringTransactions?: RecurringTransaction[];
  onAddRecurring?: (rt: Omit<RecurringTransaction, 'id'>) => void;
  onUpdateRecurring?: (id: string, updates: Partial<RecurringTransaction>) => void;
  onDeleteRecurring?: (id: string) => void;
  isPrivacyMode?: boolean;
  fontClass?: string;
  isActive?: boolean;
}

type TransactionType = 'expense' | 'income';
type ModalMode = 'add' | 'edit';

const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  isPrivacyMode = false,
  categories,
  onAddTransaction,
  onUpdateTransaction,
  onUpdateCategory,
  onDeleteTransaction,
  currentMonth,
  onMonthChange,
  themeClasses,
  currencySymbol,
  quickAddType,
  onClearQuickAdd,
  readyToAssign = 0,
  recurringTransactions = [],
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  fontClass = '',
  isActive = true
}) => {
  // Fallback theme if not passed
  const theme = themeClasses || {
    primaryBg: 'bg-indigo-600',
    primaryText: 'text-indigo-700',
    border: 'border-indigo-600',
    lightBg: 'bg-indigo-50',
    hoverBg: 'hover:bg-indigo-700',
    hex: '#4f46e5'
  };

  const haptics = useHaptics();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<TransactionType>('expense');
  const [newPayee, setNewPayee] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMemo, setNewMemo] = useState('');
  const [loveScore, setLoveScore] = useState<number>(5);
  const [isEssential, setIsEssential] = useState<boolean>(false);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [regretWarning, setRegretWarning] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<number>(0); // 0=payee, 1=category, 2=amount+date, 3=extras

  // Payday Ritual state
  const [showPaydayRitual, setShowPaydayRitual] = useState(false);

  // Tab state for recurring vs transactions view
  const [activeTab, setActiveTab] = useState<'transactions' | 'recurring'>('transactions');

  // Expanded row states
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);
  const [expandedRecurringId, setExpandedRecurringId] = useState<string | null>(null);

  // Recurring transaction modal state
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [newRecPayee, setNewRecPayee] = useState('');
  const [newRecAmount, setNewRecAmount] = useState('');
  const [newRecCategory, setNewRecCategory] = useState('');
  const [newRecFrequency, setNewRecFrequency] = useState<'monthly' | 'weekly' | 'biweekly' | 'yearly'>('monthly');
  const [newRecDay, setNewRecDay] = useState<number | ''>(1);
  const [newRecMonth, setNewRecMonth] = useState<number>(0); // 0-11
  const [newRecMemo, setNewRecMemo] = useState('');

  // Handle quick action from shortcuts/widgets
  useEffect(() => {
    if (quickAddType) {
      setModalMode('add');
      setType(quickAddType);
      setIsModalOpen(true);
      if (onClearQuickAdd) {
        onClearQuickAdd();
      }
    }
  }, [quickAddType, onClearQuickAdd]);

  // Helper function - must be defined before useMemo that uses it
  const getCategoryName = (id: string) => {
    if (id === READY_TO_ASSIGN_ID) return 'Ready to Assign';
    return categories.find(c => c.id === id)?.name || 'Uncategorized';
  };

  const getCategoryEmoji = (id: string) => {
    if (id === READY_TO_ASSIGN_ID) return 'ðŸ’°';
    const cat = categories.find(c => c.id === id);
    return cat ? getCategoryDisplayEmoji(cat.name, cat.emoji) : null;
  };

  // Calculate category frequency for sorting
  const categoryFrequencyMap = useMemo(() => {
    return transactions.reduce((acc: Record<string, number>, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + 1;
      return acc;
    }, {});
  }, [transactions]);

  // Filter transactions by current month and search query
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(t => t.date.startsWith(currentMonth));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.payee.toLowerCase().includes(query) ||
        t.memo?.toLowerCase().includes(query) ||
        getCategoryName(t.categoryId).toLowerCase().includes(query)
      );
    }

    return result;
  }, [transactions, currentMonth, searchQuery, categories]);

  const [year, month] = currentMonth.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const today = new Date();
  const currentRealMonthStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  const isPastMonth = currentMonth < currentRealMonthStr;

  // Reset form when modal opens - but preserve type if set by quickAddType
  useEffect(() => {
    if (isModalOpen && modalMode === 'add') {
      // Only reset type to expense if not already set (quickAddType will have set it)
      // Check if this is a fresh open by checking if payee is empty
      if (!newPayee) {
        // Don't override type here - let quickAddType useEffect handle it
      }
      setNewPayee('');
      setNewAmount('');
      setNewPayee('');
      setNewAmount('');
      setNewMemo('');
      setLoveScore(5);
      setIsEssential(false);

      // Set category based on current type
      if (type === 'income') {
        setNewCategory(READY_TO_ASSIGN_ID);
      } else {
        setNewCategory(''); // Force user to pick a category
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (todayStr.startsWith(currentMonth)) {
        setNewDate(todayStr);
      } else {
        setNewDate(`${currentMonth}-01`);
      }
    }
  }, [isModalOpen, modalMode, categories, currentMonth, type]);

  // Populate form when editing
  useEffect(() => {
    if (isModalOpen && modalMode === 'edit' && editingTransaction) {
      setType(editingTransaction.amount > 0 ? 'income' : 'expense');
      setNewPayee(editingTransaction.payee);
      setNewAmount(Math.abs(editingTransaction.amount).toString());
      setNewCategory(editingTransaction.categoryId);
      setNewDate(editingTransaction.date);
      setNewDate(editingTransaction.date);
      setNewMemo(editingTransaction.memo || '');
      setLoveScore(editingTransaction.sentimentScore || 5);
      setIsEssential(editingTransaction.isEssential || false);
    }
  }, [isModalOpen, modalMode, editingTransaction]);

  // Amount Suggestions
  const [suggestedAmount, setSuggestedAmount] = useState<number | null>(null);

  useEffect(() => {
    if (isModalOpen && modalMode === 'add' && newPayee.length > 2) {
      const history = transactions.filter(t => t.payee.toLowerCase() === newPayee.toLowerCase());

      if (history.length > 0) {
        const total = history.reduce((sum, t) => sum + (t.sentimentScore || 5), 0);
        setAvgScore(Math.round(total / history.length));

        const match = history[0]; // Most recent
        setSuggestedAmount(Math.abs(match.amount));
        setNewCategory(match.categoryId);
        setLoveScore(match.sentimentScore || 5);
        setIsEssential(match.isEssential || false);

        // Pause Nudge Logic
        const avg = Math.round(total / history.length);
        if (avg <= 3) {
          setRegretWarning(`Just a gentle nudge â€” you historically rated purchases at ${match.payee} a ${avg}/10. Still want to proceed?`);
        } else {
          setRegretWarning(null);
        }

      } else {
        setSuggestedAmount(null);
        setAvgScore(null);
        setRegretWarning(null);
      }
    } else {
      setSuggestedAmount(null);
      setRegretWarning(null);
    }
  }, [newPayee, isModalOpen, modalMode, transactions]);

  const applySuggestion = () => {
    if (suggestedAmount) {
      setNewAmount(suggestedAmount.toString());
      setSuggestedAmount(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If not on final step, act as a "Next" button rather than prematurely saving
    const maxStep = type === 'income' ? 3 : 4;
    if (modalStep < maxStep) {
      if (modalStep === 1 && !newPayee.trim()) return;
      if (modalStep === 3 && !newAmount) return;
      const nextStep = (type === 'income' && modalStep === 1) ? 3 : modalStep + 1;
      setModalStep(nextStep);
      return;
    }

    const amountVal = parseFloat(newAmount);
    if (isNaN(amountVal) || amountVal === 0) return;

    // Safety check: specific category is required for expenses
    if (type === 'expense' && !newCategory) {
      alert("Please select a category! Every expense needs a home ðŸ ");
      return;
    }

    if (type === 'expense' && newCategory && newCategory !== READY_TO_ASSIGN_ID) {
      const category = categories.find(c => c.id === newCategory);
      if (category && amountVal > category.available) {
        haptics.warning(); // Physical nudge when saving an overbudget expense
      } else {
        haptics.success();
      }
    } else {
      haptics.success();
    }

    const finalAmount = type === 'expense' ? -Math.abs(amountVal) : Math.abs(amountVal);

    if (modalMode === 'edit' && editingTransaction && onUpdateTransaction) {
      onUpdateTransaction(editingTransaction.id, {
        date: newDate,
        payee: newPayee,
        categoryId: type === 'income' ? READY_TO_ASSIGN_ID : newCategory,
        amount: finalAmount,
        memo: newMemo || undefined,
        ...(type === 'expense' ? { sentimentScore: loveScore, isEssential } : {}),
        cleared: true
      });
    } else {
      onAddTransaction({
        date: newDate,
        payee: newPayee,
        categoryId: type === 'income' ? READY_TO_ASSIGN_ID : newCategory,
        amount: finalAmount,
        memo: newMemo || undefined,
        ...(type === 'expense' ? { sentimentScore: loveScore, isEssential } : {}),
        cleared: true
      });
      // Trigger Payday Ritual after logging income
      if (type === 'income' && onUpdateCategory) {
        setTimeout(() => setShowPaydayRitual(true), 300);
      }
    }

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setModalStep(0);
    setEditingTransaction(null);
    setNewPayee('');
    setNewAmount('');
    setNewMemo('');
    setLoveScore(5);
    setIsEssential(false);
    setRegretWarning(null);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalMode('edit');
    setModalStep(1); // skip type picker — type is pre-set from transaction
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(id);
    }
    setDeleteConfirmId(null);
  };

  // Recurring transaction helpers
  const openRecurringModal = (rt?: RecurringTransaction) => {
    if (rt) {
      setEditingRecurring(rt);
      setNewRecPayee(rt.payee);
      setNewRecAmount(Math.abs(rt.amount).toString());
      setNewRecCategory(rt.categoryId);
      setNewRecFrequency(rt.frequency);
      setNewRecDay(rt.dayOfMonth);
      setNewRecMonth(rt.monthOfYear !== undefined ? rt.monthOfYear : new Date().getMonth());
      setNewRecMemo(rt.memo || '');
    } else {
      setEditingRecurring(null);
      setNewRecPayee('');
      setNewRecAmount('');
      setNewRecCategory(categories[0]?.id || '');
      setNewRecFrequency('monthly');
      setNewRecDay(1);
      setNewRecMonth(new Date().getMonth());
      setNewRecMemo('');
    }
    setShowRecurringModal(true);
  };

  const saveRecurring = () => {
    const amount = -Math.abs(parseFloat(newRecAmount) || 0);
    if (!newRecPayee || amount === 0) return;

    const isWeeklyType = newRecFrequency === 'weekly' || newRecFrequency === 'biweekly';

    // Validate day input based on frequency
    if (isWeeklyType) {
      if (newRecDay === '' || newRecDay < 0 || newRecDay > 6) {
        alert("Please select a valid day of the week.");
        return;
      }
    } else {
      if (newRecDay === '' || newRecDay < 1 || newRecDay > 31) {
        alert("Please enter a valid day of the month (1-31).");
        return;
      }
    }

    const todayDate = new Date();
    const day = newRecDay as number;
    let nextDue: Date;

    if (isWeeklyType) {
      // For weekly/biweekly: day is day of week (0=Sunday, 6=Saturday)
      // Find the next occurrence of this day of week
      const todayDayOfWeek = todayDate.getDay();
      let daysUntilNext = day - todayDayOfWeek;
      if (daysUntilNext <= 0) {
        // If it's today or in the past this week, go to next week
        daysUntilNext += 7;
      }
      nextDue = new Date(todayDate);
      nextDue.setDate(todayDate.getDate() + daysUntilNext);
    } else if (newRecFrequency === 'yearly') {
      // For yearly: use specific month and day
      const targetMonth = newRecMonth;
      const thisYear = todayDate.getFullYear();

      // Handle leap years/simpler logic: find valid day for this month
      const maxDays = new Date(thisYear, targetMonth + 1, 0).getDate();
      const actualDay = Math.min(day, maxDays);

      nextDue = new Date(thisYear, targetMonth, actualDay);

      // If date is in the past (before today), move to next year
      const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
      if (nextDue < startOfToday) {
        const nextYear = thisYear + 1;
        const maxDaysNext = new Date(nextYear, targetMonth + 1, 0).getDate();
        nextDue = new Date(nextYear, targetMonth, Math.min(day, maxDaysNext));
      }
    } else {
      // Monthly: Set to day of month, handling months with fewer days appropriately

      // Determine target date in current month first
      const currentYear = todayDate.getFullYear();
      const currentMonth = todayDate.getMonth();

      // Get the last day of THIS month to clamp properly
      const lastDayThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const actualDay = Math.min(day, lastDayThisMonth);

      nextDue = new Date(currentYear, currentMonth, actualDay);

      // If that date has passed (or is today), move to NEXT month
      // We want the *next* occurrence in the future
      // If strictly in the past (before today at midnight), move to next month
      // Allow 'today'
      const midnight = new Date(currentYear, currentMonth, todayDate.getDate());

      if (nextDue < midnight) {
        // Move to next month
        const nextMonthIndex = currentMonth + 1;
        const nextYear = currentYear + (nextMonthIndex > 11 ? 1 : 0);
        const actualNextMonth = nextMonthIndex % 12;

        const lastDayNextMonth = new Date(nextYear, actualNextMonth + 1, 0).getDate();
        const nextActualDay = Math.min(day, lastDayNextMonth);

        nextDue = new Date(nextYear, actualNextMonth, nextActualDay);
      }
    }

    const rtData = {
      payee: newRecPayee,
      categoryId: newRecCategory,
      amount,
      memo: newRecMemo,
      frequency: newRecFrequency,
      dayOfMonth: day,
      monthOfYear: newRecFrequency === 'yearly' ? newRecMonth : undefined,
      isActive: true,
      nextDueDate: `${nextDue.getFullYear()}-${String(nextDue.getMonth() + 1).padStart(2, '0')}-${String(nextDue.getDate()).padStart(2, '0')}`
    };

    if (editingRecurring && onUpdateRecurring) {
      onUpdateRecurring(editingRecurring.id, rtData);
    } else if (onAddRecurring) {
      onAddRecurring(rtData);
    }
    setShowRecurringModal(false);
  };

  // Calculate running balance for each transaction
  const transactionsWithBalance = useMemo(() => {
    // Sort all transactions by date (oldest first) to calculate running balance
    const allSorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = 0;
    const balanceMap = new Map<string, number>();

    allSorted.forEach(t => {
      runningBalance += t.amount;
      balanceMap.set(t.id, runningBalance);
    });

    // Return filtered transactions for current month with their running balances
    return filteredTransactions.map(t => ({
      ...t,
      runningBalance: balanceMap.get(t.id) || 0
    }));
  }, [transactions, filteredTransactions]);

  return (
    <>
      <div className="pb-8 flex flex-col relative">

        {/* Header */}
        <div className="px-4 pt-5 pb-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight underline decoration-wavy decoration-2 underline-offset-4" style={{ textDecorationColor: theme.hex }}>Ledger</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Transaction Log</p>
          </div>

          {/* Month Nav */}
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 select-none">
            <button
              onClick={() => onMonthChange(-1)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200 min-w-[110px] text-center">{monthName}</span>
            <button
              onClick={() => onMonthChange(1)}
              disabled={currentMonth === currentRealMonthStr}
              className={`p-1.5 rounded-full transition-colors ${currentMonth === currentRealMonthStr ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs - Only show if recurring is enabled */}
        {onAddRecurring && (
          <div className="px-4 pt-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-all ${activeTab === 'transactions'
                  ? `${theme.primaryBg} text-white shadow-sm`
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('recurring')}
                className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'recurring'
                  ? `${theme.primaryBg} text-white shadow-sm`
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                <RefreshCw className="w-4 h-4" />
                Recurring
                {recurringTransactions.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'recurring' ? 'bg-white/20 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                    {recurringTransactions.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Transactions Tab Content */}
        {activeTab === 'transactions' && (
          <>
            {/* Search Bar */}
            <div className="px-4 py-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 bg-transparent border-b-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 focus:border-slate-600 dark:focus:border-slate-400 outline-none transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-slate-500 placeholder:font-normal`}
                  aria-label="Search transactions"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-2 top-2.5" aria-hidden="true" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-slate-500 mt-2 font-bold">
                  Found {transactionsWithBalance.length} result{transactionsWithBalance.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Transactions List */}
            <div className="px-4 pb-4 space-y-3">
              {transactionsWithBalance.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-lg italic border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg mt-4 bg-slate-50/50 dark:bg-slate-800/50">
                  {searchQuery ? 'No matching entries found.' : 'No entries in the logbook yet.'}
                </div>
              )}
              {transactionsWithBalance.map(t => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm group relative overflow-hidden transition-[transform,box-shadow,border-color] duration-150 hover:shadow-hard hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600"
                >
                  {/* Colorful background fill — like budget category cards */}
                  {(() => {
                    const isIncome = t.amount > 0;
                    const score = t.sentimentScore ?? 5;
                    const fillPct = isIncome ? 100 : Math.max(20, score * 10);

                    // Vibrant color palette — [fillRGBA, accentHex]
                    const palette: [string, string][] = [
                      ['rgba(56,189,248,0.12)', '#38bdf8'],  // sky
                      ['rgba(139,92,246,0.12)', '#8b5cf6'],  // violet
                      ['rgba(34,211,238,0.12)', '#22d3ee'],  // cyan
                      ['rgba(236,72,153,0.10)', '#ec4899'],  // pink
                      ['rgba(20,184,166,0.12)', '#14b8a6'],  // teal
                      ['rgba(99,102,241,0.12)', '#6366f1'],  // indigo
                      ['rgba(249,115,22,0.10)', '#f97316'],  // orange
                      ['rgba(217,70,239,0.10)', '#d946ef'],  // fuchsia
                      ['rgba(132,204,22,0.10)', '#84cc16'],  // lime
                      ['rgba(168,85,247,0.12)', '#a855f7'],  // purple
                    ];

                    let fillColor: string;
                    let accentColor: string;

                    if (isIncome) {
                      fillColor = 'rgba(16,185,129,0.12)';
                      accentColor = '#10b981';
                    } else if (t.isEssential) {
                      fillColor = 'rgba(245,158,11,0.12)';
                      accentColor = '#f59e0b';
                    } else if (score >= 8) {
                      fillColor = 'rgba(244,63,94,0.10)';
                      accentColor = '#f43f5e';
                    } else if (score <= 3) {
                      fillColor = 'rgba(100,116,139,0.10)';
                      accentColor = '#94a3b8';
                    } else {
                      const hash = t.categoryId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                      [fillColor, accentColor] = palette[hash % palette.length];
                    }

                    return (
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-700 ease-out pointer-events-none rounded-xl"
                        style={{ width: `${fillPct}%`, backgroundColor: fillColor }}
                      />
                    );
                  })()}

                  <button onClick={() => setExpandedTxnId(p => p === t.id ? null : t.id)} className="w-full p-3 flex items-center justify-between text-left">
                    {/* Left Content */}
                    <div className="flex items-center gap-3 min-w-0 relative z-10 w-full sm:w-auto">
                      {/* Icon Box */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors shadow-sm ${t.categoryId === READY_TO_ASSIGN_ID ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400' :
                        t.amount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400' :
                          t.isEssential ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400' :
                            (t.sentimentScore || 0) >= 8 ? 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700 text-rose-500 dark:text-rose-400 font-bold' :
                              (t.sentimentScore || 5) <= 3 ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400' :
                                'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                        }`}>
                        {t.categoryId === READY_TO_ASSIGN_ID ? <Wallet className="w-5 h-5" /> :
                          t.amount > 0 ? <ArrowUpRight className="w-5 h-5" /> :
                            t.isEssential ? <Zap className="w-5 h-5 fill-current" /> :
                              (t.sentimentScore || 0) >= 8 ? <Heart className="w-5 h-5 fill-current" /> :
                                (t.sentimentScore || 5) <= 3 ? <Ghost className="w-5 h-5" /> :
                                  getCategoryEmoji(t.categoryId) ? <span className="text-xl leading-none filter drop-shadow-sm grayscale-[0.2]">{getCategoryEmoji(t.categoryId)}</span> :
                                    <Sparkles className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        }
                      </div>
                      {/* Text Content */}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{t.payee}</p>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          <span>{t.date}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="truncate max-w-[100px]">{getCategoryName(t.categoryId)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="text-right shrink-0 relative z-10 pl-2">
                      <p className={`font-black text-sm sm:text-lg ${t.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {t.amount > 0 ? '+' : ''}{currencySymbol}{Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>

                      {/* Score Badges */}
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        {t.amount < 0 && (() => {
                          const score = t.sentimentScore ?? 5;
                          return (
                            <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border ${score >= 8 ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 border-rose-100 dark:border-rose-800' :
                              score <= 3 ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600' :
                                'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                              }`}>
                              <Heart className={`w-3 h-3 ${score >= 8 ? 'fill-current' : ''}`} />
                              <span>{score}/10</span>
                            </div>
                          );
                        })()}
                        {t.isEssential && (
                          <div className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>Essential</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expandable actions per transaction */}
                  <div className={`grid transition-[grid-template-rows] duration-200 ${expandedTxnId === t.id ? 'grid-rows-[1fr] border-t border-slate-100 dark:border-slate-700/50' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-3 flex flex-wrap justify-between items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 hidden sm:inline">Transaction Options</span>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button onClick={() => { setExpandedTxnId(null); openEditModal(t); }} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-blue-500 hover:border-blue-200 transition-colors text-xs font-bold flex-1 sm:flex-none justify-center">
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => { setExpandedTxnId(null); setDeleteConfirmId(t.id); }} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors text-xs font-bold flex-1 sm:flex-none justify-center">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
        }

        {/* Recurring Tab Content */}
        {
          activeTab === 'recurring' && onAddRecurring && (
            <div className="px-4 py-4 space-y-3">
              {/* Section header */}
              <div className="flex items-center gap-2 px-1 mb-1">
                <RefreshCw className={`w-4 h-4 ${theme.primaryText}`} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto Transactions</p>
              </div>

              {recurringTransactions.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-lg italic border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                  No recurring transactions yet.
                </div>
              ) : (
                recurringTransactions.map(rt => {
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const isWeekly = rt.frequency === 'weekly' || rt.frequency === 'biweekly';
                  const dayDisplay = isWeekly ? dayNames[rt.dayOfMonth] || 'Unknown' : `Day ${rt.dayOfMonth}`;
                  const catEmoji = (() => { const cat = categories.find(c => c.id === rt.categoryId); return cat ? getCategoryDisplayEmoji(cat.name, cat.emoji) : 'ðŸ”„'; })();

                  return (
                    <div key={rt.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm group relative overflow-hidden transition-[transform,box-shadow,border-color] duration-150 hover:shadow-hard hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600"
                    >
                      <button onClick={() => setExpandedRecurringId(p => p === rt.id ? null : rt.id)} className="w-full p-3 flex items-center gap-3 text-left">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${theme.lightBg} border-slate-200 dark:border-slate-600`}>
                          <span className="text-xl leading-none">{catEmoji}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{rt.payee}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                            <span className="capitalize">{rt.frequency}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span>{dayDisplay}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span>Next: {rt.nextDueDate}</span>
                          </div>
                        </div>

                        {/* Amount */}
                        <p className="font-black text-sm text-slate-900 dark:text-white shrink-0">
                          -{currencySymbol}{Math.abs(rt.amount).toFixed(2)}
                        </p>

                      </button>

                      {/* Expandable actions per recurring transaction */}
                      <div className={`grid transition-[grid-template-rows] duration-200 ${expandedRecurringId === rt.id ? 'grid-rows-[1fr] border-t border-slate-100 dark:border-slate-700/50' : 'grid-rows-[0fr]'}`}>
                        <div className="overflow-hidden">
                          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 flex flex-wrap justify-between items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 hidden sm:inline">Recurring Options</span>
                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                              <button onClick={() => { setExpandedRecurringId(null); openRecurringModal(rt); }} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-blue-500 hover:border-blue-200 transition-colors text-xs font-bold flex-1 sm:flex-none justify-center">
                                <Pencil className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => { setExpandedRecurringId(null); onDeleteRecurring?.(rt.id); }} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors text-xs font-bold flex-1 sm:flex-none justify-center">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )
        }

        {/* Floating Action Button â€” portalled to body so it's always visible */}
        {
          !isPastMonth && isActive && createPortal(
            <button
              onClick={() => {
                if (activeTab === 'recurring') {
                  openRecurringModal();
                } else {
                  setType('expense');
                  setModalMode('add');
                  setIsModalOpen(true);
                }
              }}
              className={`animate-fab fixed bottom-24 sm:bottom-8 right-4 sm:right-6 z-40 flex items-center gap-3 text-white font-black pl-4 pr-5 py-3.5 rounded-2xl border-2 border-slate-900 text-sm tracking-wide ${theme.primaryBg} hover:brightness-110 active:scale-[0.93] transition-[filter,transform] duration-150`}

              aria-label={activeTab === 'recurring' ? 'Add recurring transaction' : 'Add new transaction'}
            >
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-4.5 h-4.5" strokeWidth={3} />
              </span>
              <span>{activeTab === 'recurring' ? 'Recurring' : 'New Entry'}</span>
            </button>,
            document.body
          )
        }

        {/* Transaction Modal â€” Step Wizard */}
        {isModalOpen && createPortal(
          <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${fontClass}`}>
            <div className="bg-[#fffdf5] dark:bg-slate-800 w-full max-w-sm rounded-2xl border-2 border-slate-900 shadow-hard flex flex-col">

              {/*  HEADER  */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  {modalStep > 0 && (
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${type === 'expense' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                      {type === 'expense' ? 'Expense' : 'Income'}
                    </span>
                  )}
                  {modalStep === 0 && (
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {modalMode === 'edit' ? 'Edit Entry' : 'New Entry'}
                    </span>
                  )}
                  {modalStep > 0 && (
                    <span className="text-xs text-slate-400">
                      Step {modalStep} / {type === 'income' ? 3 : 4}
                    </span>
                  )}
                </div>
                <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="transaction-form" onSubmit={handleSubmit}>

                {/* â”€â”€ STEP 0: Choose type â”€â”€ */}
                {modalStep === 0 && (
                  <div className="p-5 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">What are you recording?</p>
                    <button type="button"
                      onClick={() => { setType('expense'); setNewCategory(''); setModalStep(1); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 hover:border-rose-400 dark:hover:border-rose-600 text-left active:scale-[.98]"
                    >
                      <span className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-black text-xl shrink-0">-</span>
                      <div>
                        <p className="font-black text-rose-700 dark:text-rose-300 text-base">Expense</p>
                        <p className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">Money going out</p>
                      </div>
                    </button>
                    <button type="button"
                      onClick={() => { setType('income'); setNewCategory(READY_TO_ASSIGN_ID); setModalStep(1); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 text-left active:scale-[.98]"
                    >
                      <span className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-xl shrink-0">+</span>
                      <div>
                        <p className="font-black text-emerald-700 dark:text-emerald-300 text-base">Income</p>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">Money coming in</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* â”€â”€ STEP 1: Payee â”€â”€ */}
                {modalStep === 1 && (
                  <div className="p-5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Who is this with?
                    </label>
                    <input
                      required
                      autoFocus
                      type="text"
                      value={newPayee}
                      onChange={(e) => setNewPayee(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newPayee.trim()) {
                          e.preventDefault();
                          setModalStep(type === 'income' ? 3 : 2);
                        }
                      }}
                      className="w-full text-2xl font-black bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-700 dark:focus:border-slate-400 pb-2 mb-1"
                      placeholder={type === 'income' ? 'e.g. Salary, Freelance, Gift' : 'e.g. Grocery Store, Rent, Coffee Shop'}
                      autoComplete="off"
                    />
                    {/* Payee suggestions */}
                    {newPayee.length > 0 && (() => {
                      const matches = (Array.from(new Set(transactions.map(t => t.payee))) as string[])
                        .filter(p => p.toLowerCase().includes(newPayee.toLowerCase()) && p.toLowerCase() !== newPayee.toLowerCase())
                        .slice(0, 4);
                      if (!matches.length) return null;
                      return (
                        <div className="mt-2 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                          {matches.map(match => {
                            const lastTxn = transactions.find(t => t.payee === match);
                            return (
                              <button key={match} type="button"
                                onClick={() => {
                                  setNewPayee(match);
                                  if (lastTxn) {
                                    setNewCategory(lastTxn.categoryId);
                                    if (lastTxn.sentimentScore) setLoveScore(lastTxn.sentimentScore);
                                    setIsEssential(!!lastTxn.isEssential);
                                    setSuggestedAmount(Math.abs(lastTxn.amount));
                                  }
                                  setModalStep(type === 'income' ? 3 : 2);
                                }}
                                className="w-full text-left px-4 py-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/80 flex justify-between items-center border-b border-slate-100 dark:border-slate-600 last:border-0"
                              >
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{match}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{lastTxn ? getCategoryName(lastTxn.categoryId) : ''}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {/* Regret nudge */}
                    {regretWarning && (
                      <div className="mt-3 border-l-4 border-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-r-lg flex gap-2 items-start">
                        <Ghost className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-700 dark:text-rose-300 leading-snug">{regretWarning}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* â”€â”€ STEP 2: Category (expense only) â”€â”€ */}
                {modalStep === 2 && type === 'expense' && (
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                      {newCategory && (() => {
                        const cat = categories.find(c => c.id === newCategory);
                        return cat
                          ? <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{getCategoryDisplayEmoji(cat.name, cat.emoji)} {cat.name}</span>
                          : null;
                      })()}
                    </div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault(); // Prevent premature form submission
                          }
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none text-sm font-bold placeholder:font-normal text-slate-700 dark:text-slate-300 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {categories
                        .filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                        .sort((a, b) => categorySearch ? a.name.localeCompare(b.name) : (categoryFrequencyMap[b.id] || 0) - (categoryFrequencyMap[a.id] || 0))
                        .slice(0, categorySearch ? 20 : 12)
                        .map(c => {
                          const isSelected = newCategory === c.id;
                          return (
                            <button key={c.id} type="button"
                              onClick={() => { setNewCategory(c.id); setCategorySearch(''); setTimeout(() => setModalStep(3), 100); }}
                              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/30'}`}
                            >
                              <span className="text-xl leading-none">{getCategoryDisplayEmoji(c.name, c.emoji)}</span>
                              <span className={`text-[9px] font-bold truncate w-full text-center leading-tight ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{c.name}</span>
                            </button>
                          );
                        })
                      }
                    </div>
                    {!categorySearch && categories.length > 12 && (
                      <p className="text-[10px] text-slate-400 text-center mt-2">Search to see all {categories.length} categories</p>
                    )}
                  </div>
                )}

                {/* â”€â”€ STEP 3: Amount + Date â”€â”€ */}
                {modalStep === 3 && (
                  <div className="p-5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">How much?</label>
                    {/* Amount input row */}
                    <div className={`flex items-baseline gap-2 pb-3 border-b-2 ${type === 'income' ? 'border-emerald-200 dark:border-emerald-800' : 'border-rose-200 dark:border-rose-900'}`}>
                      <span className={`text-3xl font-bold select-none ${type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{currencySymbol}</span>
                      <input
                        required
                        autoFocus
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newAmount}
                        placeholder="0.00"
                        onChange={(e) => setNewAmount(e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        className={`flex-1 text-4xl font-black bg-transparent outline-none appearance-none placeholder:text-slate-200 dark:placeholder:text-slate-700 ${type === 'income' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}
                      />
                    </div>
                    {/* Suggested amount — highlighted */}
                    {suggestedAmount ? (
                      <button type="button" onClick={applySuggestion}
                        className="mt-3 flex items-center justify-between w-full px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl"
                      >
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Use last amount</span>
                        <span className="text-base font-black text-amber-700 dark:text-amber-300">{currencySymbol}{suggestedAmount}</span>
                      </button>
                    ) : null}
                    {/* Date */}
                    <div className="mt-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="date"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        value={newDate}
                        onChange={(e) => { if (e.target.value > new Date().toISOString().split('T')[0]) return; setNewDate(e.target.value); }}
                        className="bg-transparent outline-none font-semibold text-slate-700 dark:text-slate-300 text-sm dark:[color-scheme:dark]"
                      />
                      {newDate === new Date().toISOString().split('T')[0] && (
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">Today</span>
                      )}
                    </div>
                    {/* Category + budget status badge */}
                    {type === 'expense' && newCategory && (() => {
                      const cat = categories.find(c => c.id === newCategory);
                      if (!cat) return null;
                      const over = cat.available < parseFloat(newAmount || '0');
                      return (
                        <div className={`mt-3 flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${over ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-700/30 dark:border-slate-700'}`}>
                          <span className="font-bold text-slate-600 dark:text-slate-400">{getCategoryDisplayEmoji(cat.name, cat.emoji)} {cat.name}</span>
                          <span className={`font-black ${over ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {over ? `Over by ${currencySymbol}${(parseFloat(newAmount || '0') - cat.available).toFixed(2)}` : `${currencySymbol}${cat.available.toFixed(2)} left`}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* —— STEP 4: Optional extras (expense only) —— */}
                {modalStep === 4 && type === 'expense' && (
                  <div className="p-5 space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Optional details</label>
                      <input type="text" value={newMemo} onChange={(e) => setNewMemo(e.target.value)}
                        autoFocus
                        className="w-full py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none text-base font-medium text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 mb-4"
                        placeholder="Add a note (optional)"
                      />
                      <button type="button" onClick={() => setIsEssential(!isEssential)}
                        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 text-sm font-bold transition-all ${isEssential ? 'bg-amber-100 border-amber-400 text-amber-700 dark:bg-amber-900/40 dark:border-amber-600 dark:text-amber-300 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600 hover:bg-slate-100'}`}
                      >
                        <Zap className={`w-4 h-4 ${isEssential ? 'fill-amber-500' : ''}`} />
                        {isEssential ? 'Marked as Essential' : 'Tap to mark as Essential'}
                      </button>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[11px] font-bold text-rose-400 dark:text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 fill-rose-400 dark:fill-rose-500" />
                          Joy Score
                        </label>
                        <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                          {loveScore}<span className="text-sm font-bold text-rose-300 dark:text-rose-700/50">/10</span>
                        </span>
                      </div>
                      <input type="range" min="1" max="10" step="1" value={loveScore}
                        onChange={(e) => setLoveScore(parseInt(e.target.value))}
                        className="w-full h-2.5 bg-rose-200 dark:bg-rose-950 rounded-full appearance-none cursor-pointer accent-rose-500"
                      />
                      <div className="flex justify-between text-[10px] text-rose-400 dark:text-rose-500/80 mt-2 font-bold uppercase tracking-wide">
                        <span>Meh / Regret</span>
                        {avgScore !== null && <span className="text-rose-300 dark:text-rose-800">Your Avg: {avgScore}</span>}
                        <span>Loved it</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* â”€â”€ FOOTER â”€â”€ */}
                {modalStep > 0 && (
                  <div className="px-5 pb-5 pt-3 flex gap-2 border-t border-slate-100 dark:border-slate-700">
                    <button type="button"
                      onClick={() => modalStep === 1 ? closeModal() : setModalStep(s => s - 1)}
                      className="px-4 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 text-sm shrink-0"
                    >
                      {modalStep === 1 ? 'Cancel' : 'Back'}
                    </button>
                    {/* Next or Submit */}
                    {modalStep < (type === 'income' ? 3 : 4) ? (
                      <button form="transaction-form" type="submit"
                        className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm border-2 border-slate-900 active:translate-y-0.5 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      >Next</button>
                    ) : (
                      <button form="transaction-form" type="submit"
                        className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm border-2 border-slate-900 active:translate-y-0.5 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      >{modalMode === 'edit' ? 'Save' : 'Done'}</button>
                    )}
                    {/* Skip on the extras step */}
                    {modalStep === 4 && type === 'expense' && (
                      <button form="transaction-form" type="submit"
                        className="px-3 py-2.5 rounded-xl text-slate-400 dark:text-slate-500 text-xs font-bold border border-slate-200 dark:border-slate-600 shrink-0"
                      >Skip</button>
                    )}
                  </div>
                )}

              </form>
            </div>
          </div>,
          document.body
        )}







        {/* Recurring Transaction Modal */}
        {showRecurringModal && createPortal(
          <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in ${fontClass}`}>
            <div className="bg-[#fffdf5] dark:bg-slate-800 w-full max-w-md rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.15)] flex flex-col relative animate-slide-up max-h-[95dvh] overflow-y-auto custom-scrollbar">
              <div className="p-6 pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editingRecurring ? 'Edit Recurring' : 'New Recurring'}</h2>
                  <button onClick={() => setShowRecurringModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Payee</label>
                  <input type="text" value={newRecPayee} onChange={(e) => setNewRecPayee(e.target.value)} className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 dark:text-white dark:bg-slate-700 dark:border-slate-600" placeholder="e.g. Netflix" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount ({currencySymbol})</label>
                  <input type="number" value={newRecAmount} onChange={(e) => setNewRecAmount(e.target.value)} className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 dark:text-white dark:bg-slate-700 dark:border-slate-600" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select value={newRecCategory} onChange={(e) => setNewRecCategory(e.target.value)} className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 dark:text-white dark:bg-slate-700 dark:border-slate-600">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Frequency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['monthly', 'weekly', 'biweekly', 'yearly'] as const).map(f => (
                      <button key={f} type="button" onClick={() => { setNewRecFrequency(f); setNewRecDay(f === 'weekly' || f === 'biweekly' ? 1 : 1); }}
                        className={`p-2 rounded-lg border-2 text-sm font-bold capitalize ${newRecFrequency === f ? `${theme.primaryBg} text-white border-transparent` : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}
                      >{f}</button>
                    ))}
                  </div>
                </div>
                {(newRecFrequency === 'weekly' || newRecFrequency === 'biweekly') ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Day of Week</label>
                    <div className="grid grid-cols-7 gap-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                        <button key={d} type="button" onClick={() => setNewRecDay(i)}
                          className={`p-1.5 rounded-lg text-xs font-bold ${newRecDay === i ? `${theme.primaryBg} text-white` : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                ) : newRecFrequency === 'yearly' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Month</label>
                      <select value={newRecMonth} onChange={(e) => setNewRecMonth(parseInt(e.target.value))} className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 dark:text-white dark:bg-slate-700 dark:border-slate-600">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <option key={m} value={i}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Day</label>
                      <input type="number" min={1} max={31} value={newRecDay} onChange={(e) => setNewRecDay(parseInt(e.target.value))} className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 dark:text-white dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Day of Month</label>
                    <input type="number" min={1} max={31} value={newRecDay} onChange={(e) => { const v = parseInt(e.target.value); setNewRecDay(isNaN(v) ? '' : v); }} className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 dark:text-white dark:bg-slate-700 dark:border-slate-600" placeholder="e.g. 1" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Memo (optional)</label>
                  <input type="text" value={newRecMemo} onChange={(e) => setNewRecMemo(e.target.value)} className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 dark:text-white dark:bg-slate-700 dark:border-slate-600" placeholder="e.g. Subscription" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowRecurringModal(false)} className="flex-1 p-3 rounded-lg font-bold text-slate-500 border-2 border-slate-200 dark:border-slate-600">Cancel</button>
                  <button type="button" onClick={saveRecurring} className={`flex-1 p-3 rounded-lg text-white font-bold border-2 border-slate-900 shadow-sm active:translate-y-0.5 ${theme.primaryBg}`}>
                    {editingRecurring ? 'Save Changes' : 'Add Recurring'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && createPortal(
          <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in ${fontClass}`}>
            <div className="bg-[#fffdf5] dark:bg-slate-800 w-full max-w-sm rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.15)] p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete this entry?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">This can't be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 p-3 rounded-lg font-bold text-slate-500 border-2 border-slate-200 dark:border-slate-600">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 p-3 rounded-lg bg-rose-500 text-white font-bold border-2 border-slate-900 shadow-sm">Delete</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Payday Ritual */}
        {showPaydayRitual && onUpdateCategory && (
          <PaydayRitual
            readyToAssign={readyToAssign}
            categories={categories}
            currencySymbol={currencySymbol}
            themeClasses={theme}
            currentMonth={currentMonth}
            fontClass={fontClass}
            onUpdateCategory={onUpdateCategory}
            onClose={() => setShowPaydayRitual(false)}
          />
        )}
      </div>
    </>
  );
};

export default Transactions;

