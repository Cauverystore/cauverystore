import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ReceiptText,
  LifeBuoy,
  LogOut,
} from 'lucide-react';

const CustomerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/profile', icon: <LayoutDashboard size={18} />, label: 'Profile' },
    { path: '/orders', icon: <FileText size={18} />, label: 'Orders' },
    { path: '/my-invoices', icon: <ReceiptText size={18} />, label: 'Invoices' },
    { path: '/contact-support', icon: <LifeBuoy size={18} />, label: 'Support' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`bg-blue-700 text-white p-4 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-sm mb-6 hover:text-yellow-300"
        >
          {collapsed ? '➡️' : '⬅️ Collapse'}
        </button>

        {/* Profile */}
        {!collapsed && (
          <div className="mb-6 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-blue-900">
              C
            </div>
            <div>
              <div className="font-semibold">Customer</div>
              <div className="text-sm text-yellow-100">Welcome</div>
            </div>
          </div>
        )}

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
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && item.label}
            </a>
          ))}
          <a
            href="/logout"
            className="flex items-center gap-2 text-red-300 hover:text-red-200 mt-6"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && 'Logout'}
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 text-gray-900 dark:text-white">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
