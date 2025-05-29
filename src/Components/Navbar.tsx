import { useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const { items } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md px-4 py-3 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-700">
          CauveryStore
        </Link>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-6">
          <Link to="/cart" className="relative text-2xl">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="sm:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl">
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="sm:hidden mt-3 space-y-2">
          <Link to="/cart" className="block relative text-lg" onClick={() => setMenuOpen(false)}>
            🛒 Cart
            {totalItems > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
}
