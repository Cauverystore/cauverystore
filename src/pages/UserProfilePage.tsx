import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";

export default function UserProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        toast.error("User not found.");
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <div className="p-4">Loading profile...</div>;

  if (!profile) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <LogoutButton />
        </div>
        <p className="text-red-500">Profile not found or unavailable.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Profile</h2>
        <LogoutButton />
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {profile.avatar_url && (
          <div className="text-center">
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-lg font-medium">{profile.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Bio</p>
          <p className="text-base text-gray-700">{profile.bio || "No bio available."}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Age</p>
          <p className="text-base">{profile.age || "Unknown"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <span className="inline-block px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700 capitalize">
            {profile.role}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span
            className={`inline-block px-2 py-1 rounded-full text-sm ${
              profile.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {profile.status}
          </span>
        </div>
      </div>
    </div>
  );
}
