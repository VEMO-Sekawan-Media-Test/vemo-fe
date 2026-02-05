'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Car,
  Calendar,
  ClipboardCheck,
  Wrench,
  FileBarChart,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('ADMIN' | 'APPROVER')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Kendaraan', href: '/vehicles', icon: <Car className="w-5 h-5" />, roles: ['ADMIN'] },
  { label: 'Pemesanan', href: '/bookings', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Persetujuan', href: '/approvals', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['APPROVER'] },
  { label: 'Pemeliharaan', href: '/maintenance', icon: <Wrench className="w-5 h-5" /> },
  { label: 'Laporan', href: '/reports', icon: <FileBarChart className="w-5 h-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar, isDark } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || 'User');
          setUserRole(user.role || '');
          setIsAdmin(user.role === 'ADMIN');
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }
  }, []);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    return item.roles.some((role) => userRole === role);
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const navItemClass = isCollapsed ? 'justify-center px-2' : 'px-4';

  // Dark mode sidebar styles - solid colors
  const sidebarBg = isDark 
    ? 'bg-slate-900' 
    : 'bg-gray-800';
  const sidebarBorder = isDark ? 'border-slate-700' : 'border-gray-700';
  const navTextColor = isDark ? 'text-slate-300' : 'text-gray-300';
  const navHoverBg = isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-700/50';
  const navActiveBg = 'bg-amber-500 text-white';
  const userSectionBorder = isDark ? 'border-slate-700' : 'border-gray-700';
  const userTextColor = isDark ? 'text-white' : 'text-white';
  const roleTextColor = isDark ? 'text-amber-400' : 'text-amber-400';
  const logoBg = isDark ? 'bg-white' : 'bg-white';
  const avatarBg = isDark ? 'bg-slate-700' : 'bg-slate-100';
  const toggleBg = 'bg-amber-500 hover:bg-amber-400';

  return (
    <>
      {/* Mobile menu button */}
      <button
        className={clsx(
          'lg:hidden fixed top-4 z-50 p-2 rounded-lg shadow-md transition-colors cursor-pointer',
          isDark ? 'bg-white text-gray-900' : 'bg-white text-gray-900'
        )}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Simple Navigation Only */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 text-white transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col',
          sidebarBg,
          sidebarWidth,
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className={clsx('flex items-center border-b', sidebarBorder, isCollapsed ? 'px-2 py-4 justify-center' : 'px-6 py-4')}>
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl mt-1 p-1 flex-shrink-0', logoBg)}>
              <Image
                src="/images/vemo_ic.png"
                alt="VEMO Logo"
                width={30}
                height={30}
                className="object-contain mt-2"
              />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">VEMO</h1>
                <p className="text-xs text-gray-400">Vehicle Monitoring System</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 rounded-full items-center justify-center text-white shadow-lg transition-colors cursor-pointer z-50"
          style={{ backgroundColor: '#F59E0B' }}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 py-3 rounded-xl transition-all duration-200 cursor-pointer',
                  navItemClass,
                  isActive
                    ? navActiveBg
                    : clsx(navTextColor, navHoverBg, 'hover:text-white')
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section at Bottom */}
        <div className={clsx('px-3 py-4 border-t', userSectionBorder)}>
          {/* User Info */}
          <div className={clsx('flex items-center gap-3 mb-2', isCollapsed ? 'justify-center' : '')}>
            <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', avatarBg)}>
              <Image
                src="/images/avatar.svg"
                alt="Profile"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm font-medium truncate', userTextColor)}>{userName || 'User'}</p>
                <p className={clsx('text-xs', roleTextColor)}>{isAdmin ? 'Administrator' : 'Persetujuan'}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className={clsx(
              'flex items-center gap-3 w-full py-3 rounded-xl transition-all duration-200 cursor-pointer',
              navItemClass,
              navTextColor,
              'hover:bg-red-500/10 hover:text-red-400'
            )}
            title={isCollapsed ? 'Keluar' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 cursor-pointer" />
            {!isCollapsed && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={clsx(
            'rounded-2xl shadow-2xl max-w-md w-full p-6 border',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          )}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>

              <h3 className={clsx('text-lg font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>Konfirmasi Keluar</h3>

              <p className={clsx('mb-6', isDark ? 'text-slate-400' : 'text-gray-500')}>Apakah Anda yakin ingin keluar dari aplikasi?</p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={clsx(
                    'flex-1 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer',
                    isDark 
                      ? 'border border-slate-600 text-slate-300 hover:bg-slate-700/50' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  )}
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
