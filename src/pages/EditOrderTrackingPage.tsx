import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { sendTrackingEmail } from "@/lib/resend";

export default function EditOrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [form, setForm] = useState({
    tracking_id: "",
    courier_service: "",
    estimated_delivery_date: "",
    tracking_status: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!error && data) {
      setOrder(data);
      setForm({
        tracking_id: data.tracking_id || "",
        courier_service: data.courier_service || "",
        estimated_delivery_date: data.estimated_delivery_date || "",
        tracking_status: data.tracking_status || "pending",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!order) return;
    setSaving(true);

    const { error } = await supabase
      .from("orders")
      .update({
        tracking_id: form.tracking_id,
        courier_service: form.courier_service,
        estimated_delivery_date: form.estimated_delivery_date,
        tracking_status: form.tracking_status,
      })
      .eq("id", order.id);

    if (!error && form.tracking_status === "shipped" && order.tracking_status !== "shipped") {
      // Get customer email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", order.user_id)
        .single();

      if (!userError && user?.email) {
        await sendTrackingEmail({
          to: user.email,
          order_id: order.id,
          tracking_id: form.tracking_id,
          courier: form.courier_service,
          estimated_date: form.estimated_delivery_date,
        });
      }
    }

    setSaving(false);
    alert("Order tracking updated.");
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Update Order Tracking</h1>
      {order ? (
        <div className="space-y-4">
          <input
            type="text"
            name="tracking_id"
            value={form.tracking_id}
            onChange={handleChange}
            placeholder="Tracking ID"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            name="courier_service"
            value={form.courier_service}
            onChange={handleChange}
            placeholder="Courier Service"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="date"
            name="estimated_delivery_date"
            value={form.estimated_delivery_date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <select
            name="tracking_status"
            value={form.tracking_status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Tracking"}
          </button>
        </div>
      ) : (
        <p>Loading order...</p>
      )}
    </div>
  );
}
