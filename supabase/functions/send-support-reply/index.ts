// supabase/functions/send-support-reply/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

serve(async (req) => {
  const { record } = await req.json();

  if (!record || !record.is_admin) {
    return new Response("Not an admin reply. Ignored.", { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: supportRequest } = await supabase
    .from("support_requests")
    .select("user_id, order_id")
    .eq("id", record.support_request_id)
    .single();

  const { data: user } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", supportRequest?.user_id)
    .single();

  if (!user?.email) {
    return new Response("User email not found", { status: 400 });
  }

  const resend = new Resend(Deno.env.get("VITE_RESEND_API_KEY")!);

  const { error } = await resend.emails.send({
    from: Deno.env.get("VITE_SUPPORT_EMAIL")!,
    to: user.email,
    subject: `📩 Support reply for Order #${supportRequest?.order_id}`,
    html: `
      <p>Your support request for order <strong>${supportRequest?.order_id}</strong> has received a reply:</p>
      <blockquote>${record.message}</blockquote>
      <p><a href="https://cauverystore.in/support">View the full thread</a></p>
    `,
  });

  if (error) {
    console.error(error);
    return new Response("Failed to send email", { status: 500 });
  }

  return new Response("Email sent successfully", { status: 200 });
});
