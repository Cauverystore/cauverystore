// supabase/functions/create-razorpay-order/index.ts

import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: Deno.env.get("VITE_RAZORPAY_KEY_ID")!,
  key_secret: Deno.env.get("VITE_RAZORPAY_KEY_SECRET")!,
});

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.json();
    const { amount, currency, receipt } = body;

    if (!amount || !currency) {
      return new Response(JSON.stringify({ error: "Missing amount or currency" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Razorpay expects amount in smallest currency unit (paise for INR)
    const options = {
      amount: amount * 100, // convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // auto capture payment
    };

    const order = await razorpay.orders.create(options);

    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
