import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import LabeledInput from "@/components/ui/LabeledInput";
import FormField from "@/components/ui/FormField";

import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addToCart = useCartStore((state) => state.addToCart);
  const { toast } = useToast();

  useEffect(() => {
    fetchProductAndReviews();
  }, [productId]);

  const fetchProductAndReviews = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      const { data: reviewsData } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      setProduct(productData);
      setReviews(reviewsData || []);

      // ✅ Trigger GA4 view_item
      if (window.gtag && productData) {
        window.gtag("event", "view_item", {
          currency: "INR",
          value: productData.price,
          items: [
            {
              item_id: productData.id,
              item_name: productData.name,
              price: productData.price,
            },
          ],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to submit a review.");
      }

      const { error } = await supabase.from("product_reviews").insert([
        {
          product_id: productId,
          user_name: user.email,
          rating,
          comment: reviewText,
        },
      ]);

      if (error) throw error;

      // ✅ GA4 Review submission tracking
      if (window.gtag && product) {
        window.gtag("event", "submit_review", {
          item_id: product.id,
          item_name: product.name,
          rating,
        });
      }

      toast({ type: "success", description: "Review submitted!" });
      setReviewText("");
      setRating(5);
      fetchProductAndReviews();
    } catch (err: any) {
      toast({ type: "error", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (window.gtag && product) {
      window.gtag("event", "add_to_cart", {
        currency: "INR",
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: 1,
          },
        ],
      });
    }

    addToCart(product);
    toast({ type: "success", description: "Added to cart!" });
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return <ErrorAlert message={error || "Product not found"} />;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Helmet>
        <title>{product.name} | Cauverystore</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} | Cauverystore`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image_url} />
        <meta property="og:url" content={`https://cauverystore.in/product/${product.id}`} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | Cauverystore`} />
        <meta name="twitter:description" content={product.description} />
        <meta name="twitter:image" content={product.image_url} />
      </Helmet>

      <PageHeader title={product.name} subtitle={product.category || "Product"} />

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full rounded shadow border"
        />
        <div>
          <p className="text-xl font-semibold text-green-700 mb-2">₹{product.price}</p>
          <p className="mb-4">{product.description}</p>

          <div className="flex gap-4">
            <Button onClick={handleAddToCart}>Add to Cart</Button>
            <Button variant="outline">❤️ Wishlist</Button>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((rev, idx) => (
              <li key={idx} className="border p-3 rounded">
                <p className="font-semibold">{rev.user_name}</p>
                <p className="text-sm text-gray-600">Rating: {rev.rating}/5</p>
                <p>{rev.comment}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Write a review</h3>

          <FormField label="Rating (1 to 5)">
            <LabeledInput
              type="number"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min={1}
              max={5}
              required
            />
          </FormField>

          <FormField label="Your Comment">
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
            />
          </FormField>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>
    </div>
  );
}
