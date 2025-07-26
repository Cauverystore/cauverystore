// src/layouts/AdminLayout.tsx
import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  LifeBuoy,
  Megaphone,
  FolderKanban,
  HelpCircle,
  IndianRupee,
  BarChart,
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
import { supabase } from "@/lib/supabaseClient";
import logo from "@/assets/logo.png";

const navItems = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/orders", icon: FileText, label: "Orders" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/support", icon: LifeBuoy, label: "Support" },
  { path: "/admin/banners", icon: Megaphone, label: "Banners" },
  { path: "/admin/categories", icon: FolderKanban, label: "Categories" },
  { path: "/admin/faqs", icon: HelpCircle, label: "FAQs" },
  { path: "/admin/payouts", icon: IndianRupee, label: "Payouts" },
  { path: "/admin/seo", icon: BarChart, label: "SEO" },
  { path: "/admin/testimonials", icon: Users, label: "Testimonials" },
  { path: "/admin/test-results", icon: BarChart, label: "Test Results" },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    const fetchUnread = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (!error) {
        setUnreadCount(data?.length || 0);
      }
    };

    fetchUnread();

    const channel = supabase
      .channel("admin_notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setUnreadCount((prev) => prev + 1);
        try {
          new Audio("/notification.mp3").play();
          if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        } catch {}
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          {path === "/admin/support" && unreadCount > 0 && (
            <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
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
        <title>Admin Panel | CauveryStore</title>
        <meta name="description" content="Admin panel for managing CauveryStore platform." />
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
            <div className="font-semibold">Admin</div>
            <div className="text-sm text-gray-300">Control Panel</div>
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
          CauveryStore Admin
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/support")} className="relative">
            <Bell size={18} className="text-yellow-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
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
              placeholder="Search..."
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
