import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  usage_limit: number;
  expires_at: string;
  created_at: string;
}

export default function AdminCouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    discount_percent: 0,
    usage_limit: 1,
    expires_at: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Failed to load coupons.");
    else setCoupons(data || []);

    setLoading(false);
  };

  const handleCreate = async () => {
    const { code, discount_percent, usage_limit, expires_at } = form;
    if (!code || !discount_percent || !expires_at) {
      toast.error("All fields required");
      return;
    }

    const { error } = await supabase.from("coupons").insert({
      code,
      discount_percent,
      usage_limit,
      expires_at,
    });

    if (error) toast.error("Create failed");
    else {
      toast.success("Coupon created");
      setForm({ code: "", discount_percent: 0, usage_limit: 1, expires_at: "" });
      fetchCoupons();
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Delete this coupon?");
    if (!confirm) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Deleted");
      fetchCoupons();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Coupon Manager | Admin</title>
        <meta name="description" content="Create and manage discount coupons." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Coupon Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <Input
          placeholder="Discount %"
          type="number"
          value={form.discount_percent}
          onChange={(e) => setForm({ ...form, discount_percent: parseFloat(e.target.value) })}
        />
        <Input
          placeholder="Usage Limit"
          type="number"
          value={form.usage_limit}
          onChange={(e) => setForm({ ...form, usage_limit: parseInt(e.target.value) })}
        />
        <Input
          type="date"
          value={form.expires_at}
          onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
        />
      </div>
      <Button onClick={handleCreate}>Add Coupon</Button>

      <div className="mt-8">
        {loading ? (
          <Spinner size="lg" />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : coupons.length === 0 ? (
          <EmptyState message="No coupons available." />
        ) : (
          <div className="space-y-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="border p-4 rounded flex justify-between items-center bg-white dark:bg-gray-800"
              >
                <div>
                  <p className="font-medium">{c.code}</p>
                  <p className="text-sm text-gray-500">
                    {c.discount_percent}% off | Limit: {c.usage_limit} | Expires: {new Date(
                      c.expires_at
                    ).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
