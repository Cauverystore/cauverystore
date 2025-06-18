// pages/api/send-return-status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, order_id, status, type } = req.body;

  if (!email || !order_id || !status || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await resend.emails.send({
      from: 'support@cauverystore.in',
      to: email,
      subject: `Your ${type} request for Order #${order_id} has been ${status}`,
      html: `
        <h2>Return/Replace Update</h2>
        <p>Your <strong>${type}</strong> request for <strong>Order #${order_id}</strong> has been <strong>${status}</strong>.</p>
        <p>If you have questions, reply to this email or contact support.</p>
      `
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ error: 'Email sending failed' });
  }
}
