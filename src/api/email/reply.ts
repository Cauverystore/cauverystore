// /api/email/reply.ts
import type { VercelRequest, VercelResponse } from 'vercel';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, subject, message, contact_id } = req.body;

  if (!email || !subject || !message || !contact_id) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Send email via Resend
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject,
      html: `<p>${message}</p>`
    });

    // Log outbound email
    await supabase.from('outbound_emails').insert([
      {
        to_email: email,
        subject,
        body: message,
        context: 'contact_reply',
        related_id: contact_id
      }
    ]);

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

