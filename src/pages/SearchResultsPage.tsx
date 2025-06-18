// src/pages/SearchResultsPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url?: string;
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  const searchProducts = async (term: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`);

    if (!error && data) {
      setResults(data);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Helmet>
        <title>Search Results for "{query}" | Cauverystore</title>
        <meta
          name="description"
          content={`Browse search results for "${query}" on Cauverystore.`}
        />
      </Helmet>

      <h1 className="text-2xl font-bold mb-4">
        Search Results for “{query}”
      </h1>

      {loading ? (
        <p>Loading results...</p>
      ) : results.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {results.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover mb-2 rounded"
                />
              )}
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-600">{product.category}</p>
              <p className="text-green-600 font-semibold">₹{product.price}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
