import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const parsed = storedCart ? JSON.parse(storedCart) : [];
    setCartItems(parsed);
  }, []);

  useEffect(() => {
    const sum = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(sum);
  }, [cartItems]);

  const handleRemove = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-16">
        <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
        <Link to="/storefront" className="text-green-600 hover:underline mt-4 inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Your Cart</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center bg-white p-4 shadow rounded">
            <div>
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-600">
                ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
              </p>
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              className="text-red-600 hover:underline text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <p className="text-xl font-semibold">Total: ₹{total}</p>
        <button
          onClick={handleCheckout}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
