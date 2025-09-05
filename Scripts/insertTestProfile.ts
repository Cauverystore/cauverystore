import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function insertTestProfile() {
  const { data, error } = await supabase.from('profiles').insert({
    id: 'f8fb6a07-f6bf-4689-8437-cc79bd7fe3d1', // your test user id
    name: 'Test User 2'
  });

  if (error) {
    console.error('❌ Failed to insert profile:', error.message);
  } else {
    console.log('✅ Profile inserted:', data);
  }
}

insertTestProfile();
