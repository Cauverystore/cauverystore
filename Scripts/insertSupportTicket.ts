// scripts/insertSupportTicket.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function insertSupportTicket() {
  const { data, error } = await supabase
    .from('support_requests')
    .insert({
      user_id: 'f8fb6a07-f6bf-4689-8437-cc79bd7fe3d1', // ✅ replace with actual test user ID
      subject: 'Test ticket for new user',
      message: 'Testing support integration',
      status: 'open'
    })
    .select(); // 👈 ensures inserted row is returned

  if (error) {
    console.error('❌ Failed to insert support ticket:', error.message);
  } else {
    console.log('✅ Support ticket inserted:', data);
  }
}

insertSupportTicket();
