import React, { useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BudgetCategory, ThemeClasses } from '../types';
import { X, Check, ArrowRight, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react';

interface PaydayRitualProps {
    readyToAssign: number;
    categories: BudgetCategory[];
    currency: string;
    themeClasses: ThemeClasses;
    currentMonth: string;
    fontClass?: string;
    onUpdateCategory: (id: string, updates: Partial<BudgetCategory>) => void;
    onClose: () => void;
}

const PaydayRitual: React.FC<PaydayRitualProps> = ({
    readyToAssign,
    categories,
    currency,
    themeClasses,
    currentMonth,
    fontClass = '',
    onUpdateCategory,
    onClose,
}) => {
    // Local allocation state — keyed by category id, value is the string input
    const [allocations, setAllocations] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        categories.forEach(c => { init[c.id] = ''; });
        return init;
    });

    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [isDone, setIsDone] = useState(false);

    // Ref map for auto-advancing focus between inputs
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // Get flat list of visible (non-collapsed) category IDs in display order
    const visibleCategoryIds = useMemo(() => {
        const ids: string[] = [];
        const groupOrder: string[] = [];
        const seen = new Set<string>();
        categories.forEach(c => {
            if (!seen.has(c.groupId)) { seen.add(c.groupId); groupOrder.push(c.groupId); }
        });
        groupOrder.forEach(gid => {
            if (!collapsedGroups.has(gid)) {
                categories.filter(c => c.groupId === gid).forEach(c => ids.push(c.id));
            }
        });
        return ids;
    }, [categories, collapsedGroups]);

    // Focus the next input when Enter is pressed
    const focusNextInput = useCallback((currentId: string) => {
        const idx = visibleCategoryIds.indexOf(currentId);
        if (idx >= 0 && idx < visibleCategoryIds.length - 1) {
            const nextId = visibleCategoryIds[idx + 1];
            inputRefs.current[nextId]?.focus();
            inputRefs.current[nextId]?.select();
        }
    }, [visibleCategoryIds]);

    // Derive unique group ids from categories (preserve order)
    const groupIds = useMemo(() => {
        const seen = new Set<string>();
        const result: string[] = [];
        categories.forEach(c => {
            if (!seen.has(c.groupId)) { seen.add(c.groupId); result.push(c.groupId); }
        });
        return result;
    }, [categories]);

    // Group name prettifier (groupId → display name)
    const groupName = (id: string) => {
        if (id === 'needs') return 'Needs';
        if (id === 'savings') return 'Savings & Debt';
        if (id === 'wants') return 'Wants';
        return id.charAt(0).toUpperCase() + id.slice(1);
    };

    // Total allocated so far in this ritual
    const totalAllocated = useMemo(() => {
        return (Object.values(allocations) as string[]).reduce((sum: number, v: string) => {
            const n = parseFloat(v);
            return sum + (isNaN(n) ? 0 : n);
        }, 0);
    }, [allocations]);

    const remaining = readyToAssign - totalAllocated;
    const isOverAllocated = remaining < -0.005;
    const isFullyAllocated = Math.abs(remaining) < 0.005;

    const handleChange = (id: string, value: string) => {
        setAllocations(prev => ({ ...prev, [id]: value }));
    };

    const handleQuickFill = (id: string) => {
        // Fill this category with whatever is remaining
        if (remaining <= 0) return;
        const current = parseFloat(allocations[id]) || 0;
        setAllocations(prev => ({ ...prev, [id]: (current + remaining).toFixed(2) }));
    };

    const handleConfirm = () => {
        // Apply all non-zero allocations
        (Object.entries(allocations) as [string, string][]).forEach(([id, val]: [string, string]) => {
            const n = parseFloat(val);
            if (!isNaN(n) && n > 0) {
                const cat = categories.find(c => c.id === id);
                if (cat) {
                    onUpdateCategory(id, {
                        assignedCurrent: (cat.assignedCurrent || 0) + n,
                    });
                }
            }
        });
        setIsDone(true);
    };

    const toggleGroup = (id: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return createPortal(
        <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4 ${fontClass}`}>
            <div className="w-full max-w-md bg-[#fffdf5] border-2 border-slate-900 rounded-2xl shadow-hard-lg flex flex-col max-h-[92dvh] overflow-hidden relative animate-slide-up">

                {/* Header strip */}
                <div className={`${themeClasses.primaryBg} px-5 py-3 flex items-center justify-between shrink-0`}>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Payday Ritual</span>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {isDone ? (
                    /* ── Success State ── */
                    <div className="flex flex-col items-center justify-center text-center p-10 gap-4">
                        <div className={`w-16 h-16 rounded-2xl ${themeClasses.lightBg} border-2 border-slate-900 flex items-center justify-center shadow-hard`}>
                            <Sparkles className={`w-8 h-8 ${themeClasses.primaryText}`} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Money assigned!</h2>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-xs">
                            Every dollar has a job. You're set for the month.
                        </p>
                        <button
                            onClick={onClose}
                            className={`mt-2 w-full ${themeClasses.primaryBg} text-white font-bold py-3 rounded-xl border-2 border-slate-900 shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2`}
                        >
                            <Check className="w-4 h-4" /> Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* RTA Banner */}
                        <div className="px-5 py-4 border-b border-slate-200 shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ready to Assign</p>
                                    <p className={`text-3xl font-black ${isOverAllocated ? 'text-rose-600' : 'text-slate-900'}`}>
                                        {currency}{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Allocated</p>
                                    <p className="text-xl font-black text-slate-600">
                                        {currency}{totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${isOverAllocated ? 'bg-rose-500' : isFullyAllocated ? 'bg-emerald-500' : themeClasses.primaryBg}`}
                                    style={{ width: `${Math.min((totalAllocated / readyToAssign) * 100, 100)}%` }}
                                />
                            </div>

                            {isOverAllocated && (
                                <div className="flex items-center gap-1.5 mt-2 text-rose-600">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <p className="text-xs font-bold">Over-allocated by {currency}{Math.abs(remaining).toFixed(2)}</p>
                                </div>
                            )}
                            {isFullyAllocated && (
                                <div className="flex items-center gap-1.5 mt-2 text-emerald-600">
                                    <Check className="w-3.5 h-3.5" />
                                    <p className="text-xs font-bold">Fully allocated — every dollar has a job!</p>
                                </div>
                            )}
                        </div>

                        {/* Category list — scrollable */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {groupIds.map(gid => {
                                const groupCats = categories.filter(c => c.groupId === gid);
                                const isCollapsed = collapsedGroups.has(gid);
                                const groupTotal = groupCats.reduce((s, c) => {
                                    const n = parseFloat(allocations[c.id]);
                                    return s + (isNaN(n) ? 0 : n);
                                }, 0);

                                return (
                                    <div key={gid} className="border-b border-slate-100 last:border-0">
                                        {/* Group header */}
                                        <button
                                            onClick={() => toggleGroup(gid)}
                                            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isCollapsed
                                                    ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                    : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{groupName(gid)}</span>
                                            </div>
                                            {groupTotal > 0 && (
                                                <span className={`text-xs font-bold ${themeClasses.primaryText}`}>
                                                    +{currency}{groupTotal.toFixed(2)}
                                                </span>
                                            )}
                                        </button>

                                        {!isCollapsed && groupCats.map(cat => {
                                            const currentAssigned = cat.assignedCurrent || 0;
                                            const inputVal = allocations[cat.id];
                                            const addAmount = parseFloat(inputVal) || 0;
                                            const newTotal = currentAssigned + addAmount;
                                            const available = cat.available || 0;

                                            return (
                                                <div key={cat.id} className="px-5 py-3 flex items-center gap-3 border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-900 text-sm truncate">{cat.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                Assigned: {currency}{currentAssigned.toLocaleString()}
                                                            </span>
                                                            {addAmount > 0 && (
                                                                <span className={`text-[10px] font-bold ${themeClasses.primaryText}`}>
                                                                    → {currency}{newTotal.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Quick-fill button */}
                                                    {remaining > 0.005 && (
                                                        <button
                                                            onClick={() => handleQuickFill(cat.id)}
                                                            className="text-[10px] font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 border border-slate-200"
                                                            title="Fill with remaining"
                                                        >
                                                            Fill
                                                        </button>
                                                    )}

                                                    {/* Amount input */}
                                                    <div className={`flex items-baseline border-b-2 transition-colors w-24 ${inputVal ? themeClasses.border : 'border-slate-200 focus-within:border-slate-400'}`}>
                                                        <span className="text-sm font-bold text-slate-400 mr-1 select-none">{currency}</span>
                                                        <input
                                                            ref={el => { inputRefs.current[cat.id] = el; }}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={inputVal}
                                                            onChange={e => handleChange(cat.id, e.target.value)}
                                                            onWheel={e => e.currentTarget.blur()}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    focusNextInput(cat.id);
                                                                }
                                                            }}
                                                            placeholder="0"
                                                            className="w-full bg-transparent outline-none text-right font-bold text-slate-900 text-sm placeholder:text-slate-300"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-slate-200 shrink-0 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all text-sm"
                            >
                                Do it later
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={totalAllocated <= 0 || isOverAllocated}
                                className={`flex-1 py-3 rounded-xl border-2 border-slate-900 font-bold text-white shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-y-0.5 active:shadow-none transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 ${themeClasses.primaryBg}`}
                            >
                                Confirm <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default PaydayRitual;
