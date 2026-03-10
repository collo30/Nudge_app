import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile } from '../types';
import { Search, ArrowRight, Lock, ShieldCheck, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import NudgeLogo from './NudgeLogo';

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

const ALL_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'United States Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
];

const STEPS = [
  { label: 'Welcome', color: 'bg-emerald-500' },
  { label: 'You', color: 'bg-indigo-500' },
  { label: 'Security', color: 'bg-violet-500' },
  { label: 'Setup', color: 'bg-amber-500' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState(ALL_CURRENCIES.find(c => c.code === 'USD') || ALL_CURRENCIES[0]);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enablePin, setEnablePin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  useEffect(() => {
    const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');
    metaThemeColors.forEach(meta => meta.setAttribute('content', '#fffdf5'));
  }, []);

  useEffect(() => {
    try {
      const guess = Intl.NumberFormat().resolvedOptions().currency;
      if (guess) {
        const found = ALL_CURRENCIES.find(c => c.code === guess);
        if (found) setCurrency(found);
      }
    } catch (e) { }
  }, []);

  const filteredCurrencies = useMemo(() =>
    ALL_CURRENCIES.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const handleNext = () => {
    if (step === 1 && !name) return;
    if (step === 2 && enablePin) {
      if (pin.length !== 4 || pin !== confirmPin) return;
    }
    if (step === 3) {
      const startBalance = balance === '' ? 0 : parseFloat(balance);
      onComplete({
        name,
        currency: currency.symbol,
        currencyCode: currency.code,
        startingBalance: isNaN(startBalance) ? 0 : startBalance,
        pin: enablePin ? pin : undefined,
        isOnboarded: true
      });
      return;
    }
    setStep(prev => prev + 1);
  };

  const accentColor = STEPS[step]?.color ?? 'bg-emerald-500';

  return (
    <div className="fixed inset-0 z-50 bg-[#fffdf5] flex flex-col items-center justify-center p-4 overflow-hidden">

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 bg-paper-dots opacity-60 pointer-events-none" />

      {/* Top color accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor} transition-colors duration-500`} />

      {/* Progress steps */}
      {step > 0 && (
        <div className="absolute top-6 left-0 right-0 flex justify-center gap-1.5 z-10">
          {STEPS.slice(1).map((s, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i < step - 1 ? 'w-8 bg-slate-300' :
              i === step - 1 ? `w-8 ${s.color}` :
                'w-4 bg-slate-200'
              }`} />
          ))}
        </div>
      )}

      {/* ── Step 0: Hero ── */}
      {step === 0 && (
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm animate-slide-up">
          {/* Logo */}
          <div className="w-20 h-20 bg-white border-2 border-slate-900 rounded-2xl shadow-hard-lg flex items-center justify-center mb-8 overflow-hidden">
            <NudgeLogo className="w-14 h-14" />
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
            Nudge
          </h1>
          <p className="text-slate-500 font-bold mb-10 leading-relaxed max-w-xs">
            Simple, private budgeting. No accounts, no cloud — just you and your money.
          </p>

          {/* Hero stat strip — like the dashboard's Total Contentment sub-row */}
          <div className="w-full bg-white border-2 border-slate-900 rounded-xl shadow-hard mb-8 overflow-hidden">
            <div className="bg-emerald-500 px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Why Nudge?</span>
            </div>
            <div className="grid grid-cols-3 divide-x-2 divide-slate-900">
              {[['100%', 'Private'], ['0', 'Servers'], ['∞', 'Free']].map(([val, label]) => (
                <div key={label} className="flex flex-col items-center py-3 px-2">
                  <span className="text-xl font-black text-slate-900">{val}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full group bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl text-lg border-2 border-slate-900 shadow-hard hover:shadow-hard-lg hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* ── Steps 1-3: Card layout ── */}
      {step > 0 && (
        <div className="relative z-10 w-full max-w-sm animate-slide-up">
          <div className="bg-white border-2 border-slate-900 rounded-xl shadow-hard-lg overflow-hidden">

            {/* Card color header strip */}
            <div className={`${accentColor} px-5 py-3 flex items-center justify-between`}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                {step === 1 ? 'Step 1 — Identity' : step === 2 ? 'Step 2 — Security' : 'Step 3 — Setup'}
              </span>
              <span className="text-[10px] font-bold text-white/70">{step} / 3</span>
            </div>

            <div className="p-6">
              {/* ── Step 1: Name ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">What's your name?</h2>
                    <p className="text-sm font-bold text-slate-400">We'll use this to personalise your experience.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                    <div className={`flex items-baseline border-b-2 transition-colors ${name ? 'border-indigo-500' : 'border-slate-300 focus-within:border-indigo-500'}`}>
                      <input
                        autoFocus type="text" value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleNext()}
                        className="flex-1 py-2 bg-transparent outline-none text-2xl font-bold text-slate-900 placeholder:text-slate-300"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNext} disabled={!name}
                    className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl border-2 border-slate-900 shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Step 2: Security ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Secure your data</h2>
                    <p className="text-sm font-bold text-slate-400">Everything stays on this device. Always.</p>
                  </div>

                  {/* Privacy notice — like dashboard's info strip */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-sm font-bold text-slate-600 leading-relaxed">
                      No servers, no tracking. Your data is stored locally on this device only.
                    </p>
                  </div>

                  {/* PIN toggle */}
                  <div className="flex items-center justify-between py-3 border-b-2 border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Enable App Lock</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">4-digit PIN</p>
                    </div>
                    <button
                      onClick={() => setEnablePin(!enablePin)}
                      className={`w-12 h-6 rounded-full border-2 border-slate-900 relative transition-colors duration-200 ${enablePin ? 'bg-violet-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-slate-300 shadow transition-all duration-200 ${enablePin ? 'left-[calc(100%-18px)]' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {enablePin && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Create PIN</label>
                        <input
                          type="password" maxLength={4} value={pin}
                          onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full py-2 bg-transparent border-b-2 border-slate-300 focus:border-violet-500 outline-none text-center text-3xl tracking-[0.5em] text-slate-900 font-sans font-bold transition-colors"
                          placeholder="••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm PIN</label>
                        <input
                          type="password" maxLength={4} value={confirmPin}
                          onChange={e => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                          className={`w-full py-2 bg-transparent border-b-2 outline-none text-center text-3xl tracking-[0.5em] font-sans font-bold transition-colors ${confirmPin && pin !== confirmPin ? 'border-rose-500 text-rose-600' :
                            confirmPin && pin === confirmPin ? 'border-emerald-500 text-emerald-600' :
                              'border-slate-300 focus:border-violet-500 text-slate-900'
                            }`}
                          placeholder="••••"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleNext}
                    disabled={enablePin && (pin.length !== 4 || pin !== confirmPin)}
                    className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl border-2 border-slate-900 shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Step 3: Currency & Balance ── */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Almost there</h2>
                    <p className="text-sm font-bold text-slate-400">Set your currency and starting balance.</p>
                  </div>

                  {/* Currency */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Currency</label>
                    <button
                      onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                      className="w-full flex items-center justify-between py-2 border-b-2 border-slate-300 hover:border-amber-500 focus:border-amber-500 transition-colors outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-sans">{currency.code}</span>
                        <span className="font-bold text-slate-900">{currency.name}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCurrencyOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-slate-900 rounded-xl shadow-hard-lg max-h-52 overflow-y-auto z-50 animate-fade-in custom-scrollbar">
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-2">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-amber-500 transition-colors">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              autoFocus type="text" placeholder="Search currency..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                        {filteredCurrencies.map(c => (
                          <button key={c.code}
                            onClick={() => { setCurrency(c); setIsCurrencyOpen(false); setSearchQuery(''); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors"
                          >
                            <span className="font-bold text-slate-800 text-sm">{c.name}</span>
                            <span className="text-xs font-bold text-slate-400 font-sans">{c.code}</span>
                          </button>
                        ))}
                        {filteredCurrencies.length === 0 && (
                          <div className="p-4 text-center text-sm font-bold text-slate-400">No results</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Balance — like the amount field in the transaction modal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Starting Balance</label>
                    <div className="flex items-baseline border-b-2 border-slate-300 focus-within:border-amber-500 transition-colors">
                      <span className="font-bold text-2xl mr-2 text-slate-400 select-none">{currency.symbol}</span>
                      <input
                        type="number" value={balance}
                        onChange={e => setBalance(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleNext()}
                        className="flex-1 py-2 bg-transparent outline-none text-3xl font-bold text-slate-900 placeholder:text-slate-300"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-2">You can adjust this anytime in Settings.</p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-xl border-2 border-slate-900 shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                    Start Budgeting
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
