import React from 'react';

type OutputProps = {
  income: number;
  allocations: {
    fixed: number;
    invest: number;
    savings: number;
    guiltFree: number;
  };
  currency: string;
};

export default function BudgetOutput({ income, allocations, currency }: OutputProps) {
  const handlePrint = () => window.print();

  if (income === 0) return null;

  return (
    <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full opacity-20 blur-xl"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading">Your Payday Routine</h2>
            <p className="text-slate-400 text-sm">Execute these transfers every month.</p>
          </div>
          <button 
            onClick={handlePrint}
            className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
          >
            🖨️ Print
          </button>
        </div>

        <div className="space-y-4 font-mono text-sm">
          {/* Step 1 */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
             <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">1</div>
             <div className="flex-1">
               <p className="text-slate-300 text-xs sm:text-sm">Keep in Checking (Bills)</p>
               <p className="text-base sm:text-lg font-bold text-white">{currency}{allocations.fixed.toLocaleString()}</p>
             </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
             <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold shrink-0">2</div>
             <div className="flex-1">
               <p className="text-slate-300 text-xs sm:text-sm">Auto-Transfer to Investment Accts</p>
               <p className="text-base sm:text-lg font-bold text-white">{currency}{allocations.invest.toLocaleString()}</p>
             </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">3</div>
             <div className="flex-1">
               <p className="text-slate-300 text-xs sm:text-sm">Transfer to Savings (HYSA)</p>
               <p className="text-base sm:text-lg font-bold text-white">{currency}{allocations.savings.toLocaleString()}</p>
             </div>
          </div>

           {/* Step 4 */}
           <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
             <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">4</div>
             <div className="flex-1">
               <p className="text-slate-300 text-xs sm:text-sm">Move to Debit Card / Cash (Fun)</p>
               <p className="text-base sm:text-lg font-bold text-white">{currency}{allocations.guiltFree.toLocaleString()}</p>
             </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 italic">
           "Spend extravagantly on the things you love, and cut costs mercilessly on the things you don't."
        </div>
      </div>
    </div>
  );
}