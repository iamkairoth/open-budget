import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type VisualProps = {
  data: { name: string; value: number; color: string }[];
  totalIncome: number;
  currency: string;
};

// Custom Tooltip component to render formatting correctly
const CustomTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm z-50 relative">
        <p className="font-bold text-slate-700">{payload[0].name}</p>
        <p className="text-indigo-600 font-mono">
          {currency}{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function BudgetVisuals({ data, totalIncome, currency }: VisualProps) {
  // 1. Filter out empty values so we don't render invisible slices that take up legend space
  const activeData = data.filter(d => d.value > 0);

  // Calculate specific danger metrics
  const fixedCosts = data.find(d => d.name.includes("Fixed") || d.name.includes("Needs") || d.name.includes("Necessities"))?.value || 0;
  const fixedRatio = totalIncome > 0 ? (fixedCosts / totalIncome) * 100 : 0;
  
  const isDanger = fixedRatio > 60;

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      
      {/* Chart Section */}
      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <Pie
              data={activeData}
              innerRadius={50} // Slightly smaller for mobile safety
              outerRadius={70} 
              paddingAngle={4}
              dataKey="value"
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text (Total Income) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
          <div className="text-center">
             <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
             <p className="font-bold text-slate-800 text-lg">{currency}{totalIncome.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Insight Section */}
      <div className="w-full space-y-4">
        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider text-center border-b border-slate-100 pb-2">Health Check</h3>
        
        {/* Fixed Cost Meter */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-600">Fixed Costs Health</span>
            <span className={`font-bold ${isDanger ? 'text-red-500' : 'text-green-600'}`}>
              {Math.round(fixedRatio)}% {isDanger ? '(High)' : '(Good)'}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${isDanger ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(fixedRatio, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {isDanger 
              ? "Fixed costs > 60%. Try to negotiate bills to free up investing money." 
              : "Fixed costs are sustainable. Great job!"}
          </p>
        </div>
      </div>
    </div>
  );
}