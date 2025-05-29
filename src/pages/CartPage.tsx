import { useCartStore } from "@/store/cartStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, removeItem, getTotal } = useCartStore();
  const navigate = useNavigate();

  const handleRemove = (id: string) => {
    removeItem(id);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                  <p className="font-medium text-lg">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 text-sm mt-2 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="text-xl font-bold">Summary</h3>
            <p className="text-lg">
              Total: <span className="font-semibold">₹{getTotal().toFixed(2)}</span>
            </p>
            <Button className="w-full" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
