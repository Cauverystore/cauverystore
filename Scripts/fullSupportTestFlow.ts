// fullExportTestFlow.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from optional .env.test.flow
const envPath = path.resolve('.env.test.flow');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('📦 Loaded test config from .env.test.flow');
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const bucket = 'exports';
const testFile = `test-report-${uuidv4()}.txt`;
const filePath = path.resolve(`./logs/${testFile}`);
const fileContents = `Test export log for ${new Date().toISOString()}`;

fs.writeFileSync(filePath, fileContents);
console.log(`📝 Created mock file: ${filePath}`);

async function uploadToSupabase() {
  console.log('⏫ Uploading to Supabase Storage...');
  const fileBuffer = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`test-exports/${testFile}`, fileBuffer, {
      contentType: 'text/plain',
      upsert: true,
    });

  if (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Upload successful:', data?.path);

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(`test-exports/${testFile}`);

  console.log('🔗 Public URL:', urlData.publicUrl);
}

uploadToSupabase().then(() => console.log('🎉 Export test completed.'));
