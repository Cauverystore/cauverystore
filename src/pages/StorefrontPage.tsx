// src/pages/StorefrontPage.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { useDebounce } from "@/Hooks/useDebounce";
import { highlightMatch } from "@/utils/highlightMatch";

const CATEGORIES = ["all", "herbs", "oils", "grains"];
const TAGS = ["Best Seller", "New", "Discount"];

export default function StorefrontPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<any>(null);

  const pageSize = 6;
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthChecked(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (authChecked) fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, debouncedSearchTerm, selectedCategory, selectedTag, page, authChecked]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      let query = supabase.from("products").select("*, product_reviews(rating)");

      if (sortBy === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price_desc") {
        query = query.order("price", { ascending: false });
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) {
        setError(error.message);
        return;
      }

      let filtered = data || [];

      if (selectedCategory !== "all") {
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
        window.gtag?.("event", "search", {
          search_term: debouncedSearchTerm,
        });
      }

      setProducts(filtered);

      // GA4: view_item_list event
      if (filtered.length > 0) {
        window.gtag?.("event", "view_item_list", {
          item_list_name: "Storefront",
          items: filtered.map((p, index) => ({
            item_id: p.id,
            item_name: p.name,
            index,
            price: p.price,
            item_category: p.category,
          })),
        });
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setShowCategories(false);
    window.gtag?.("event", "select_item", {
      item_list_name: "Category Filter",
      items: [{ item_name: cat }],
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTag = selectedTag === tag ? "" : tag;
    setSelectedTag(newTag);
    if (newTag) {
      window.gtag?.("event", "select_item", {
        item_list_name: "Tag Filter",
        items: [{ item_name: newTag }],
      });
    }
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    window.gtag?.("event", "filter", {
      filter_type: "sort_by",
      value: val,
    });
  };

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => prev + 1);

  if (!authChecked) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Helmet>
        <title>Cauverystore | Shop Herbal & Natural Products</title>
        <meta
          name="description"
          content="Browse and buy authentic herbal and natural products from Cauverystore. Discover oils, herbs, grains, and more."
        />
        <meta property="og:title" content="Shop Herbal & Natural Products - Cauverystore" />
        <meta
          property="og:description"
          content="Explore curated herbs, oils, and grains from verified merchants. Natural wellness starts here."
        />
        <meta property="og:image" content="https://cauverystore.in/og-store.jpg" />
        <meta property="og:url" content="https://cauverystore.in/store" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop Herbal & Natural Products - Cauverystore" />
        <meta
          name="twitter:description"
          content="Discover oils, herbs, and grains curated for quality and purity. Only on Cauverystore."
        />
        <meta name="twitter:image" content="https://cauverystore.in/og-store.jpg" />
      </Helmet>

      <PageHeader
        title="Welcome to Cauverystore"
        subtitle="Browse authentic herbal and natural products"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4 relative z-10">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-48 dark:bg-gray-800 dark:text-white"
        />

        <div className="relative">
          <div
            className="border px-3 py-2 rounded bg-white dark:bg-gray-800 dark:text-white cursor-pointer w-48"
            onClick={() => setShowCategories((prev) => !prev)}
          >
            {selectedCategory === "all" ? "All Categories" : selectedCategory}
          </div>
          {showCategories && (
            <ul className="absolute z-20 bg-white dark:bg-gray-900 border rounded mt-1 w-48 max-h-60 overflow-y-auto shadow">
              {CATEGORIES.map((cat) => (
                <li
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-2 hover:bg-green-100 dark:hover:bg-green-800 cursor-pointer ${
                    selectedCategory === cat ? "bg-green-200 dark:bg-green-700 font-semibold" : ""
                  }`}
                >
                  {highlightMatch(cat, searchTerm)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border px-3 py-2 rounded w-48 dark:bg-gray-800 dark:text-white"
        >
          <option value="default">Sort</option>
          <option value="price_asc">Price Low to High</option>
          <option value="price_desc">Price High to Low</option>
        </select>
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full border text-sm transition ${
              selectedTag === tag
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-green-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-green-900"
            }`}
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState message="No products found matching your filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                searchTerm={debouncedSearchTerm}
              />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <Button onClick={handlePrevPage} disabled={page === 1}>
              Previous
            </Button>
            <span>Page {page}</span>
            <Button onClick={handleNextPage}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}
