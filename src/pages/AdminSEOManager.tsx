import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import toast from "react-hot-toast";

interface SEOEntry {
  id: string;
  page: string;
  title: string;
  description: string;
}

export default function AdminSEOManager() {
  const [entries, setEntries] = useState<SEOEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchSEOEntries();
  }, []);

  const fetchSEOEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("seo_meta").select("*");
    if (error) setError("Failed to fetch SEO entries");
    else setEntries(data || []);
    setLoading(false);
  };

  const addEntry = async () => {
    if (!page.trim() || !title.trim() || !description.trim()) return;
    const { error } = await supabase.from("seo_meta").insert([{ page, title, description }]);
    if (!error) {
      toast.success("SEO entry added");
      setPage("");
      setTitle("");
      setDescription("");
      fetchSEOEntries();
    } else toast.error("Failed to add SEO entry");
  };

  const deleteEntry = async (id: string) => {
    const confirm = window.confirm("Delete this SEO entry?");
    if (!confirm) return;
    const { error } = await supabase.from("seo_meta").delete().eq("id", id);
    if (!error) {
      toast.success("Deleted");
      fetchSEOEntries();
    } else toast.error("Delete failed");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin SEO Manager | Cauverystore</title>
        <meta name="description" content="Manage SEO titles and meta descriptions." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">SEO Meta Manager</h1>

      <div className="space-y-3 mb-6">
        <Input placeholder="Page Path (e.g., /about)" value={page} onChange={(e) => setPage(e.target.value)} />
        <Input placeholder="SEO Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Meta Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button onClick={addEntry}>Add Meta Tag</Button>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : entries.length === 0 ? (
        <p>No SEO entries found.</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="border p-4 rounded bg-white shadow-sm dark:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    <strong>{entry.page}</strong><br />Title: {entry.title}<br />Description: {entry.description}
                  </p>
                </div>
                <button
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => deleteEntry(entry.id)}
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
