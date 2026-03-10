
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { BudgetCategory, FinancialContext, UserProfile } from '../types';
import { Plus, ChevronDown, ChevronRight, Trash2, ChevronLeft, Lock, Pencil, AlertTriangle, Eye, EyeOff, Copy, Target, Sparkles, Trophy, Skull } from 'lucide-react';
import { getCategoryDisplayEmoji, categoryEmojis } from '../utils/categoryEmojis';
import { useHaptics } from '../hooks/useHaptics';

interface BudgetProps {
  context: FinancialContext;
  onUpdateCategory: (id: string, updates: Partial<BudgetCategory>) => void;
  onAddCategory: (groupId: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onToggleVice?: (id: string) => void; // New prop for Habit Nudge
  onMonthChange: (offset: number) => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onCopyLastMonthBudget?: () => void;
}

// Performant Input Component
const BudgetInput = ({
  value,
  onSave,
  disabled,
  currency
}: {
  value: number;
  onSave: (val: number) => void;
  disabled: boolean;
  currency: string;
}) => {
  const haptics = useHaptics();
  const [localValue, setLocalValue] = useState<string>(value === 0 ? '' : value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Sync with prop value only when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value === 0 ? '' : value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    let numVal = parseFloat(localValue);
    if (isNaN(numVal)) numVal = 0;

    // Only trigger update if changed
    if (numVal !== value) {
      haptics.medium(); // confirm assignment saved
      onSave(numVal);
    }
    setLocalValue(numVal === 0 ? '' : numVal.toString());
  };

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // If value is 0 or matches current, select all or clear for easy entry
    if (parseFloat(localValue) === 0 || localValue === '0' || localValue === '') {
      setLocalValue('');
    } else {
      e.target.select();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div className={`relative group/input transition-all rounded-md ${!disabled && 'bg-slate-100/50 dark:bg-slate-700/30 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'}`}>
      <span className={`absolute -left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 text-xs font-bold transition-opacity pointer-events-none ${isFocused ? 'opacity-100' : 'opacity-0 group-hover/input:opacity-100'}`}>
        <Pencil className="w-3 h-3" />
      </span>
      <input
        type="number"
        disabled={disabled}
        value={localValue}
        placeholder=""
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        className={`w-20 text-right bg-transparent outline-none font-bold text-lg transition-all p-1 rounded-sm ${isFocused
          ? 'border-b-2 border-slate-800 dark:border-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-600 shadow-sm placeholder:text-slate-200 dark:placeholder:text-slate-500'
          : 'border-b-2 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-500'
          }`}
      />
    </div>
  );
};

const Budget: React.FC<BudgetProps> = ({ context, onUpdateCategory, onAddCategory, onDeleteCategory, onMonthChange, onUpdateProfile, onCopyLastMonthBudget, onToggleVice }) => {
  const { groups, categories, readyToAssign, currentMonth, userProfile, themeClasses } = context;
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'category' | 'confirm-delete' | 'emoji-picker' | null>(null);
  const [tempGroupId, setTempGroupId] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null);
  const [emojiPickerCategory, setEmojiPickerCategory] = useState<{ id: string, name: string, currentEmoji?: string } | null>(null);
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');

