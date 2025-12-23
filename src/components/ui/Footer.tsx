import React from 'react';

export default function Footer() {
  const handleReset = () => {
    // Confirmation dialog to prevent accidental deletion
    if (confirm("Are you sure? This will delete all your budget, salary, and wealth data irreversibly.")) {
      localStorage.removeItem('open-budget-data');
      // Redirect to home and reload to clear React state
      window.location.href = '/'; 
    }
  };

  return (
    <footer className="border-t border-slate-200 mt-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Branding & Privacy Notice */}
        <div className="text-center md:text-left">
          <p className="text-sm font-bold text-slate-700">Open Budget v1.0</p>
          <p className="text-xs text-slate-500 mt-1">
            Privacy First: Your financial data stays 100% on your device.
          </p>
        </div>

        {/* Reset Action */}
        <button 
          onClick={handleReset}
          className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-red-50"
          title="Clear LocalStorage"
        >
          Reset All Data
        </button>

      </div>
    </footer>
  );
}