import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { FinancialContext } from '../types';
import { Flame, ArrowUpRight, Scale, TrendingUp, TrendingDown, PiggyBank, ShoppingBag, Home, AlertTriangle, ChevronDown, ChevronUp, Wallet, Heart, Target, Gift, Landmark, GraduationCap, Car, Sparkles, Lightbulb, ChevronLeft, ChevronRight, Zap, Ghost, Trophy, X, Activity, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

// ===== BUDGETING RATIO DEFINITIONS =====
type BudgetRatioId = '50-30-20' | '70-20-10' | '80-20' | '60-method' | '30-30-30-10' | 'pay-yourself-first';

const FINANCIAL_TIPS = [
    { title: "The 24-Hour Rule", text: "Wait 24 hours before making any non-essential purchase over $50 to curb impulse buying." },
    { title: "Emergency Fund", text: "Aim to save 3-6 months of living expenses. Start small with a $1,000 safety net." },
    { title: "Pay Yourself First", text: "Treat your savings like a bill. Transfer money to savings as soon as you get paid, not after spending." },
    { title: "Snowball Method", text: "Pay off debts smallest to largest. The psychological win of closing an account motivates you to keep going." },
    { title: "Review Subscriptions", text: "Check your bank statement for unused subscriptions. Cancel what you don’t need." },
    { title: "50/30/20 Rule", text: "Allocate 50% to needs, 30% to wants, and 20% to savings/debt repayment." },
    { title: "Track Every Penny", text: "Small daily expenses add up. Tracking coffee or snacks reveals hidden budget leaks." },
    { title: "Automate Savings", text: "Set up automatic transfers to your savings account on payday so you never see the money to spend it." },
    { title: "Cook at Home", text: "Meal prepping and cooking at home can save thousands per year compared to dining out or ordering delivery." },
    { title: "Go Generic", text: "Store-brand medicines and pantry staples often have the exact same ingredients as name brands for half the cost." },
    { title: "Use the Library", text: "Libraries offer free books, movies, audiobooks, and sometimes even tools or museum passes." },
    { title: "Energy Audit", text: "Switch to LED bulbs and unplug electronics when not in use to lower your monthly utility bills." },
    { title: "Cash Envelope System", text: "Withdraw cash for discretionary categories like 'Dining Out'. When the envelope is empty, spending stops." },
    { title: "No-Spend Days", text: "Challenge yourself to spend $0 on non-essentials for one day a week or one weekend a month." },
    { title: "Price Matching", text: "Many major retailers will match a lower price found on a competitor's website. Just ask!" },
    { title: "Sell Unused Items", text: "Declutter your home and sell clothes, electronics, or furniture on marketplaces for extra cash." },
    { title: "Negotiate Bills", text: "Call your internet or phone provider annually to ask for loyalty discounts or better rates." },
    { title: "Reusable Water Bottle", text: "Stop buying bottled water. It's better for your wallet and the environment." },
    { title: "Second-hand First", text: "Check thrift stores or online marketplaces before buying furniture, clothes, or tools brand new." },
    { title: "Credit Card Rewards", text: "If you pay off your balance in full every month, use credit cards to earn cash back on necessary spending." },
    { title: "Time in the Market", text: "Investing early and consistently beats trying to time the market. Compound interest needs time to work." },
    { title: "Increase 1%", text: "Try increasing your savings or retirement contribution by just 1% every 6 months. You likely won't miss it." },
    { title: "Impulse Friction", text: "Delete shopping apps and remove saved credit card numbers from browsers to make buying harder." },
    { title: "DIY Repairs", text: "Learn basic sewing or home repairs via YouTube instead of replacing items or hiring help immediately." },
    { title: "Quality over Quantity", text: "Sometimes spending more on one high-quality item (like boots) is cheaper than replacing cheap ones yearly." },
    { title: "Grocery List Rule", text: "Never go grocery shopping hungry, and stick strictly to your list to avoid marketing traps." },
    { title: "Free Entertainment", text: "Look for free community events, parks, and museum free-entry days instead of expensive outings." },
    { title: "Avoid Lifestyle Creep", text: "When you get a raise, save the difference instead of upgrading your car or apartment immediately." },
    { title: "Audit Insurance", text: "Shop around for car and home insurance quotes annually. Loyalty rarely pays in insurance." },
    { title: "Unsubscribe Emails", text: "Unsubscribe from retailer marketing emails to remove the temptation of 'sales' and 'limited time offers'." },
    { title: "Health is Wealth", text: "Preventative healthcare, dental checkups, and exercise save massive medical costs in the long run." },
    { title: "Match Your Spending", text: "For every non-essential dollar you spend, force yourself to put the same amount into savings." },
    { title: "Avalanche Method", text: "Mathematically optimal debt repayment: Pay off debts with the highest interest rate first to save on interest." },
    { title: "Rent vs Buy", text: "Homeownership isn't always best. In high-cost areas, renting and investing the difference often yields higher wealth." },
    { title: "Job Loyalty Tax", text: "Employees who stay at companies longer than 2 years get paid 50% less over their lifetime. Job hop to grow income." },
    { title: "Buy the Latte", text: "Cutting $5 coffees won't make you rich. Focus on earning more income and reducing big housing/car costs instead." },
    { title: "Die With Zero", text: "Don't hoard wealth for old age when you can't enjoy it. Spend on experiences while you are young and healthy." },
    { title: "Credit is King", text: "Debit cards are risky. Use credit cards for everything to get fraud protection and rewards, provided you pay in full." },
    { title: "Good Debt Leverage", text: "Not all debt is bad. Low-interest debt (like a mortgage) used to buy appreciating assets is a powerful wealth tool." },
    { title: "Emergency Funds are Dead", text: "Cash drags down returns. Keep a small buffer and invest the rest; liquidating stocks is fast enough for emergencies." },
];

interface RatioCategory {
    id: string;
    name: string;
    target: number;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    description: string;
    groupIds: string[]; // Maps to our budget group IDs
}

interface BudgetRatio {
    id: BudgetRatioId;
    name: string;
    shortName: string;
    description: string;
    categories: RatioCategory[];
}

const BUDGET_RATIOS: BudgetRatio[] = [
    {
        id: '50-30-20',
        name: '50/30/20 Rule',
        shortName: '50/30/20',
        description: 'Elizabeth Warren\'s balanced approach: Needs, Wants, Savings',
        categories: [
            { id: 'needs', name: 'Needs', target: 50, color: 'bg-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: <Home className="w-4 h-4" />, description: 'Bills, rent, groceries, insurance', groupIds: ['needs'] },
            { id: 'wants', name: 'Wants', target: 30, color: 'bg-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: <ShoppingBag className="w-4 h-4" />, description: 'Entertainment, dining, hobbies', groupIds: ['wants'] },
            { id: 'savings', name: 'Savings', target: 20, color: 'bg-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <PiggyBank className="w-4 h-4" />, description: 'Emergency fund, investments, debt', groupIds: ['savings'] },
        ]
    },
    {
        id: '70-20-10',
        name: '70/20/10 Rule',
        shortName: '70/20/10',
        description: 'Simple living approach with giving/debt focus',
        categories: [
            { id: 'living', name: 'Living Expenses', target: 70, color: 'bg-sky-500', bgColor: 'bg-sky-100 dark:bg-sky-900/30', icon: <Wallet className="w-4 h-4" />, description: 'All bills, needs, and wants', groupIds: ['needs', 'wants'] },
            { id: 'savings', name: 'Savings', target: 20, color: 'bg-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <PiggyBank className="w-4 h-4" />, description: 'Build your safety net', groupIds: ['savings'] },
            { id: 'giving', name: 'Giving/Debt', target: 10, color: 'bg-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/30', icon: <Heart className="w-4 h-4" />, description: 'Donations, charity, extra debt payments', groupIds: [] },
        ]
    },
    {
        id: '80-20',
        name: '80/20 Rule',
        shortName: '80/20',
        description: 'The simplest approach: Save first, spend the rest',
        categories: [
            { id: 'spending', name: 'All Spending', target: 80, color: 'bg-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: <Wallet className="w-4 h-4" />, description: 'Everything else after saving', groupIds: ['needs', 'wants'] },
            { id: 'savings', name: 'Savings', target: 20, color: 'bg-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <PiggyBank className="w-4 h-4" />, description: 'Pay yourself first!', groupIds: ['savings'] },
        ]
    },
    {
        id: '60-method',
        name: '60% Solution',
        shortName: '60% Method',
        description: 'Richard Jenkins\' balanced buckets approach',
        categories: [
            { id: 'committed', name: 'Committed', target: 60, color: 'bg-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-700/50', icon: <Target className="w-4 h-4" />, description: 'Fixed expenses: bills, taxes, essentials', groupIds: ['needs'] },
            { id: 'retirement', name: 'Retirement', target: 10, color: 'bg-indigo-500', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', icon: <Landmark className="w-4 h-4" />, description: '401k, IRA contributions', groupIds: ['savings'] },
            { id: 'longterm', name: 'Long-term', target: 10, color: 'bg-cyan-500', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', icon: <GraduationCap className="w-4 h-4" />, description: 'Car fund, education, big purchases', groupIds: ['savings'] },
            { id: 'shortterm', name: 'Short-term', target: 10, color: 'bg-violet-500', bgColor: 'bg-violet-100 dark:bg-violet-900/30', icon: <Car className="w-4 h-4" />, description: 'Vacations, emergency buffer', groupIds: ['savings'] },
            { id: 'fun', name: 'Fun Money', target: 10, color: 'bg-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30', icon: <Sparkles className="w-4 h-4" />, description: 'Guilt-free spending!', groupIds: ['wants'] },
        ]
    },
    {
        id: '30-30-30-10',
        name: '30/30/30/10 Rule',
        shortName: '30/30/30/10',
        description: 'Balanced quarters with fun money focus',
        categories: [
            { id: 'housing', name: 'Housing', target: 30, color: 'bg-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: <Home className="w-4 h-4" />, description: 'Rent/mortgage, utilities', groupIds: ['needs'] },
            { id: 'necessities', name: 'Necessities', target: 30, color: 'bg-teal-500', bgColor: 'bg-teal-100 dark:bg-teal-900/30', icon: <Target className="w-4 h-4" />, description: 'Food, transport, insurance', groupIds: ['needs'] },
            { id: 'goals', name: 'Financial Goals', target: 30, color: 'bg-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <PiggyBank className="w-4 h-4" />, description: 'Savings, investments, debt', groupIds: ['savings'] },
            { id: 'wants', name: 'Wants', target: 10, color: 'bg-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: <Gift className="w-4 h-4" />, description: 'Entertainment, treats', groupIds: ['wants'] },
        ]
    },
    {
        id: 'pay-yourself-first',
        name: 'Pay Yourself First',
        shortName: 'Save First',
        description: 'Aggressive saver: 30% savings minimum',
        categories: [
            { id: 'savings', name: 'Savings First', target: 30, color: 'bg-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <PiggyBank className="w-4 h-4" />, description: 'Save before anything else!', groupIds: ['savings'] },
            { id: 'needs', name: 'Essential Needs', target: 50, color: 'bg-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: <Home className="w-4 h-4" />, description: 'Fixed costs and essentials', groupIds: ['needs'] },
            { id: 'wants', name: 'Lifestyle', target: 20, color: 'bg-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: <ShoppingBag className="w-4 h-4" />, description: 'What\'s left for fun', groupIds: ['wants'] },
        ]
    }
];

interface DashboardProps {
    context: FinancialContext;
}






const HandDrawnCoin = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Sketchy Circle */}
        <path d="M50 5 C25 5 5 25 5 50 C5 75 25 95 50 95 C75 95 95 75 95 50 C95 25 75 5 50 5" strokeWidth="2" />
        <path d="M48 7 C28 9 9 28 7 48 C5 70 22 92 48 93 C72 94 92 78 93 52" strokeWidth="1" className="opacity-70" />

        {/* Sketchy Dollar Sign - Corrected S Curve */}
        <path d="M50 20 V80" strokeWidth="6" />
        <path d="M65 30 C65 30 60 20 50 20 C35 20 35 40 50 50 C65 60 65 80 50 80 C40 80 35 70 35 70" strokeWidth="6" />
        <path d="M68 30 C68 30 62 18 50 18 C38 18 38 38 50 48 C62 58 62 78 50 78 C38 78 32 68 32 68" strokeWidth="2" className="opacity-70" />
    </svg>
);

// Pattern removed per user request


const ComparisonTooltip = ({ active, payload, currency }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl text-sm z-50 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                    <p className="font-bold text-slate-700 dark:text-white">{data.name}</p>
                </div>
                <div className="text-slate-600 dark:text-slate-300 space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Income</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">+{currency} {data.Income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">-{currency} {data.Expense.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const Dashboard: React.FC<DashboardProps> = ({ context }) => {
    const { groups, transactions, userProfile, totalAvailable, readyToAssign, themeClasses, currentMonth } = context;

    // Selected budget ratio
    const [selectedRatioId, setSelectedRatioId] = useState<BudgetRatioId>('50-30-20');
    const [showRatioDropdown, setShowRatioDropdown] = useState(false);
    const selectedRatio = BUDGET_RATIOS.find(r => r.id === selectedRatioId) || BUDGET_RATIOS[0];

    // Tip rotation state
    const [tipIndex, setTipIndex] = useState(() => new Date().getDate() % FINANCIAL_TIPS.length);
    const [tipFading, setTipFading] = useState(false);

    // Collapsible sections state
    const [expanded, setExpanded] = useState({ goal: true, tips: true, trends: true });
    const toggle = (key: keyof typeof expanded) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    // Auto-rotate tips every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTipFading(true);
            setTimeout(() => {
                setTipIndex(prev => (prev + 1) % FINANCIAL_TIPS.length);
                setTipFading(false);
            }, 300);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const nextTip = () => {
        setTipFading(true);
        setTimeout(() => {
            setTipIndex(prev => (prev + 1) % FINANCIAL_TIPS.length);
            setTipFading(false);
        }, 150);
    };

    const prevTip = () => {
        setTipFading(true);
        setTimeout(() => {
            setTipIndex(prev => (prev - 1 + FINANCIAL_TIPS.length) % FINANCIAL_TIPS.length);
            setTipFading(false);
        }, 150);
    };

    // --- LOGIC: CALCULATE STATS ---
    const [year, month] = currentMonth.split('-').map(Number);
    const selectedMonthDate = new Date(year, month - 1);
    const selectedMonthName = selectedMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Privacy Mode
    const isPrivacyMode = context.userProfile.preferences?.privacyMode || false;

    // Calculate true total cash on hand (Available in Categories + Unassigned in RTA)
    const totalCash = totalAvailable + readyToAssign;
    // Combined budget data - both allocation AND spending per group
    const budgetData = useMemo(() => {
        // Calculate totals per group
        let needsAllocated = 0, wantsAllocated = 0, savingsAllocated = 0;
        let needsSpent = 0, wantsSpent = 0, savingsSpent = 0;

        // Helper to classify group
        const classifyGroup = (groupId: string, groupName: string): 'needs' | 'wants' | 'savings' => {
            const key = (groupId + ' ' + groupName).toLowerCase();
            if (key.includes('need') || key.includes('bill') || key.includes('essential')) return 'needs';
            if (key.includes('saving') || key.includes('debt') || key.includes('invest')) return 'savings';
            return 'wants';
        };

        // Sum allocations by group
        context.categories.forEach(cat => {
            const group = groups.find(g => g.id === cat.groupId);
            if (!group) return;

            const allocated = cat.assignedCurrent || 0;
            const type = classifyGroup(group.id, group.name);

            if (type === 'needs') needsAllocated += allocated;
            else if (type === 'savings') savingsAllocated += allocated;
            else wantsAllocated += allocated;
        });

        // Sum spending by group (current month expenses)
        transactions
            .filter(t => t.date.startsWith(currentMonth) && t.amount < 0)
            .forEach(t => {
                const cat = context.categories.find(c => c.id === t.categoryId);
                if (!cat) return;
                const group = groups.find(g => g.id === cat.groupId);
                if (!group) return;

                const type = classifyGroup(group.id, group.name);
                const amount = Math.abs(t.amount);

                if (type === 'needs') needsSpent += amount;
                else if (type === 'savings') savingsSpent += amount;
                else wantsSpent += amount;
            });

        const totalAllocated = needsAllocated + wantsAllocated + savingsAllocated;
        const totalSpent = needsSpent + wantsSpent + savingsSpent;

        return {
            totalAllocated,
            totalSpent,
            needs: { allocated: needsAllocated, spent: needsSpent },
            wants: { allocated: wantsAllocated, spent: wantsSpent },
            savings: { allocated: savingsAllocated, spent: savingsSpent },
        };
    }, [transactions, currentMonth, context.categories, groups]);

    const getCategoryName = (id: string) => {
        return context.categories.find(c => c.id === id)?.name || 'Unknown';
    };

    // Trends Data - Last 6 Months relative to selected month - Memoized
    const trendData = useMemo(() => {
        const data = [];

        // Include selected month (index 0) and 5 previous
        for (let i = 5; i >= 0; i--) {
            const d = new Date(year, month - 1 - i, 1);
            const mStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            const mLabel = d.toLocaleString('default', { month: 'short' });

            const income = transactions
                .filter(t => t.date.startsWith(mStr) && t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = transactions
                .filter(t => t.date.startsWith(mStr) && t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            data.push({ name: mLabel, Income: income, Expense: expense });
        }
        return data;
    }, [transactions, currentMonth]);




    const { savingsRate } = useMemo(() => {
        const mStr = `${year}-${String(month).padStart(2, '0')}`;
        const income = transactions.filter(t => t.date.startsWith(mStr) && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const expenses = Math.abs(transactions.filter(t => t.date.startsWith(mStr) && t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const savings = Math.max(0, income - expenses);
        const rate = income > 0 ? (savings / income) * 100 : 0;
        return { savingsRate: rate };
    }, [transactions, year, month]);


    // Celebration Logic
    const hasCelebratedSession = useRef(false);
    const [showCelebration, setShowCelebration] = useState(false);

    // Check Goal Completion & New Year
    const isGoalMet = !!context.userProfile.financialGoal && context.goalPercentage >= 100;
    const isNewYear = new Date().getMonth() === 0 && new Date().getDate() === 1;

    useEffect(() => {
        if ((isGoalMet || isNewYear) && !hasCelebratedSession.current) {
            hasCelebratedSession.current = true;
            setShowCelebration(true);

            // Trigger Confetti
            const duration = 3000;
            const end = Date.now() + duration;
            const frame = () => {
                confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#fbbf24', '#f59e0b', '#fff'] });
                confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#fbbf24', '#f59e0b', '#fff'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    }, [isGoalMet, isNewYear]);

    return (
        <div className="pb-4 min-h-full overflow-x-hidden">
            {/* Header - Dynamic & Personal */}
            <div className={`px-6 py-6 pb-2 border-b border-transparent bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 transition-all`}>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, <span className="underline decoration-2 decoration-emerald-200/50 dark:decoration-emerald-900/50 underline-offset-4">{userProfile.name?.split(' ')[0]}</span>.
                        </h2>
                    </div>
                    {/* Shape Shifting Blob - Abstract Aesthetic */}
                    <div
                        className={`w-8 h-8 ${themeClasses.primaryBg} shadow-lg border border-white/20 mb-1 cursor-default animate-blob opacity-80 hover:opacity-100`}
                        title="Current Theme"
                    />
                </div>
            </div>

            <div className="p-4 space-y-5">
                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Total Contentment - Premium Hero Card */}
                    <div className={`col-span-2 ${themeClasses.primaryBg} p-4 rounded-xl shadow-hard relative overflow-hidden group animate-stagger-1 text-white border-2 border-slate-900 dark:border-slate-600 transform -rotate-2 hover:rotate-0 transition-transform duration-300`}>




                        <div className="relative z-10 flex flex-col items-center justify-center text-center py-2">
                            {/* Label Capsule - Engraved Style */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 border-y border-white/30 cursor-default">
                                <Wallet className="w-3.5 h-3.5 text-white/90" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Total Contentment</span>
                            </div>

                            {/* Main Amount - Meticulous Typography */}
                            <div className="flex items-baseline justify-center gap-1 mb-5 scale-100 group-hover:scale-105 transition-transform duration-500">
                                <span className={`text-2xl opacity-60 font-medium ${isPrivacyMode ? 'blur-[6px]' : ''}`}>{userProfile.currency}</span>
                                <span className={`text-5xl sm:text-6xl font-bold tracking-tighter drop-shadow-sm ${isPrivacyMode ? 'blur-xl select-none opacity-50' : ''}`}>
                                    {totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Stats Line - Banknote Data Box Style */}
                            <div className="flex w-full max-w-sm justify-between border-t border-white/20 pt-4 px-2">
                                <div className="flex flex-col items-start">
                                    <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold mb-1">To Assign</span>
                                    <div className="flex items-center gap-1.5 font-bold text-white/90 text-sm">
                                        <ArrowUpRight className="w-3.5 h-3.5 text-white/60" />
                                        <span>{readyToAssign > 0 ? `${userProfile.currency} ${readyToAssign.toLocaleString()}` : '0.00'}</span>
                                    </div>
                                </div>

                                <div className="h-8 w-px bg-white/20"></div>

                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold mb-1">Savings Rate</span>
                                    <div className="flex items-center gap-1.5 font-bold text-white/90 text-sm">
                                        <span>{Math.round(savingsRate)}%</span>
                                        <TrendingUp className="w-3.5 h-3.5 text-white/60" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Goal Progress - Premium Card */}
                    {context.userProfile.financialGoal && context.userProfile.goalTarget > 0 && (
                        <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden animate-stagger-2">
                            {/* Header */}
                            <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center cursor-pointer" onClick={() => toggle('goal')}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${themeClasses.lightBg}`}>
                                        <Flame className={`w-5 h-5 ${themeClasses.primaryText}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Financial Goal</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{context.userProfile.financialGoal}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <div className="flex items-baseline justify-end gap-1">
                                            <span className={`text-sm text-slate-400 font-bold ${isPrivacyMode ? 'blur-[2px]' : ''}`}>{userProfile.currency}</span>
                                            <span className={`text-lg font-black text-slate-800 dark:text-white ${isPrivacyMode ? 'blur-[4px]' : ''}`}>{context.goalProgress.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-700 p-1 rounded-full border border-slate-100 dark:border-slate-600">
                                        {expanded.goal ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>
                            </div>

                            {expanded.goal && (
                                <div className="p-5 animate-fade-in-down">
                                    {/* Progress Bar */}
                                    <div className="h-5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
                                        <div
                                            className={`h-full ${themeClasses.primaryBg} transition-all duration-1000 ease-out relative`}
                                            style={{ width: `${Math.min(context.goalPercentage, 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                                            {/* Striped pattern overlay */}
                                            <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                            {Math.round(context.goalPercentage)}% Complete
                                        </span>
                                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {context.daysToGoal > 0 ? `${context.daysToGoal} days left` : 'Goal date reached!'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Celebration Notification */}
                {showCelebration && (
                    <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-2 border-indigo-500 animate-slide-up flex items-center gap-4 max-w-sm">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full shrink-0">
                            {isNewYear ? <Sparkles className="w-6 h-6 text-indigo-500" /> : <Trophy className="w-6 h-6 text-indigo-500" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                                {isNewYear ? 'Happy New Year!' : 'Goal Achieved!'}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {isNewYear ? "Here's to a prosperous year ahead!" : "You've reached your financial goal!"}
                            </p>
                        </div>
                        <button onClick={() => setShowCelebration(false)} className="text-slate-400 hover:text-slate-600 ml-2 p-1"><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* Financial Tips Card - Collapsible */}
                <div className="bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 p-5 relative overflow-hidden animate-stagger-3 mb-5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => toggle('tips')}>
                            <div className="bg-amber-100 p-2 rounded-xl border-2 border-amber-200 dark:bg-slate-700 dark:border-slate-500 shadow-sm group-hover:scale-110 transition-transform">
                                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Daily Nudge</h3>
                                <p className="text-[10px] text-slate-500 font-bold">Gentle financial advice</p>
                            </div>
                            <div className="ml-auto bg-white/50 dark:bg-black/20 p-1 rounded-full">{expanded.tips ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</div>
                        </div>
                    </div>

                    {expanded.tips && (
                        <div className="animate-fade-in-down mt-3 relative z-10">
                            <div className="glass-panel p-4 rounded-xl border border-amber-200/50 dark:border-slate-600/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-md flex-1 pr-4 leading-tight">
                                        {FINANCIAL_TIPS[tipIndex].title}
                                    </h4>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={prevTip} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-3 h-3" /></button>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center">{tipIndex + 1}/{FINANCIAL_TIPS.length}</span>
                                        <button onClick={nextTip} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-3 h-3" /></button>
                                    </div>
                                </div>
                                <div className={`transition-opacity duration-300 ${tipFading ? 'opacity-0' : 'opacity-100'}`}>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                                        {FINANCIAL_TIPS[tipIndex].text}
                                    </p>
                                </div>
                            </div>
                            <div className="h-1 bg-amber-200/30 dark:bg-slate-700 mt-3 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-300 rounded-full" style={{ width: `${((tipIndex + 1) / FINANCIAL_TIPS.length) * 100}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Best & Worst Analysis Card - Premium */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-stagger-2 group">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20`}>
                                <Activity className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Spending Highlights</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top & Bottom</p>
                            </div>
                        </div>
                        <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-md">
                            Insights
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 pt-0">
                        {/* Best (Joyful) - GREEN */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500 fill-current" />
                                <h4 className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Top Value</h4>
                            </div>
                            {transactions
                                .filter(t => t.date.startsWith(currentMonth) && t.amount < 0 && (t.sentimentScore || 5) >= 8)
                                .sort((a, b) => ((b.sentimentScore || 0) - (a.sentimentScore || 0)) || (Math.abs(b.amount) - Math.abs(a.amount)))
                                .slice(0, 3)
                                .map(t => (
                                    <div key={t.id} className="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center group transition-transform hover:scale-[1.02]">
                                        <div className="min-w-0">
                                            <p className="font-bold text-emerald-900 dark:text-white text-sm truncate group-hover:text-emerald-700 transition-colors">{t.payee}</p>
                                            <p className="text-[10px] font-bold text-emerald-600/70">{getCategoryName(t.categoryId)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600 dark:text-emerald-300 text-sm">{userProfile.currency}{Math.abs(t.amount).toLocaleString()}</p>
                                            <div className="flex items-center justify-end gap-0.5 text-[10px] font-bold text-emerald-500">
                                                <span>{t.sentimentScore}</span>
                                                <TrendingUp className="w-2.5 h-2.5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {transactions.filter(t => t.date.startsWith(currentMonth) && t.amount < 0 && (t.sentimentScore || 5) >= 8).length === 0 && (
                                <div className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-600">No high-value spends yet.</div>
                            )}
                        </div>

                        {/* Worst (Regret) - RED */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-rose-500" />
                                <h4 className="text-xs font-bold uppercase text-rose-500 tracking-wider">Review List</h4>
                            </div>
                            {transactions
                                .filter(t => t.date.startsWith(currentMonth) && t.amount < 0 && (t.sentimentScore || 5) <= 4 && !t.isEssential)
                                .sort((a, b) => ((a.sentimentScore || 10) - (b.sentimentScore || 10)) || (Math.abs(b.amount) - Math.abs(a.amount)))
                                .slice(0, 3)
                                .map(t => (
                                    <div key={t.id} className="bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg border border-rose-100 dark:border-rose-600 flex justify-between items-center group transition-transform hover:scale-[1.02]">
                                        <div className="min-w-0">
                                            <p className="font-bold text-rose-900 dark:text-rose-300 text-sm truncate group-hover:text-rose-700 dark:group-hover:text-white transition-colors">{t.payee}</p>
                                            <p className="text-[10px] font-bold text-rose-400">{getCategoryName(t.categoryId)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-rose-600 dark:text-rose-300 text-sm">{userProfile.currency}{Math.abs(t.amount).toLocaleString()}</p>
                                            <div className="flex items-center justify-end gap-0.5 text-[10px] font-bold text-rose-400">
                                                <span>{t.sentimentScore}</span>
                                                <span className="opacity-50">/10</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {transactions.filter(t => t.date.startsWith(currentMonth) && t.amount < 0 && (t.sentimentScore || 5) <= 4 && !t.isEssential).length === 0 && (
                                <div className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-600">No low-value spends found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Section break ── */}
                <div className="py-6 px-5 bg-slate-50/80 dark:bg-slate-900/40 -mx-4 border-y border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap">Budget Breakdown</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
                </div>

                {/* Budget Breakdown - Premium Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-stagger-4 relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Scale className="w-32 h-32" />
                    </div>
                    {/* Header */}
                    <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${themeClasses.lightBg}`}>
                                    <ShoppingBag className={`w-5 h-5 ${themeClasses.primaryText}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Budget Analysis</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Where your money goes</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {userProfile.currency}{budgetData.totalAllocated.toLocaleString()} <span className="text-slate-400 font-normal">budgeted</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bar Charts */}
                    <div className="p-5 space-y-5">
                        {/* Needs */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <img src="/icons/needs.png" alt="Needs" className="w-6 h-6 object-contain" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Needs</span>
                                </div>
                                <div className="text-right text-sm">
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {userProfile.currency}{budgetData.needs.allocated.toLocaleString()}
                                    </span>
                                    {budgetData.needs.spent > 0 && (
                                        <span className="text-rose-500 dark:text-rose-400 ml-2">
                                            -{userProfile.currency}{budgetData.needs.spent.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Stacked bar - Allocated (light) with Spent (dark) inside */}
                            <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                {/* Allocated bar (light pastel color) */}
                                <div
                                    className="h-full bg-blue-200 dark:bg-blue-900/50 rounded-full relative overflow-hidden transition-all duration-500"
                                    style={{ width: `${budgetData.totalAllocated > 0 ? (budgetData.needs.allocated / budgetData.totalAllocated) * 100 : 0}%` }}
                                >
                                    {/* Spent bar inside (dark saturated color - proportional to allocated) */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${budgetData.needs.allocated > 0 ? Math.min((budgetData.needs.spent / budgetData.needs.allocated) * 100, 100) : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-1.5 text-xs">
                                <span className="text-slate-400">{budgetData.totalAllocated > 0 ? Math.round((budgetData.needs.allocated / budgetData.totalAllocated) * 100) : 0}% of budget</span>
                                <span className={`font-medium ${budgetData.needs.spent > budgetData.needs.allocated ? 'text-rose-500 dark:text-rose-400' : 'text-blue-500 dark:text-blue-400'}`}>
                                    {budgetData.needs.allocated > 0 ? Math.round((budgetData.needs.spent / budgetData.needs.allocated) * 100) : 0}% used
                                </span>
                            </div>
                        </div>

                        {/* Wants */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <img src="/icons/wants.png" alt="Wants" className="w-6 h-6 object-contain" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Wants</span>
                                </div>
                                <div className="text-right text-sm">
                                    <span className="font-bold text-purple-600 dark:text-purple-400">
                                        {userProfile.currency}{budgetData.wants.allocated.toLocaleString()}
                                    </span>
                                    {budgetData.wants.spent > 0 && (
                                        <span className="text-rose-500 dark:text-rose-400 ml-2">
                                            -{userProfile.currency}{budgetData.wants.spent.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-200 dark:bg-purple-900/50 rounded-full relative overflow-hidden transition-all duration-500"
                                    style={{ width: `${budgetData.totalAllocated > 0 ? (budgetData.wants.allocated / budgetData.totalAllocated) * 100 : 0}%` }}
                                >
                                    <div
                                        className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${budgetData.wants.allocated > 0 ? Math.min((budgetData.wants.spent / budgetData.wants.allocated) * 100, 100) : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-1.5 text-xs">
                                <span className="text-slate-400">{budgetData.totalAllocated > 0 ? Math.round((budgetData.wants.allocated / budgetData.totalAllocated) * 100) : 0}% of budget</span>
                                <span className={`font-medium ${budgetData.wants.spent > budgetData.wants.allocated ? 'text-rose-500 dark:text-rose-400' : 'text-purple-500 dark:text-purple-400'}`}>
                                    {budgetData.wants.allocated > 0 ? Math.round((budgetData.wants.spent / budgetData.wants.allocated) * 100) : 0}% used
                                </span>
                            </div>
                        </div>

                        {/* Savings */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <img src="/icons/savings.png" alt="Savings" className="w-6 h-6 object-contain" />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Savings</span>
                                </div>
                                <div className="text-right text-sm">
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {userProfile.currency}{budgetData.savings.allocated.toLocaleString()}
                                    </span>
                                    {budgetData.savings.spent > 0 && (
                                        <span className="text-rose-500 dark:text-rose-400 ml-2">
                                            -{userProfile.currency}{budgetData.savings.spent.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-200 dark:bg-emerald-900/50 rounded-full relative overflow-hidden transition-all duration-500"
                                    style={{ width: `${budgetData.totalAllocated > 0 ? (budgetData.savings.allocated / budgetData.totalAllocated) * 100 : 0}%` }}
                                >
                                    <div
                                        className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${budgetData.savings.allocated > 0 ? Math.min((budgetData.savings.spent / budgetData.savings.allocated) * 100, 100) : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-1.5 text-xs">
                                <span className="text-slate-400">{budgetData.totalAllocated > 0 ? Math.round((budgetData.savings.allocated / budgetData.totalAllocated) * 100) : 0}% of budget</span>
                                <span className={`font-medium ${budgetData.savings.spent > budgetData.savings.allocated ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                    {budgetData.savings.allocated > 0 ? Math.round((budgetData.savings.spent / budgetData.savings.allocated) * 100) : 0}% used
                                </span>
                            </div>
                        </div>


                        {/* Summary footer */}
                        {budgetData.totalSpent > 0 && (
                            <div className="px-5 pb-5">
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-center border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Total spent this month: <span className="font-bold text-slate-700 dark:text-slate-200">{userProfile.currency}{budgetData.totalSpent.toLocaleString()}</span>
                                        <span className="ml-1 opacity-70">({budgetData.totalAllocated > 0 ? Math.round((budgetData.totalSpent / budgetData.totalAllocated) * 100) : 0}% of budget)</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section break ── */}
                <div className="py-6 px-5 bg-slate-50/80 dark:bg-slate-900/40 -mx-4 border-y border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap">Cash Flow</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/60" />
                </div>

                {/* Charts - Collapsible */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-stagger-5">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 cursor-pointer bg-slate-50/50 dark:bg-slate-800/50" onClick={() => toggle('trends')}>
                        <div className={`${themeClasses.lightBg} p-2 rounded-lg`}>
                            <TrendingUp className={`w-5 h-5 ${themeClasses.primaryText}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Cash Flow Trend</h3>
                            <p className="text-[10px] font-bold text-slate-400">Last 6 months</p>
                        </div>

                        <div className="ml-auto bg-white dark:bg-slate-700 p-1 rounded-full border border-slate-100 dark:border-slate-600">
                            {expanded.trends ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                    </div>
                    {expanded.trends && (
                        <div className="h-64 w-full p-0 mt-0 animate-fade-in-down">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={themeClasses.hex} stopOpacity={0.4} />
                                            <stop offset="95%" stopColor={themeClasses.hex} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                        dy={10}
                                        padding={{ left: 20, right: 20 }}
                                    />
                                    <Tooltip content={<ComparisonTooltip currency={userProfile.currency} />} cursor={{ stroke: themeClasses.hex, strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="Income"
                                        stroke={themeClasses.hex}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: themeClasses.hex }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Expense"
                                        stroke="#f43f5e"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorExpense)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>



            </div>

            {/* Dynamic Footer Quote */}
            <div className="text-center py-6 opacity-60 hover:opacity-100 transition-opacity">
                <p className="font-serif-display italic text-slate-600 dark:text-slate-400 text-sm animate-pulse-subtle">
                    {["Beware of little expenses. A small leak will sink a great ship.",
                        "A penny saved is a penny earned.",
                        "The best things in life are free.",
                        "Budgeting is telling your money where to go instead of wondering where it went.",
                        "Do not save what is left after spending, but spend what is left after saving."][new Date().getDate() % 5]}
                </p>
            </div>
        </div>

    );
};

export default Dashboard;