  // Dismiss keyboard when confirm-delete modal is activated
  useEffect(() => {
    if (activeModal === 'confirm-delete') {
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [activeModal]);

  // Privacy Mode from Profile
  const isPrivacyMode = userProfile.preferences?.privacyMode || false;
  const haptics = useHaptics();


  // Format month header
  const [year, month] = currentMonth.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Navigation Constraints
  const today = new Date();
  const currentRealMonthStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  const isCurrentMonth = currentMonth === currentRealMonthStr;
  const isPastMonth = currentMonth < currentRealMonthStr;

  // Fire haptics when a category transitions to overspent or fully-funded
  const prevAvailableRef = React.useRef<Record<string, number>>({});
  useEffect(() => {
    if (!isCurrentMonth) return;
    categories.forEach(cat => {
      const prev = prevAvailableRef.current[cat.id];
      const curr = cat.available;
      if (prev !== undefined) {
        if (prev >= 0 && curr < 0) {
          haptics.warning();
        } else if (prev < cat.assignedCurrent && curr >= cat.assignedCurrent && cat.assignedCurrent > 0) {
          haptics.heavy();
        }
      }
      prevAvailableRef.current[cat.id] = curr;
    });
  }, [categories, isCurrentMonth]);

  // Check if current month has any assignments (to show copy button)
  const hasAnyAssignments = categories.some(c => (c.assignedCurrent || 0) > 0);

  // Days until next payday — only active when user has explicitly set one
  const daysUntilHorizon = useMemo(() => {
    if (!isCurrentMonth || !userProfile.nextPayday) return 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const paydayDate = new Date(userProfile.nextPayday + 'T00:00:00');
    const days = Math.round((paydayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 60 ? days : 0;
  }, [isCurrentMonth, userProfile.nextPayday]);

  const horizonLabel = 'payday';

  // Auto-cycle all eligible rows between available balance and $/day every 3s
  const [showDailyMode, setShowDailyMode] = useState(false);
  useEffect(() => {
    if (daysUntilHorizon <= 0) return;
    const id = setInterval(() => setShowDailyMode(v => !v), 3000);
    return () => clearInterval(id);
  }, [daysUntilHorizon]);

  // Check if previous month had assignments (to enable copy button)
  const prevMonthDate = new Date(parseInt(year), parseInt(month) - 2);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const prevMonthHadAssignments = categories.some(c => (c.assignments?.[prevMonthStr] || 0) > 0);

  const toggleGroup = (id: string) => {
    const newSet = new Set(collapsedGroups);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCollapsedGroups(newSet);
  };

  const handleCreate = () => {
    if (!newItemName.trim()) return;
    if (activeModal === 'category' && tempGroupId) {
      onAddCategory(tempGroupId, newItemName);
    }
    setNewItemName('');
    setActiveModal(null);
  };

  const openEmojiPicker = (cat: { id: string, name: string, emoji?: string }) => {
    setEmojiPickerCategory({ id: cat.id, name: cat.name, currentEmoji: cat.emoji });
    setNewCategoryEmoji(cat.emoji || '');
    setActiveModal('emoji-picker');
  };

  const saveEmoji = () => {
    if (emojiPickerCategory) {
      onUpdateCategory(emojiPickerCategory.id, { emoji: newCategoryEmoji || undefined });
    }
    setActiveModal(null);
    setEmojiPickerCategory(null);
  };

  return (
    <div className="pb-4 min-h-full">

      {/* Header */}
      <div className="px-4 pt-5 pb-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight underline decoration-wavy decoration-2 underline-offset-4" style={{ textDecorationColor: themeClasses.hex }}>Budget</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Envelope Planner</p>
        </div>

        {/* Month Nav */}
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 select-none">
          <button onClick={() => onMonthChange(-1)} aria-label="Previous Month" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 min-w-[120px] justify-center">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200" aria-live="polite">{monthName}</span>
            {isPastMonth && <Lock className="w-3 h-3 text-slate-400" aria-label="Locked (Past Month)" />}
          </div>
          <button
            onClick={() => !isCurrentMonth && onMonthChange(1)}
            disabled={isCurrentMonth}
            aria-label="Next Month"
            className={`p-1.5 rounded-full transition-colors ${isCurrentMonth ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Goal & RTA Section */}
      <div className="px-4 mt-6 mb-6 grid gap-4 max-w-sm mx-auto">
        {/* Goal Highlight - Prominent */}
        {userProfile.financialGoal && userProfile.goalTarget > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-1 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform relative z-10">
            <div className="bg-white dark:bg-slate-900 rounded-[4px] p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Focus Goal</span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg leading-none">{userProfile.financialGoal}</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-baseline justify-end gap-0.5">
                  <span className="text-sm opacity-60 text-slate-500">{userProfile.currency}</span>
                  <span>{context.goalProgress.toLocaleString()}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400">of {userProfile.currency}{userProfile.goalTarget.toLocaleString()}</div>
              </div>
            </div>
            {/* Progress Bar Bottom */}
            <div className="absolute bottom-0 left-1 right-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1 mx-2">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${context.goalPercentage}%` }}></div>
            </div>
          </div>
        )}

        <div className={`flex flex-col items-center justify-center p-6 border-[3px] ${readyToAssign < 0 ? 'border-rose-500 text-rose-600 dark:text-rose-400' : `${themeClasses.border} ${themeClasses.primaryText} dark:text-white`} bg-paper-dots shadow-hard rounded-xl transform rotate-1 transition-transform hover:rotate-0 relative overflow-hidden group mb-4`}>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1 border-b-2 border-current pb-0.5">
              Ready to Assign
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-bold opacity-80 ${isPrivacyMode ? 'blur-[4px]' : ''}`}>{userProfile.currency}</span>
              <span className={`text-5xl font-black ${isPrivacyMode ? 'blur-[8px]' : ''}`}>
                {readyToAssign.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Copy Last Month's Budget Button - show when no assignments yet */}
        {!isPastMonth && !hasAnyAssignments && prevMonthHadAssignments && onCopyLastMonthBudget && (
          <button
            onClick={onCopyLastMonthBudget}
            className={`w-full flex items-center justify-center gap-2 mt-1 py-2.5 px-4 rounded-lg border-2 border-dashed ${themeClasses.border} dark:border-slate-500 text-sm font-bold ${themeClasses.primaryText} dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all hover:border-solid group`}
          >
            <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Copy Last Month's Budget
          </button>
        )}
      </div>

      {/* Budget List */}
      <div className="px-4 space-y-4">
        {groups.map(group => {
          const groupCategories = categories.filter(c => c.groupId === group.id);
          const isCollapsed = collapsedGroups.has(group.id);

          return (
            <div key={group.id} className="relative">
              {/* Group Header - Not sticky anymore */}
              <div className="flex items-center justify-between py-2 px-1 mb-2">
                <button
                  className="flex items-center gap-2 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-sm"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`group-${group.id}-content`}
                  aria-label={`Toggle group ${group.name}`}
                >
                  <div className={`p-1.5 rounded-lg ${themeClasses.lightBg}`} aria-hidden="true">
                    {isCollapsed
                      ? <ChevronRight className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      : <ChevronDown className={`w-4 h-4 ${themeClasses.primaryText}`} />}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{group.name}</h3>
                </button>
                {!isPastMonth && (
                  <button
                    onClick={() => {
                      setTempGroupId(group.id);
                      setActiveModal('category');
                    }}
                    aria-label={`Add category to ${group.name}`}
                    className={`p-1.5 rounded-lg ${themeClasses.lightBg} ${themeClasses.primaryText} hover:opacity-80 transition-all`}
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Categories List - Transactions-style cards */}
              {!isCollapsed && (
                <div className="space-y-2 mb-2">
                  {/* Column Headers */}
                  <div className="flex items-center text-[10px] uppercase font-bold text-slate-400 px-3 pb-1">
                    <div className="flex-1">Category</div>
                    <div className="w-20 text-right">Assigned</div>
                    <div className="w-[85px] text-right flex items-center justify-end gap-1">
                      Available
                      {isCurrentMonth && daysUntilHorizon > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 animate-pulse ${showDailyMode ? 'bg-violet-400' : 'bg-emerald-400'}`} title={showDailyMode ? `Showing $/day until ${horizonLabel}` : 'Showing available balance'} />
                      )}
                    </div>
                  </div>

                  {groupCategories.map((cat) => {
                    const isOverspent = cat.available < 0;
                    const isFunded = cat.available > 0;
                    const percentRemaining = cat.assignedCurrent > 0
                      ? Math.max(0, Math.min(100, (cat.available / cat.assignedCurrent) * 100))
                      : 0;

                    return (
                      <div
                        key={cat.id}
                        className="relative group/row overflow-hidden bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-hard hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 transition-[transform,box-shadow,border-color] duration-150"
                      >
                        {/* Progress bar background */}
                        {isFunded && !isOverspent && (
                          <div
                            className="absolute inset-y-0 left-0 bg-emerald-50 dark:bg-emerald-900/20 transition-all duration-700 ease-out pointer-events-none rounded-xl"
                            style={{ width: `${percentRemaining}%` }}
                          />
                        )}
                        {isOverspent && (
                          <div className="absolute inset-y-0 left-0 w-full bg-rose-50 dark:bg-rose-900/20 pointer-events-none rounded-xl" />
                        )}

                        <div className="px-3 py-3 flex items-center gap-2 relative z-10">
                          {/* Emoji Button */}
                          <button
                            onClick={() => openEmojiPicker(cat)}
                            className="w-10 h-10 flex items-center justify-center rounded-full border-2 shrink-0 transition-colors shadow-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xl hover:bg-slate-50 dark:hover:bg-slate-700"
                            title="Change emoji"
                          >
                            {getCategoryDisplayEmoji(cat.name, cat.emoji)}
                          </button>

                          {/* Name + Vice badge */}
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={(e) => {
                                setExpandedCategory(prev => prev === cat.id ? null : cat.id);
                              }}
                              className="text-left w-full flex flex-col items-start min-w-0 overflow-hidden"
                              title={cat.name}
                            >
                              <span className="cat-name font-bold text-slate-900 dark:text-white text-sm truncate block group-hover/row:text-slate-700 dark:group-hover/row:text-slate-200 transition-colors">
                                {cat.name}
                              </span>
                              {cat.isVice && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-100 dark:border-rose-800 px-1.5 py-0.5 rounded mt-0.5">
                                  <Skull className="w-2.5 h-2.5" />
                                  Vice
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Assigned Input */}
                          <div className="shrink-0">
                            <BudgetInput
                              value={cat.assignedCurrent}
                              disabled={isPastMonth}
                              onSave={(val) => onUpdateCategory(cat.id, { assignedCurrent: val })}
                              currency={userProfile.currency}
                            />
                          </div>

                          {/* Available Amount — auto-cycles between balance and $/day */}
                          {(() => {
                            const canCycle = !isOverspent && daysUntilHorizon > 0 && cat.available > 0;
                            const showDaily = canCycle && showDailyMode;
                            const dailyRate = daysUntilHorizon > 0 ? cat.available / daysUntilHorizon : 0;
                            return (
                              <div className="min-w-[80px] text-right shrink-0 relative flex flex-col items-end">
                                <span
                                  className={`font-black text-sm transition-all duration-500 ${isOverspent ? 'text-rose-600 dark:text-rose-400' :
                                    isFunded ? 'text-emerald-600 dark:text-emerald-400' :
                                      'text-slate-400 dark:text-slate-500'
                                    } ${isPrivacyMode ? 'blur-[6px] select-none' : ''}`}
                                >
                                  {showDaily
                                    ? `${userProfile.currency}${dailyRate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/day`
                                    : `${userProfile.currency}${cat.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  }
                                </span>
                                {/* Tiny mode dots — shown when cycling is active */}
                                {canCycle && (
                                  <span className="flex gap-[3px] mt-0.5">
                                    <span className={`w-1 h-1 rounded-full transition-colors duration-500 ${!showDaily ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-600'}`} />
                                    <span className={`w-1 h-1 rounded-full transition-colors duration-500 ${showDaily ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-600'}`} />
                                  </span>
                                )}
                                {isOverspent && (
                                  <svg className="absolute -top-1 -left-1 w-[110%] h-[130%] pointer-events-none z-0 text-rose-400" viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <path d="M10,20 Q30,5 90,20 Q95,25 90,30 Q50,45 10,30 Q5,25 10,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="100 10" />
                                  </svg>
                                )}
                              </div>
                            );
                          })()}

                        </div>

                        {/* Expandable actions per category */}
                        <div className={`relative z-10 grid transition-[grid-template-rows] duration-200 ${expandedCategory === cat.id ? 'grid-rows-[1fr] border-t border-slate-100 dark:border-slate-700/50' : 'grid-rows-[0fr]'}`}>
                          <div className="overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 flex flex-wrap justify-between items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 hidden sm:inline">Category Options</span>
                              <div className="flex gap-2 w-full sm:w-auto justify-end">
                                {!isPastMonth && (
                                  <>
                                    <button
                                      onClick={() => {
                                        if (onToggleVice) {
                                          if (!userProfile.financialGoal || !userProfile.goalCategoryId) {
                                            alert("Hey! You need to set a Financial Goal in the Settings tab first, so Nudge knows where to send the money!");
                                            return;
                                          }

                                          onToggleVice(cat.id);
                                          if (!cat.isVice) {
                                            alert("Marked as Habit Nudge Category!\nSpending in '" + cat.name + "' will auto-transfer a 'Nudge' amount to your Goal.");
                                          }
                                        }
                                      }}
                                      className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors text-xs font-bold flex-1 sm:flex-none justify-center ${cat.isVice ? 'text-rose-500 border-rose-200' : 'text-slate-500 hover:text-rose-500 hover:border-rose-200'}`}
                                    >
                                      <Skull className="w-4 h-4" />
                                      {cat.isVice ? 'Disable Nudge' : 'Enable Nudge'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                                          document.activeElement.blur();
                                        }
                                        setCategoryToDelete({ id: cat.id, name: cat.name });
                                        setActiveModal('confirm-delete');
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors text-xs font-bold flex-1 sm:flex-none justify-center"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {groupCategories.length === 0 && (
                    <div className="p-10 text-center text-slate-400 text-lg italic border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                      Nothing here yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* Creation Modal */}
      {
        activeModal === 'category' && createPortal(
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#fffdf5] dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-600 rounded-lg w-full max-w-sm p-6 shadow-hard-lg relative animate-slide-up">
              {/* Sticky Tape Modal */}
              <div className="washi-tape absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-slate-200/90 dark:bg-slate-600/90 rotate-1 shadow-sm border-l border-r border-slate-300 dark:border-slate-500"></div>

              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className={`w-12 h-12 ${themeClasses.lightBg} border-2 border-slate-900 dark:border-slate-700 rounded-full flex items-center justify-center`}>
                  <Plus className={`w-6 h-6 ${themeClasses.primaryText}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Category</h3>
                </div>
              </div>

              <input
                autoFocus
                type="text"
                placeholder="Write name here..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className={`w-full p-3 bg-white dark:bg-slate-700 border-2 border-slate-900 dark:border-slate-600 rounded-md text-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-500 mb-8 shadow-inner`}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setNewItemName('');
                  }}
                  className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  aria-label="Save new item"
                  className={`flex-1 py-3 text-white font-bold rounded-lg border-2 border-slate-900 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all ${themeClasses.primaryBg}`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Delete Confirmation Modal */}
      {
        activeModal === 'confirm-delete' && categoryToDelete && createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
            role="alertdialog"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <div className="bg-[#fffdf5] dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-600 rounded-lg w-full max-w-sm p-6 shadow-hard-lg relative animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center border-2 border-rose-300 dark:border-rose-700">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 id="delete-dialog-title" className="text-xl font-bold text-slate-900 dark:text-white">Delete Category?</h3>
                  <p id="delete-dialog-description" className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
                    "{categoryToDelete.name}" will be permanently removed.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-700/50">
                ⚠️ Any transactions in this category will become uncategorized.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setCategoryToDelete(null);
                  }}
                  className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteCategory(categoryToDelete.id);
                    setActiveModal(null);
                    setCategoryToDelete(null);
                  }}
                  className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-lg border-2 border-slate-900 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Emoji Picker Modal */}
      {activeModal === 'emoji-picker' && emojiPickerCategory && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffdf5] dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-600 rounded-lg w-full max-w-sm p-6 shadow-hard-lg relative animate-slide-up">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
              Choose Emoji
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
              For "{emojiPickerCategory.name}"
            </p>

            {/* Current Selection */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-4xl">
                {newCategoryEmoji || '❓'}
              </div>
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 mb-4">
              {categoryEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => setNewCategoryEmoji(emoji)}
                  className={`w-8 h-8 flex items-center justify-center text-xl rounded-lg transition-all ${newCategoryEmoji === emoji
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 scale-110'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Clear Option */}
            <button
              onClick={() => setNewCategoryEmoji('')}
              className="w-full py-2 mb-4 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Remove emoji
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEmojiPickerCategory(null);
                }}
                className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border-2 border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={saveEmoji}
                className={`flex-1 py-3 text-white font-bold rounded-lg border-2 border-slate-900 shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all ${themeClasses.primaryBg}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div >
  );
};

export default Budget;
