// api/generate-sitemap.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Environment
const supabaseUrl = 'https://smwtliaoqgscyeppidvz.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET!;
const BASE_URL = 'https://www.cauverystore.in';

// Init Supabase
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 🔐 Secure CRON auth
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('⏳ Fetching products from Supabase...');
    const { data: products, error } = await supabase
      .from('products')
      .select('slug, published_at')
      .eq('status', 'active');

    if (error) {
      console.error('❌ Supabase fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    // Static Routes
    const staticRoutes = [
      { path: '', priority: '1.0' },
      { path: '/store', priority: '0.9' },
      { path: '/login', priority: '0.5' },
      { path: '/signup', priority: '0.5' },
      { path: '/thank-you', priority: '0.6' },
    ];

    const urls = staticRoutes.map(({ path, priority }) => {
      return `<url>
  <loc>${BASE_URL}${path}</loc>
  <priority>${priority}</priority>
</url>`;
    });

    // Dynamic Product Routes
    const productUrls = (products || []).map((p) => {
      const lastmod = p.published_at
        ? new Date(p.published_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      return `<url>
  <loc>${BASE_URL}/product/${encodeURIComponent(p.slug)}</loc>
  <lastmod>${lastmod}</lastmod>
  <priority>0.7</priority>
</url>`;
    });

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                      http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
${[...urls, ...productUrls].join('\n')}
</urlset>`;

    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml.trim());

    console.log(`✅ Sitemap written to ${sitemapPath}`);

    // 🔔 Ping search engines
    const pingTargets = [
      {
        name: 'Google',
        url: `https://www.google.com/ping?sitemap=${BASE_URL}/sitemap.xml`,
      },
      {
        name: 'Bing',
        url: `https://www.bing.com/ping?sitemap=${BASE_URL}/sitemap.xml`,
      },
      {
        name: 'Yandex',
        url: `https://yandex.com/indexnow?url=${BASE_URL}/sitemap.xml`,
      },
    ];

    for (const engine of pingTargets) {
      try {
        const response = await fetch(engine.url);
        if (response.ok) {
          console.log(`🔔 Pinged ${engine.name}`);
        } else {
          console.warn(`⚠️ Failed to ping ${engine.name}: ${response.statusText}`);
        }
      } catch (err) {
        console.error(`❌ Error pinging ${engine.name}:`, err);
      }
    }

    console.log('ℹ️ DuckDuckGo will detect sitemap via robots.txt');

    return res.status(200).json({ message: 'Sitemap updated and pinged.' });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
