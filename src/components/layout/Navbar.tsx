'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';

export function Navbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme, isCollapsed } = useSidebar();

  const getPageTitle = () => {
    const path = pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/bookings') return 'Pemesanan Kendaraan';
    if (path === '/approvals') return 'Persetujuan Pemesanan';
    if (path === '/vehicles') return 'Data Kendaraan';
    if (path === '/maintenance') return 'Pemeliharaan Kendaraan';
    if (path === '/reports') return 'Laporan Pemesanan';
    return '';
  };

  const getPageDescription = () => {
    const path = pathname;
    if (path === '/dashboard') return 'Overview sistem monitoring kendaraan';
    if (path === '/bookings') return 'Kelola dan monitor pemesanan kendaraan';
    if (path === '/approvals') return 'Persetujuan pemesanan berjenjang';
    if (path === '/vehicles') return 'Data lengkap kendaraan perusahaan';
    if (path === '/maintenance') return 'Jadwal dan riwayat pemeliharaan';
    if (path === '/reports') return 'Export dan filter data pemesanan';
    return '';
  };

  const pageTitle = getPageTitle();
  const pageDescription = getPageDescription();

  // Dynamic styles based on theme
  const navBg = isDark ? 'bg-slate-800' : 'bg-white';
  const navBorder = isDark ? 'border-slate-700' : 'border-slate-200';
  const titleColor = isDark ? 'text-white' : 'text-gray-900';
  const descColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const buttonBg = isDark ? 'bg-slate-700' : 'bg-slate-100';
  const buttonHoverBg = isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200';
  const buttonBorder = isDark ? 'border-slate-600' : 'border-slate-200';

  const navMargin = isCollapsed ? 'lg:left-20' : 'lg:left-64';

  return (
    <nav className={clsx(
      'fixed top-0 left-0 right-0 z-30 px-6 py-3 border-b transition-all duration-300',
      navMargin,
      navBg,
      navBorder
    )}>
      <div className="flex items-center justify-between">
        {/* Page Title & Description */}
        <div className="flex-1">
          {pageTitle && (
            <>
              <h1 className={clsx('text-2xl font-bold', titleColor)}>
                {pageTitle}
              </h1>
              {pageDescription && (
                <p className={clsx('text-sm mt-1', descColor)}>
                  {pageDescription}
                </p>
              )}
            </>
          )}
        </div>

        {/* Right Section - Theme Toggle Only */}
        <button
          onClick={toggleTheme}
          className={clsx(
            'w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer',
            buttonBg,
            buttonHoverBg,
            buttonBorder
          )}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>
    </nav>
  );
}
