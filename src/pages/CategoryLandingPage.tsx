// src/pages/CategoryLandingPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  subcategory?: string;
}

export default function CategoryLandingPage() {
  const { category } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);

    if (error) {
      console.error('Failed to load category products', error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const groupBySubcategory = () => {
    const map: Record<string, Product[]> = {};
    for (const product of products) {
      const subcat = product.subcategory || 'Uncategorized';
      if (!map[subcat]) map[subcat] = [];
      map[subcat].push(product);
    }
    return map;
  };

  const grouped = groupBySubcategory();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Helmet>
        <title>{category?.toUpperCase()} | Cauverystore</title>
        <meta name="description" content={`Explore all products under ${category}`} />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6 capitalize">
        {category} Products
      </h1>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        Object.entries(grouped).map(([subcat, prods]) => (
          <div key={subcat} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {subcat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {prods.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
