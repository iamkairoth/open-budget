import React, { useRef } from 'react';

export default function Footer() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = localStorage.getItem('open-budget-data');
    if (!data) return alert("No data to export!");
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `open-budget-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);
        if (!parsed.budget && !parsed.income) throw new Error("Invalid file format");
        if (confirm("This will OVERWRITE your current data with the backup. Continue?")) {
            localStorage.setItem('open-budget-data', json);
            window.location.href = '/'; 
        }
      } catch (err) {
        alert("Failed to load backup. Invalid file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will delete ALL data irreversibly.")) {
      localStorage.removeItem('open-budget-data');
      window.location.href = '/'; 
    }
  };

  return (
    <footer className="border-t border-slate-200 mt-12 bg-white pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
        
        {/* Branding & Support */}
        <div className="text-center md:text-left space-y-2">
          <div>
            <p className="text-sm font-bold text-slate-700">Open Budget v1.0</p>
            <p className="text-xs text-slate-500">
              Privacy First: Data stays on your device.
            </p>
          </div>
          
          {/* COFFEE BUTTON START */}
          <a 
            href="https://buymeacoffee.com/pandeakshat" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-amber-600 transition-colors bg-slate-50 hover:bg-amber-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-amber-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Fuel the Developer</span>
          </a>
          {/* COFFEE BUTTON END */}
        </div>

        {/* Data Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full md:w-auto">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

            <div className="flex gap-4">
                <button onClick={handleExport} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider px-2 py-2">
                    Export Data
                </button>
                <button onClick={handleImportClick} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider px-2 py-2">
                    Import Backup
                </button>
            </div>

            <div className="h-px w-full sm:h-4 sm:w-px bg-slate-200 sm:bg-slate-300 mx-2 block"></div>

            <button onClick={handleReset} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider px-2 py-2">
                Reset All
            </button>
        </div>

      </div>
    </footer>
  );
}