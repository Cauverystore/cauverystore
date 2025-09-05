// src/pages/Signup.tsx
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message || "Signup failed");
      return;
    }

    const userId = data.user.id;

    await supabase.from("profiles").insert([
      {
        id: userId,
        email,
        role: "customer",
        status: "active",
      },
    ]);

    // ✅ GA4 sign_up event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "sign_up", {
        method: "email",
        user_id: userId,
      });
    }

    setLoading(false);
    toast.success("Signup successful. You can now log in.");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Helmet>
        <title>Sign Up | Cauverystore</title>
        <meta name="description" content="Create your Cauverystore account to shop your favorite products online." />
        <meta property="og:title" content="Sign Up | Cauverystore" />
        <meta property="og:description" content="Join Cauverystore to start shopping and managing your orders online." />
        <meta name="twitter:title" content="Sign Up | Cauverystore" />
        <meta name="twitter:description" content="Create a new Cauverystore account today." />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <form
        onSubmit={handleSignup}
        className="p-6 rounded-xl shadow-lg w-full max-w-sm bg-white space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-green-700">Create an Account</h2>

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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
