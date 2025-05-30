// src/pages/EditProduct.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import LogoutButton from "@/components/LogoutButton";

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        toast.error("Failed to fetch product.");
        return;
      }

      setProduct(data);
      setName(data.name);
      setDescription(data.description);
      setPrice(data.price);
      setQuantity(data.quantity);
      setCategory(data.category);
      setImageUrl(data.image_url);
    };

    fetchProduct();
  }, [productId]);

  const handleImageUpload = async () => {
    if (!imageFile) return imageUrl;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      toast.error("Image upload failed.");
      return imageUrl;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const uploadedImageUrl = await handleImageUpload();

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price,
        quantity,
        category,
        image_url: uploadedImageUrl,
      })
      .eq("id", productId);

    setLoading(false);

    if (error) {
      toast.error("Failed to update product.");
    } else {
      toast.success("Product updated successfully!");
      navigate("/merchant/dashboard");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <LogoutButton />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="block mb-1 font-medium">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>

        <div>
          <Label htmlFor="description" className="block mb-1 font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
          />
        </div>

        <div>
          <Label htmlFor="price" className="block mb-1 font-medium">
            Price
          </Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            placeholder="Enter price"
          />
        </div>

        <div>
          <Label htmlFor="quantity" className="block mb-1 font-medium">
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            placeholder="Enter stock quantity"
          />
        </div>

        <div>
          <Label htmlFor="category" className="block mb-1 font-medium">
            Category
          </Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category"
          />
        </div>

        <div>
          <Label htmlFor="image" className="block mb-1 font-medium">
            Product Image
          </Label>
          <Input
            id="image"
            type="file"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Update Product"}
        </Button>
      </form>
    </div>
  );
}
