import { highlightMatch } from '@/utils/highlightMatch';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category?: string;
    stock?: number;
    discount?: number;
    tags?: string[];
  };
  searchTerm?: string;
}

const tagStyles: Record<string, string> = {
  'Best Seller': 'bg-yellow-500 text-white',
  Discount: 'bg-red-600 text-white',
  New: 'bg-blue-600 text-white',
};

export default function ProductCard({ product, searchTerm = '' }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price - (product.price * product.discount) / 100
      : product.price;

  return (
    <div className="relative border rounded-xl p-4 shadow-md hover:shadow-lg transition duration-300 bg-white dark:bg-gray-900">
      {/* Wishlist Icon */}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 text-red-500 hover:scale-110 transition"
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Product Image */}
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}

      {/* Tag Badges */}
      {product.tags?.length > 0 && (
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                tagStyles[tag] || 'bg-gray-300 text-black'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Product Name */}
      <h2 className="text-lg font-semibold mb-1">
        {highlightMatch(product.name, searchTerm)}
      </h2>

      {/* Product Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        {highlightMatch(product.description, searchTerm)}
      </p>

      {/* Low Stock Warning */}
      {product.stock !== undefined && product.stock < 5 && (
        <p className="text-xs text-red-600 font-semibold mb-1">
          ⚠️ Only {product.stock} left!
        </p>
      )}

      {/* Price Display */}
      <div className="flex items-center gap-2 mb-3">
        {product.discount ? (
          <>
            <span className="text-green-700 font-bold text-base">
              ₹{discountedPrice.toFixed(2)}
            </span>
            <span className="line-through text-sm text-gray-400">
              ₹{product.price}
            </span>
            <span className="text-sm text-red-500 font-semibold">
              -{product.discount}%
            </span>
          </>
        ) : (
          <span className="text-green-700 font-bold text-base">
            ₹{product.price}
          </span>
        )}
      </div>

      {/* Add to Cart */}
      <button
        onClick={() => addToCart(product)}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </button>
    </div>
  );
}
