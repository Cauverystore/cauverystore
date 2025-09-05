import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'testuser2@cauverystore.in', // ✅ changed to a unique email
    password: 'SecurePass123!',
    email_confirm: true
  });

  if (error) {
    console.error('❌ User creation failed:', error.message);
  } else {
    console.log('✅ User created:', data?.user?.id);
  }
}

createTestUser();
