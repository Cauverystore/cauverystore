// src/pages/AddProduct.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  title: string;
  parent_id: number | null;
}

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (!error && data) {
        setMainCategories(data.filter((cat) => cat.parent_id === null));
        setSubcategories(data.filter((cat) => cat.parent_id !== null));
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !categoryId || !subcategoryId) {
      alert("Please fill in all fields.");
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        name,
        price,
        stock,
        category_id: categoryId,
        subcategory_id: subcategoryId,
      },
    ]);

    if (error) {
      alert("Failed to add product");
    } else {
      navigate("/admin/products");
    }
  };

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.parent_id === categoryId
  );

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
