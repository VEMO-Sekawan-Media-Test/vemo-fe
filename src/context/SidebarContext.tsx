'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  const toggleTheme = () => {
    setIsDark((prevIsDark) => {
      const newIsDark = !prevIsDark;
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newIsDark;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed, isDark, toggleTheme, isMobileOpen, setMobileOpen: setIsMobileOpen, toggleMobileMenu }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export { SidebarContext };
