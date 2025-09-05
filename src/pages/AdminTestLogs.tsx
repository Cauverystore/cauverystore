import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { exec } from 'child_process';

// Load .env.test.flow if it exists
const testEnvPath = path.resolve('.env.test.flow');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
  console.log('📦 Loaded config from .env.test.flow');
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logFile = path.join('logs', 'test-flow.log');
const archiveDir = path.join('logs', 'archive');
const now = new Date().toISOString();

function logToFile(message: string) {
  fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] ${message}`);
}

async function archiveLogFile() {
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir);
  const archivedPath = path.join(archiveDir, `log-${now}.txt`);
  fs.copyFileSync(logFile, archivedPath);
  console.log(`📁 Log archived to: ${archivedPath}`);
}

async function notifyFailure(reason: string) {
  const webhookUrl = process.env.FAILURE_WEBHOOK_URL;
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `❌ Support test flow failed: ${reason}` })
  });
}

async function main() {
  try {
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
      throw new Error(userError?.message || 'Unknown user creation error');
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

    if (profileError) throw new Error(profileError.message);
    console.log('✅ Profile upserted');
    logToFile(`✅ Profile upserted`);

    // Insert a test order
    const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert({
      user_id,
      status: 'processing',
      total: 1999,
      created_at: now
    }).select().single();

    const orderId = insertedOrder?.id;
    if (orderError || !orderId) throw new Error(orderError?.message || 'Order insert failed');
    console.log('✅ Order inserted:', orderId);
    logToFile(`✅ Order inserted: ${orderId}`);

    // Insert support tickets
    const supportTickets = [
      { subject: 'Order not received', message: 'My order has not arrived yet.' },
      { subject: 'Wrong item delivered', message: 'I received a different product.' },
      { subject: 'Return request', message: 'I want to return the product.' },
    ];

    const insertedTicketIds: string[] = [];

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

      if (ticketError || !insertedTickets?.[0]) throw new Error(ticketError?.message || 'Ticket insert failed');

      const ticketId = insertedTickets[0].id;
      insertedTicketIds.push(ticketId);
      console.log('✅ Support ticket inserted:', ticketId);
      logToFile(`✅ Ticket inserted: ${ticketId}`);

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

      if (!replyRes.ok) {
        const err = await replyRes.text();
        throw new Error(`Reply failed for ${ticketId}: ${err}`);
      }

      console.log('✅ Reply sent to:', ticketId);
      logToFile(`✅ Reply sent for ticket ${ticketId}`);
    }

    // ✅ Assertions
    const { data: foundTickets } = await supabase
      .from('support_requests')
      .select('*')
      .eq('user_id', user_id);

    if ((foundTickets?.length || 0) !== 3) {
      throw new Error(`Expected 3 support tickets, found ${foundTickets?.length}`);
    }

    const { data: replies } = await supabase
      .from('support_replies')
      .select('*')
      .in('support_request_id', insertedTicketIds);

    if ((replies?.length || 0) !== 3) {
      throw new Error(`Expected 3 admin replies, found ${replies?.length}`);
    }

    // Upload log to Supabase
    const logBuffer = fs.readFileSync(logFile);
    const fileName = `log-${now}.txt`;
    const { error: storageError } = await supabase.storage
      .from('test-logs')
      .upload(fileName, logBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'text/plain'
      });

    if (storageError) throw new Error(`Log upload failed: ${storageError.message}`);
    console.log('✅ Log uploaded to storage');
    logToFile(`✅ Log uploaded as ${fileName}`);

    await archiveLogFile();
  } catch (err: any) {
    console.error('❌ Script failed:', err.message);
    logToFile(`❌ Script failed: ${err.message}`);
    await notifyFailure(err.message);
    process.exit(1);
  }
}

main();
