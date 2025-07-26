// src/pages/ResetPassword.tsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Extract access token from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get("access_token");

  useEffect(() => {
    if (!accessToken) {
      toast.error("Invalid or missing access token.");
      navigate("/login");
    }
  }, [accessToken, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!accessToken) {
      toast.error("Invalid or missing access token.");
      setLoading(false);
      return;
    }

    // Supabase expects the access_token under key "access_token" inside updateUser options
    const { error } = await supabase.auth.updateUser({
      password,
      access_token: accessToken, // note the snake_case here
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully! Please login.");
      navigate("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Helmet>
        <title>Reset Password | Cauverystore</title>
        <meta
          name="description"
          content="Set your new password for your Cauverystore account."
        />
      </Helmet>

      <form
        onSubmit={handleResetPassword}
        className="p-6 rounded-xl shadow-lg w-full max-w-sm bg-white space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-green-700">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md transition duration-200"
        >
          {loading ? "Updating password..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
