// supabase/functions/export-contact-logs/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format } from "https://deno.land/std@0.177.0/datetime/mod.ts";
import * as Papa from "https://esm.sh/papaparse@5.4.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (_req) => {
  try {
    // 1. Fetch messages
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) throw error;

    // 2. Create CSV
    const csv = Papa.unparse(data);
    const csvBytes = new TextEncoder().encode(csv);
    const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
    const filePath = `contact_logs_${timestamp}.csv`;

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("exports")
      .upload(filePath, csvBytes, {
        contentType: "text/csv",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. Generate public URL
    const { data: publicUrl } = supabase.storage
      .from("exports")
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ success: true, url: publicUrl.publicUrl }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Export Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
    });
  }
});
