// Edge Function to insert admin notifications
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const body = await req.json();
  const { type, message, data, source_id } = body;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (!type || !message) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const { error } = await supabase.from("notifications").insert([
    {
      type,
      message,
      data,
      source_id,
      is_read: false,
    }
  ]);

  if (error) {
    console.error("Insert error", error.message);
    return new Response(JSON.stringify({ error: "Insert failed" }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
