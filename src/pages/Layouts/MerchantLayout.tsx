// src/layouts/MerchantLayout.tsx
import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PackageSearch,
  PackagePlus,
  ReceiptText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { path: "/merchant/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/merchant/orders", icon: FileText, label: "Orders" },
  { path: "/merchant/products", icon: PackageSearch, label: "Products" },
  { path: "/merchant/products/add", icon: PackagePlus, label: "Add Product" },
  { path: "/merchant/invoices", icon: ReceiptText, label: "Invoices" },
];

const MerchantLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      {navItems.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded hover:bg-indigo-700 ${
              isActive ? "bg-indigo-600 text-yellow-200 font-semibold" : "text-white"
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
        className="flex items-center gap-2 px-3 py-2 rounded text-red-300 hover:text-red-200 mt-4"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </a>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-indigo-800 text-white p-4">
        <div className="mb-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400 text-indigo-900 font-bold flex items-center justify-center">
            M
          </div>
          <div>
            <div className="font-semibold">Merchant</div>
            <div className="text-sm text-yellow-200">Store Owner</div>
          </div>
        </div>
        <nav className="space-y-2">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile Drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-indigo-800 text-white p-4">
        <div className="font-bold">Merchant Panel</div>
        <button onClick={() => setMobileOpen((prev) => !prev)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed top-16 left-0 z-40 w-64 h-full bg-indigo-800 text-white p-4 space-y-2 shadow-lg">
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

export default MerchantLayout;
