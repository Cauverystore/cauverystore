import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Moon,
  Sun,
} from "lucide-react";
import { useDarkMode } from "@/store/darkModeStore";
import { useCartStore } from "@/store/useCartStore";
import logo from "@/assets/logo.png";

export default function CustomerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { cartItems } = useCartStore();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setDrawerOpen(false);
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/store", label: "Store" },
    { to: "/wishlist", label: "Wishlist" },
    { to: "/orders", label: "My Orders" },
    { to: "/support", label: "Support" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 dark:text-white">
      <Helmet>
        <title>Customer Panel | CauveryStore</title>
        <meta name="description" content="Browse products, manage orders, wishlist, and profile on CauveryStore." />
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

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-lg">
            <img src={logo} alt="Logo" className="h-8 w-8" /> CauveryStore
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm ${isActive ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-700 dark:text-gray-300"}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-black dark:text-white"
              />
              <button type="submit" className="absolute right-1 top-1 text-gray-500 dark:text-gray-300">
                <Search size={16} />
              </button>
            </form>

            <NavLink to="/cart" className="relative">
              <ShoppingCart size={20} />
              {(cartItems?.length ?? 0) > 0 && (
                <span className="absolute -top-1 -right-2 bg-green-600 text-white text-xs rounded-full px-1.5">
                  {cartItems.length}
                </span>
              )}
            </NavLink>

            <button onClick={toggleDarkMode} aria-label="Toggle theme">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-700 dark:text-gray-300" onClick={() => setDrawerOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm md:hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-900 shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Menu</span>
              <button onClick={() => setDrawerOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-black dark:text-white"
              />
              <button type="submit">
                <Search size={18} />
              </button>
            </form>

            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `text-base ${isActive ? "text-green-600 dark:text-green-400 font-semibold" : "text-gray-700 dark:text-gray-300"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/cart" onClick={() => setDrawerOpen(false)} className="relative text-sm">
                <ShoppingCart size={18} className="inline" />
                {(cartItems?.length ?? 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full px-1.5">
                    {cartItems.length}
                  </span>
                )} Cart
              </NavLink>

              <button
                onClick={() => {
                  toggleDarkMode();
                  setDrawerOpen(false);
                }}
                className="text-sm mt-6"
              >
                {isDarkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-600 dark:text-gray-400 py-4">
        © {new Date().getFullYear()} CauveryStore. All rights reserved.
      </footer>
    </div>
  );
}
