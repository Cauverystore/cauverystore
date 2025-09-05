// src/pages/ProductUploadPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import LabeledInput from "@/components/ui/LabeledInput";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import LoadingButton from "@/components/ui/LoadingButton";
import { useToast } from "@/components/ui/use-toast";

export default function ProductUploadPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to upload a product.");
      }

      const { error } = await supabase.from("products").insert([
        {
          name,
          description,
          price: parseFloat(price),
          image_url: imageUrl,
          merchant_id: user.id,
        },
      ]);

      if (error) throw error;

      toast({
        type: "success",
        description: "Product uploaded successfully!",
      });

      navigate("/merchant/products");
    } catch (err: any) {
      toast({
        type: "error",
        description: err.message || "Failed to upload product.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Helmet>
        <title>Upload Product | Cauverystore</title>
        <meta name="description" content="Upload a new product to your Cauverystore catalog." />
        <meta property="og:title" content="Upload Product | Cauverystore" />
        <meta property="og:description" content="Add new items to sell in your Cauverystore shop." />
        <meta name="twitter:title" content="Upload Product | Cauverystore" />
        <meta name="twitter:description" content="Add new items to sell in your Cauverystore shop." />
      </Helmet>

      <PageHeader title="Upload Product" subtitle="Add a new item to your store" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Product Name" required>
          <LabeledInput
            id="name"
            placeholder="E.g., Handmade Vase"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Description" required>
          <Textarea
            id="description"
            placeholder="Brief details about the product"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Price (INR)" required>
          <LabeledInput
            id="price"
            type="number"
            min="0"
            placeholder="E.g., 499"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Image URL" required>
          <LabeledInput
            id="image-url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </FormField>

        <div className="text-right">
          {loading ? (
            <LoadingButton label="Uploading..." />
          ) : (
            <Button type="submit">Upload Product</Button>
          )}
        </div>
      </form>
    </div>
  );
}
