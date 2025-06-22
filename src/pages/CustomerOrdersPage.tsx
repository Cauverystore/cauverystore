// src/pages/CustomerOrdersPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    setUserId(user.id);
    fetchOrders(user.id);
  };

  const fetchOrders = async (uid: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Helmet>
        <title>My Orders | Cauverystore</title>
        <meta name="description" content="View your past orders and track deliveries." />
      </Helmet>

      <h1 className="text-2xl font-bold mb-6 text-green-700">My Orders</h1>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="border rounded p-4 mb-6 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <p><strong>Order ID:</strong> {order.id}</p>
              <span className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</span>
            </div>

            <div className="mb-2">
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ₹{order.total_amount}</p>
              <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 border p-3 rounded bg-gray-50 dark:bg-gray-700">
                  <img
                    src={item.products.image_url}
                    alt={item.products.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold">{item.products.name}</p>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                    <p className="text-sm">Price: ₹{item.products.price}</p>
                    <Link
                      to={`/product/${item.products.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
