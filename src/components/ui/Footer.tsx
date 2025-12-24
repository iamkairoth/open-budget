import React, { useRef } from 'react';

export default function Footer() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EXPORT FUNCTION ---
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

  // --- IMPORT FUNCTION ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);
        
        // Basic validation
        if (!parsed.budget && !parsed.income) {
           throw new Error("Invalid file format");
        }
        
        if (confirm("This will OVERWRITE your current data with the backup. Continue?")) {
            localStorage.setItem('open-budget-data', json);
            window.location.href = '/'; // Reload to apply changes (simplest way)
        }
      } catch (err) {
        alert("Failed to load backup. Invalid file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // --- RESET FUNCTION ---
  const handleReset = () => {
    if (confirm("Are you sure? This will delete ALL data irreversibly.")) {
      localStorage.removeItem('open-budget-data');
      window.location.href = '/'; 
    }
  };

  return (
    <footer className="border-t border-slate-200 mt-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Branding */}
        <div className="text-center md:text-left">
          <p className="text-sm font-bold text-slate-700">Open Budget v1.0</p>
          <p className="text-xs text-slate-500 mt-1">
            Privacy First: Data stays on your device.
          </p>
        </div>

        {/* Data Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
            {/* Hidden Input for Import */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
            />

            <button onClick={handleExport} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider">
                Export Data
            </button>
            
            <button onClick={handleImportClick} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider">
                Import Backup
            </button>

            <div className="h-4 w-px bg-slate-300 mx-2 hidden md:block"></div>

            <button onClick={handleReset} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider">
                Reset All
            </button>
        </div>

      </div>
    </footer>
  );
}