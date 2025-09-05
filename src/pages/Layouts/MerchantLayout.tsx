import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  Bell,
  LogOut,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useDarkMode } from "@/store/darkModeStore";
import logo from "@/assets/logo.png";

const navItems = [
  { path: "/merchant/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/merchant/products", icon: Package, label: "Products" },
  { path: "/merchant/orders", icon: FileText, label: "Orders" },
  { path: "/merchant/messages", icon: MessageSquare, label: "Messages" },
  { path: "/merchant/settings", icon: Settings, label: "Settings" },
];

export default function MerchantLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/merchant/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

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
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Helmet>
        <title>Merchant Panel | CauveryStore</title>
        <meta name="description" content="Manage products and orders on CauveryStore Merchant Panel." />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-3KRHXGB7JV', { debug_mode: true });
          `}
        </script>
      </Helmet>

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-gray-800 text-white p-4">
        <div className="mb-6 flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full bg-white p-1" />
          <div>
            <div className="font-semibold">Merchant</div>
            <div className="text-sm text-gray-300">Seller Panel</div>
          </div>
        </div>
        <nav className="space-y-2">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-gray-800 text-white px-4 py-3 shadow">
        <div className="flex items-center gap-2 font-bold">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded bg-white p-1" />
          CauveryStore
        </div>
        <div className="flex items-center gap-3">
          <button>
            <Bell size={18} className="text-yellow-400" />
          </button>
          <button onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileOpen((prev) => !prev)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed top-14 left-0 z-40 w-64 h-full bg-gray-800 text-white p-4 space-y-2 shadow-lg">
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm px-2 py-1 border border-gray-600 rounded bg-gray-900 text-white"
            />
            <button type="submit">
              <Search size={18} />
            </button>
          </form>
          <NavLinks />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 mt-14 md:mt-0 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
