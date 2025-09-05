// /pages/api/email/reply.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, subject, message, contact_id } = req.body;

  if (!email || !subject || !message || !contact_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "no-reply@cauverystore.in",
      to: email,
      subject,
      html: `
        <div style="font-family:sans-serif;line-height:1.5">
          <h2>Reply from Cauverystore Admin</h2>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
          <hr/>
          <p style="font-size:12px;color:#888;">This reply was sent in response to your contact request ID: <code>${contact_id}</code>.</p>
        </div>
      `,
    });

    if (response.error) {
      console.error("Resend Error:", response.error);
      return res.status(500).json({ error: "Failed to send email." });
    }

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error("Email send failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
