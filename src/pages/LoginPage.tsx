// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast({
        type: "error",
        description: error.message,
        duration: 4000,
      });
    } else {
      toast({
        type: "success",
        description: "Logged in successfully!",
        duration: 3000,
      });
      navigate("/");
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Cauverystore</title>
        <meta
          name="description"
          content="Login to your Cauverystore account to manage your orders, wishlist, and profile."
        />
        <meta property="og:title" content="Login | Cauverystore" />
        <meta
          property="og:description"
          content="Access your Cauverystore account securely."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Login | Cauverystore" />
        <meta
          name="twitter:description"
          content="Access your Cauverystore account securely."
        />
      </Helmet>

      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <PageHeader title="Login to Cauverystore" subtitle="Access your account" />
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
