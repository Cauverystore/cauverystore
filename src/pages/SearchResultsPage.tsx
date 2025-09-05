// src/pages/SearchResultsPage.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import ProductCard from "@/components/ProductCard";

export default function SearchResultsPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("q") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!searchTerm.trim()) return;

    const fetchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .ilike("name", `%${searchTerm}%`);

        if (error) throw error;

        setProducts(data || []);

        // ✅ GA4 event tracking for search
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "search", {
            search_term: searchTerm,
            results_count: data?.length || 0,
          });
        }
      } catch (err: any) {
        console.error("Search error:", err);
        setError("Something went wrong while fetching results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Helmet>
        <title>Search Results for "{searchTerm}" | Cauverystore</title>
        <meta
          name="description"
          content={`View products matching "${searchTerm}" on Cauverystore.`}
        />
        <meta property="og:title" content={`Search results for "${searchTerm}" | Cauverystore`} />
        <meta
          property="og:description"
          content={`See all items related to "${searchTerm}" on Cauverystore.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://cauverystore.in/search?q=${encodeURIComponent(searchTerm)}`} />
        <meta name="twitter:title" content={`Search: "${searchTerm}" | Cauverystore`} />
        <meta
          name="twitter:description"
          content={`Browse products matching "${searchTerm}" on Cauverystore.`}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <h1 className="text-2xl font-semibold mb-4">
        Search Results for: <span className="text-green-600">"{searchTerm}"</span>
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center">No products found for "{searchTerm}".</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
