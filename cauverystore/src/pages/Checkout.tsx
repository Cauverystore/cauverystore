import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cartItems, clearCart } = useCartStore();
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !address) return;

    setLoading(true);

    // 1. Create new order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customerName,
          email,
          address,
          total_amount: total,
          items: JSON.stringify(cartItems),
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      setLoading(false);
      alert("Order creation failed.");
      return;
    }

    // 2. Insert order items
    const orderItemsPayload = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      setLoading(false);
      alert("Order items failed to save.");
      return;
    }

    // 3. Deduct stock
    for (const item of cartItems) {
      const { data: product, error } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        setLoading(false);
        alert(`Product not found: ${item.name}`);
        return;
      }

      if (product.stock < item.quantity) {
        setLoading(false);
        alert(`${item.name} is out of stock.`);
        return;
      }

      await supabase
        .from("products")
        .update({ stock: product.stock - item.quantity })
        .eq("id", item.id);
    }

    clearCart();
    setSuccess(true);
    setTimeout(() => navigate("/"), 3000);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold text-green-700 mb-2">
          ✅ Order Placed Successfully!
        </h2>
        <p>You will be redirected to the homepage shortly.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Checkout</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <textarea
          placeholder="Shipping Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <div className="font-semibold text-right">Total: ₹{total.toFixed(2)}</div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}
