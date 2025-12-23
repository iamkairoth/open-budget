import React, { useState, useEffect } from 'react';
import { useFinancialData } from '../../lib/store';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- TYPES & CONFIG ---
type CountryCode = 'USA' | 'UK' | 'IND' | 'EUR';
type Mode = 'forward' | 'reverse';

type LineItem = {
  id: string;
  name: string;
  type: 'deduction';
  mode: 'percent' | 'fixed';
  value: number;
};

// This Object can be moved to a separate 'tax_regimes.json' file later
const COUNTRY_CONFIG: Record<CountryCode, { 
  name: string; currency: string; flag: string; defaults: LineItem[];
}> = {
  USA: {
    name: 'United States', currency: '$', flag: '🇺🇸',
    defaults: [
      { id: 'fed', name: 'Federal Tax', type: 'deduction', mode: 'percent', value: 22 },
      { id: 'state', name: 'State Tax', type: 'deduction', mode: 'percent', value: 5 },
      { id: 'fica', name: 'FICA (SS/Medicare)', type: 'deduction', mode: 'percent', value: 7.65 },
      { id: '401k', name: '401k Contribution', type: 'deduction', mode: 'percent', value: 5 },
      { id: 'health', name: 'Health Insurance', type: 'deduction', mode: 'fixed', value: 200 }
    ]
  },
  UK: {
    name: 'United Kingdom', currency: '£', flag: '🇬🇧',
    defaults: [
      { id: 'tax', name: 'Income Tax', type: 'deduction', mode: 'percent', value: 20 },
      { id: 'ni', name: 'National Insurance', type: 'deduction', mode: 'percent', value: 10 },
      { id: 'pension', name: 'Pension', type: 'deduction', mode: 'percent', value: 5 }
    ]
  },
  IND: {
    name: 'India', currency: '₹', flag: '🇮🇳',
    defaults: [
      { id: 'epf', name: 'EPF', type: 'deduction', mode: 'fixed', value: 1800 },
      { id: 'it', name: 'Income Tax (TDS)', type: 'deduction', mode: 'percent', value: 15 },
      { id: 'pt', name: 'Professional Tax', type: 'deduction', mode: 'fixed', value: 200 },
    ]
  },
  EUR: {
    name: 'Europe', currency: '€', flag: '🇪🇺',
    defaults: [
      { id: 'it', name: 'Income Tax', type: 'deduction', mode: 'percent', value: 30 },
      { id: 'ss', name: 'Social Security', type: 'deduction', mode: 'percent', value: 10 }
    ]
  }
};

