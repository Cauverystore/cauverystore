import { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import LogoutButton from "@/components/LogoutButton";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        toast.error("Failed to fetch profile.");
        return;
      }

      setProfile(data);
      setName(data.name || "");
      setBio(data.bio || "");
      setAge(data.age || undefined);
      setAvatarUrl(data.avatar_url || null);
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ name, bio, age, avatar_url: avatarUrl })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save profile.");
    } else {
      toast.success("Profile updated!");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload image.");
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setAvatarUrl(data.publicUrl);
    toast.success("Avatar uploaded!");
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <LogoutButton />
      </div>

      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
      )}

      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Upload Avatar</label>
          <input type="file" accept="image/*" onChange={handleAvatarUpload} />
        </div>

        <div>
          <label className="block font-semibold">Email</label>
          <input
            className="w-full border p-2 rounded bg-gray-100"
            value={profile.email || user.email}
            disabled
          />
        </div>
        <div>
          <label className="block font-semibold">Role</label>
          <input
            className="w-full border p-2 rounded bg-gray-100"
            value={profile.role}
            disabled
          />
        </div>
        <div>
          <label className="block font-semibold">Name</label>
          <input
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold">Bio</label>
          <textarea
            className="w-full border p-2 rounded"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold">Age</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={age || ""}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </div>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
