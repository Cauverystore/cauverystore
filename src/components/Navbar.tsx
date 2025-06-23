import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, role } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    setDarkMode(stored === 'dark');
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { path: '/store', label: 'Store' },
    { path: '/wishlist', label: 'Wishlist' },
    { path: '/orders', label: 'Orders' },
    { path: '/my-invoices', label: 'Invoices' },
    { path: '/profile', label: 'Profile' },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin Dashboard' },
    { path: '/admin/product-reports', label: 'Product Reports' },
  ];

  const merchantLinks = [{ path: '/merchant', label: 'Merchant Dashboard' }];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-green-700">
          CauveryStore
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium ${
                isActive(link.path)
                  ? 'text-green-600 underline underline-offset-4'
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {role === 'admin' &&
            adminLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-green-600 underline underline-offset-4'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

          {role === 'merchant' &&
            merchantLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-green-600 underline underline-offset-4'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="text-gray-700 dark:text-gray-200"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 dark:text-gray-200"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-4 pb-4 space-y-2">
          {[...navLinks,
            ...(role === 'admin' ? adminLinks : []),
            ...(role === 'merchant' ? merchantLinks : []),
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${
                isActive(link.path)
                  ? 'text-green-600 underline underline-offset-4'
                  : 'text-gray-700 dark:text-gray-300 hover:text-green-600'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => {
              setDarkMode((prev) => !prev);
              setMenuOpen(false);
            }}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="block bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
