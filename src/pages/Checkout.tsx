import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/SupabaseClient";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please log in to place an order.");
      setPlacingOrder(false);
      return;
    }

    const { error } = await supabase.from("orders").insert([
      {
        user_id: session.user.id,
        total,
        items: cart,
      },
    ]);

    if (error) {
      toast.error("Failed to place order.");
      console.error(error);
    } else {
      toast.success("Order placed successfully!");
      clearCart();
      navigate("/checkout-success");
    }

    setPlacingOrder(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Checkout</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-white shadow rounded px-4 py-2"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}

          <div className="flex justify-between font-bold text-lg mt-6">
            <span>Total:</span>
            <span>₹{total}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 mt-4"
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
