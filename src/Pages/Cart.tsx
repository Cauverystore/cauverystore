import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";

export default function Cart() {
  const { items, removeFromCart, clearCart } = useCartStore();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty 🛒</h2>
        <Link
          to="/"
          className="text-green-600 underline hover:text-green-700 transition"
        >
          Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Your Cart</h2>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b pb-4"
          >
            <div className="flex items-center space-x-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  ₹{item.price} x {item.quantity}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-lg font-semibold">
                ₹{item.price * item.quantity}
              </p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <h3 className="text-xl font-bold">Total: ₹{total.toFixed(2)}</h3>
        <div className="space-x-4">
          <button
            onClick={clearCart}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Cart
          </button>
          <Link
            to="/checkout"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
