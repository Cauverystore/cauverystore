// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError || !data.user) {
      setError(loginError?.message || "Login failed");
      return;
    }

    // ✅ GA4 login event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "login", {
        method: "password",
        user_id: data.user.id,
      });
    }

    toast.success("Logged in successfully");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Helmet>
        <title>Login | Cauverystore</title>
        <meta name="description" content="Login to your Cauverystore account to manage orders, wishlist, and more." />
        <meta property="og:title" content="Login | Cauverystore" />
        <meta property="og:description" content="Access your Cauverystore account by logging in securely." />
        <meta name="twitter:title" content="Login | Cauverystore" />
        <meta name="twitter:description" content="Securely log in to your Cauverystore account." />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <form
        onSubmit={handleLogin}
        className="p-6 rounded-xl shadow-lg w-full max-w-sm bg-white space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-green-700">Log In</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-md transition duration-200"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
