import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/SupabaseClient";
import toast from "react-hot-toast";
import CartIcon from "./CartIcon";

interface NavbarProps {
  user: any;
  role: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ user, role }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Logout failed.");
    } else {
      toast.success("Logged out.");
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo / Home Link */}
      <Link to="/" className="text-xl font-bold text-green-700">
        Cauvery Store
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-4 text-sm">
        <Link to="/products" className="hover:text-green-600">
          Products
        </Link>

        {user && role === "merchant" && (
          <Link to="/merchant" className="hover:text-green-600">
            Merchant
          </Link>
        )}

        {user && role === "admin" && (
          <Link to="/admin" className="hover:text-green-600">
            Admin
          </Link>
        )}

        {user && (
          <>
            <Link to="/profile" className="hover:text-green-600">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" className="hover:text-green-600">
              Login
            </Link>
            <Link to="/signup" className="hover:text-green-600">
              Signup
            </Link>
          </>
        )}

        {/* Cart Icon (Always Visible) */}
        <CartIcon />
      </div>
    </nav>
  );
};

export default Navbar;
