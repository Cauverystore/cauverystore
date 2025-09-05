import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import axios from "axios";

async function runTestFlow()  {
    console.log("SUPABASE_URL loaded:", process.env.SUPABASE_URL);
  // ✅ Init Supabase AFTER dotenv.config()
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const log: string[] = [];
  const timestamp = Date.now();
  const testEmail = `test_user_${timestamp}@cauverystore.in`;
  const password = "test1234";

  log.push(`📧 Creating test user: ${testEmail}`);

  const { data: user, error: signUpErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    password,
    email_confirm: true,
  });

  if (signUpErr || !user.user) {
    throw new Error(`❌ User creation failed: ${signUpErr?.message}`);
  }

  const userId = user.user.id;

  await supabase.from("profiles").insert({
    id: userId,
    full_name: "Test User",
    role: "customer",
  });

  log.push(`👤 Profile inserted for user: ${userId}`);

  const productId = uuidv4();
  await supabase.from("products").insert({
    id: productId,
    name: "Test Product",
    description: "Smoke test product",
    price: 499,
    stock: 10,
    category: "Test",
    merchant_id: userId,
  });

  log.push(`🛍️ Test product inserted: ${productId}`);

  const orderId = uuidv4();
  await supabase.from("orders").insert({
    id: orderId,
    user_id: userId,
    total: 499,
    status: "placed",
    payment_method: "razorpay",
  });

  await supabase.from("order_items").insert({
    id: uuidv4(),
    order_id: orderId,
    product_id: productId,
    quantity: 1,
    price: 499,
  });

  log.push(`✅ Order placed: ${orderId}`);

  await supabase.from("returns").insert({
    id: uuidv4(),
    order_id: orderId,
    user_id: userId,
    reason: "Smoke test return",
    status: "requested",
  });

  log.push(`↩️ Return request submitted`);

  await supabase.from("cancellations").insert({
    id: uuidv4(),
    order_id: orderId,
    user_id: userId,
    reason: "Smoke test cancel",
    status: "requested",
  });

  log.push(`❌ Cancel request submitted`);

  const supportId = uuidv4();
  await supabase.from("support_requests").insert({
    id: supportId,
    user_id: userId,
    subject: "Smoke Test Support Ticket",
    message: "This is a test message for support.",
    status: "open",
  });

  log.push(`🆘 Support ticket created: ${supportId}`);

  // 📩 Call Edge Function to simulate admin reply (and email)
  const replyPayload = {
  email: testEmail,
  subject: "✅ Test Support Reply",
  message: "This is a test reply from admin via Edge Function",
  support_request_id: supportId,
  is_admin: true, // ✅ This must be TRUE
};

  try {
    await axios.post(
      `${process.env.SUPABASE_EDGE_URL}/support-reply-email`,
      replyPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    log.push(`📩 Email reply sent via Edge Function`);
  } catch (err: any) {
    log.push(`❌ Failed to call support-reply-email: ${err.message}`);
  }

  // 🧾 Write to log file
  const logDir = path.join(__dirname, "..", "logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logFile = path.join(logDir, `smoke-log-${timestamp}.txt`);
  fs.writeFileSync(logFile, log.join("\n"));

  console.log(`✅ Smoke test completed. Log saved to: ${logFile}`);
}

runTestFlow().catch((err) => {
  console.error("❌ Smoke Test Failed:", err);
});
