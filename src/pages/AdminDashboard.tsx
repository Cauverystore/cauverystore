// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [userRes, orderRes] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
      ]);

      if (userRes.error || orderRes.error) {
        throw userRes.error || orderRes.error;
      }

      setUserCount(userRes.count ?? 0);
      setOrderCount(orderRes.count ?? 0);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin Dashboard | Cauverystore</title>
        <meta
          name="description"
          content="Monitor store activity and user metrics in the Cauverystore admin dashboard."
        />
        <meta property="og:title" content="Admin Dashboard | Cauverystore" />
        <meta
          property="og:description"
          content="Overview of users and orders in the Cauverystore platform."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Admin Dashboard | Cauverystore" />
        <meta
          name="twitter:description"
          content="Monitor activity and metrics as an admin."
        />
      </Helmet>

      <PageHeader title="Admin Dashboard" subtitle="Overview of your platform metrics" />

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="border rounded-lg p-6 shadow bg-white">
            <h2 className="text-lg font-semibold mb-2">Total Users</h2>
            <p className="text-3xl font-bold text-green-700">{userCount}</p>
          </div>
          <div className="border rounded-lg p-6 shadow bg-white">
            <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
            <p className="text-3xl font-bold text-green-700">{orderCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
