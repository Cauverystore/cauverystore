// contact-reply-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${SERVICE_ROLE_KEY}`) {
    console.error("❌ Unauthorized request");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!RESEND_API_KEY) {
    console.error("❌ Missing RESEND_API_KEY");
    return new Response(JSON.stringify({ error: "Missing API key" }), { status: 500 });
  }

  try {
    const { email, subject, message, contact_id } = await req.json();

    if (!email || !subject || !message || !contact_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const resendPayload = {
      from: "Cauverystore <noreply@cauverystore.in>",
      to: email,
      subject,
      html: `
        <div>
          <p>${message}</p>
          <hr />
          <small>Contact ID: ${contact_id}</small>
        </div>
      `,
    };

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const result = await resendRes.json();
    if (!resendRes.ok) {
      console.error("❌ Resend Error:", result);
      return new Response(
        JSON.stringify({ error: "Failed to send", details: result }),
        { status: 500 }
      );
    }

    console.log("✅ Email sent successfully");
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
    });

  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Function crashed", message: err.message }),
      { status: 500 }
    );
  }
});
