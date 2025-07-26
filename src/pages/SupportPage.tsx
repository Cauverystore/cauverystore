// src/pages/SupportPage.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";

interface SupportRequest {
  id: string;
  created_at: string;
  message: string;
  status: string;
  replies?: SupportReply[];
}

interface SupportReply {
  id: string;
  support_id: string;
  message: string;
  created_at: string;
  sender: "user" | "admin";
}

export default function SupportPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("You must be logged in to view support requests.");
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      setAuthChecked(true);
    };

    init();
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    const fetchSupportRequests = async () => {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("support_requests")
          .select("*, replies:support_replies(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setRequests(data || []);

        // ✅ GA4 Event: Track support request view
        if (typeof window !== "undefined" && window.gtag && data?.length > 0) {
          window.gtag("event", "view_support_requests", {
            user_id: user.id,
            request_count: data.length,
          });
        }
      } catch (err: any) {
        console.error("Support fetch error:", err);
        setError(err.message || "Failed to fetch support requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupportRequests();
  }, [authChecked]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Support | Cauverystore</title>
        <meta
          name="description"
          content="Track your support requests, view replies, and get help for any issues related to your Cauverystore orders."
        />
        <meta property="og:title" content="Support | Cauverystore" />
        <meta
          property="og:description"
          content="Need help? Track your support tickets and responses at Cauverystore."
        />
        <meta name="twitter:title" content="Support | Cauverystore" />
        <meta
          name="twitter:description"
          content="Check status of your support queries and communicate with Cauverystore support."
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3KRHXGB7JV"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3KRHXGB7JV');
        `}</script>
      </Helmet>

      <PageHeader title="Support Requests" subtitle="Your submitted tickets and replies" />

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : requests.length === 0 ? (
        <EmptyState message="You haven't submitted any support requests yet." />
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 border rounded bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">
                  Submitted on {new Date(req.created_at).toLocaleDateString()}
                </p>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    req.status === "open"
                      ? "bg-yellow-200 text-yellow-800"
                      : req.status === "resolved"
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <p className="mb-3">{req.message}</p>

              {req.replies && req.replies.length > 0 && (
                <div className="border-t pt-3 space-y-2">
                  <p className="font-medium text-sm text-gray-600">Replies:</p>
                  {req.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`text-sm p-2 rounded ${
                        reply.sender === "admin"
                          ? "bg-green-50 text-green-900"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <span className="block">{reply.message}</span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {new Date(reply.created_at).toLocaleString()} –{" "}
                        {reply.sender === "admin" ? "Support" : "You"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
