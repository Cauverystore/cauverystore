import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Failed to fetch product.");
        return;
      }

      setProduct(data);
      setName(data.name);
      setPrice(data.price);
      setStock(data.stock);
      setDescription(data.description);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleImageUpload = async () => {
    if (!image) return product.image_url;

    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, image);

    if (error) {
      toast.error("Image upload failed.");
      return product.image_url;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const imageUrl = await handleImageUpload();

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        stock,
        description,
        image_url: imageUrl,
      })
      .eq("id", id);

    if (!error) {
      toast.success("Product updated!");
      navigate("/merchant");
    } else {
      toast.error("Update failed.");
      console.error("Update error:", error);
    }

    setSaving(false);
  };

  if (loading) return <div className="text-center py-10">Loading product...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Edit Product</h1>
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
          <label className="block text-sm font-medium">Replace Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {saving ? "Saving..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
