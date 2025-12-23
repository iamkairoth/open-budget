import React, { useState, useEffect } from 'react';
import { useFinancialData } from '../../lib/store';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- TYPES ---
type Debt = { id: string; name: string; balance: number; rate: number; minPayment: number };
type Strategy = 'snowball' | 'avalanche';

export default function WealthBuilder() {
  const { data, update, loaded } = useFinancialData();
  
  // --- DEBT STATE ---
  const [debts, setDebts] = useState<Debt[]>([]); 
  const [strategy, setStrategy] = useState<Strategy>('avalanche');
  const [extraPayment, setExtraPayment] = useState<number>(0);

  // --- LIFE BUILDER STATE (Standalone) ---
  const [currentPortfolio, setCurrentPortfolio] = useState<number>(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(0); // Standalone Input
  const [returnRate, setReturnRate] = useState<number>(8);
  const [richLifeTarget, setRichLifeTarget] = useState<number>(1000000);

  // Init Data
  useEffect(() => {
    if (loaded) {
      // Load Debts
      if (data.debts && data.debts.length > 0) {
        setDebts(data.debts);
      } else {
        setDebts([
          { id: '1', name: 'Credit Card', balance: 5000, rate: 24, minPayment: 150 },
          { id: '2', name: 'Student Loan', balance: 15000, rate: 6, minPayment: 200 }
        ]);
      }

      // Load Wealth / Assets
      if (data.assets) {
        setCurrentPortfolio(data.assets.investments || 0);
        // If we saved a specific contribution scenario, load it. 
        // Otherwise, default to 0 (Standalone).
        // We'll borrow the 'investments' field for initial portfolio, 
        // but 'monthlyContribution' is now local/session based or needs a new home. 
        // For now, we initialize it to 0 or 500 to let user play.
        setMonthlyContribution(500); 
      }
    }
  }, [loaded]);

  // Save changes
  useEffect(() => {
    if (loaded) {
      update({ 
        debts,
        // We update the asset snapshot if user changes "Current Portfolio" here
        assets: { ...data.assets, investments: currentPortfolio } 
      });
    }
  }, [debts, currentPortfolio, loaded]);

  // --- MATH ENGINE 1: DEBT DESTROYER ---
  const calculateDebtFreeDate = () => {
    let currentDebts = debts.map(d => ({ ...d }));
    let months = 0;
    const history = [];

    const sortDebts = (d: Debt[]) => {
      return d.sort((a, b) => {
        if (strategy === 'snowball') return a.balance - b.balance; 
        return b.rate - a.rate; 
      });
    };

    while (currentDebts.some(d => d.balance > 0) && months < 360) { 
      months++;
      let monthlyBudget = extraPayment; 
      
      currentDebts.forEach(d => {
        if (d.balance > 0) {
          const interest = d.balance * (d.rate / 100 / 12);
          d.balance += interest;
          let payment = Math.min(d.balance, d.minPayment);
          d.balance -= payment;
          
          if (d.balance <= 0) {
            monthlyBudget += d.minPayment; 
            d.balance = 0;
          }
        }
      });

      let sorted = sortDebts(currentDebts.filter(d => d.balance > 0));
      if (sorted.length > 0) {
        let target = sorted[0];
        let payment = Math.min(target.balance, monthlyBudget);
        target.balance -= payment;
      }

      const totalRemaining = currentDebts.reduce((sum, d) => sum + d.balance, 0);
      if (months % 6 === 0 || totalRemaining === 0) {
        history.push({ month: months, balance: Math.round(totalRemaining) });
      }
      if (totalRemaining === 0) break;
    }

    return { months, history };
  };

  const debtResult = calculateDebtFreeDate();
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + debtResult.months);

  // --- MATH ENGINE 2: LIFE BUILDER (Standalone) ---
  const calculateGrowth = () => {
    let balance = currentPortfolio;
    const history = [];
    let yearsToTarget = 0;
    let targetReached = false;

    for (let year = 0; year <= 30; year++) {
      history.push({ year: new Date().getFullYear() + year, amount: Math.round(balance) });
      
      if (!targetReached && balance >= richLifeTarget) {
        yearsToTarget = year;
        targetReached = true;
      }

      // Compound Interest: (Balance * Rate) + (Contribution * 12)
      balance = (balance * (1 + returnRate / 100)) + (monthlyContribution * 12);
    }
    return { history, yearsToTarget };
  };

  const growthResult = calculateGrowth();

  // --- CRUD Actions ---
  const addDebt = () => setDebts([...debts, { id: Date.now().toString(), name: 'New Loan', balance: 0, rate: 0, minPayment: 0 }]);
  const updateDebt = (id: string, field: keyof Debt, val: any) => setDebts(debts.map(d => d.id === id ? { ...d, [field]: val } : d));
  const removeDebt = (id: string) => setDebts(debts.filter(d => d.id !== id));

  if (!loaded) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-8 pb-20">
      
      {/* --- LEFT COLUMN: DEBT DESTROYER --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Debt Destroyer</h2>
                <p className="text-slate-500 text-sm">Clear the past.</p>
            </div>
        </div>

        {/* Debt List Inputs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">Your Liabilities</span>
                <button onClick={addDebt} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:border-indigo-500 hover:text-indigo-600">+ Add Debt</button>
            </div>
            <div className="divide-y divide-slate-100">
                {debts.map(d => (
                    <div key={d.id} className="p-4 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                            <input type="text" value={d.name} onChange={e => updateDebt(d.id, 'name', e.target.value)} className="w-full font-bold text-slate-700 bg-transparent outline-none" />
                        </div>
                        <div className="col-span-3">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Balance</label>
                            <input type="number" value={d.balance} onChange={e => updateDebt(d.id, 'balance', parseFloat(e.target.value))} className="w-full text-slate-700 bg-transparent outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">APR %</label>
                            <input type="number" value={d.rate} onChange={e => updateDebt(d.id, 'rate', parseFloat(e.target.value))} className="w-full text-slate-700 bg-transparent outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Min Pay</label>
                            <input type="number" value={d.minPayment} onChange={e => updateDebt(d.id, 'minPayment', parseFloat(e.target.value))} className="w-full text-slate-700 bg-transparent outline-none" />
                        </div>
                        <div className="col-span-1 text-right">
                             <button onClick={() => removeDebt(d.id)} className="text-slate-300 hover:text-red-500">&times;</button>
                        </div>
                    </div>
                ))}
                {debts.length === 0 && <div className="p-6 text-center text-slate-400 italic">No debts! You are free! 🎉</div>}
            </div>
        </div>

        {/* Strategy Controls */}
        {debts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                
                <div className="flex justify-center bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setStrategy('avalanche')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${strategy === 'avalanche' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Avalanche (High Interest)</button>
                    <button onClick={() => setStrategy('snowball')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${strategy === 'snowball' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Snowball (Low Balance)</button>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-700">Extra Monthly Payment</span>
                        <span className="font-mono font-bold text-green-600">{data.currency}{extraPayment}</span>
                    </div>
                    <input 
                        type="range" min="0" max="2000" step="50" 
                        value={extraPayment} onChange={e => setExtraPayment(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                </div>

                <div className="bg-slate-800 text-white rounded-xl p-5 flex justify-between items-center">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold">Debt Free Date</p>
                        <p className="text-2xl font-bold">{debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-xs uppercase font-bold">Time Saved</p>
                        <p className="text-xl font-bold text-green-400">{debtResult.months < 360 ? `${debtResult.months} months` : '> 30 Years'}</p>
                    </div>
                </div>

                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={debtResult.history}>
                             <defs>
                                <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" hide />
                            <Tooltip />
                            <Area type="monotone" dataKey="balance" stroke="#F87171" fillOpacity={1} fill="url(#colorDebt)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}
      </div>

      {/* --- RIGHT COLUMN: LIFE BUILDER (STANDALONE) --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Life Builder</h2>
                <p className="text-slate-500 text-sm">Simulate your future wealth.</p>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* STANDALONE INPUTS */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Monthly Investment</label>
                    <div className="relative">
                        <span className="absolute left-0 text-slate-400 font-bold">{data.currency}</span>
                        <input 
                            type="number" 
                            className="w-full pl-4 bg-transparent outline-none font-bold text-xl text-slate-800"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
                            placeholder="0"
                        />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Current Portfolio</label>
                    <div className="relative">
                        <span className="absolute left-0 text-slate-400 font-bold">{data.currency}</span>
                        <input 
                            type="number" 
                            className="w-full pl-4 bg-transparent outline-none font-bold text-xl text-slate-800"
                            value={currentPortfolio}
                            onChange={(e) => setCurrentPortfolio(parseFloat(e.target.value))}
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div>
                 <div className="flex justify-between mb-2">
                    <label className="font-bold text-slate-700">Expected Annual Return</label>
                    <span className="font-bold text-indigo-600">{returnRate}%</span>
                 </div>
                 <input 
                    type="range" min="1" max="15" step="0.5" 
                    value={returnRate} onChange={e => setReturnRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                 />
                 <p className="text-xs text-slate-400 mt-2">S&P 500 Historical Average: ~8-10%</p>
            </div>

            {/* Rich Life Target */}
            <div>
                 <label className="font-bold text-slate-700 mb-2 block">Your "Rich Life" Number</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{data.currency}</span>
                    <input 
                        type="number" 
                        value={richLifeTarget} onChange={e => setRichLifeTarget(parseFloat(e.target.value))}
                        className="w-full pl-8 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                 </div>
            </div>

            {/* Result Chart */}
            <div className="h-64 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthResult.history}>
                        <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="year" style={{ fontSize: '12px' }} tickMargin={10} />
                        <YAxis hide />
                        <Tooltip formatter={(val: number) => `${data.currency}${val.toLocaleString()}`} />
                        <Area type="monotone" dataKey="amount" stroke="#4ADE80" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
                    </AreaChart>
                 </ResponsiveContainer>
                 
                 {/* Milestone Badge */}
                 {growthResult.yearsToTarget > 0 && (
                     <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-in fade-in zoom-in">
                        Hit Target in {growthResult.yearsToTarget} Years 🚀
                     </div>
                 )}
            </div>

            {/* Projection Text */}
            <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-100 pt-4">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">In 10 Years</p>
                    <p className="font-bold text-lg text-slate-800">{data.currency}{growthResult.history[10]?.amount.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">In 20 Years</p>
                    <p className="font-bold text-lg text-slate-800">{data.currency}{growthResult.history[20]?.amount.toLocaleString()}</p>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
}