import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load categories");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: newCategory.trim() });
    if (error) toast.error("Failed to add category");
    else {
      toast.success("Category added");
      setNewCategory("");
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Category deleted");
      fetchCategories();
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editingValue.trim()) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: editingValue.trim() })
      .eq("id", editingId);
    if (error) toast.error("Update failed");
    else {
      toast.success("Category updated");
      setEditingId(null);
      setEditingValue("");
      fetchCategories();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Helmet>
        <title>Manage Categories | Admin</title>
        <meta name="description" content="Admin panel to manage product categories." />
      </Helmet>

      <h1 className="text-2xl font-bold text-green-700 mb-6">Manage Categories</h1>

      <div className="flex gap-3 mb-6">
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Add new category"
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : categories.length === 0 ? (
        <EmptyState message="No categories found." />
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              {editingId === cat.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleUpdate}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setEditingValue("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {cat.name}
                  </span>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingValue(cat.name);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
