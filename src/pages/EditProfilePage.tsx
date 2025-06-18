// src/pages/EditProfilePage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return navigate("/login");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) toast.error("Failed to fetch profile");
    else setProfile(data);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
      })
      .eq("id", profile.id);

    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated");
    setSaving(false);
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Edit Profile</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            name="full_name"
            value={profile.full_name || ""}
            onChange={handleChange}
            className="border rounded px-4 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            className="border rounded px-4 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            name="address"
            value={profile.address || ""}
            onChange={handleChange}
            className="border rounded px-4 py-2 w-full"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
