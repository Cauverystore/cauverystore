import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

interface ReviewReport {
  id: string;
  review_id: string;
  reason: string;
  created_at: string;
}

export default function AdminReviewReportsPage() {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviewReports();
  }, []);

  const fetchReviewReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("review_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Failed to fetch review reports");
    else setReports(data || []);

    setLoading(false);
  };

  const deleteReport = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this report?");
    if (!confirm) return;
    const { error } = await supabase.from("review_reports").delete().eq("id", id);
    if (!error) fetchReviewReports();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Review Reports | Admin</title>
        <meta name="description" content="Admin panel to manage reported reviews." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Reported Reviews</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : reports.length === 0 ? (
        <EmptyState message="No review reports found." />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Review ID: <span className="text-gray-700">{report.review_id}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Reason: {report.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteReport(report.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
