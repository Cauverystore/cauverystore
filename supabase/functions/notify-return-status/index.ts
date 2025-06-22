// supabase/functions/notify-return-status/index.ts

// Enable autocomplete + types
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Start the Supabase Edge Function server
Deno.serve(async (req) => {
  try {
    // Parse request payload
    const { user_email, user_name, order_id, product_name, status } = await req.json();

    if (!user_email || !user_name || !order_id || !product_name || !status) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Construct email details
    const subject = `Your ${status.toUpperCase()} Request for Order ${order_id}`;
    const body = `
Hi ${user_name},

This is to inform you that your ${status.toUpperCase()} request for the product "${product_name}" under Order ID ${order_id} has been processed.

Status: ${status.toUpperCase()}

If you have any questions, feel free to reply to this email.

Regards,  
Cauverystore Support Team
`;

    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "support@cauverystore.in",
        to: user_email,
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      return new Response(
        JSON.stringify({ error: "Email failed", details: errorDetails }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", message: err.message }),
      { status: 500 }
    );
  }
});
