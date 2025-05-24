import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { v4 as uuidv4 } from "uuid";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("name, description, price, image_url, stock, merchant_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      if (data.merchant_id !== userId) {
        setError("Unauthorized");
        setLoading(false);
        return;
      }

      setForm({
        name: data.name,
        description: data.description,
        price: data.price.toString(),
        stock: data.stock?.toString() || "0",
        image_url: data.image_url,
      });

      setLoading(false);
    };

    fetchProduct();
  }, [id, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImageFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let image_url = form.image_url;

    if (newImageFile) {
      const fileExt = newImageFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, newImageFile);

      if (uploadError) {
        setError("Image upload failed.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      image_url = urlData?.publicUrl || image_url;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        image_url,
      })
      .eq("id", id);

    if (updateError) {
      setError("Failed to update product");
    } else {
      navigate("/merchant/dashboard");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          placeholder="Product Description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          value={form.stock}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <div>
          <label className="block mb-1 text-sm">Current Image:</label>
          <img
            src={form.image_url}
            alt="Product"
            className="w-full h-40 object-cover mb-2 rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}
