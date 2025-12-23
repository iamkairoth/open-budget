import { useState, useEffect } from 'react';

// Define the Global Data Shape
export type FinancialData = {
  currency: string;
  income: number; // Monthly In-Hand
  ctc: number;    // Annual Gross (for Salary module)
  
  // CSP Data
  budget: Record<string, any[]>;
  
  // Wealth Data
  assets: {
    emergencyFund: number;
    investments: number;
    goals: any[];
  };
  debts: any[]; // For Debt Destroyer
};

const DEFAULT_DATA: FinancialData = {
  currency: '$',
  income: 0,
  ctc: 0,
  budget: {
    fixed: [{ id: 'def-1', name: "Accommodation (Rent/Mortgage)", amount: 0 }],
    invest: [{ id: 'def-2', name: "Index Funds / 401k", amount: 0 }],
    savings: [{ id: 'def-3', name: "Emergency Fund Contribution", amount: 0 }],
    guiltFree: [{ id: 'def-4', name: "Dining Out / Social", amount: 0 }]
  },
  assets: { emergencyFund: 0, investments: 0, goals: [] },
  debts: []
};

// The Custom Hook
export function useFinancialData() {
  const [data, setData] = useState<FinancialData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem('open-budget-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with default to ensure new fields (like 'debts') exist if user has old data
        setData({ ...DEFAULT_DATA, ...parsed });
      } catch (e) {
        console.error("Failed to parse budget data");
      }
    }
    setLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('open-budget-data', JSON.stringify(data));
    }
  }, [data, loaded]);

  // Update Helper
  const update = (partial: Partial<FinancialData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  return { data, update, loaded };
}