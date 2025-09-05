// supabase/functions/add_admin_reply_and_notify/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  const { request_id, reply_text } = await req.json();

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Insert reply into support_replies table
  const { error: insertError } = await supabaseClient.from("support_replies").insert([
    {
      request_id,
      message: reply_text,
      role: "admin",
    },
  ]);

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  }

  // Get user's email from the support_requests table
  const { data, error: fetchError } = await supabaseClient
    .from("support_requests")
    .select("profiles(email)")
    .eq("id", request_id)
    .single();

  if (fetchError || !data) {
    return new Response(JSON.stringify({ error: fetchError?.message || "User not found" }), {
      status: 500,
    });
  }

  const customerEmail = data.profiles?.email;

  // Mock sending email (You can integrate Resend, Mailgun, or any SMTP)
  console.log(`📧 Notify ${customerEmail} - Your support ticket has a new reply!`);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
