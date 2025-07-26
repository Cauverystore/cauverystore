// src/pages/UserProfilePage.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import InputError from "@/components/ui/InputError";
import toast from "react-hot-toast";

export default function UserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchProfile = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("You must be logged in to view your profile.");
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      setAuthChecked(true);
      const userId = data.session.user.id;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        setError("Failed to load profile.");
      } else {
        setProfile(profileData);
        setName(profileData.name || "");

        // ✅ GA4 Event: View Profile
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "view_user_profile", {
            user_id: userId,
          });
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated");

      // ✅ GA4 Event: Update Profile
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "update_user_profile", {
          user_id: user.id,
          updated_name: name,
        });
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setError(err.message || "Failed to update profile.");
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Helmet>
        <title>User Profile | Cauverystore</title>
        <meta
          name="description"
          content="View and update your user profile including name and preferences."
        />
        <meta property="og:title" content="User Profile | Cauverystore" />
        <meta
          property="og:description"
          content="Manage your Cauverystore user profile and settings."
        />
        <meta property="twitter:title" content="User Profile | Cauverystore" />
        <meta
          property="twitter:description"
          content="Edit your name and preferences for your Cauverystore account."
        />
      </Helmet>

      <PageHeader title="My Profile" subtitle="Manage your account settings" />

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-6 bg-white dark:bg-gray-800 border rounded p-6 shadow-sm"
        >
          <div>
            <label htmlFor="name" className="block font-medium mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {error && <InputError message={error} />}

          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
