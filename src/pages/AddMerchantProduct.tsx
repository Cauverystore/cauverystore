import { useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AddMerchantProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = async () => {
    if (!image) return null;
    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, image);

    if (error) {
      toast.error("Image upload failed.");
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    const imageUrl = await handleImageUpload();
    if (!imageUrl) {
      setUploading(false);
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        name,
        price,
        stock,
        description,
        image_url: imageUrl,
        merchant_id: session.user.id,
        is_active: true,
      },
    ]);

    if (!error) {
      toast.success("Product added!");
      navigate("/merchant");
    } else {
      console.error("Insert error:", error);
      toast.error("Failed to add product.");
    }

    setUploading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price (₹)</label>
          <input
            type="number"
            required
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Stock Quantity</label>
          <input
            type="number"
            required
            min={0}
            max={1000}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {uploading ? "Uploading..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddMerchantProduct;
