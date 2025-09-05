import React from "react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent! Please check your inbox.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Helmet>
        <title>Forgot Password | Cauverystore</title>
        <meta
          name="description"
          content="Reset your password by receiving a reset link on your email."
        />
      </Helmet>

      <form
        onSubmit={handleForgotPassword}
        className="p-6 rounded-xl shadow-lg w-full max-w-sm bg-white space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-green-700">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md transition duration-200"
        >
          {loading ? "Sending reset link..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
