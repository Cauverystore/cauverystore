// src/components/WishlistButton.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { Heart, HeartOff } from 'lucide-react';

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    image_url: string;
    stock: number;
  };
}

const WishlistButton = ({ product }: Props) => {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const [loading, setLoading] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = async () => {
    setLoading(true);
    if (inWishlist) {
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('product_id', product.id)
        .single();

      if (existing) {
        await supabase.from('wishlists').delete().eq('id', existing.id);
        removeItem(product.id);
        toast.success('Removed from wishlist');
      }
    } else {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({ product_id: product.id })
        .select('id, product:product_id(*)')
        .single();

      if (!error && data) {
        addItem(data);
        toast.success('Added to wishlist');
      }
    }
    setLoading(false);
  };

  return (
    <button
      disabled={loading}
      onClick={toggleWishlist}
      className={`text-xl ${inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-400'} transition`}
      title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      {inWishlist ? <HeartOff /> : <Heart />}
    </button>
  );
};

export default WishlistButton;
