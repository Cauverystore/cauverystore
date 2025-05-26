// src/pages/EditProduct.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Category {
  id: number;
  title: string;
  parent_id: number | null;
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error && data) {
        setMainCategories(data.filter((cat) => cat.parent_id === null));
        setSubcategories(data.filter((cat) => cat.parent_id !== null));
      }
    };

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (data && !error) {
        setName(data.name);
        setPrice(data.price);
        setStock(data.stock);
        setCategoryId(data.category_id);
        setSubcategoryId(data.subcategory_id);
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !categoryId || !subcategoryId) {
      alert("Please fill in all fields.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        stock,
        category_id: categoryId,
        subcategory_id: subcategoryId,
      })
      .eq("id", id);

    if (error) {
      alert("Failed to update product");
    } else {
      navigate("/admin/products");
    }
  };

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.parent_id === categoryId
  );

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />

        <select
          className="w-full p-2 border rounded"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          <option value="">Select Category</option>
          {mainCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select
          className="w-full p-2 border rounded"
          value={subcategoryId ?? ""}
          onChange={(e) => setSubcategoryId(Number(e.target.value))}
        >
          <option value="">Select Subcategory</option>
          {filteredSubcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}
