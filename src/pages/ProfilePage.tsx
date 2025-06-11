import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import toast from "react-hot-toast";

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in.");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data) {
        toast.error("Failed to fetch profile.");
      } else {
        setProfile(data);
        setName(data.name || "");
        setAge(data.age || null);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({ name, age })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated!");
    }

    setSaving(false);
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Age</label>
          <input
            type="number"
            value={age || ""}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
