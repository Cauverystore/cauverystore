import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { v4 as uuidv4 } from "uuid";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setErrorMsg("You must be logged in to add a product.");
      setLoading(false);
      return;
    }

    if (!imageFile) {
      setErrorMsg("Please upload an image.");
      setLoading(false);
      return;
    }

    try {
      // Upload image
      const imageExt = imageFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${imageExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const imageUrl = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName).data.publicUrl;

      // Insert product
      const { error: insertError } = await supabase.from("products").insert([
        {
          name,
          price,
          quantity,
          category,
          image_url: imageUrl,
          merchant_id: user.id,
        },
      ]);

      if (insertError) throw insertError;

      navigate("/merchant-dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["merchant"]}>
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-green-700">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Product Name</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Price (₹)</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Quantity</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min="1"
              max="1000"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Category</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Groceries, Clothing"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          {errorMsg && <p className="text-red-600">{errorMsg}</p>}

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
