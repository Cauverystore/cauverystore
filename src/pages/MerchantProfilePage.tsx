// src/pages/MerchantProfilePage.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MerchantProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "merchant")
      .single();

    if (!error && data) setProfile(data);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Merchant Profile</h1>
      {profile ? (
        <div className="space-y-2 text-gray-800">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>
          <p><strong>Store:</strong> {profile.store_name || "N/A"}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
