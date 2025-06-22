// src/pages/CartPage.tsx
import { useCartStore } from '@/stores/useCartStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
}

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
  }, [cartItems]);

  const fetchProductDetails = async () => {
    if (cartItems.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ids = cartItems.map((item) => item.id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error(err.message);
      setError('Failed to load cart products.');
    } finally {
      setLoading(false);
    }
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);

  const total = cartItems.reduce((acc, item) => {
    const product = getProduct(item.id);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Shopping Cart</h1>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : cartItems.length === 0 ? (
        <div className="text-gray-600 text-center py-12">
          Your cart is empty. 🛒
        </div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => {
            const product = getProduct(item.id);
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between border rounded p-4 bg-white shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-green-700">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      ₹{product.price} × {item.quantity}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 text-sm"
                >
                  Remove
                </Button>
              </div>
            );
          })}

          {/* Totals & Actions */}
          <div className="text-right border-t pt-4">
            <p className="text-xl font-semibold text-green-700">
              Total: ₹{total.toFixed(2)}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={clearCart}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
              >
                Clear Cart
              </Button>
              <Button
                onClick={handleCheckout}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
