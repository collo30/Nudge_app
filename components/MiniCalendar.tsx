
import React, { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';


interface DateSelectorProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
  maxDate?: string; // Optional max date constraint
}

const MONTHS = [
  { val: '01', label: 'Jan' }, { val: '02', label: 'Feb' }, { val: '03', label: 'Mar' },
  { val: '04', label: 'Apr' }, { val: '05', label: 'May' }, { val: '06', label: 'Jun' },
  { val: '07', label: 'Jul' }, { val: '08', label: 'Aug' }, { val: '09', label: 'Sep' },
  { val: '10', label: 'Oct' }, { val: '11', label: 'Nov' }, { val: '12', label: 'Dec' }
];

export const DateSelector: React.FC<DateSelectorProps> = ({ value, onChange, className = '', maxDate }) => {
  // Parse existing date or default to today
  const [yearStr, monthStr, dayStr] = (value || new Date().toISOString().split('T')[0]).split('-');

  const currentYear = parseInt(yearStr);
  const currentMonth = parseInt(monthStr);
  const currentDay = parseInt(dayStr);

  // Parse Max Date if provided
  const maxD = useMemo(() => maxDate ? new Date(maxDate) : null, [maxDate]);
  const maxYear = maxD ? maxD.getFullYear() : null;
  const maxMonth = maxD ? maxD.getMonth() + 1 : null;
  const maxDayVal = maxD ? maxD.getDate() : null;

  // Generate Year Options
  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const arr = [];
    const end = maxYear ? maxYear : thisYear + 5; // Allow future if no maxDate
    for (let i = thisYear - 5; i <= end; i++) arr.push(i);
    return arr.reverse(); // Newest first
  }, [maxYear]);

  // Calculate Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentYear, currentMonth]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleChange = (type: 'y' | 'm' | 'd', val: string | number) => {
    let y = currentYear;
    let m = currentMonth;
    let d = currentDay;

    if (type === 'y') y = parseInt(val.toString());
    if (type === 'm') m = parseInt(val.toString());
    if (type === 'd') d = parseInt(val.toString());

    // Adjust day if new month has fewer days
    const maxDaysInMonth = new Date(y, m, 0).getDate();
    if (d > maxDaysInMonth) d = maxDaysInMonth;

    // Enforce Max Date
    if (maxDate && maxD) {
      const newDateObj = new Date(y, m - 1, d);
      if (newDateObj > maxD) {
        // Reset to max date if selection exceeds it
        // Or explicitly cap the components
        // For UX, sticking to the constraint is better
        // If user changes year to future year, we already filtered options, but if logic slips:
        if (y > maxD.getFullYear()) y = maxD.getFullYear();
        if (y === maxD.getFullYear() && m > (maxD.getMonth() + 1)) m = maxD.getMonth() + 1;
        if (y === maxD.getFullYear() && m === (maxD.getMonth() + 1) && d > maxD.getDate()) d = maxD.getDate();
      }
    }

    const newDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    onChange(newDate);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Month */}
      <div className="relative flex-1">
        <select
          value={monthStr}
          onChange={(e) => handleChange('m', e.target.value)}
          className="w-full appearance-none bg-white dark:bg-slate-700 border-2 border-slate-900 dark:border-slate-500 rounded-lg px-3 py-2 font-bold text-slate-800 dark:text-white outline-none focus:bg-slate-50 dark:focus:bg-slate-600 transition-colors shadow-sm"
        >
          {MONTHS.map(m => {
            const isDisabled = maxYear !== null && currentYear === maxYear && parseInt(m.val) > (maxMonth || 12);
            if (isDisabled && maxYear === currentYear) return null; // Hide future months in max year to be cleaner? Or disable.
            // Disabling is better context.
            return <option key={m.val} value={m.val} disabled={isDisabled}>{m.label}</option>;
          })}
        </select>
        <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {/* Day */}
      <div className="relative w-20">
        <select
          value={currentDay}
          onChange={(e) => handleChange('d', e.target.value)}
          className="w-full appearance-none bg-white dark:bg-slate-700 border-2 border-slate-900 dark:border-slate-500 rounded-lg px-3 py-2 font-bold text-slate-800 dark:text-white outline-none focus:bg-slate-50 dark:focus:bg-slate-600 transition-colors shadow-sm text-center"
        >
          {days.map(d => {
            const isDisabled = maxYear !== null && currentYear === maxYear && currentMonth === maxMonth && d > (maxDayVal || 31);
            return <option key={d} value={d} disabled={isDisabled}>{d}</option>;
          })}
        </select>
        <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {/* Year */}
      <div className="relative w-24">
        <select
          value={currentYear}
          onChange={(e) => handleChange('y', e.target.value)}
          className="w-full appearance-none bg-white dark:bg-slate-700 border-2 border-slate-900 dark:border-slate-500 rounded-lg px-3 py-2 font-bold text-slate-800 dark:text-white outline-none focus:bg-slate-50 dark:focus:bg-slate-600 transition-colors shadow-sm"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};
