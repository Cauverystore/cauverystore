import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateTestProfile() {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', 'f8fb6a07-f6bf-4689-8437-cc79bd7fe3d1')
    .single();

  if (error || !profile) {
    console.error('❌ No profile found with that ID:', error?.message);
    return;
  }

  console.log('👀 Profile found:', profile);

  const { data, error: updateError } = await supabase
    .from('profiles')
    .update({ name: 'Test User 2 Updated' })
    .eq('id', profile.id);

  if (updateError) {
    console.error('❌ Failed to update profile:', updateError.message);
  } else {
    console.log('✅ Profile updated successfully');
  }
}

updateTestProfile();
