import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deleteOldTestData() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  console.log(`🧹 Deleting test users & tickets before: ${cutoff}`);

  // 1. Delete support tickets linked to old test users
  const { data: usersToDelete, error: fetchErr } = await supabase
    .from('profiles')
    .select('id')
    .like('email', 'testuser@cauverystore.in') // matches test users
    .lte('created_at', cutoff);

  if (fetchErr) {
    console.error('❌ Failed to fetch old test users:', fetchErr.message);
    return;
  }

  const userIds = usersToDelete?.map(u => u.id);
  if (!userIds?.length) {
    console.log('✅ No old test users found to delete.');
    return;
  }

  console.log(`📛 Users to delete: ${userIds.join(', ')}`);

  // Delete support_requests for those users
  const { error: supportDelErr } = await supabase
    .from('support_requests')
    .delete()
    .in('user_id', userIds);

  if (supportDelErr) {
    console.error('❌ Failed to delete support requests:', supportDelErr.message);
    return;
  }

  // Delete profiles
  const { error: profileDelErr } = await supabase
    .from('profiles')
    .delete()
    .in('id', userIds);

  if (profileDelErr) {
    console.error('❌ Failed to delete profiles:', profileDelErr.message);
    return;
  }

  // Delete auth users
  for (const id of userIds) {
    const { error: authErr } = await supabase.auth.admin.deleteUser(id);
    if (authErr) {
      console.error(`❌ Failed to delete auth user ${id}:`, authErr.message);
    } else {
      console.log(`🗑️ Deleted auth user: ${id}`);
    }
  }

  console.log('✅ Test user data cleanup complete.');
}

deleteOldTestData();
