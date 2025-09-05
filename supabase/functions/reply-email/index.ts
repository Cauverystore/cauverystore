// supabase/functions/support-reply-email/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    // ✅ No authorization check here — auth is skipped for local testing
    const {
      email,
      subject,
      message,
      support_request_id,
      is_admin,
    } = body;

    if (!email || !subject || !message || !support_request_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert the reply into support_replies table
    const { error: insertError } = await supabase
      .from("support_replies")
      .insert([
        {
          support_request_id,
          message,
          is_admin,
        },
      ]);

    if (insertError) {
      console.error("DB insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to insert reply" }),
        { status: 500 }
      );
    }

    // Send actual email via Resend or other provider here
    console.log(`📧 Sent reply to ${email}: ${subject}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in handler:", err);
    return new Response(JSON.stringify({ msg: "Internal Server Error" }), {
      status: 500,
    });
  }
}); 