export default function SalaryArchitect() {
  const { data, update, loaded } = useFinancialData();
  const [mode, setMode] = useState<Mode>('forward');
  const [country, setCountry] = useState<CountryCode>('USA');
  
  // Inputs
  const [inputValue, setInputValue] = useState<number>(0); // Holds either Gross or Target Net depending on mode
  const [items, setItems] = useState<LineItem[]>([]);

  // Init Data
  useEffect(() => {
    if (loaded) {
      // Default to loading Gross if available, otherwise 0
      if (data.ctc > 0) setInputValue(data.ctc);
      setItems(COUNTRY_CONFIG[country].defaults);
    }
  }, [loaded, country]);

  // --- THE UNIFIED MATH ENGINE ---
  const calculate = () => {
    const totalPercent = items.reduce((sum, i) => i.mode === 'percent' ? sum + i.value : sum, 0);
    const totalFixedMonthly = items.reduce((sum, i) => i.mode === 'fixed' ? sum + i.value : sum, 0);
    const totalFixedAnnual = totalFixedMonthly * 12;

    let grossAnnual = 0;
    let netAnnual = 0;
    
    if (mode === 'forward') {
      // Input is Gross -> Find Net
      grossAnnual = inputValue;
      const percentDeductionAmount = grossAnnual * (totalPercent / 100);
      const totalDeductionAmount = percentDeductionAmount + totalFixedAnnual;
      netAnnual = Math.max(0, grossAnnual - totalDeductionAmount);
    } else {
      // Input is Target Net (Monthly) -> Find Gross
      // Formula: Gross = (Net + Fixed) / (1 - %)
      const targetNetAnnual = inputValue * 12;
      const retentionRate = 1 - (totalPercent / 100);
      
      if (retentionRate <= 0) {
        // Guard against >100% tax
        grossAnnual = 0; 
      } else {
        grossAnnual = (targetNetAnnual + totalFixedAnnual) / retentionRate;
      }
      netAnnual = targetNetAnnual;
    }

    const monthlyGross = grossAnnual / 12;
    const monthlyNet = netAnnual / 12;
    const totalDeductionsMonthly = monthlyGross - monthlyNet;

    // Granular Breakdown for Display
    const breakdown = items.map(item => {
      let amount = 0;
      if (item.mode === 'fixed') amount = item.value;
      else amount = monthlyGross * (item.value / 100);
      return { ...item, amount };
    });

    return { grossAnnual, monthlyGross, monthlyNet, totalDeductionsMonthly, breakdown };
  };

  const results = calculate();
  const currency = COUNTRY_CONFIG[country].currency;

  // --- ACTIONS ---
  const updateItem = (id: string, field: keyof LineItem, val: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };
  const addItem = () => {
    const newId = Date.now().toString();
    setItems([...items, { id: newId, name: 'New Deduction', type: 'deduction', mode: 'percent', value: 0 }]);
  };
  const deleteItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const toggleModeLogic = (id: string) => {
    const monthlyGross = results.monthlyGross;
    if (monthlyGross === 0) return;
    setItems(items.map(item => {
      if (item.id === id) {
        if (item.mode === 'percent') {
            const fixedValue = monthlyGross * (item.value / 100);
            return { ...item, mode: 'fixed', value: parseFloat(fixedValue.toFixed(2)) };
        } else {
            const percentValue = (item.value / monthlyGross) * 100;
            return { ...item, mode: 'percent', value: parseFloat(percentValue.toFixed(2)) };
        }
      }
      return item;
    }));
  };

  const saveToBudget = () => {
    update({ ctc: results.grossAnnual, income: results.monthlyNet, currency });
    alert(`✅ Updated Budget Income to ${currency}${Math.round(results.monthlyNet).toLocaleString()}`);
  };

  // Switch Modes (Reset input if needed or convert? For now, we clean reset to avoid confusion)
  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setInputValue(0); 
  };

  if (!loaded) return null;

  // Chart Data
  const chartData = [
    { name: 'Gross', value: results.monthlyGross, color: '#94A3B8' }, 
    { name: 'Deductions', value: results.totalDeductionsMonthly, color: '#F87171' },
    { name: 'In-Hand', value: results.monthlyNet, color: '#4ADE80' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Salary Architect</h1>
        <p className="text-slate-500">
            {mode === 'forward' ? 'Analyze your offer.' : 'Reverse-engineer your negotiation.'}
        </p>
        
        {/* Mode Switcher */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => handleModeSwitch('forward')}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'forward' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Calculate In-Hand
           </button>
           <button 
             onClick={() => handleModeSwitch('reverse')}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'reverse' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Calculate Required CTC
           </button>
        </div>
      </div>

      {/* Country Selector */}
      <div className="flex justify-center">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex gap-1">
          {(Object.keys(COUNTRY_CONFIG) as CountryCode[]).map(c => (
            <button
              key={c} onClick={() => setCountry(c)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${country === c ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>{COUNTRY_CONFIG[c].flag}</span><span>{COUNTRY_CONFIG[c].name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className={`card-premium p-6 border rounded-2xl transition-colors ${mode === 'forward' ? 'bg-white border-slate-200' : 'bg-indigo-50 border-indigo-100'}`}>
            <label className={`text-xs font-bold uppercase tracking-widest ${mode === 'forward' ? 'text-slate-400' : 'text-indigo-400'}`}>
                {mode === 'forward' ? 'Annual CTC / Gross Salary' : 'Target Monthly In-Hand'}
            </label>
            <div className="flex items-center text-4xl font-bold text-slate-800 mt-2 relative">
               <span className="text-slate-300 mr-2">{currency}</span>
               <input 
                 type="number" placeholder="0" className="w-full bg-transparent outline-none"
                 value={inputValue || ''} onChange={(e) => setInputValue(parseFloat(e.target.value))}
               />
            </div>
            {mode === 'forward' && <div className="mt-2 text-sm font-mono text-slate-400">= {currency}{Math.round(inputValue / 12).toLocaleString()} / month</div>}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Deduction Stack</h3>
                <button onClick={addItem} className="text-xs bg-white border border-slate-300 px-3 py-1 rounded hover:border-indigo-500 hover:text-indigo-600 font-medium transition-colors">+ Add Item</button>
             </div>
             
             {/* Unified List for Both Modes */}
             <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                     <input 
                       type="text" className="flex-1 font-medium text-slate-700 bg-transparent outline-none text-sm"
                       value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                     />
                     <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all">
                        <button onClick={() => toggleModeLogic(item.id)} className="px-2 py-1 text-[10px] font-bold uppercase rounded hover:bg-slate-200 text-slate-500 w-8">
                            {item.mode === 'percent' ? '%' : currency}
                        </button>
                        <input 
                          type="number" className="w-20 bg-transparent outline-none text-right text-sm font-mono font-bold text-slate-700 pr-2"
                          value={item.value} onChange={(e) => updateItem(item.id, 'value', parseFloat(e.target.value))}
                        />
                     </div>
                     <div className="w-24 text-right flex flex-col justify-center">
                        <span className="text-xs text-red-500 font-mono font-bold">-{currency}{Math.round(results.breakdown.find(x => x.id === item.id)?.amount || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">
                            {item.mode === 'percent' 
                                ? 'of monthly' 
                                : `${results.monthlyGross > 0 ? ((item.value/results.monthlyGross)*100).toFixed(1) : 0}%`}
                        </span>
                     </div>
                     <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500 px-1">&times;</button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
           
           <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
              <div className="relative z-10 text-center">
                 {mode === 'forward' ? (
                    <>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Monthly In-Hand</p>
                        <div className="text-5xl font-extrabold tracking-tight mb-2">{currency}{Math.round(results.monthlyNet).toLocaleString()}</div>
                        <p className="text-indigo-300 text-sm">Net Annual: {currency}{Math.round(results.monthlyNet * 12).toLocaleString()}</p>
                    </>
                 ) : (
                    <>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Required CTC / Gross</p>
                        <div className="text-5xl font-extrabold tracking-tight mb-2">{currency}{Math.round(results.grossAnnual).toLocaleString()}</div>
                        <p className="text-indigo-300 text-sm">To get {currency}{inputValue.toLocaleString()} / mo</p>
                    </>
                 )}

                 <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-700 pt-6">
                    <div>
                       <p className="text-slate-500 text-xs uppercase">Gross Monthly</p>
                       <p className="font-mono font-bold text-lg">{currency}{Math.round(results.monthlyGross).toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 text-xs uppercase">Total Deductions</p>
                       <p className="font-mono font-bold text-lg text-red-400">-{currency}{Math.round(results.totalDeductionsMonthly).toLocaleString()}</p>
                    </div>
                 </div>

                 <button onClick={saveToBudget} className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                   <span>Use This in Budget</span>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </button>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 text-center">Salary Waterfall</h3>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                       <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}