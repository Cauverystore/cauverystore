// Deno-based Supabase Edge Function
import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format } from "https://deno.land/std@0.202.0/datetime/mod.ts";
import { encode } from "https://deno.land/std@0.202.0/encoding/base64.ts";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("support_requests")
    .select(`
      id, subject, status, created_at,
      support_replies(message, created_at)
    `);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const rows = data.map((req) => ({
    id: req.id,
    subject: req.subject,
    status: req.status,
    created_at: req.created_at,
    replies: req.support_replies.map((r) => `${r.created_at}: ${r.message}`).join(" | "),
  }));

  const csvHeader = "ID,Subject,Status,Created At,Replies\n";
  const csvBody = rows.map((r) =>
    `"${r.id}","${r.subject}","${r.status}","${r.created_at}","${r.replies.replace(/"/g, "'")}"`
  ).join("\n");

  const content = `${csvHeader}${csvBody}`;
  const fileName = `support-log-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`;

  const upload = await supabase.storage
    .from("exports")
    .upload(`support_logs/${fileName}`, new Blob([content], { type: "text/csv" }), {
      upsert: true,
      contentType: "text/csv",
    });

  if (upload.error) {
    return new Response(JSON.stringify({ error: upload.error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Uploaded", path: upload.data.path }), {
    headers: { "Content-Type": "application/json" },
  });
});
