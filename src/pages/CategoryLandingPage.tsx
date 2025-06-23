// src/pages/CategoryLandingPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';

import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function CategoryLandingPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndProducts(categoryId);
    }
  }, [categoryId]);

  const fetchCategoryAndProducts = async (id: string) => {
    setLoading(true);

    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (categoryError || !categoryData) {
      navigate('/404');
      return;
    }

    setCategory(categoryData);

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', id)
      .eq('is_active', true)
      .gt('stock', 0);

    if (productsError) {
      console.error(productsError);
    } else {
      setProducts(productsData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6 text-center">
        <EmptyState
          title="Category Not Found"
          description="The category you're looking for does not exist."
          actionLabel="Go Back"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Helmet>
        <title>{category.name} | Cauvery Store</title>
        <meta name="description" content={`Explore products under the ${category.name} category.`} />
      </Helmet>

      <PageHeader
        title={category.name}
        subtitle={category.description || 'Browse top products in this category'}
      />

      {products.length === 0 ? (
        <EmptyState
          title="No Products Available"
          description="We’re adding more products soon. Stay tuned!"
          actionLabel="Go to Storefront"
          onAction={() => navigate('/storefront')}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
