// src/pages/ProductDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';

import Spinner from "@/components/ui/Spinner";
import ErrorAlert from '@/components/ui/ErrorAlert';
import { Button } from "@/components/ui/button"; 
import InputError from '@/components/ui/InputError';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface Review {
  id: string;
  rating: number;
  review: string;
  user_id: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;

      const { data: reviewData } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', id);

      setProduct(productData);
      setReviews(reviewData || []);
    } catch (err: any) {
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!userReview.trim() || userRating === 0 || !product?.id) {
      toast.error('Please provide a rating and review');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('You must be logged in to leave a review');
      return;
    }

    const { error: insertError } = await supabase.from('product_reviews').insert([
      {
        product_id: product.id,
        user_id: user.id,
        rating: userRating,
        review: userReview,
      },
    ]);

    if (insertError) {
      toast.error('Error submitting review');
    } else {
      toast.success('Review submitted');
      setUserReview('');
      setUserRating(0);
      fetchProduct(); // Refresh reviews
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <ErrorAlert message={error || 'Product not found'} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <Helmet>
        <title>{product.name} | Cauvery Store</title>
        <meta name="description" content={product.description?.slice(0, 150)} />
      </Helmet>

      {/* Product Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full md:w-1/2 rounded shadow"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            {product.name}
          </h1>
          <p className="text-gray-700 text-lg mb-2">₹{product.price}</p>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <Button className="w-full">Add to Cart 🛒</Button>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Customer Reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="border-b pb-2">
                <p className="font-semibold text-sm">⭐ {review.rating}/5</p>
                <p className="text-gray-600 text-sm">{review.review}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Leave a Review */}
      <div>
        <h3 className="text-xl font-semibold text-green-700 mb-2">
          Leave a Review
        </h3>
        <div className="flex gap-4 mb-2">
          <select
            value={userRating}
            onChange={(e) => setUserRating(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            <option value={0}>Rating</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <InputError
            condition={userRating === 0}
            message="Rating is required"
          />
        </div>

        <textarea
          className="w-full border rounded px-3 py-2 mb-2"
          rows={3}
          placeholder="Write your review here..."
          value={userReview}
          onChange={(e) => setUserReview(e.target.value)}
        />
        <Button onClick={handleReviewSubmit}>Submit Review</Button>
      </div>
    </div>
  );
}
