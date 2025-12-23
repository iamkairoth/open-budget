import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BENCHMARKS = {
  fixed: { label: "Fixed Costs", target: "50-60%", min: 50, max: 60, color: "#F87171" },
  invest: { label: "Investments", target: "10%", min: 10, max: 999, color: "#4ADE80" },
  savings: { label: "Savings", target: "5-10%", min: 5, max: 20, color: "#60A5FA" },
  guiltFree: { label: "Guilt-Free", target: "20-35%", min: 20, max: 35, color: "#A78BFA" }
};

export default function BudgetPlanView() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('open-budget-data');
    if (saved) setData(JSON.parse(saved));
  }, []);

  if (!data) return <div className="p-10 text-center text-slate-500">Loading...</div>;

  const { income, currency, wealth } = data;
  const categories = data.data;

  // Calculations
  const getSum = (key: string) => categories[key]?.reduce((sum: any, item: any) => sum + item.amount, 0) || 0;
  const totals = {
    fixed: getSum('fixed'),
    invest: getSum('invest'),
    savings: getSum('savings'),
    guiltFree: getSum('guiltFree')
  };
  const totalAllocated = Object.values(totals).reduce((a: number, b: number) => a + b, 0);
  
  // Safety Net
  const monthlyFixed = totals.fixed;
  const targetSafetyNet = monthlyFixed * 6;
  const currentRunway = monthlyFixed > 0 ? (wealth.emergencyFund / monthlyFixed).toFixed(1) : "0";
  const safetyNetGap = Math.max(0, targetSafetyNet - wealth.emergencyFund);
  const monthlySavingsRate = totals.savings;
  const monthsToZeroRisk = monthlySavingsRate > 0 ? Math.ceil(safetyNetGap / monthlySavingsRate) : 999;

  const chartData = Object.keys(totals).map(key => ({
    name: BENCHMARKS[key as keyof typeof BENCHMARKS].label,
    value: totals[key as keyof typeof totals],
    color: BENCHMARKS[key as keyof typeof BENCHMARKS].color
  }));

  const getStatus = (key: keyof typeof totals, percent: number) => {
    const b = BENCHMARKS[key];
    if (key === 'fixed') return percent <= b.max ? "✅ Healthy" : "⚠️ Too High";
    if (percent >= b.min) return "✅ Good";
    return "⚠️ Low";
  };

  const copyToExcel = () => {
    let tsv = `Category\tItem\tAmount\n`;
    Object.keys(categories).forEach(key => {
      categories[key].forEach((item: any) => {
        tsv += `${key.toUpperCase()}\t${item.name}\t${item.amount}\n`;
      });
    });
    navigator.clipboard.writeText(tsv);
    alert("Copied!");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 space-y-10 print:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Financial Blueprint</h1>
          <div className="flex gap-4 mt-2 text-sm text-slate-500">
             <span>Income: <strong className="text-slate-800">{currency}{income.toLocaleString()}</strong></span>
             <span>•</span>
             <span>Net Liquid Assets: <strong className="text-slate-800">{currency}{(wealth.emergencyFund + wealth.investments).toLocaleString()}</strong></span>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0 print:hidden">
          <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">🖨️ Print</button>
          <button onClick={copyToExcel} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg">📋 Copy to Excel</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Safety Net */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
           <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">🛡️ Safety Net Analysis</h2>
           <div className="flex items-center gap-6 mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center flex-col border-4 ${parseFloat(currentRunway) >= 6 ? 'border-green-100 bg-green-50' : 'border-amber-100 bg-amber-50'}`}>
                  <span className="text-2xl font-bold text-slate-800">{currentRunway}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Months</span>
              </div>
              <div className="flex-1">
                 <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Current Cash</span><span className="font-bold">{currency}{wealth.emergencyFund.toLocaleString()}</span></div>
                 <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Target (6mo)</span><span className="font-bold">{currency}{targetSafetyNet.toLocaleString()}</span></div>
                 <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all" style={{ width: `${Math.min((wealth.emergencyFund/targetSafetyNet)*100, 100)}%` }}></div>
                 </div>
              </div>
           </div>
           <div className="bg-slate-50 rounded-xl p-4 text-sm border border-slate-100">
              {safetyNetGap <= 0 ? <p className="text-green-700 font-medium">🎉 Fully funded! Risk is 0.</p> : (
                 <div><p className="text-slate-600 mb-2">You need <strong>{currency}{safetyNetGap.toLocaleString()}</strong> more.</p>
                    {monthlySavingsRate > 0 ? <p className="text-slate-800 font-medium">Safe in <span className="text-indigo-600 text-lg font-bold">{monthsToZeroRisk} months</span>.</p> : <p className="text-red-500 font-bold">⚠️ Allocation needed in "Savings".</p>}
                 </div>
              )}
           </div>
        </div>

        {/* Allocation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center">
            <h2 className="w-full text-lg font-bold text-slate-800 mb-4 text-left">📊 Allocation Breakdown</h2>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                     </Pie>
                     <Tooltip formatter={(value: number) => `${currency}${value.toLocaleString()}`} />
                     <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Benchmarks */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50"><h2 className="font-bold text-slate-800">✅ Benchmark Scorecard</h2></div>
         <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {Object.keys(totals).map((key) => {
               const k = key as keyof typeof totals;
               const val = totals[k];
               const percent = income > 0 ? Math.round((val / income) * 100) : 0;
               return (
                  <div key={key} className="p-6 text-center">
                     <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">{BENCHMARKS[k].label}</div>
                     <div className="text-3xl font-bold text-slate-800 mb-1">{percent}%</div>
                     <div className="text-xs text-slate-500 mb-3">Target: {BENCHMARKS[k].target}</div>
                     <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatus(k, percent).includes('✅') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{getStatus(k, percent)}</div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* --- GOALS PROGRESS (RESTORED) --- */}
      <div>
         <h2 className="text-xl font-bold text-slate-800 mb-4">🏆 Goals Progress</h2>
         <div className="grid md:grid-cols-2 gap-4">
            {wealth.goals.length === 0 && <p className="text-slate-400 italic">No specific goals set.</p>}
            {wealth.goals.map((g: any) => {
               const progress = g.target > 0 ? (g.current / g.target) * 100 : 0;
               return (
                  <div key={g.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                     <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-700">{g.name}</span>
                        <span className="text-slate-500 text-sm">{currency}{g.current.toLocaleString()} / {currency}{g.target.toLocaleString()}</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                     </div>
                     <p className="text-right text-xs text-indigo-600 font-bold mt-1">{Math.round(progress)}%</p>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Ledger */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Detailed Ledger</h2>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Item</th>
                <th className="p-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {['fixed', 'invest', 'savings', 'guiltFree'].map(key => (
                 categories[key].map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                       <td className="p-4 text-slate-400 uppercase text-xs font-bold tracking-wider w-32">{key}</td>
                       <td className="p-4 font-medium text-slate-700">{item.name || 'Unlabeled'}</td>
                       <td className="p-4 text-right font-mono text-slate-600">{currency}{item.amount.toLocaleString()}</td>
                    </tr>
                 ))
              ))}
              <tr className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
                 <td className="p-4" colSpan={2}>TOTAL</td>
                 <td className="p-4 text-right">{currency}{totalAllocated.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}