import React from 'react';

export default function Navbar({ currentPath }: { currentPath: string }) {
  const links = [
    { name: 'Dashboard', href: '/' },
    { name: 'Salary', href: '/salary' },
    { name: 'Budget', href: '/csp' },
    { name: 'Wealth', href: '/wealth' },
    { name: 'Vault', href: '/scripts' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="font-bold text-xl tracking-tight text-slate-900">
              open<span className="text-indigo-600">budget</span>
            </a>
          </div>
          <div className="hidden sm:flex sm:space-x-8 items-center">
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
        </div>
      </div>
    </nav>
  );
}