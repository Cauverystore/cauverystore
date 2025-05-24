import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function AddMerchantProduct() {
  const { userId } = useAuthStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !name || !price || !stock || !imageFile) return;

    const fileExt = imageFile.name.split(".").pop();
    const filePath = `products/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile);

    if (uploadError) return alert("Image upload failed.");

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData?.publicUrl;

    const { error: insertError } = await supabase.from("products").insert([
      {
        name,
        price,
        stock,
        image_url: imageUrl,
        merchant_id: userId,
      },
    ]);

    if (insertError) {
      alert("Failed to save product.");
    } else {
      navigate("/merchant/dashboard");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full"
          required
        />
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
