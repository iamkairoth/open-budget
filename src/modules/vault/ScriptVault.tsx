import React, { useState } from 'react';

// --- DATA: The Script Library ---
const SCRIPTS = [
  // --- EARNING ---
  {
    id: 'earn-1',
    category: 'Earning',
    title: 'Negotiating a New Job Offer',
    description: 'Use this when you have an offer but want a higher base salary.',
    content: `Hi [Recruiter Name],\n\nThank you so much for the offer. I'm incredibly excited about the team and the role.\n\nI've reviewed the details, and while the fit is perfect, the base salary is currently lower than what I'm targeting based on my experience and the market rate for this role.\n\nI am looking for a base of $[Amount]. If we can match that, I would be thrilled to sign right away.\n\nLet me know if we can make this work.`
  },
  {
    id: 'earn-2',
    category: 'Earning',
    title: 'Asking for a Raise',
    description: 'Best used after a recent "win" or project completion.',
    content: `Hi [Manager Name],\n\nI'd love to schedule a brief time to discuss my performance and compensation.\n\nOver the last year, I've led [Project A] and helped the team achieve [Result B]. Based on this expanded scope and value, I'd like to discuss adjusting my compensation to the [Market/Senior] level.\n\nI've prepared a few notes on my contributions—when would be a good time to chat?`
  },
  {
    id: 'earn-3',
    category: 'Earning',
    title: 'Asking for a Signing Bonus',
    description: 'Use when the company can\'t budge on Base Salary, but has budget elsewhere.',
    content: `Hi [Recruiter Name],\n\nI completely understand that the base salary budget is capped at $[Amount].\n\nHowever, I am leaving some unvested equity/annual bonus on the table at my current company. To help bridge that gap, would you be able to offer a one-time signing bonus of $[Amount]?\n\nThis would make the decision much easier for me.`
  },

  // --- DEBT ---
  {
    id: 'debt-1',
    category: 'Debt',
    title: 'Lowering Credit Card APR',
    description: 'Call the number on the back of your card. Works best with good payment history.',
    content: `Hi, I've been a customer for [X] years and I'd like to lower the APR on my card.\n\nI've been reviewing other offers in the mail with 0% balance transfers, and I'd prefer to stay with you, but the interest rate is too high.\n\nCan you check if my account is eligible for a rate reduction today?`
  },
  {
    id: 'debt-2',
    category: 'Debt',
    title: 'Waiving Bank Fees',
    description: 'Use this for overdraft fees or monthly maintenance fees.',
    content: `Hi, I saw a $[Amount] fee on my account today. I've been a good customer for years and this was an honest mistake.\n\nI'd like to ask you to waive this fee as a courtesy. Thank you.`
  },
  {
    id: 'debt-3',
    category: 'Debt',
    title: 'Goodwill Deletion Letter',
    description: 'Ask a creditor to remove a "Late Payment" mark from your credit report.',
    content: `To [Creditor Name],\n\nI am writing regarding account #[Number]. I noticed a late payment reported on [Date].\n\nSince then, I have maintained a perfect payment history. That missed payment was due to [Reason: moved addresses/technical glitch/emergency] and does not reflect my financial responsibility.\n\nAs a gesture of goodwill, I am asking that you remove this negative mark from my credit report.`
  },

  // --- BILLS ---
  {
    id: 'rent-1',
    category: 'Bills',
    title: 'Negotiating Rent Renewal',
    description: 'Use when your landlord sends a lease renewal with a price hike.',
    content: `Hi [Landlord Name],\n\nI received the renewal notice. I've loved living here and have always paid rent on time.\n\nI noticed similar units in the area are renting for $[Lower Amount]. Given my history as a reliable tenant, would you be open to renewing at $[Target Amount]?\n\nI'd love to stay if we can make the numbers work.`
  },
  {
    id: 'bill-2',
    category: 'Bills',
    title: 'Lowering Internet/Cable Bill',
    description: 'Call them and ask for the "Retention Department".',
    content: `Hi, I'm looking at my bill and it has gone up to $[Amount].\n\nI see a promotional offer from [Competitor] for $[Lower Amount] for the same speed. I'd prefer not to go through the hassle of switching, but I can't justify this price difference.\n\nWhat can you do to match that rate or lower my bill?`
  },
  {
    id: 'bill-3',
    category: 'Bills',
    title: 'Negotiating Medical Bills',
    description: 'Use this for hospital bills that seem confusing or high.',
    content: `Hi, I'm reviewing my bill for [Service].\n\nFirst, I'd like an itemized receipt with CPT codes to ensure there are no duplicate charges.\n\nSecond, I am unable to pay this full amount immediately. Do you offer a "Cash Pay" discount if I pay a lump sum today, or can we set up a 0% interest payment plan?`
  },

  // --- AI PROMPTS ---
  {
    id: 'ai-1',
    category: 'AI Prompts',
    title: 'Analyze My Budget Leaks',
    description: 'Paste your last month of expenses into ChatGPT/Claude with this prompt.',
    content: `I am going to paste my expenses for the last month. Please analyze them and find 3 specific areas where I am "leaking" money on small, frequent purchases. Group them by category and suggest a hard limit for next month.\n\n[Paste CSV Data Here]`
  },
  {
    id: 'ai-2',
    category: 'AI Prompts',
    title: 'Meal Plan on a Budget',
    description: 'Get a grocery list for cheap, healthy meals.',
    content: `Create a meal plan for one person for 7 days. My budget is $60. I want high protein, low prep time meals. Give me the exact grocery list and the cooking instructions for Sunday meal prep.`
  },
  {
    id: 'ai-3',
    category: 'AI Prompts',
    title: 'The Interview Coach',
    description: 'Use AI to practice tough interview questions.',
    content: `I am interviewing for a [Job Title] role at [Company Type]. Please act as a tough interviewer. Ask me one question at a time. Wait for my response, then grade my answer on clarity and confidence, and suggest a stronger improvement.`
  }
];

