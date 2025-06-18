import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { highlightMatch } from '@/utils/highlightMatch';

const CATEGORIES = ['all', 'herbs', 'oils', 'grains'];
const TAGS = ['Best Seller', 'New', 'Discount'];

export default function StorefrontPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    fetchProducts();
  }, [sortBy, debouncedSearchTerm, selectedCategory, selectedTag, page]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*, product_reviews(rating)');

      if (sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      let filtered = data || [];

      if (selectedCategory !== 'all') {
        filtered = filtered.filter((p) => p.category === selectedCategory);
      }

      if (selectedTag) {
        filtered = filtered.filter((p) => p.tags?.includes(selectedTag));
      }

      if (debouncedSearchTerm.trim()) {
        const term = debouncedSearchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        );
      }

      setProducts(filtered);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => prev + 1);

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-48"
        />

        {/* Category Dropdown with Highlighting */}
        <div className="relative">
          <div
            className="border p-2 rounded bg-white cursor-pointer w-48"
            onClick={() => setShowCategories((prev) => !prev)}
          >
            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
          </div>
          {showCategories && (
            <ul className="absolute z-20 bg-white border rounded mt-1 w-48 max-h-60 overflow-y-auto shadow">
              {CATEGORIES.map((cat) => (
                <li
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowCategories(false);
                  }}
                  className={`p-2 hover:bg-green-100 cursor-pointer ${
                    selectedCategory === cat ? 'bg-green-200 font-semibold' : ''
                  }`}
                >
                  {highlightMatch(cat, searchTerm)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded w-48"
        >
          <option value="default">Sort</option>
          <option value="price_asc">Price Low to High</option>
          <option value="price_desc">Price High to Low</option>
        </select>
      </div>

      {/* Tag Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full border ${
              selectedTag === tag
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-green-100'
            }`}
            onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            searchTerm={debouncedSearchTerm}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button onClick={handleNextPage}>Next</Button>
      </div>
    </div>
  );
}
