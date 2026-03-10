
import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, FinancialContext, PaperType, FontType, AccentColor } from '../types';
import { User, Trash2, Target, Calendar, TrendingUp, Type, Grid, Palette, Check, Globe, CheckCircle2, Moon, Sun, X, ChevronRight, Lock, Search, Eye, EyeOff, ShieldCheck, Skull, Smartphone } from 'lucide-react';
import { DateSelector } from './MiniCalendar';
import NudgeLogo from './NudgeLogo';

// Comprehensive Currency List
const ALL_CURRENCIES = [
  { code: 'AED', symbol: 'dh', name: 'UAE Dirham' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'ANG', symbol: 'ƒ', name: 'Netherlands Antillean Guilder' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'AWG', symbol: 'ƒ', name: 'Aruban Florin' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia-Herzegovina Convertible Mark' },
  { code: 'BBD', symbol: '$', name: 'Barbadian Dollar' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  { code: 'BIF', symbol: 'FBu', name: 'Burundian Franc' },
  { code: 'BMD', symbol: '$', name: 'Bermudan Dollar' },
  { code: 'BND', symbol: '$', name: 'Brunei Dollar' },
  { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'BSD', symbol: '$', name: 'Bahamian Dollar' },
  { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CDF', symbol: 'FC', name: 'Congolese Franc' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'CUP', symbol: '₱', name: 'Cuban Peso' },
  { code: 'CVE', symbol: '$', name: 'Cape Verdean Escudo' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'ERN', symbol: 'Nfk', name: 'Eritrean Nakfa' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'FJD', symbol: '$', name: 'Fijian Dollar' },
  { code: 'FKP', symbol: '£', name: 'Falkland Islands Pound' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'GIP', symbol: '£', name: 'Gibraltar Pound' },
  { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
  { code: 'GNF', symbol: 'FG', name: 'Guinean Franc' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  { code: 'GYD', symbol: '$', name: 'Guyanaese Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'HTG', symbol: 'G', name: 'Haitian Gourde' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
  { code: 'JOD', symbol: 'د.أ', name: 'Jordanian Dinar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'KGS', symbol: 'с', name: 'Kyrgystani Som' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'KMF', symbol: 'CF', name: 'Comorian Franc' },
  { code: 'KPW', symbol: '₩', name: 'North Korean Won' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'KYD', symbol: '$', name: 'Cayman Islands Dollar' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'LAK', symbol: '₭', name: 'Laotian Kip' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'LRD', symbol: '$', name: 'Liberian Dollar' },
  { code: 'LSL', symbol: 'L', name: 'Lesotho Loti' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'MAD', symbol: 'dh', name: 'Moroccan Dirham' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
  { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary' },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
  { code: 'MMK', symbol: 'K', name: 'Myanma Kyat' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },
  { code: 'MRU', symbol: 'UM', name: 'Mauritanian Ouguiya' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa' },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
  { code: 'NAD', symbol: '$', name: 'Namibian Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Nuevo Sol' },
  { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'PYG', symbol: 'Gs', name: 'Paraguayan Guarani' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Rial' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'RSD', symbol: 'дин.', name: 'Serbian Dinar' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'SBD', symbol: '$', name: 'Solomon Islands Dollar' },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee' },
  { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'SHP', symbol: '£', name: 'Saint Helena Pound' },
  { code: 'SLE', symbol: 'Le', name: 'Sierra Leonean Leone' },
  { code: 'SOS', symbol: 'S', name: 'Somali Shilling' },
  { code: 'SRD', symbol: '$', name: 'Surinamese Dollar' },
  { code: 'SSP', symbol: '£', name: 'South Sudanese Pound' },
  { code: 'STN', symbol: 'Db', name: 'São Tomé and Príncipe Dobra' },
  { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
  { code: 'SZL', symbol: 'L', name: 'Swazi Lilangeni' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'TJS', symbol: 'SM', name: 'Tajikistani Somoni' },
  { code: 'TMT', symbol: 'T', name: 'Turkmenistani Manat' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad and Tobago Dollar' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'USD', symbol: '$', name: 'United States Dollar' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  { code: 'UZS', symbol: 'лв', name: 'Uzbekistan Som' },
  { code: 'VES', symbol: 'Bs', name: 'Venezuelan Bolívar' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu' },
  { code: 'WST', symbol: 'WS$', name: 'Samoan Tala' },
  { code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC' },
  { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar' },
  { code: 'XOF', symbol: 'CFA', name: 'CFA Franc BCEAO' },
  { code: 'XPF', symbol: '₣', name: 'CFP Franc' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'ZWL', symbol: '$', name: 'Zimbabwean Dollar' },
];

interface SettingsProps {
  context: FinancialContext;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetData: () => void;
  onShowGuide?: () => void;
}

const KenyanHolidayBadge = () => {
  const [showFlag, setShowFlag] = useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowFlag(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      <img
        src="/kenyan_flag_vibrant.png"
        alt="Kenya Flag"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${showFlag ? 'opacity-100' : 'opacity-0'}`}
      />
      <img
        src="/kenyan_holiday.png"
        alt="Kenyan Spirit"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${showFlag ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

const Settings: React.FC<SettingsProps> = ({
  context,
  onUpdateProfile,
  onResetData,
  onShowGuide
}) => {
  const { userProfile, themeClasses } = context;
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  // Filter currencies based on search
  const filteredCurrencies = useMemo(() => {
    return ALL_CURRENCIES.filter(c =>
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase())
    );
  }, [currencySearch]);

  const [feedbackMsg, setFeedbackMsg] = useState('');

  const [isEditingGoal, setIsEditingGoal] = useState(() => !(context.userProfile.financialGoal && context.userProfile.goalTarget > 0));
  const [showAboutModal, setShowAboutModal] = useState(false);

  // PIN Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const currentPaper = userProfile.theme?.paper || 'dots';
  const currentFont = userProfile.theme?.font || 'hand';
  const currentColor = userProfile.theme?.accentColor || 'amber';
  const isDarkMode = userProfile.theme?.darkMode || false;

  // Lock body scroll when modals are open
  React.useEffect(() => {
    if (showAboutModal || showCurrencyModal || showPinModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAboutModal, showCurrencyModal, showPinModal]);

  const updateTheme = (type: 'paper' | 'font' | 'accentColor' | 'darkMode', value: string | boolean) => {
    onUpdateProfile({
      theme: {
        paper: type === 'paper' ? (value as PaperType) : currentPaper,
        font: type === 'font' ? (value as FontType) : currentFont,
        accentColor: type === 'accentColor' ? (value as AccentColor) : currentColor,
        darkMode: type === 'darkMode' ? (value as boolean) : isDarkMode
      }
    });
  };

  const colors: { id: AccentColor, class: string, label: string }[] = [
    { id: 'indigo', class: 'bg-indigo-500', label: 'Indigo' },
    { id: 'emerald', class: 'bg-emerald-500', label: 'Emerald' },
    { id: 'rose', class: 'bg-rose-500', label: 'Rose' },
    { id: 'amber', class: 'bg-amber-500', label: 'Amber' },
    { id: 'violet', class: 'bg-violet-500', label: 'Violet' },
    { id: 'cyan', class: 'bg-cyan-500', label: 'Cyan' },
    { id: 'pink', class: 'bg-pink-500', label: 'Pink' },
  ];

  // Refs
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Goal Suggestions
  const goalSuggestions = [
    "Pay off credit card debt",
    "Build an emergency fund",
    "Save for a vacation",
    "Save for a house",
    "Invest for retirement",
    "Pay off student loans",
  ];


  return (
    <div className="pb-32 min-h-full animate-fade-in relative">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg font-bold animate-fade-in text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {feedbackMsg}
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Customize your experience</p>
      </div>

      <div className="p-4 space-y-6">

        {/* Appearance */}
        <section>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Appearance</p>
          <div className="space-y-2">

            {/* Accent Color card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <Palette className="w-3.5 h-3.5" /> Accent Color
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateTheme('accentColor', c.id)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${c.class} ${currentColor === c.id ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                    aria-label={c.label}
                  >
                    {currentColor === c.id && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode card */}
            <button
              onClick={() => updateTheme('darkMode', !isDarkMode)}
              className="w-full bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex items-center justify-between hover:shadow-hard hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-amber-50 border-amber-200'}`}>
                  {isDarkMode ? <Moon className="w-5 h-5 text-slate-300" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</p>
                  <p className="text-xs text-slate-400">{isDarkMode ? 'Currently dark' : 'Currently light'}</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isDarkMode ? 'translate-x-6' : ''}`} />
              </div>
            </button>

            {/* Font Style card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <Type className="w-3.5 h-3.5" /> Font Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'legible', label: 'Legible', cls: "font-['Lora'] font-semibold text-base" },
                  { id: 'hand', label: 'Handwritten', cls: "font-['Patrick_Hand'] text-lg" },
                  { id: 'sans', label: 'Clean Sans', cls: 'font-sans font-bold text-base' },
                  { id: 'serif', label: 'Elegant', cls: 'font-serif font-bold text-base' },
                  { id: 'casual', label: 'Casual', cls: 'font-casual text-lg' },
                  { id: 'cursive', label: 'Artsy', cls: 'font-cursive text-lg' },
                ].map((f) => (
                  <button key={f.id} onClick={() => updateTheme('font', f.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${currentFont === f.id ? `${themeClasses.lightBg} ${themeClasses.border} ${themeClasses.primaryText}` : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'}`}>
                    <span className={f.cls}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Type card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <Grid className="w-3.5 h-3.5" /> Paper Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[{ id: 'dots', label: 'Dots' }, { id: 'lines', label: 'Lines' }, { id: 'grid', label: 'Grid' }, { id: 'plain', label: 'Plain' }].map((opt) => (
                  <button key={opt.id} onClick={() => updateTheme('paper', opt.id)}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${currentPaper === opt.id ? `${themeClasses.lightBg} ${themeClasses.border} ${themeClasses.primaryText}` : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'}`}>
                    <div className={`w-8 h-8 rounded border shadow-sm ${isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-[#fffdf5]'} ${opt.id === 'dots' ? 'bg-paper-dots' : opt.id === 'lines' ? 'bg-paper-lines' : opt.id === 'grid' ? 'bg-paper-grid' : ''}`} />
                    <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>


        {/* Identity */}
        <section>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Identity</p>
          <div className="space-y-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-600 ${themeClasses.lightBg} shrink-0`}>
                <User className={`w-5 h-5 ${themeClasses.primaryText}`} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Display Name</label>
                <input type="text" value={userProfile.name} onChange={(e) => onUpdateProfile({ name: e.target.value })}
                  className="w-full font-bold text-slate-900 dark:text-white outline-none bg-transparent border-b border-transparent focus:border-slate-300 transition-colors text-base" />
              </div>
            </div>
            <button onClick={() => setShowCurrencyModal(true)}
              className="w-full bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex items-center gap-3 hover:shadow-hard hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center border-2 border-emerald-100 dark:border-emerald-800 shrink-0">
                <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Currency</p>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-slate-900 dark:text-white px-2 py-0.5 rounded text-xs font-mono font-bold">{userProfile.currencyCode}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{userProfile.currency}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Next Payday */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center border-2 border-violet-100 dark:border-violet-800 shrink-0">
                <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Next Payday</label>
                <input
                  type="date"
                  value={userProfile.nextPayday || ''}
                  onChange={e => onUpdateProfile({ nextPayday: e.target.value || undefined })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full font-bold text-slate-900 dark:text-white outline-none bg-transparent border-b border-transparent focus:border-slate-300 transition-colors text-sm"
                />
              </div>
              {userProfile.nextPayday && (
                <button
                  onClick={() => onUpdateProfile({ nextPayday: undefined })}
                  className="text-slate-300 hover:text-rose-400 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </section>



        {/* Privacy */}
        <section>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Privacy</p>
          <div className="space-y-2">
            {[
              { key: 'privacyMode', icon: userProfile.preferences?.privacyMode ? EyeOff : Eye, label: 'Privacy Blur', sub: 'Hide amounts across the app', active: !!userProfile.preferences?.privacyMode, toggle: () => onUpdateProfile({ preferences: { ...(userProfile.preferences || {} as any), privacyMode: !userProfile.preferences?.privacyMode } }) },
              { key: 'blurAtStartup', icon: Lock, label: 'Blur at Startup', sub: 'Always start with blurred values', active: !!userProfile.preferences?.blurAtStartup, toggle: () => onUpdateProfile({ preferences: { ...(userProfile.preferences || {} as any), blurAtStartup: !userProfile.preferences?.blurAtStartup } }) },
            ].map((item) => (
              <button key={item.key} onClick={item.toggle}
                className="w-full bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex items-center gap-3 hover:shadow-hard hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${item.active ? `${themeClasses.lightBg} border-current ${themeClasses.primaryText}` : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                  <item.icon className={`w-5 h-5 ${item.active ? themeClasses.primaryText : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${item.active ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.active ? 'translate-x-6' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Security */}
        <section>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Security</p>
          <div className="space-y-2">
            {/* PIN status card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${userProfile.pin ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                  <Lock className={`w-5 h-5 ${userProfile.pin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{userProfile.pin ? 'PIN Enabled' : 'No PIN Set'}</p>
                  <p className="text-xs text-slate-400">{userProfile.pin ? userProfile.pin.replace(/./g, '•') : 'Add a PIN for privacy'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4 digits"
                  className="flex-1 text-center font-bold tracking-widest p-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:border-slate-400 outline-none text-base" />
                <button
                  onClick={() => { if (pinInput.length === 4) { onUpdateProfile({ pin: pinInput }); setPinInput(''); setFeedbackMsg('PIN saved!'); setTimeout(() => setFeedbackMsg(''), 1500); } }}
                  disabled={pinInput.length !== 4}
                  className={`px-4 py-2.5 font-bold rounded-xl transition-all text-sm ${pinInput.length === 4 ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                  {userProfile.pin ? 'Update' : 'Set'}
                </button>
              </div>
              {userProfile.pin && (
                <button onClick={() => { onUpdateProfile({ pin: undefined, biometricEnabled: false, skipLockForWidget: false }); setPinInput(''); setFeedbackMsg('PIN removed'); setTimeout(() => setFeedbackMsg(''), 1500); }}
                  className="w-full mt-2 py-1.5 text-rose-500 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                  Remove PIN
                </button>
              )}
            </div>
            {/* Biometric card */}
            {userProfile.pin && (
              <button onClick={() => onUpdateProfile({ biometricEnabled: !userProfile.biometricEnabled })}
                className="w-full bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex items-center gap-3 hover:shadow-hard hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${userProfile.biometricEnabled ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                  <ShieldCheck className={`w-5 h-5 ${userProfile.biometricEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Fingerprint Unlock</p>
                    {!userProfile.biometricEnabled && <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">RECOMMENDED</span>}
                  </div>
                  <p className="text-xs text-slate-400">Use biometrics for faster access</p>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${userProfile.biometricEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${userProfile.biometricEnabled ? 'translate-x-6' : ''}`} />
                </div>
              </button>
            )}
          </div>
        </section>




        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goals</p>
            <button
              onClick={() => {
                if (isEditingGoal) {
                  // Ensure they don't save a half-finished goal that could cause issues
                  const isFilled = !!userProfile.financialGoal && userProfile.goalTarget > 0;
                  const isEmpty = !userProfile.financialGoal && (!userProfile.goalTarget || userProfile.goalTarget <= 0);

                  if (isFilled || isEmpty) {
                    setIsEditingGoal(false);
                  } else {
                    alert('Please provide both a Name and an Amount, or clear both fields to remove your goal.');
                  }
                } else {
                  setIsEditingGoal(true);
                }
              }}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors hover:-translate-y-0.5 shadow-sm active:translate-y-0 ${isEditingGoal ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-600'}`}
            >
              {isEditingGoal ? 'Save Goal' : 'Edit Goal'}
            </button>
          </div>

          {(() => {
            const canEdit = isEditingGoal;
            return (
              <div className={`space-y-2 relative transition-opacity ${!canEdit ? 'opacity-80 hover:opacity-100' : ''}`}>
                {/* Click overlay to easily enter edit mode */}
                {!canEdit && <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => setIsEditingGoal(true)} />}

                {/* Goal name card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-600 ${themeClasses.lightBg} shrink-0`}>
                    <Target className={`w-5 h-5 ${themeClasses.primaryText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Primary Goal</label>
                    <input type="text" disabled={!canEdit} value={userProfile.financialGoal || ''}
                      onChange={(e) => onUpdateProfile({ financialGoal: e.target.value })}
                      placeholder="Enter your financial goal..."
                      className="w-full font-bold text-slate-900 dark:text-white outline-none bg-transparent border-b border-transparent focus:border-slate-300 transition-colors disabled:cursor-not-allowed placeholder:text-slate-300 dark:placeholder:text-slate-600 text-base" />
                  </div>
                </div>

                {/* Goal suggestions */}
                {canEdit && !userProfile.financialGoal && (
                  <div className="px-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {goalSuggestions.map((suggestion) => (
                        <button key={suggestion} onClick={() => {
                          onUpdateProfile({ financialGoal: suggestion });
                          setTimeout(() => amountInputRef.current?.focus(), 50);
                        }}
                          className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-bold">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target amount card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center border-2 border-blue-100 dark:border-blue-800 shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Target Amount</label>
                    <div className="relative flex items-baseline gap-1">
                      <span className="text-slate-400 font-bold text-sm">{userProfile.currency}</span>
                      <input
                        ref={amountInputRef}
                        type="number" disabled={!canEdit} value={userProfile.goalTarget || ''}
                        onChange={(e) => onUpdateProfile({ goalTarget: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        placeholder="0.00"
                        className="flex-1 font-bold text-slate-900 dark:text-white outline-none bg-transparent border-b border-transparent focus:border-slate-300 transition-colors disabled:cursor-not-allowed placeholder:text-slate-300 text-base" />
                    </div>
                  </div>
                </div>

                {/* Target date card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm p-4">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5" /> Target Date
                  </label>
                  <div className={!canEdit ? 'pointer-events-none opacity-50' : ''}>
                    <DateSelector value={userProfile.goalDate || ''} onChange={(d) => onUpdateProfile({ goalDate: d })} />
                  </div>
                </div>

                {/* Habit Nudge card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-rose-100 dark:border-rose-900/30 shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center border-2 border-rose-100 dark:border-rose-800 shrink-0">
                      <Skull className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Habit Nudge Rate</p>
                      <p className="text-xs text-slate-400">Gentle auto-transfer for restricted spending</p>
                    </div>
                    <span className="font-black text-lg text-rose-500">{userProfile.preferences?.viceTaxPercentage || 10}%</span>
                  </div>
                  <input type="range" min="1" max="100" step="1" disabled={!canEdit}
                    value={userProfile.preferences?.viceTaxPercentage || 10}
                    onChange={(e) => onUpdateProfile({ preferences: { ...(userProfile.preferences || {} as any), viceTaxPercentage: parseInt(e.target.value) } })}
                    className={`w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    <span>1% (Light)</span><span>50% (Firm)</span><span>100% (Strong)</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Data */}
        <section>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Data</p>
          <button
            onClick={() => { if (confirm("Tear out all pages? This will wipe your history permanently.")) { onResetData(); } }}
            className="w-full bg-white dark:bg-slate-800 rounded-xl border-2 border-rose-100 dark:border-rose-900/30 shadow-sm p-4 flex items-center gap-3 hover:shadow-hard hover:-translate-y-0.5 hover:border-rose-300 dark:hover:border-rose-700 transition-all group"
          >
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center border-2 border-rose-100 dark:border-rose-800 shrink-0 group-hover:bg-rose-100 transition-colors">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-rose-600 dark:text-rose-400 text-sm">Burn Journal</p>
              <p className="text-xs text-rose-400 dark:text-rose-500">Reset all data permanently</p>
            </div>
          </button>
        </section>

        {/* About */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[22px] shadow-hard border-2 border-slate-900 mb-4 overflow-hidden bg-black relative">
            {(() => {
              const today = new Date();
              const m = today.getMonth(); // 0-11
              const d = today.getDate();
              // Madaraka (June 1), Utamaduni (Oct 10), Mashujaa (Oct 20), Jamhuri (Dec 12)
              const isKenyanHoliday = (m === 5 && d === 1) || (m === 9 && d === 10) || (m === 9 && d === 20) || (m === 11 && d === 12);

              if (isKenyanHoliday) {
                return <KenyanHolidayBadge />;
              }
              return <NudgeLogo className="w-full h-full" />;
            })()}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Nudge</h3>
          <div className="mt-2 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created By</p>
            <a href="mailto:collinscherry30@gmail.com" className="bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500 bg-[length:300%_auto] animate-[shimmer_4s_linear_infinite] bg-clip-text text-transparent font-black text-xl hover:scale-110 transition-transform inline-block">
              Collins Cheruiyot
            </a>
            <div className="flex flex-col items-center mt-1 space-y-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('collinscherry30@gmail.com');
                  setFeedbackMsg('Email Copied!');
                  setTimeout(() => setFeedbackMsg(''), 2000);
                }}
                className="text-[10px] text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 group"
              >
                collinscherry30@gmail.com
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">📋</span>
              </button>
              {feedbackMsg === 'Email Copied!' && (
                <span className="text-[10px] font-bold text-emerald-500 animate-fade-in">
                  ✓ Copied to clipboard
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setShowAboutModal(true)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
            >
              About & Privacy
            </button>

            {onShowGuide && (
              <button
                onClick={onShowGuide}
                className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline underline-offset-4 decoration-2 decoration-slate-300 dark:decoration-slate-600 transition-colors"
              >
                View User Guide
              </button>
            )}
          </div>
        </div>

        {/* About Modal */}
        {
          showAboutModal && createPortal(
            <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#fffdf5] dark:bg-slate-800 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative animate-slide-up">
                <div className="sticky top-0 z-10 p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">About Nudge</h2>
                  <button onClick={() => setShowAboutModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <div className="p-6 space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-center">
                  <div>
                    <div className="flex flex-col items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-1">
                        <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Local-First Privacy</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Your Data, Your Device</p>
                      </div>
                    </div>
                    <p className="max-w-sm mx-auto">Nudge is built on a <strong>Local-First</strong> architecture. Your financial data lives exclusively on your device. We do not track, store, or sell your information. It never leaves your phone.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs uppercase">No Cloud Sync</span>
                      </div>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">Data stays offline.</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs uppercase">No Sign Up</span>
                      </div>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">Just start budgeting.</p>
                    </div>
                  </div>

                  <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center">
                    <div className="inline-flex items-center justify-center gap-2 font-bold text-amber-800 dark:text-amber-400 uppercase text-xs tracking-wider mb-2">
                      <span className="text-lg">💡</span> Disclaimer
                    </div>
                    <p className="text-xs text-amber-900/70 dark:text-amber-200/70 leading-relaxed max-w-sm mx-auto">
                      The financial tips and "wisdom nuggets" provided are for entertainment and motivation. Please verify with a professional before making major financial decisions.
                    </p>
                  </div>

                  <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-bold text-slate-400">Version 2.0 • Crafted with ❤️</p>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">© 2026 Nudge</p>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        }


      </div >



      {/* Currency Modal */}
      {
        showCurrencyModal && createPortal(
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#fffdf5] dark:bg-slate-800 w-full max-w-md rounded-2xl border-2 border-slate-900 shadow-hard-lg max-h-[80vh] flex flex-col overflow-hidden relative animate-slide-up">
              <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select Currency</h2>
                <button onClick={() => { setShowCurrencyModal(false); setCurrencySearch(''); }}>
                  <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search currencies..."
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    className="bg-transparent w-full outline-none font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Currency List */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredCurrencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onUpdateProfile({ currency: c.symbol, currencyCode: c.code });
                      setShowCurrencyModal(false);
                      setCurrencySearch('');
                      setFeedbackMsg('Currency updated!');
                      setTimeout(() => setFeedbackMsg(''), 1500);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${userProfile.currencyCode === c.code
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-yellow-200 text-slate-900 px-2 py-1 rounded border border-slate-900 text-sm font-mono font-bold">
                        {c.code}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-500">{c.symbol}</span>
                      {userProfile.currencyCode === c.code && (
                        <Check className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </button>
                ))}
                {filteredCurrencies.length === 0 && (
                  <p className="text-center text-slate-400 py-8 font-bold">No currencies found</p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      }


      {/* PIN Modal - Simple 4 Box Style */}
      {
        showPinModal && createPortal(
          <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 w-full max-w-sm rounded-3xl border border-slate-700/50 shadow-2xl p-8 relative animate-slide-up">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50 shadow-lg">
                  <Lock className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {userProfile.pin ? 'Change PIN' : 'Set New PIN'}
                </h2>
                <p className="text-sm text-slate-400 mt-2">Enter a 4-digit PIN</p>
              </div>

              {/* 4 Box PIN Display */}
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-all ${pinInput.length > i
                      ? 'border-emerald-400 bg-emerald-400/10 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                      : 'border-slate-600 bg-slate-800/50'
                      }`}
                  >
                    {pinInput.length > i ? '•' : ''}
                  </div>
                ))}
              </div>

              {/* Native keyboard input */}
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full text-center text-3xl font-bold tracking-[0.5em] p-4 border-2 border-slate-600 rounded-xl bg-slate-800/50 text-white focus:border-emerald-500 outline-none mb-6"
                placeholder="----"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                  }}
                  className="flex-1 py-3 font-bold text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (pinInput.length === 4) {
                      onUpdateProfile({ pin: pinInput });
                      setShowPinModal(false);
                      setPinInput('');
                      setFeedbackMsg(userProfile.pin ? 'PIN updated!' : 'PIN set!');
                      setTimeout(() => setFeedbackMsg(''), 1500);
                    }
                  }}
                  disabled={pinInput.length !== 4}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all ${pinInput.length === 4
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-emerald-400'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  Save PIN
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div >
  );
};

export default Settings;