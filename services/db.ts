
import { CategoryGroup, BudgetCategory, Transaction, UserStats, UserProfile, Notification, RecurringTransaction } from '../types';

const DB_KEY = 'pocket_budget_data_v1';

export interface AppDatabase {
  groups: CategoryGroup[];
  categories: BudgetCategory[];
  transactions: Transaction[];
  userStats: UserStats;
  userProfile: UserProfile;
  notifications: Notification[];
  recurringTransactions?: RecurringTransaction[];
}

export const loadDB = (): AppDatabase | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load database:", error);
    return null;
  }
};

export const saveDB = (data: AppDatabase): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save database:", error);
  }
};

export const clearDB = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DB_KEY);
  } catch (error) {
    console.error("Failed to clear database:", error);
  }
};
