import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/Components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to checkout.");
      navigate("/login");
    }
  }, [user, navigate]);

  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !street || !city || !pincode) {
      toast.error("Please fill in all address fields.");
      return;
    }

    if (items.length === 0) {
      toast.error("Cart is empty.");
      return;
    }

    setLoading(true);

    const address = { fullName, phone, street, city, pincode };

    const { error: orderError } = await supabase.from("orders").insert([
      {
        User_id: user.id,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: getTotal(),
        status: "pending",
        address,
      },
    ]);

    for (const item of items) {
      await supabase.rpc("decrement_quantity", {
        pid: item.id,
        qty: item.quantity,
      });
    }

    setLoading(false);

    if (orderError) {
      toast.error("Failed to place order.");
    } else {
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/checkout-success");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Street Address"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="border p-2 rounded w-full md:col-span-2"
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Order Summary */}
      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white rounded-lg shadow p-4"
              >
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
                <div className="text-right font-medium">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-right text-xl font-semibold mt-6">
            Total: ₹{getTotal().toFixed(2)}
          </div>

          <div className="text-right mt-4">
            <Button className="w-full sm:w-auto" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
