import React, { useState, useEffect } from 'react';
import { useFinancialData } from '../../lib/store';

export default function GuideView() {
  const { data, update, loaded } = useFinancialData();
  const [activeTab, setActiveTab] = useState<'system' | 'automation' | 'vision' | 'library'>('system');
  
  // Local state for Vision inputs
  const [vision, setVision] = useState({ love: '', hate: '', statement: '' });

  // Load vision data from store when ready
  useEffect(() => {
    if (loaded && data.richLife) {
      setVision(data.richLife);
    }
  }, [loaded, data.richLife]);

  const saveVision = () => {
    update({ richLife: vision });
    alert("✅ Vision saved! Keep this as your compass.");
  };

  if (!loaded) return null;

  // --- DATA PREP ---
  const income = data.income || 0;
  const currency = data.currency || '$';

  const getSum = (key: string) => {
    if (!data.budget || !data.budget[key]) return 0;
    return data.budget[key].reduce((acc: any, item: any) => acc + item.amount, 0);
  };
  
  const alloc = {
    fixed: getSum('fixed'),
    invest: getSum('invest'),
    savings: getSum('savings'),
    guiltFree: getSum('guiltFree')
  };

  const TABS = [
    { id: 'system', label: '1. System' }, 
    { id: 'automation', label: '2. Automation' }, 
    { id: 'vision', label: '3. Vision' }, 
    { id: 'library', label: '4. Library' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">The Manual</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
          Master the tools, automate the flow, and define your rich life.
        </p>

        {/* Tab Navigation - Scrollable on Mobile */}
        <div className="flex justify-center mt-6">
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0 no-scrollbar">
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex whitespace-nowrap gap-1">
                    {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === tab.id ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* --- TAB 1: SYSTEM GUIDE --- */}
      {activeTab === 'system' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Section 1: Salary */}
          <div className="grid md:grid-cols-12 gap-6 sm:gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
             <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 border border-indigo-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Salary Architect</h2>
                <p className="text-sm text-slate-500 mt-2">The Input Engine</p>
             </div>
             <div className="md:col-span-8 space-y-4">
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Most people don't know their true hourly rate. This tool converts your complex Gross CTC into a real, usable <strong>Monthly In-Hand</strong> number.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100 space-y-3">
                   <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">💡 Pro Tips</h3>
                   <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2 items-start">
                         <span className="text-indigo-600 font-bold">•</span>
                         <span><strong>Smart Toggles:</strong> Click the currency symbol ({currency}) or (%) inside any deduction box to switch modes.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                         <span className="text-indigo-600 font-bold">•</span>
                         <span><strong>Reverse Mode:</strong> Use this for negotiation. If you need 5,000 net, it calculates exactly what Gross Salary to ask for.</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>

          {/* Section 2: Budget */}
          <div className="grid md:grid-cols-12 gap-6 sm:gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
             <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 border border-purple-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">The Budget 

[Image of The Budget]
</h2>
                <p className="text-sm text-slate-500 mt-2">The Sorting Machine</p>
             </div>
             <div className="md:col-span-8 space-y-4">
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  This implements the <strong>Conscious Spending Plan</strong>. Instead of tracking every coffee, you track 4 broad categories.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100 space-y-3">
                   <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">💡 Key Rules</h3>
                   <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2 items-start">
                         <span className="text-purple-600 font-bold">•</span>
                         <span><strong>Zero-Based:</strong> The "Left to Allocate" bar must be exactly 0. Every dollar gets a job.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                         <span className="text-purple-600 font-bold">•</span>
                         <span><strong>Danger Zone:</strong> If Fixed Costs are &gt;60%, you will struggle to build wealth. Cut big things (Rent, Car), not small things (Lattes).</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: AUTOMATION MAP --- */}
      {activeTab === 'automation' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4">
           
           <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-2xl text-center max-w-3xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-blue-900">Your Personal Automation Flow</h2>
              <p className="text-blue-700 text-xs sm:text-sm mt-2">
                This diagram pulls real numbers from your <strong>Budget</strong>. <br className="hidden sm:block"/>
                If the numbers are 0, go back to the Budget tab and allocate your income!
              </p>
           </div>

           {/* DESKTOP VIEW: HORIZONTAL BRANCHING */}
           <div className="hidden md:block bg-white p-8 rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
              <div className="flex flex-col items-center min-w-max">
                 
                 {/* 1. INCOME */}
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center w-64 mb-4 relative z-10">
                    <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Source</div>
                    <div className="font-bold text-slate-800 text-lg">Work / Salary</div>
                    <div className="text-indigo-600 font-mono font-bold">{currency}{income.toLocaleString()}</div>
                 </div>

                 <svg className="w-6 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" /></svg>

                 {/* 2. CHECKING */}
                 <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl text-center w-80 mb-8 relative z-10">
                    <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">The Hub</div>
                    <div className="font-bold text-2xl">Checking Account</div>
                    <p className="text-slate-400 text-xs mt-2">Money sits here for 1-2 days max.</p>
                 </div>

                 {/* 3. BRANCHES */}
                 <div className="grid grid-cols-4 gap-6 w-full relative">
                    <div className="absolute top-0 left-[12.5%] right-[12.5%] h-8 border-t-2 border-l-2 border-r-2 border-slate-300 rounded-t-xl -z-0"></div>
                    
                    {[
                        { label: 'Fixed Costs', color: 'red', date: '1st-3rd', val: alloc.fixed, items: ['Keep in Checking', 'Set Bills to Auto-Pay'] },
                        { label: 'Investments', color: 'green', date: '5th', val: alloc.invest, items: ['401k / Roth IRA', 'Index Funds', 'Set Auto-Transfer'] },
                        { label: 'Savings', color: 'blue', date: '5th', val: alloc.savings, items: ['High Yield Savings', 'FDs / Liquid Funds'] },
                        { label: 'Guilt-Free', color: 'purple', date: 'Anytime', val: alloc.guiltFree, items: ['Keep in Checking', 'Or Separate Debit Card'] }
                    ].map((bucket, i) => (
                        <div key={i} className="pt-8 flex flex-col items-center">
                            <div className="h-6 w-0.5 bg-slate-300 mb-2"></div>
                            <div className={`bg-white p-5 rounded-xl border-t-4 border-${bucket.color}-400 shadow-lg w-full text-center h-full`}>
                                <div className="text-[10px] font-bold uppercase text-slate-400">Date: {bucket.date}</div>
                                <div className="font-bold text-slate-800 text-lg">{bucket.label}</div>
                                <div className={`text-${bucket.color}-500 font-mono font-bold text-xl mt-1`}>{currency}{bucket.val.toLocaleString()}</div>
                                <div className="mt-4 text-left bg-slate-50 p-3 rounded-lg text-xs space-y-2">
                                    <p className="font-bold text-slate-700">Where?</p>
                                    <ul className="list-disc list-inside text-slate-500">
                                        {bucket.items.map(it => <li key={it}>{it}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* MOBILE VIEW: VERTICAL WATERFALL */}
           <div className="md:hidden space-y-4">
                {/* 1. INCOME */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative z-10 mx-auto w-3/4">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Source</div>
                    <div className="font-bold text-slate-800">Work / Salary</div>
                    <div className="text-indigo-600 font-mono font-bold">{currency}{income.toLocaleString()}</div>
                 </div>
                 
                 {/* Arrow Down */}
                 <div className="flex justify-center -my-2"><svg className="w-6 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" /></svg></div>

                 {/* 2. CHECKING */}
                 <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl text-center relative z-10">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">The Hub</div>
                    <div className="font-bold text-xl">Checking Account</div>
                    <p className="text-slate-400 text-xs mt-1">Money sits here for 1-2 days max.</p>
                 </div>

                 {/* Arrow Down Split */}
                 <div className="flex justify-center -my-2"><svg className="w-6 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" /></svg></div>

                 {/* 3. VERTICAL STACK */}
                 <div className="space-y-4">
                    {[
                        { label: 'Fixed Costs', color: 'red', date: '1st-3rd', val: alloc.fixed },
                        { label: 'Investments', color: 'green', date: '5th', val: alloc.invest },
                        { label: 'Savings', color: 'blue', date: '5th', val: alloc.savings },
                        { label: 'Guilt-Free', color: 'purple', date: 'Anytime', val: alloc.guiltFree }
                    ].map((bucket, i) => (
                        <div key={i} className={`bg-white p-4 rounded-xl border-l-4 border-${bucket.color}-400 shadow-sm flex justify-between items-center`}>
                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400">Date: {bucket.date}</div>
                                <div className="font-bold text-slate-800">{bucket.label}</div>
                            </div>
                            <div className={`text-${bucket.color}-600 font-mono font-bold text-lg`}>
                                {currency}{bucket.val.toLocaleString()}
                            </div>
                        </div>
                    ))}
                 </div>
           </div>

        </div>
      )}

      {/* --- TAB 3: RICH LIFE VISION --- */}
      {activeTab === 'vision' && (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-6 sm:space-y-8">
           
           <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Your Rich Life Profile</h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">
                 Budgeting isn't about restriction. It's about spending extravagantly on the things you love, 
                 and cutting costs mercilessly on the things you don't.
              </p>
           </div>

           <div className="space-y-6">
              
              {/* Question 1: LOVE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                 </div>
                 <label className="block font-bold text-base sm:text-lg text-slate-800 mb-2 relative z-10">
                    1. What do you LOVE spending money on?
                 </label>
                 <p className="text-sm text-slate-500 mb-4 relative z-10">
                    Travel? Convenience? Michelin star food? Be specific. 
                 </p>
                 <textarea 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[100px] relative z-10"
                    placeholder="I spend extravagantly on..."
                    value={vision.love}
                    onChange={(e) => setVision({...vision, love: e.target.value})}
                 />
              </div>

              {/* Question 2: HATE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M15 4V2H9v2H5v18h14V4h-4zM6 16V6h12v10H6z"/></svg>
                 </div>
                 <label className="block font-bold text-base sm:text-lg text-slate-800 mb-2 relative z-10">
                    2. What do you HATE spending money on?
                 </label>
                 <p className="text-sm text-slate-500 mb-4 relative z-10">
                    Where do you cut costs mercilessly? 
                 </p>
                 <textarea 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-red-500 outline-none transition-all min-h-[100px] relative z-10"
                    placeholder="I cut costs mercilessly on..."
                    value={vision.hate}
                    onChange={(e) => setVision({...vision, hate: e.target.value})}
                 />
              </div>

              {/* Question 3: STATEMENT */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl text-center">
                 <h3 className="text-lg sm:text-xl font-bold mb-4">Your Rich Life Statement</h3>
                 <p className="text-slate-400 text-sm mb-6">
                    Combine them into one sentence. This is your compass.
                 </p>
                 <div className="relative">
                    <span className="absolute top-2 left-2 text-slate-500 font-serif text-3xl sm:text-4xl">“</span>
                    <textarea 
                        className="w-full p-6 bg-slate-800 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none transition-all min-h-[120px] text-center text-base sm:text-lg font-medium leading-relaxed italic"
                        placeholder="I live my Rich Life by..."
                        value={vision.statement}
                        onChange={(e) => setVision({...vision, statement: e.target.value})}
                    />
                    <span className="absolute bottom-2 right-2 text-slate-500 font-serif text-3xl sm:text-4xl">”</span>
                 </div>
                 
                 <button 
                    onClick={saveVision}
                    className="mt-6 w-full sm:w-auto px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                 >
                    Save My Vision
                 </button>
              </div>

           </div>
        </div>
      )}

      {/* --- TAB 4: KNOWLEDGE BASE --- */}
      {activeTab === 'library' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200">
             <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center">
                Common Terms Defined 
                <img src="/img-terms.svg" alt="" className="inline-block h-6 w-6 ml-2 align-text-bottom" />
             </h2>
             <div className="grid md:grid-cols-2 gap-6">
                {[
                    { term: "Index Fund", def: "A bucket of stocks that copies the whole market. Low fees, boring, reliable." },
                    { term: "Expense Ratio", def: "The fee you pay to own a fund. You want this below 0.10%." },
                    { term: "HYSA", def: "High Yield Savings Account. Pays 3-5% interest just for parking money." },
                    { term: "Compound Interest", def: "Interest on your interest. The reason why saving early makes you rich." }
                ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                        <div>
                            <strong className="block text-slate-800">{item.term}</strong>
                            <span className="text-sm text-slate-500">{item.def}</span>
                        </div>
                    </div>
                ))}
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
             <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                 <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                    Debt Attack Plan
                    <img src="/img-debt.svg" alt="" className="inline-block h-6 w-6 ml-2" />
                 </h3>
                 <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-red-700">
                        <input type="checkbox" className="accent-red-600 w-4 h-4" />
                        <span>List all debts in the Wealth module.</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-red-700">
                        <input type="checkbox" className="accent-red-600 w-4 h-4" />
                        <span>Call credit cards to lower APR (Script in Vault).</span>
                    </li>
                 </ul>
             </div>

             <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                 <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                    Wealth Setup 
                    <img src="/img-wealth.svg" alt="" className="inline-block h-6 w-6 ml-2" />
                 </h3>
                 <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-green-700">
                        <input type="checkbox" className="accent-green-600 w-4 h-4" />
                        <span>Open a low-fee brokerage account.</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-green-700">
                        <input type="checkbox" className="accent-green-600 w-4 h-4" />
                        <span>Set up monthly auto-transfer on the 5th.</span>
                    </li>
                 </ul>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}