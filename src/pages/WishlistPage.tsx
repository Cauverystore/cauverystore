// src/pages/WishlistPage.tsx – Fully Integrated with Helmet, Buttons, Empty State
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { useCartStore } from '@/stores/useCartStore';

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image_url: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login to view wishlist');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        toast.error('Failed to fetch wishlist');
      } else {
        setWishlist(data as WishlistItem[]);
      }

      setLoading(false);
    };

    fetchWishlist();
  }, [navigate]);

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from('wishlist').delete().eq('id', id);
    if (error) {
      toast.error('Failed to remove item');
    } else {
      toast.success('Removed from wishlist');
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({ id: item.product_id, name: item.name, price: item.price, quantity: 1 });
    toast.success('Added to cart');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Helmet>
        <title>Wishlist | Cauvery Store</title>
        <meta name="description" content="View and manage your saved items on Cauvery Store." />
      </Helmet>

      <PageHeader title="My Wishlist" subtitle="Save items for later purchase" />

      {loading ? (
        <Spinner size="lg" />
      ) : wishlist.length === 0 ? (
        <EmptyState
          title="No items in wishlist"
          description="Browse the store and add your favorite items to your wishlist."
          actionLabel="Go to Store"
          onAction={() => navigate('/storefront')}
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {wishlist.map((item) => (
            <li key={item.id} className="border rounded p-4 bg-white shadow-sm flex flex-col">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-48 object-cover rounded mb-3"
              />
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600 mb-2">₹{item.price}</p>
              <div className="mt-auto flex gap-2">
                <Button onClick={() => handleAddToCart(item)} className="bg-green-600 text-white">
                  Add to Cart
                </Button>
                <Button variant="outline" onClick={() => handleRemove(item.id)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
