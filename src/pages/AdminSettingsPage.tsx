// src/pages/AdminSettings.tsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import toast from "react-hot-toast";

interface Settings {
  id: number;
  site_name: string;
  support_email: string;
  maintenance_mode: boolean;
  enable_returns: boolean;
  tax_percentage: number;
  flat_shipping_rate: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (error) {
      setError("Failed to fetch settings");
    } else {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleChange = (field: keyof Settings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const saveSettings = async () => {
    if (!settings) return;
    const { error } = await supabase.from("settings").update(settings).eq("id", 1);
    if (!error) toast.success("Settings updated");
    else toast.error("Failed to update settings");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Helmet>
        <title>Admin Settings | Cauverystore</title>
        <meta name="description" content="Manage platform-wide configurations like tax, shipping, and maintenance." />
      </Helmet>

      <h1 className="text-3xl font-bold text-green-700 mb-6">Platform Settings</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : settings ? (
        <div className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Site Name</label>
            <Input
              value={settings.site_name}
              onChange={(e) => handleChange("site_name", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Support Email</label>
            <Input
              value={settings.support_email}
              onChange={(e) => handleChange("support_email", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tax Percentage (%)</label>
            <Input
              type="number"
              value={settings.tax_percentage}
              onChange={(e) => handleChange("tax_percentage", parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Flat Shipping Rate (₹)</label>
            <Input
              type="number"
              value={settings.flat_shipping_rate}
              onChange={(e) => handleChange("flat_shipping_rate", parseFloat(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => handleChange("maintenance_mode", e.target.checked)}
            />
            <label className="font-medium">Enable Maintenance Mode</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enable_returns}
              onChange={(e) => handleChange("enable_returns", e.target.checked)}
            />
            <label className="font-medium">Allow Customer Returns</label>
          </div>

          <Button onClick={saveSettings}>Save Changes</Button>
        </div>
      ) : null}
    </div>
  );
}
