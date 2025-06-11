import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/SupabaseClient";

const Home = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!error) {
        setRole(data?.role || null);
      }
    };

    fetchRole();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-green-700">Welcome to Cauvery Store</h1>
        <p className="text-gray-700">Your one-stop e-commerce marketplace for local merchants.</p>

        <div className="space-x-4">
          <Link
            to="/storefront"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Shop Now
          </Link>
          <Link
            to="/login"
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
          >
            Login
          </Link>
        </div>

        {role === "admin" && (
          <Link to="/admin" className="block text-sm text-red-600 underline">
            Go to Admin Dashboard
          </Link>
        )}
        {role === "merchant" && (
          <Link to="/merchant" className="block text-sm text-blue-600 underline">
            Go to Merchant Dashboard
          </Link>
        )}
        {role === "customer" && (
          <Link to="/profile" className="block text-sm text-green-600 underline">
            View Your Profile
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
