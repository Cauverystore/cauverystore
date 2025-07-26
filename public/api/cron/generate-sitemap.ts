// /api/cron/generate-sitemap.ts
import { exec } from "child_process";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { CRON_SECRET } = process.env;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Execute the sitemap generation script
  exec("npx tsx scripts/generate-sitemap.ts", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Sitemap generation error:", error.message);
      return res.status(500).json({ error: "Sitemap generation failed" });
    }

    if (stderr) {
      console.warn("⚠️ Sitemap stderr:", stderr);
    }

    console.log("✅ Sitemap generated:\n", stdout);
    return res.status(200).json({ message: "Sitemap generated successfully" });
  });
}