const CATEGORIES = ['All', 'Earning', 'Debt', 'Bills', 'AI Prompts'];

export default function ScriptVault() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedScript, setSelectedScript] = useState<typeof SCRIPTS[0] | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter Logic
  const filteredScripts = SCRIPTS.filter(s => {
    const matchesCategory = filter === 'All' || s.category === filter;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = () => {
    if (selectedScript) {
      navigator.clipboard.writeText(selectedScript.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">The Vault</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
          Don't know what to say? Use these battle-tested scripts to negotiate, save, and strategize.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Categories - Mobile Scrollable */}
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0 no-scrollbar">
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${
                  filter === cat 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
           <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           <input 
             type="text" 
             placeholder="Search scripts..." 
             className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredScripts.map(script => (
          <div 
            key={script.id}
            onClick={() => setSelectedScript(script)}
            className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 cursor-pointer group flex flex-col h-full active:scale-95"
          >
             <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider ${
                    script.category === 'Earning' ? 'bg-green-100 text-green-700' :
                    script.category === 'Debt' ? 'bg-red-100 text-red-700' :
                    script.category === 'Bills' ? 'bg-blue-100 text-blue-700' :
                    script.category === 'AI Prompts' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                }`}>
                    {script.category}
                </span>
                <div className="bg-slate-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </div>
             </div>
             <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{script.title}</h3>
             <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{script.description}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedScript && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           {/* Modal Card */}
           <div className="bg-white w-full sm:max-w-2xl h-[85vh] sm:h-auto sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300 sm:zoom-in-95">
             
             {/* Modal Header */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 shrink-0">
                 <div className="pr-4">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedScript.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{selectedScript.description}</p>
                 </div>
                 <button 
                   onClick={() => setSelectedScript(null)}
                   className="text-slate-400 hover:text-slate-600 bg-slate-200/50 p-2 rounded-full transition-colors"
                 >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
             </div>

             {/* Modal Content - Scrollable Area */}
             <div className="p-6 bg-slate-50/50 overflow-y-auto flex-grow max-h-[60vh]">
                 <div className="bg-white border border-slate-200 rounded-xl p-5 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm selection:bg-indigo-100 selection:text-indigo-700">
                    {selectedScript.content}
                 </div>
             </div>

             {/* Modal Footer */}
             <div className="p-4 border-t border-slate-100 flex justify-between sm:justify-end gap-3 bg-white shrink-0 safe-area-bottom">
                 <button 
                   onClick={() => setSelectedScript(null)}
                   className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm"
                 >
                    Close
                 </button>
                 <button 
                   onClick={handleCopy}
                   className={`flex-1 sm:flex-none px-6 py-3 sm:py-2 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-sm shadow-lg ${
                     copied ? 'bg-green-600 scale-95' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 active:scale-95'
                   }`}
                 >
                    {copied ? (
                        <>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           Copied!
                        </>
                    ) : (
                        <>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                           Copy Script
                        </>
                    )}
                 </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}