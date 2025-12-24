import React, { useState } from 'react';
import BudgetVisuals from './BudgetVisuals';
import { useFinancialData } from '../../lib/store';

// --- Types ---
type Item = { id: string; name: string; amount: number };
type Goal = { id: string; name: string; current: number; target: number };
type CategoryKey = 'fixed' | 'invest' | 'savings' | 'guiltFree';

// Configuration (Ramit Sethi CSP Only)
const CONFIG: Record<CategoryKey, { title: string; target: string; description: string; color: string; hex: string }> = {
  fixed: { 
    title: "Fixed Costs", target: "50-60%", 
    description: "Must-haves: Rent, Mortgage, Bills, Debt.",
    color: "bg-red-50 text-red-700 border-red-100", hex: "#F87171"
  },
  invest: { 
    title: "Investments", target: "10%", 
    description: "Future You: 401k, IRA, Index Funds.",
    color: "bg-green-50 text-green-700 border-green-100", hex: "#4ADE80"
  },
  savings: { 
    title: "Savings Goals", target: "5-10%", 
    description: "Short-term: Emergency Fund, Wedding, Car.",
    color: "bg-blue-50 text-blue-700 border-blue-100", hex: "#60A5FA"
  },
  guiltFree: { 
    title: "Guilt-Free Play", target: "20-35%", 
    description: "Fun money: Dining, Hobbies, Travel.",
    color: "bg-purple-50 text-purple-700 border-purple-100", hex: "#A78BFA"
  }
};

