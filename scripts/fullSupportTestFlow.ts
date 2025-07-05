import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logFile = path.join('logs', 'test-flow.log');
const now = new Date().toISOString();

function logToFile(message: string) {
  fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] ${message}`);
}

async function main() {
  const testEmail = `testuser_${uuidv4().slice(0, 6)}@cauverystore.in`;

  // Cleanup old test users
  const { data: oldUsers } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (oldUsers?.users?.length) {
    for (const user of oldUsers.users) {
      if (user.email?.startsWith('testuser_')) {
        await supabase.auth.admin.deleteUser(user.id);
        logToFile(`🗑️ Deleted old test user: ${user.email}`);
      }
    }
  }

  // Create a new user
  const { data: newUserData, error: userError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'SecurePass123!',
    email_confirm: true
  });

  if (userError || !newUserData.user) {
    console.error('❌ Failed to create test user:', userError?.message);
    logToFile(`❌ Failed to create user: ${userError?.message}`);
    return;
  }

  const user_id = newUserData.user.id;
  console.log('✅ User created:', user_id);
  logToFile(`✅ User created: ${user_id}`);

  // Upsert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user_id,
    name: 'Test User',
    role: 'customer',
    email: testEmail
  });

  if (profileError) {
    console.error('❌ Failed to upsert profile:', profileError.message);
    logToFile(`❌ Profile error: ${profileError.message}`);
  } else {
    console.log('✅ Profile upserted');
    logToFile(`✅ Profile upserted`);
  }

  // Insert a test order
  const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert({
    user_id,
    status: 'processing',
    total: 1999,
    created_at: now
  }).select().single();

  const orderId = insertedOrder?.id;
  if (orderError || !orderId) {
    console.error('❌ Order insert failed:', orderError?.message);
    logToFile(`❌ Order insert failed: ${orderError?.message}`);
  } else {
    console.log('✅ Order inserted:', orderId);
    logToFile(`✅ Order inserted: ${orderId}`);
  }

  // Insert support tickets with order reference
  const supportTickets = [
    {
      subject: 'Order not received',
      message: 'My order has not arrived yet.',
    },
    {
      subject: 'Wrong item delivered',
      message: 'I received a different product.',
    },
    {
      subject: 'Return request',
      message: 'I want to return the product.',
    },
  ];

  for (const ticket of supportTickets) {
    const { data: insertedTickets, error: ticketError } = await supabase
      .from('support_requests')
      .insert({
        user_id,
        subject: ticket.subject,
        message: ticket.message,
        status: 'open',
        order_id: orderId
      })
      .select();

    if (ticketError || !insertedTickets?.[0]) {
      console.error('❌ Support ticket insert failed:', ticketError?.message);
      logToFile(`❌ Ticket insert failed: ${ticketError?.message}`);
    } else {
      const ticketId = insertedTickets[0].id;
      console.log('✅ Support ticket inserted:', ticketId);
      logToFile(`✅ Ticket inserted: ${ticketId}`);

      // Simulate threaded admin reply via Edge Function
      const replyRes = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/support-reply-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          subject: `Reply: ${ticket.subject}`,
          message: `Admin response to: ${ticket.message}`,
          support_request_id: ticketId,
          is_admin: true
        }),
        duplex: 'half'
      });

      if (replyRes.ok) {
        console.log('✅ Reply sent to:', ticketId);
        logToFile(`✅ Reply sent for ticket ${ticketId}`);
      } else {
        const err = await replyRes.text();
        console.error('❌ Failed to send reply:', err);
        logToFile(`❌ Reply failed: ${err}`);
      }
    }
  }

  // Upload log file to Supabase Storage
  const logBuffer = fs.readFileSync(logFile);
  const fileName = `log-${now}.txt`;
  const { error: storageError } = await supabase.storage
    .from('test-logs')
    .upload(fileName, logBuffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'text/plain'
    });

  if (storageError) {
    console.error('❌ Log upload failed:', storageError.message);
    logToFile(`❌ Log upload failed: ${storageError.message}`);
  } else {
    console.log('✅ Log uploaded to storage');
    logToFile(`✅ Log uploaded to Supabase storage as ${fileName}`);
  }
}

main();
