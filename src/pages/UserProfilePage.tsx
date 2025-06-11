import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const userId = session.user.id;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile.");
      } else {
        setProfile(data);
        setName(data.name || "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", profile.id);

    if (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save changes.");
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Your Profile</h1>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <p className="text-gray-700">{profile.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Role</label>
          <p className="text-gray-700">{profile.role}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            className="mt-1 w-full border rounded px-3 py-2"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default UserProfilePage;
