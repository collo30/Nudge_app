import React, { useState } from 'react';
import { View } from '../types';
import { Check, ChevronRight, ChevronLeft, X, Wallet, TrendingUp, Target, Zap, ShieldCheck, Sparkles, LayoutDashboard, Ghost, Skull } from 'lucide-react';

interface WalkthroughProps {
    onComplete: () => void;
    onNavigate: (view: View) => void;
}

const steps = [
    {
        title: 'Welcome to Nudge',
        description: 'Your comprehensive, local-first budgeting companion. No bank connections, no ads — just you and your financial goals.',
        icon: Wallet,
        accent: 'bg-emerald-500',
        accentLight: 'bg-emerald-50',
        accentText: 'text-emerald-600',
        accentBorder: 'border-emerald-200',
        label: 'Getting Started',
    },
    {
        title: 'The Envelope Method',
        description: "Think of categories as envelopes. You only spend what's inside. We've digitized this powerful habit for the modern era.",
        icon: LayoutDashboard,
        accent: 'bg-indigo-500',
        accentLight: 'bg-indigo-50',
        accentText: 'text-indigo-600',
        accentBorder: 'border-indigo-200',
        label: 'Core Concept',
    },
    {
        title: 'Give Every Dollar a Job',
        description: "When you get paid, log it as Income. Move money from 'Ready to Assign' into your categories until you hit zero.",
        icon: TrendingUp,
        accent: 'bg-blue-500',
        accentLight: 'bg-blue-50',
        accentText: 'text-blue-600',
        accentBorder: 'border-blue-200',
        label: 'Step 1',
    },
    {
        title: 'Check Before Spending',
        description: "Before buying that latte, check your 'Coffee' category. If there's money, enjoy it guilt-free! If not, move money from another category first.",
        icon: Target,
        accent: 'bg-rose-500',
        accentLight: 'bg-rose-50',
        accentText: 'text-rose-600',
        accentBorder: 'border-rose-200',
        label: 'Step 2',
    },
    {
        title: 'Total Contentment',
        description: "Your Dashboard shows a 'Total Contentment' card — your exact liquid cash position and savings rate at a glance.",
        icon: Sparkles,
        accent: 'bg-amber-500',
        accentLight: 'bg-amber-50',
        accentText: 'text-amber-600',
        accentBorder: 'border-amber-200',
        label: 'Dashboard',
    },
    {
        title: 'Mindful Spending',
        description: "Rate every transaction with a Love Score. If you consistently rate a payee poorly, the Pause Nudge will gently warn you before you buy again.",
        icon: Ghost,
        accent: 'bg-purple-500',
        accentLight: 'bg-purple-50',
        accentText: 'text-purple-600',
        accentBorder: 'border-purple-200',
        label: 'Smart Feature',
    },
    {
        title: 'The Habit Nudge',
        description: "Trying to quit a bad habit? Mark a category as a Vice. Every time you spend there, we gently nudge a small amount straight to your Goal.",
        icon: Skull,
        accent: 'bg-rose-600',
        accentLight: 'bg-rose-50',
        accentText: 'text-rose-700',
        accentBorder: 'border-rose-200',
        label: 'Habit Nudge',
    },
    {
        title: 'Recur & Automate',
        description: "Have monthly bills? Set up Recurring Transactions in the Log tab. We handle the boring stuff automatically.",
        icon: Zap,
        accent: 'bg-violet-500',
        accentLight: 'bg-violet-50',
        accentText: 'text-violet-600',
        accentBorder: 'border-violet-200',
        label: 'Automation',
    },
    {
        title: 'Your Private Vault',
        description: "Your data lives only on your device. Toggle Privacy Mode to blur balances in public, and secure it with a PIN or Biometrics.",
        icon: ShieldCheck,
        accent: 'bg-slate-700',
        accentLight: 'bg-slate-50',
        accentText: 'text-slate-700',
        accentBorder: 'border-slate-200',
        label: 'Privacy',
    },
];

const Walkthrough: React.FC<WalkthroughProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
        else finish();
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const finish = () => {
        setIsExiting(true);
        setTimeout(onComplete, 300);
    };

    const s = steps[currentStep];
    const Icon = s.icon;
    const isLast = currentStep === steps.length - 1;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={finish} />

            {/* Card — same structure as transaction modal */}
            <div className={`relative z-10 w-full max-w-sm bg-[#fffdf5] dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-600 rounded-xl shadow-hard-lg overflow-hidden flex flex-col transition-transform duration-300 animate-slide-up ${isExiting ? 'scale-95 translate-y-2' : 'scale-100'}`}>

                {/* Colored header strip — like dashboard hero card */}
                <div className={`${s.accent} px-5 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-white/90" strokeWidth={2} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-white/60">{currentStep + 1} / {steps.length}</span>
                        <button onClick={finish} className="text-white/70 hover:text-white transition-colors" aria-label="Skip">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Progress bar — segmented like the modal's type switcher */}
                <div className="flex h-1 bg-slate-100">
                    {steps.map((st, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentStep(i)}
                            className={`flex-1 transition-all duration-500 ${i <= currentStep ? st.accent : ''}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                    {/* Icon badge — like dashboard card icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${s.accentLight} border ${s.accentBorder} mb-5`}>
                        <Icon className={`w-6 h-6 ${s.accentText}`} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-xl font-black text-slate-900 mb-3 leading-tight">{s.title}</h2>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{s.description}</p>
                </div>

                {/* Footer — like modal footer with border-b separator */}
                <div className="px-6 pb-5 pt-4 border-t border-slate-200 flex justify-between items-center gap-3">
                    <button
                        onClick={handlePrev}
                        className={`flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-2 hover:bg-slate-100 rounded-lg transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    {/* Dot indicators */}
                    <div className="flex gap-1 items-center">
                        {steps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentStep(i)}
                                className={`rounded-full border border-slate-900 transition-all duration-300 ${i === currentStep ? `w-5 h-1.5 ${s.accent}` : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className={`flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-xl border-2 border-slate-900 shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg active:shadow-none active:translate-y-0.5 transition-all text-white ${s.accent}`}
                    >
                        {isLast ? (
                            <><Check className="w-4 h-4" /> Done</>
                        ) : (
                            <>Next <ChevronRight className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Walkthrough;
