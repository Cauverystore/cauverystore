import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend";

serve(async (req) => {
  try {
    const body = await req.json();
    const { email, subject, message, support_request_id, is_admin } = body;

    if (!email || typeof is_admin !== "boolean" || !is_admin) {
      return new Response("Blocked - not an admin reply", { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert admin reply
    const { error: insertError } = await supabase
      .from("support_replies")
      .insert([{ support_request_id, message, is_admin: true }]);

    if (insertError) {
      console.error("Insert failed:", insertError.message);
      return new Response("Insert failed", { status: 500 });
    }

    // Update request status
    const { error: updateError } = await supabase
      .from("support_requests")
      .update({ status: "responded" })
      .eq("id", support_request_id);

    if (updateError) {
      console.error("Status update failed:", updateError.message);
    }

    // Send email via Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

    const { error: emailError } = await resend.emails.send({
      from: "support@cauverystore.in",
      to: [email],
      subject,
      html: `<p>${message}</p><br/><p>– Team Cauverystore</p>`,
    });

    if (emailError) {
      console.error("Email failed:", emailError);
      return new Response("Email send failed", { status: 500 });
    }

    return new Response(JSON.stringify({ status: "sent" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
