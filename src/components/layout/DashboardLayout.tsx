'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSidebar } from '@/context/SidebarContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();

  const mainContentMargin = isCollapsed ? 'lg:ml-20' : 'lg:ml-64';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--main-content-bg, var(--color-background))' }}>
      <Sidebar />
      <main className={`transition-all duration-300 min-h-screen ${mainContentMargin}`}>
        {/* Top Navbar with Page Title & Description - Fixed */}
        <Navbar />
        
        {/* Content Area - With proper top margin to avoid navbar overlap */}
        <div className="p-4 lg:p-6">
          <div className="mt-18 lg:mt-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
