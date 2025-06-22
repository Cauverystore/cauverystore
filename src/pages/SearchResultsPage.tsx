// src/pages/SearchResultsPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import { useDebounce } from '@/hooks/useDebounce';
import { Helmet } from 'react-helmet-async';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchResults(debouncedQuery);
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [debouncedQuery]);

  const fetchResults = async (searchTerm: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, product_reviews(rating)')
      .ilike('name', `%${searchTerm}%`);

    if (error) {
      console.error('Search error:', error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Helmet>
        <title>Search Results | Cauverystore</title>
      </Helmet>

      <h1 className="text-2xl font-bold text-green-700 mb-4">
        Search Results for "{query}"
      </h1>

      {loading ? (
        <p className="text-gray-500">Searching...</p>
      ) : products.length === 0 ? (
        <p className="text-red-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} searchTerm={debouncedQuery} />
          ))}
        </div>
      )}
    </div>
  );
}
