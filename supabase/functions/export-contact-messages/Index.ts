// supabase/functions/export-contact-messages/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format } from "https://deno.land/std@0.177.0/datetime/format.ts";

// ENV vars
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPPORT_EMAIL_FROM = Deno.env.get("SUPPORT_EMAIL_FROM")!;
const SUPPORT_EMAIL_TO = "papillonmediaworks@gmail.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async () => {
  const today = new Date();
  const formatted = format(today, "yyyy-MM-dd");
  const filename = `contact_logs/${formatted}.csv`;

  try {
    // 1. Fetch recent contact messages (last 7 days)
    const since = new Date(today);
    since.setDate(today.getDate() - 7);

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .gte("created_at", since.toISOString());

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log("⚠️ No recent contact messages found.");
      return new Response("No messages to export", { status: 200 });
    }

    // 2. Convert to CSV
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map(row =>
        headers.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("exports")
      .upload(filename, new Blob([csv], { type: "text/csv" }), {
        upsert: true,
      });

    if (uploadError) throw uploadError;
    console.log("✅ Uploaded to Supabase Storage:", filename);

    // 4. Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SUPPORT_EMAIL_FROM,
        to: SUPPORT_EMAIL_TO,
        subject: `📥 Weekly Contact Logs Export - ${formatted}`,
        html: `
          <p>Hello Admin,</p>
          <p>The contact messages for the past 7 days have been exported.</p>
          <p><strong>Filename:</strong> ${filename}</p>
          <p>You can download it from your Supabase Storage or access the logs in the dashboard.</p>
          <hr/>
          <small>This email was sent automatically by your Supabase Edge Function.</small>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errJson = await emailRes.json();
      console.error("❌ Resend API error:", errJson);
      throw new Error("Failed to send email");
    }

    console.log("✅ Email sent to:", SUPPORT_EMAIL_TO);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Function error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
    });
  }
});
