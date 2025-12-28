import React, { useState } from 'react';

export default function Navbar({ currentPath }: { currentPath: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/' },
    { name: 'Guide', href: '/guide' },
    { name: 'Salary', href: '/salary' },
    { name: 'Budget', href: '/csp' },
    { name: 'Wealth', href: '/wealth' },
    { name: 'Vault', href: '/scripts' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <a href="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1">
              <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">OB</span>
              <span className="hidden sm:inline">open<span className="text-indigo-600">budget</span></span>
            </a>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex md:space-x-8 items-center">
            {links.map((link) => {
              const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors ${
                    isActive
                      ? 'border-indigo-500 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {links.map((link) => {
               const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
               return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.name}
                  </a>
               );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}