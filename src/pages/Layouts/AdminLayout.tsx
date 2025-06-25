// src/layouts/AdminLayout.tsx
import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  BarChart,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/orders", icon: FileText, label: "Orders" },
  { path: "/admin/products", icon: Package, label: "Products" },
  { path: "/admin/reports", icon: BarChart, label: "Reports" },
  { path: "/admin/support-requests", icon: LifeBuoy, label: "Support" },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      {navItems.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 ${
              isActive ? "bg-green-600 text-white font-semibold" : "text-gray-300"
            }`
          }
          onClick={() => setMobileOpen(false)}
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
      <a
        href="/logout"
        className="flex items-center gap-2 px-3 py-2 rounded text-red-400 hover:text-red-300 mt-4"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </a>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-gray-800 text-white p-4">
        <div className="mb-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-500 text-gray-900 font-bold flex items-center justify-center">
            A
          </div>
          <div>
            <div className="font-semibold">Admin</div>
            <div className="text-sm text-gray-300">Administrator</div>
          </div>
        </div>
        <nav className="space-y-2">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile Drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-gray-800 text-white p-4">
        <div className="font-bold">Admin Panel</div>
        <button onClick={() => setMobileOpen((prev) => !prev)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed top-16 left-0 z-40 w-64 h-full bg-gray-800 text-white p-4 space-y-2 shadow-lg">
          <NavLinks />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 mt-16 md:mt-0 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
