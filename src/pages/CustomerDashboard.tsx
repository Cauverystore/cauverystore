// Page: CustomerDashboard.tsx (already existing)

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      fetchOrders(user.id);
      fetchWishlist(user.id);
    }
  };

  const fetchOrders = async (uid: string) => {
    const { data } = await supabase
      .from('orders')
      .select('id, created_at, total_amount')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setOrders(data);
  };

  const fetchWishlist = async (uid: string) => {
    const { data } = await supabase
      .from('wishlist')
      .select('products(id, name, price, image_url)')
      .eq('user_id', uid)
      .limit(3);
    if (data) setWishlist(data);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-700">
        Welcome back, {userEmail}
      </h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Orders</h2>
        {orders.length === 0 ? (
          <p>No recent orders.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <li key={order.id} className="border p-3 rounded bg-white">
                <p>Order ID: {order.id}</p>
                <p>Placed: {new Date(order.created_at).toLocaleDateString()}</p>
                <p>Total: ₹{order.total_amount}</p>
              </li>
            ))}
          </ul>
        )}
        <Link to="/orders" className="text-blue-600 text-sm mt-2 block">
          View All Orders
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Your Wishlist</h2>
        {wishlist.length === 0 ? (
          <p>Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wishlist.map((item: any) => (
              <Link
                to={`/product/${item.products.id}`}
                key={item.products.id}
                className="border p-3 rounded bg-white hover:shadow"
              >
                <img
                  src={item.products.image_url}
                  alt={item.products.name}
                  className="w-full h-32 object-cover rounded"
                />
                <h3 className="font-medium mt-2">{item.products.name}</h3>
                <p className="text-sm text-green-700">₹{item.products.price}</p>
              </Link>
            ))}
          </div>
        )}
        <Link to="/wishlist" className="text-blue-600 text-sm mt-2 block">
          View Full Wishlist
        </Link>
      </section>
    </div>
  );
}
