import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';
import { format } from 'date-fns';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateExportFile(): Promise<string> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*');

  if (error) throw new Error('Failed to fetch contact messages');

  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const filename = `contact_export_${timestamp}.csv`;
  const exportDir = path.join('exports', 'test-exports');
  fs.mkdirSync(exportDir, { recursive: true });

  const csvHeader = 'ID,Email,Subject,Message,Created At\n';
  const csvBody = data
    .map((msg) =>
      `${msg.id},${msg.email},"${msg.subject}","${msg.message}",${msg.created_at}`
    )
    .join('\n');
  const fullPath = path.join(exportDir, filename);
  fs.writeFileSync(fullPath, csvHeader + csvBody);
  return fullPath;
}

async function uploadToSupabase(filePath: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);

  const { error } = await supabase.storage
    .from('exports')
    .upload(`test-exports/${filename}`, fileBuffer, {
      contentType: 'text/csv',
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
}

(async () => {
  console.log('🚀 Starting full export test flow...');

  try {
    const filePath = await generateExportFile();
    console.log(`✅ Export file created: ${filePath}`);

    await uploadToSupabase(filePath);
    console.log('✅ File uploaded to Supabase Storage');
  } catch (err: any) {
    console.error('❌ Error during export test flow:', err.message);
  }
})();
