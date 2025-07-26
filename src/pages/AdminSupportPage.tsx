// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import PageHeader from "@/components/ui/PageHeader";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("You must be logged in.");
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user || !user.email?.endsWith("@admin.cauverystore.in")) {
        setError("Unauthorized access");
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      setAuthChecked(true);
      fetchStats();
    };

    init();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("orders").select("*", { count: "exact" }),
        supabase.from("products").select("*", { count: "exact" }),
      ]);

      if (usersRes.error || ordersRes.error || productsRes.error) {
        throw new Error("Failed to fetch dashboard data");
      }

      setStats({
        users: usersRes.count || 0,
        orders: ordersRes.count || 0,
        products: productsRes.count || 0,
      });
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>Admin Dashboard | Cauverystore</title>
        <meta
          name="description"
          content="Overview of Cauverystore's users, orders, and product statistics for admins."
        />
        <meta property="og:title" content="Admin Dashboard | Cauverystore" />
        <meta
          property="og:description"
          content="Monitor total users, orders, and products on Cauverystore."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Admin Dashboard | Cauverystore" />
        <meta
          name="twitter:description"
          content="Monitor total users, orders, and products on Cauverystore."
        />
      </Helmet>

      <PageHeader title="Admin Dashboard" subtitle="Platform statistics at a glance" />

      {!authChecked ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-white border rounded shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Users</h3>
            <p className="text-3xl font-bold">{stats.users}</p>
          </div>
          <div className="bg-white border rounded shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Orders</h3>
            <p className="text-3xl font-bold">{stats.orders}</p>
          </div>
          <div className="bg-white border rounded shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Products</h3>
            <p className="text-3xl font-bold">{stats.products}</p>
          </div>
        </div>
      )}
    </div>
  );
}
