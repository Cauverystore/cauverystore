// src/layouts/PublicLayout.tsx
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png'; // Replace with your logo path

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/store', label: 'Store' },
  { path: '/wishlist', label: 'Wishlist' },
  { path: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow px-4 py-3 dark:bg-gray-900 dark:text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg text-green-700 dark:text-green-400">
            <img src={logo} alt="Logo" className="h-8 w-8" />
            CauveryStore
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive
                    ? 'text-green-700 font-semibold'
                    : 'hover:text-green-600 text-gray-700 dark:text-gray-300'
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/cart" className="relative hover:text-green-600">
              <ShoppingCart size={20} />
            </NavLink>
            <NavLink to="/login" className="hover:text-green-600">
              <User size={20} />
            </NavLink>
          </nav>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden mt-4 space-y-3 px-2 text-gray-700 dark:text-gray-300">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded ${
                    isActive ? 'bg-green-100 dark:bg-green-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/cart" className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800">
              🛒 Cart
            </NavLink>
            <NavLink to="/login" className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800">
              👤 Login
            </NavLink>
          </nav>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 text-center py-4 text-sm text-gray-500 dark:text-gray-400 mt-auto border-t dark:border-gray-700">
        © {new Date().getFullYear()} CauveryStore. All rights reserved.
      </footer>
    </div>
  );
}
