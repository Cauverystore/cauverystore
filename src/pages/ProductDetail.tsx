import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useCartStore } from '@/store/cartStore';
import WishlistButton from '@/components/WishlistButton';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reportedReviewIds, setReportedReviewIds] = useState<number[]>([]);
  const [userReview, setUserReview] = useState('');
  const [rating, setRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { addToCart, clearCart } = useCartStore();

  useEffect(() => {
    fetchProduct();
    getUser();
  }, [id]);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      fetchReportedReviews(user.id);
    }
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
      toast.error('Product not found');
      navigate('/products');
    } else {
      setProduct(data);
      fetchReviews(data.id);
    }
  };

  const fetchReviews = async (productId: string) => {
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (data) {
      setReviews(data);
      setHasReviewed(data.some((r) => r.user_id === userId));
    }
  };

  const fetchReportedReviews = async (uid: number) => {
    const { data } = await supabase
      .from('review_reports')
      .select('review_id')
      .eq('user_id', uid);
    if (data) {
      setReportedReviewIds(data.map((r) => r.review_id));
    }
  };

  const handleReviewSubmit = async () => {
    if (!userId || hasReviewed || !rating || !userReview.trim()) return;
    const { error } = await supabase.from('product_reviews').insert({
      product_id: product.id,
      user_id: userId,
      rating,
      review: userReview,
    });
    if (!error) {
      toast.success('Review submitted');
      setUserReview('');
      setRating(5);
      fetchReviews(product.id);
    }
  };

  const handleReportReview = async (reviewId: number) => {
    if (!userId || reportedReviewIds.includes(reviewId)) return;
    const reason = window.prompt('Please describe the issue with this review:');
    if (!reason?.trim()) return;

    const { error } = await supabase.from('review_reports').insert({
      review_id: reviewId,
      user_id: userId,
      reason,
    });
    if (!error) {
      toast.success('Review reported');
      setReportedReviewIds([...reportedReviewIds, reviewId]);
    } else toast.error('Failed to report review');
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 'No reviews yet';

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full md:w-1/2 h-80 object-cover rounded-xl shadow"
        />

        <div className="flex flex-col md:w-1/2 gap-4">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-green-700">{product.name}</h1>
            <WishlistButton product={product} />
          </div>

          <p className="text-lg">
            ₹{product.price}{' '}
            {product.original_price && product.original_price > product.price && (
              <span className="line-through text-gray-400 ml-2">₹{product.original_price}</span>
            )}
          </p>

          <p className="text-yellow-500 text-sm">⭐ {averageRating}</p>

          <p>{product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}</p>

          <div className="flex gap-4">
            <button
              onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1 })}
              disabled={product.stock <= 0}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                clearCart();
                addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1 });
                navigate('/checkout');
              }}
              disabled={product.stock <= 0}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Buy Now
            </button>
          </div>

          <Link
            to={`/report-product/${product.id}`}
            className="text-sm text-red-600 hover:underline mt-2"
          >
            Report Product
          </Link>
        </div>
      </div>

      {/* Review Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Reviews</h2>

        {reviews.length === 0 && <p>No reviews yet.</p>}

        {reviews.map((review) => (
          <div key={review.id} className="border-b py-3">
            <p className="text-sm text-yellow-500">⭐ {review.rating}</p>
            <p className="text-gray-700 dark:text-gray-300">{review.review}</p>
            <p className="text-xs text-gray-500 italic">Verified Buyer</p>
            {review.reply && <p className="text-xs text-blue-600">Admin Reply: {review.reply}</p>}
            <button
              onClick={() => handleReportReview(review.id)}
              disabled={reportedReviewIds.includes(review.id)}
              className="text-red-500 text-xs hover:underline mt-1"
            >
              {reportedReviewIds.includes(review.id) ? 'Reported' : 'Report Review'}
            </button>
          </div>
        ))}

        {userId && !hasReviewed && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="border px-3 py-1 rounded"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <textarea
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Write your review..."
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
            ></textarea>
            <button
              onClick={handleReviewSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
