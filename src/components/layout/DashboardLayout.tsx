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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--main-content-bg, var(--color-background))' }}>
      <Sidebar />
      <main className={`min-h-screen ${mainContentMargin}`}>
        <Navbar />
        
        <div className="p-4 lg:p-6">
          <div className="mt-16 lg:mt-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