const CURRENCIES = [{ code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' }, { code: 'INR', symbol: '₹' }];

export default function BudgetApp() {
  // 1. CONNECT TO THE BRAIN
  const { data, update, loaded } = useFinancialData();
  const [expanded, setExpanded] = useState<CategoryKey | null>(null);

  if (!loaded) return <div className="p-10 text-center text-slate-400">Loading Budget...</div>;

  // 2. EXTRACT DATA FROM STORE
  const { income, currency, budget, wealth } = data;

  // Ensure budget buckets exist (prevent crash on new load)
  const buckets = budget || {
    fixed: [{ id: 'def-1', name: "Rent / Mortgage", amount: 0 }],
    invest: [{ id: 'def-2', name: "401k / Index Funds", amount: 0 }],
    savings: [{ id: 'def-3', name: "Emergency Fund", amount: 0 }],
    guiltFree: [{ id: 'def-4', name: "Dining / Fun", amount: 0 }]
  };

  // --- Calculations ---
  const getSum = (key: CategoryKey) => buckets[key]?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;
  const totalAllocated = getSum('fixed') + getSum('invest') + getSum('savings') + getSum('guiltFree');
  const unallocated = income - totalAllocated;

  // Safety Net Calc
  const monthlyFixedCosts = getSum('fixed');
  const targetSafetyNet = monthlyFixedCosts * 6; 
  const safetyNetGap = Math.max(0, targetSafetyNet - (wealth?.emergencyFund || 0));
  const monthlySavingsTotal = getSum('savings'); 
  const monthsToSafety = monthlySavingsTotal > 0 ? Math.ceil(safetyNetGap / monthlySavingsTotal) : 0;
  const isFullyFunded = (wealth?.emergencyFund || 0) >= targetSafetyNet && targetSafetyNet > 0;

  // --- Actions (Update Store directly) ---
  const updateStoreBuckets = (newBuckets: any) => {
    update({ budget: newBuckets });
  };

  const addItem = (key: CategoryKey) => {
    const newBuckets = { ...buckets, [key]: [...(buckets[key] || []), { id: Date.now().toString(), name: '', amount: 0 }] };
    updateStoreBuckets(newBuckets);
  };
  
  const updateItem = (key: CategoryKey, id: string, field: keyof Item, value: any) => {
    const newBuckets = {
      ...buckets,
      [key]: buckets[key].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    };
    updateStoreBuckets(newBuckets);
  };
  
  const deleteItem = (key: CategoryKey, id: string) => {
    const newBuckets = {
      ...buckets,
      [key]: buckets[key].filter((item: any) => item.id !== id)
    };
    updateStoreBuckets(newBuckets);
  };

  const addGoal = () => {
    update({ assets: { ...wealth, goals: [...(wealth.goals || []), { id: Date.now().toString(), name: '', current: 0, target: 0 }] } });
  };

  const updateGoal = (id: string, field: keyof Goal, value: any) => {
    const newGoals = (wealth.goals || []).map((g: any) => g.id === id ? { ...g, [field]: value } : g);
    update({ assets: { ...wealth, goals: newGoals } });
  };

  const setWealthValue = (field: 'emergencyFund' | 'investments', value: number) => {
    update({ assets: { ...wealth, [field]: value } });
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start pb-20">
      
      {/* LEFT COLUMN: Inputs */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">1. Monthly In-Flow</h2>
            <select 
              className="text-sm bg-white border border-slate-200 rounded px-2 py-1 cursor-pointer" 
              onChange={(e) => update({ currency: e.target.value })} 
              value={currency}
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.symbol}>{c.code}</option>)}
            </select>
        </div>

        {/* Income */}
        <div className="card-premium p-6 text-center bg-white rounded-2xl border border-slate-200">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Take-Home Salary</label>
          <div className="flex justify-center items-center text-4xl font-bold text-slate-800 mt-2 relative">
            <span className="text-slate-300 absolute left-[15%] sm:left-[25%] pointer-events-none">{currency}</span>
            <input 
              type="number" 
              placeholder="0" 
              className="w-48 text-center border-b-2 border-indigo-100 focus:border-indigo-600 outline-none bg-transparent"
              value={income || ''} 
              onChange={(e) => update({ income: parseFloat(e.target.value) })} 
            />
          </div>
        </div>

        {/* Budget Buckets */}
        <div className="space-y-4">
          {(Object.keys(CONFIG) as CategoryKey[]).map((key) => {
            const total = getSum(key);
            const isExpanded = expanded === key;
            const config = CONFIG[key];
            return (
              <div key={key} className={`card-premium bg-white overflow-hidden border transition-all ${isExpanded ? 'ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-200'}`}>
                <div onClick={() => setExpanded(isExpanded ? null : key)} className="p-5 cursor-pointer flex justify-between items-center hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color.replace('text-', 'bg-opacity-20 ')}`}>
                       <div className={`w-3 h-3 rounded-full ${config.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{config.title}</h3>
                      <p className="text-xs text-slate-500 hidden sm:block">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xl text-slate-800">{currency}{total.toLocaleString()}</div>
                    <div className="text-xs font-medium text-slate-400">Target: {config.target}</div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="bg-slate-50 p-5 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <div className="space-y-3">
                      {buckets[key]?.map((item: any) => (
                        <div key={item.id} className="flex gap-3 items-center">
                          <input 
                            type="text" 
                            placeholder="Item Name" 
                            className="input-modern flex-1 text-sm py-2"
                            value={item.name} 
                            onChange={(e) => updateItem(key, item.id, 'name', e.target.value)} 
                          />
                          <div className="relative w-32">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{currency}</span>
                             <input type="number" placeholder="0" className="input-modern w-full pl-8 text-sm py-2 text-right font-mono" value={item.amount || ''} onChange={(e) => updateItem(key, item.id, 'amount', parseFloat(e.target.value))} />
                          </div>
                          <div className="w-6 flex justify-center">
                                <button onClick={() => deleteItem(key, item.id)} className="text-slate-400 hover:text-red-500 px-1">&times;</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addItem(key)} className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">+ Add New Item</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status Bar */}
        {income > 0 && (
          <div className={`p-5 rounded-xl border flex items-center justify-between transition-colors shadow-sm ${
            unallocated < 0 ? 'bg-red-50 border-red-200 text-red-800' : 
            unallocated > 0 ? 'bg-slate-800 border-slate-700 text-white' : 
            'bg-green-50 border-green-200 text-green-800'
          }`}>
            <div>
              <h3 className="font-bold text-lg">
                {unallocated < 0 ? "⚠️ Over Budget" : unallocated > 0 ? "Left to Allocate" : "🎉 Perfect Budget"}
              </h3>
            </div>
            <div className="text-right">
               <span className="block text-2xl font-bold font-mono tracking-tight">
                 {unallocated < 0 ? '-' : ''}{currency}{Math.abs(unallocated).toLocaleString()}
               </span>
            </div>
          </div>
        )}

        {/* --- NET WORTH & GOALS --- */}
        <div className="pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">2. Net Worth & Goals</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
             {/* Emergency Fund */}
             <div className="card-premium p-5 bg-white border border-slate-200 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <label className="font-bold text-slate-700 flex items-center gap-2">💊 Emergency Cash</label>
                    <p className="text-xs text-slate-400 mb-2">Money currently in bank</p>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">{currency}</span>
                        <input type="number" className="input-modern pl-12 text-xl font-bold text-slate-800" placeholder="0"
                            value={wealth.emergencyFund || ''} onChange={(e) => setWealthValue('emergencyFund', parseFloat(e.target.value))} />
                    </div>
                </div>
                {monthlyFixedCosts > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-sm relative z-10">
                     <div className="flex justify-between text-slate-500 mb-1 text-xs">
                        <span>Target (6mo):</span>
                        <span className="font-mono">{currency}{targetSafetyNet.toLocaleString()}</span>
                     </div>
                     {isFullyFunded ? (
                        <div className="text-green-600 font-bold bg-green-50 p-2 rounded text-center">✅ Fully Funded!</div>
                     ) : (
                        <div className="text-xs">
                            {monthlySavingsTotal > 0 ? (
                                <div className="text-slate-600">
                                    Safe in: <span className="font-bold text-indigo-600 text-lg">{monthsToSafety} mo</span>
                                </div>
                            ) : (
                                <span className="text-amber-600">Add to "Savings" to forecast.</span>
                            )}
                        </div>
                     )}
                  </div>
                )}
             </div>

             {/* Investments */}
             <div className="card-premium p-5 bg-white border border-slate-200 flex flex-col justify-start">
                <label className="font-bold text-slate-700 flex items-center gap-2">📈 Investments</label>
                <p className="text-xs text-slate-400 mb-3">Total Portfolio Value</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">{currency}</span>
                  <input type="number" className="input-modern pl-12 text-xl font-bold text-slate-800" placeholder="0"
                    value={wealth.investments || ''} onChange={(e) => setWealthValue('investments', parseFloat(e.target.value))} />
                </div>
             </div>
          </div>

          {/* Goals Input */}
          <div className="card-premium bg-white border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">🏆 Saving Targets</h3>
                <button onClick={addGoal} className="text-xs bg-white border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 px-3 py-1 rounded-md font-medium transition-colors">+ New Goal</button>
             </div>
             <div className="divide-y divide-slate-100">
                {(wealth.goals || []).map((g: any) => (
                  <div key={g.id} className="p-4 grid grid-cols-12 gap-3 items-center hover:bg-slate-50 transition-colors">
                     <div className="col-span-12 md:col-span-5">
                        <input type="text" placeholder="Goal Name (e.g. Wedding)" className="input-modern text-sm py-2 w-full" 
                           value={g.name} onChange={(e) => updateGoal(g.id, 'name', e.target.value)} />
                     </div>
                     <div className="col-span-5 md:col-span-3 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{currency}</span>
                        <input type="number" placeholder="Have" className="input-modern pl-8 text-sm py-2 w-full text-right" 
                           value={g.current || ''} onChange={(e) => updateGoal(g.id, 'current', parseFloat(e.target.value))} />
                     </div>
                     <div className="col-span-5 md:col-span-3 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{currency}</span>
                        <input type="number" placeholder="Target" className="input-modern pl-8 text-sm py-2 w-full text-right" 
                           value={g.target || ''} onChange={(e) => updateGoal(g.id, 'target', parseFloat(e.target.value))} />
                     </div>
                     <div className="col-span-2 md:col-span-1 text-right">
                        <button onClick={() => {
                           const newGoals = wealth.goals.filter((x: any) => x.id !== g.id);
                           update({ assets: { ...wealth, goals: newGoals } });
                        }} className="text-slate-300 hover:text-red-500 p-2">&times;</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
        <div className="card-premium bg-white p-6 rounded-2xl border border-slate-200">
           <BudgetVisuals 
              data={(Object.keys(CONFIG) as CategoryKey[]).map(key => ({ name: CONFIG[key].title, value: getSum(key), color: CONFIG[key].hex }))} 
              totalIncome={income} currency={currency} 
           />
        </div>
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full opacity-20 blur-xl"></div>
           <h3 className="text-2xl font-bold relative z-10">Ready to Review?</h3>
           <p className="text-slate-400 mb-6 relative z-10 text-sm">{unallocated < 0 ? "⚠️ You are over budget." : "Your plan is ready to view."}</p>
           <a href="/guide" className="block w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors relative z-10 shadow-lg shadow-indigo-500/30">View Guide & Automation &rarr;</a>
        </div>
      </div>
    </div>
  );
}