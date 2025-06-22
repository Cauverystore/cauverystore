// src/pages/ProductUploadPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

import MerchantLayout from "@/layouts/MerchantLayout";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function ProductUploadPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [stock, setStock] = useState<number | string>("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !description || !stock || !image) {
      toast.error("All fields are required.");
      return;
    }

    setUploading(true);

    try {
      // Upload image to Supabase Storage
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, image);

      if (uploadError) {
        throw new Error("Failed to upload image.");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      // Insert product details
      const { error } = await supabase.from("products").insert({
        name,
        price: Number(price),
        description,
        image_url: publicUrl,
        stock: Number(stock),
      });

      if (error) {
        throw new Error("Failed to save product data.");
      }

      toast.success("✅ Product uploaded successfully.");
      navigate("/merchant/products");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <MerchantLayout>
      <div className="max-w-2xl mx-auto p-6">
        <PageHeader
          title="📦 Upload New Product"
          subtitle="Fill in the details below to list a new product in your store."
        />

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-6 bg-white p-6 rounded-2xl shadow-md border"
        >
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Price (₹)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Input
            label="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              required
              className="block w-full text-sm border rounded px-3 py-2"
            />
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="mt-3 h-32 rounded object-cover"
              />
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-green-600 text-white hover:bg-green-700"
              disabled={uploading}
            >
              {uploading ? <Spinner size="sm" /> : "Upload Product"}
            </Button>
          </div>
        </form>
      </div>
    </MerchantLayout>
  );
}
