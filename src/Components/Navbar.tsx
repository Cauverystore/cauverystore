import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const { isLoggedIn, role, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="flex gap-4 items-center font-medium text-sm">
        <Link to="/">CauveryStore</Link>
        <Link to="/cart">Cart</Link>
        {isLoggedIn && role === "admin" && <Link to="/admin/orders">Admin</Link>}
      </div>
      <div className="flex gap-4">
        {isLoggedIn ? (
          <button
            onClick={logout}
            className="text-red-600 hover:underline text-sm"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-green-600 hover:underline text-sm">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
