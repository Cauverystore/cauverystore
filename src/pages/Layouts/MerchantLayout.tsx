import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PackageSearch,
  PackagePlus,
  ReceiptText,
  LogOut,
} from 'lucide-react';

const MerchantLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/merchant/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/merchant/orders', icon: <FileText size={18} />, label: 'Orders' },
    { path: '/merchant/products', icon: <PackageSearch size={18} />, label: 'Products' },
    { path: '/merchant/products/add', icon: <PackagePlus size={18} />, label: 'Add Product' },
    { path: '/merchant/invoices', icon: <ReceiptText size={18} />, label: 'Invoices' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`bg-indigo-800 text-white p-4 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-sm mb-6 hover:text-yellow-300"
        >
          {collapsed ? '➡️' : '⬅️ Collapse'}
        </button>

        {/* Profile Info */}
        {!collapsed && (
          <div className="mb-6 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-indigo-900">
              M
            </div>
            <div>
              <div className="font-semibold">Merchant</div>
              <div className="text-sm text-yellow-200">Store Owner</div>
            </div>
          </div>
        )}

        {/* Nav Links */}
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

      {/* Content Area */}
      <main className="flex-1 p-6 text-gray-900 dark:text-white">
        <Outlet />
      </main>
    </div>
  );
};

export default MerchantLayout;
