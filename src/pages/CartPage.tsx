import { useCartStore } from '@/store/useCartStore';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    ₹{item.price.toFixed(2)} × {item.quantity} = ₹
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="flex items-center mt-2 gap-2">
                    <label className="text-sm">Qty:</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value, 10) || 1)
                      }
                      className="w-16 p-1 border rounded text-center"
                    />
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Remove from cart"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-between items-center border-t pt-4">
            <div>
              <p className="text-lg">
                Total Items: <span className="font-bold">{getTotalItems()}</span>
              </p>
              <p className="text-lg">
                Total Price: ₹
                <span className="font-bold">{getTotalPrice().toFixed(2)}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
