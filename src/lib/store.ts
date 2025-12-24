import { useState, useEffect } from 'react';
import { create } from 'zustand';

// --- TYPES ---
export type FinancialData = {
  // Salary
  ctc: number;
  income: number;
  currency: string;
  
  // Budget (CSP)
  budget: Record<string, any[]>;
  
  // Wealth
  assets: {
    emergencyFund: number;
    investments: number;
    goals: any[];
  };
  debts: any[];

  // Guide (Rich Life Vision) -- NEW
  richLife?: {
    love: string;
    hate: string;
    statement: string;
  };
};

// --- DEFAULTS ---
const DEFAULT_DATA: FinancialData = {
  ctc: 0,
  income: 0,
  currency: '$',
  budget: {
    fixed: [],
    invest: [],
    savings: [],
    guiltFree: []
  },
  assets: {
    emergencyFund: 0,
    investments: 0,
    goals: []
  },
  debts: [],
  richLife: { love: '', hate: '', statement: '' } // Default empty state
};

// --- STORE ---
type Store = {
  data: FinancialData;
  loaded: boolean;
  update: (partial: Partial<FinancialData>) => void;
};

export const useStore = create<Store>((set) => ({
  data: DEFAULT_DATA,
  loaded: false,
  update: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
}));

// --- PERSISTENCE HOOK ---
export const useFinancialData = () => {
  const { data, loaded, update } = useStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('open-budget-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved data with defaults to ensure new fields (like richLife) exist
        update({ ...DEFAULT_DATA, ...parsed });
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    useStore.setState({ loaded: true });
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (loaded && isHydrated) {
      localStorage.setItem('open-budget-data', JSON.stringify(data));
    }
  }, [data, loaded, isHydrated]);

  return { data, update, loaded: isHydrated };
};