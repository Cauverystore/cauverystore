import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import toast from "react-hot-toast";

interface Banner {
  id: string;
  image_url: string;
  link_url: string;
  created_at: string;
}

export default function AdminBannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    if (error) setError("Failed to fetch banners");
    else setBanners(data || []);
    setLoading(false);
  };

  const addBanner = async () => {
    if (!imageUrl.trim()) return;
    const { error } = await supabase.from("banners").insert([{ image_url: imageUrl, link_url: linkUrl }]);
    if (!error) {
      toast.success("Banner added");
      setImageUrl("");
      setLinkUrl("");
      fetchBanners();
    } else toast.error("Failed to add banner");
  };

  const deleteBanner = async (id: string) => {
    const confirm = window.confirm("Delete this banner?");
    if (!confirm) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (!error) {
      toast.success("Deleted");
      fetchBanners();
    } else toast.error("Delete failed");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin Banner Manager | Cauverystore</title>
        <meta name="description" content="Manage promotional homepage banners." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Homepage Banner Management</h1>

      <div className="space-y-3 mb-6">
        <Input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Input
          placeholder="Link URL (optional)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
        <Button onClick={addBanner}>Add Banner</Button>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : banners.length === 0 ? (
        <p>No banners found.</p>
      ) : (
        <ul className="space-y-4">
          {banners.map((b) => (
            <li
              key={b.id}
              className="border p-4 rounded bg-white shadow-sm dark:bg-gray-800"
            >
              <div className="flex justify-between items-start gap-4">
                <img src={b.image_url} alt="Banner" className="w-32 h-20 object-cover rounded" />
                <div className="flex-1">
                  {b.link_url && (
                    <a href={b.link_url} className="text-blue-600 underline text-sm" target="_blank" rel="noopener noreferrer">
                      {b.link_url}
                    </a>
                  )}
                </div>
                <button
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => deleteBanner(b.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
