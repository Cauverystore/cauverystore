import { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutButton from "@/components/LogoutButton";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderCount, setOrderCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;

      // Check user status
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .eq("status", "active")
        .single();

      if (!profile || error) {
        toast.error("Access denied or account suspended.");
        navigate("/not-authorized");
        return;
      }

      // Fetch orders
      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("User_id", user.id);

      if (!orderError && orders) {
        setOrderCount(orders.length);
        setPendingCount(orders.filter((o) => o.status === "pending").length);
        const total = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        setTotalSpent(total);
      }

      setLoading(false);
    };

    fetchDashboard();
  }, [user, navigate]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customer Dashboard</h2>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-3xl mt-2 text-green-700">{orderCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <h3 className="text-lg font-semibold">Pending Orders</h3>
          <p className="text-3xl mt-2 text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <h3 className="text-lg font-semibold">Total Spent</h3>
          <p className="text-3xl mt-2 text-blue-700">₹{totalSpent.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
