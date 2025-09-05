import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

interface ReportUnion {
  id: string;
  type: "product" | "review" | "general";
  subject?: string;
  message?: string;
  reason?: string;
  reference_id: string;
  user_id: string;
  created_at: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportUnion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("unified_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError("Unable to load consolidated reports.");
    else setReports(data || []);

    setLoading(false);
  };

  const deleteReport = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this report?");
    if (!confirm) return;
    const { error } = await supabase.from("unified_reports").delete().eq("id", id);
    if (!error) fetchReports();
  };

  const renderContent = (report: ReportUnion) => {
    switch (report.type) {
      case "product":
        return `Product Report - Reason: ${report.reason}`;
      case "review":
        return `Review Report - Reason: ${report.reason}`;
      case "general":
        return `General Report - Subject: ${report.subject}, Message: ${report.message}`;
      default:
        return "Unknown report type";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Helmet>
        <title>All Reports | Admin</title>
        <meta name="description" content="Unified dashboard to manage all user reports." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">All Reports</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : reports.length === 0 ? (
        <EmptyState message="No reports available." />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 border rounded bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">
                    [{report.type.toUpperCase()}] Ref ID: {report.reference_id}
                  </p>
                  <p className="text-sm mt-1 text-gray-700">{renderContent(report)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(report.created_at).toLocaleString()} by {report.user_id}
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
