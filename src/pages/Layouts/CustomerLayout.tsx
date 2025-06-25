// src/layouts/CustomerLayout.tsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ReceiptText,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const CustomerLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/profile', icon: <LayoutDashboard size={18} />, label: 'Profile' },
    { path: '/orders', icon: <FileText size={18} />, label: 'Orders' },
    { path: '/my-invoices', icon: <ReceiptText size={18} />, label: 'Invoices' },
    { path: '/contact-support', icon: <LifeBuoy size={18} />, label: 'Support' },
  ];

  const SidebarContent = (
    <div className="h-full flex flex-col bg-blue-700 text-white p-4 w-64 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between md:justify-start md:space-x-3">
        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-blue-900">
          C
        </div>
        <div className="hidden md:block">
          <div className="font-semibold">Customer</div>
          <div className="text-sm text-yellow-100">Welcome</div>
        </div>
        <button
          onClick={() => setDrawerOpen(false)}
          className="md:hidden ml-auto"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-3">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center gap-2 ${
              isActive(item.path)
                ? 'text-yellow-300 font-semibold'
                : 'hover:text-yellow-300'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
        <a
          href="/logout"
          className="flex items-center gap-2 text-red-300 hover:text-red-200 mt-6"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </a>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Menu Toggle */}
      <div className="absolute top-4 left-4 z-20 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-blue-800 bg-white p-2 rounded shadow"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Drawer for Mobile */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-10" onClick={() => setDrawerOpen(false)} />
          <div className="fixed top-0 left-0 h-full z-20">{SidebarContent}</div>
        </>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-shrink-0">{SidebarContent}</aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
