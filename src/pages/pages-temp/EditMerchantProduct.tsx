import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function EditMerchantProduct() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("name, price, stock")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Failed to fetch product.");
      } else {
        setName(data.name);
        setPrice(data.price);
        setStock(data.stock);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("products")
      .update({ name, price, stock })
      .eq("id", id);

    if (error) {
      alert("Failed to update product.");
    } else {
      navigate("/merchant/dashboard");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Stock Quantity"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
