// src/components/Header.tsx
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-primary text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">CauveryStore</Link>
      <input
        type="text"
        placeholder="Search for products"
        className="px-3 py-2 rounded w-96 text-black"
      />
      <nav className="space-x-6">
        <Link to="/login" className="hover:underline">Login</Link>
        <Link to="/cart" className="hover:underline">Cart</Link>
      </nav>
    </header>
  );
}
