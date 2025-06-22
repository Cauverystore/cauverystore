import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  BarChart,
  LifeBuoy,
  LogOut,
} from 'lucide-react';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    { path: '/admin/orders', icon: <FileText size={18} />, label: 'Orders' },
    { path: '/admin/products', icon: <Package size={18} />, label: 'Products' },
    { path: '/admin/reports', icon: <BarChart size={18} />, label: 'Reports' },
    { path: '/admin/support-requests', icon: <LifeBuoy size={18} />, label: 'Support' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white transition-all duration-300 ease-in-out p-4 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-sm mb-6 text-white hover:text-green-400"
        >
          {collapsed ? '➡️' : '⬅️ Collapse'}
        </button>

        {/* Admin Profile */}
        {!collapsed && (
          <div className="mb-6 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold text-white">
              A
            </div>
            <div>
              <div className="font-semibold">Admin Name</div>
              <div className="text-sm text-gray-300">Administrator</div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-3">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 ${
                isActive(item.path)
                  ? 'text-green-400 font-semibold'
                  : 'hover:text-green-300'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && item.label}
            </a>
          ))}

          <a
            href="/logout"
            className="flex items-center gap-2 text-red-400 hover:text-red-300 mt-6"
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

export default AdminLayout;
