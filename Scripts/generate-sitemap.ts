import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://smwtliaoqgscyeppidvz.supabase.co'; // ✅ Replace with your actual URL if different
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Your public domain
const BASE_URL = 'https://www.cauverystore.in';

const generateSitemap = async () => {
  console.log('⏳ Fetching products from Supabase...');
  const { data: products, error } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'active');

  if (error) {
    console.error('❌ Supabase fetch error:', error.message);
    process.exit(1);
  }

  const staticRoutes = [
    '',
    '/store',
    '/wishlist',
    '/cart',
    '/support',
    '/checkout',
    '/login',
    '/signup',
    '/thank-you',
  ];

  const urls = staticRoutes.map(
    (route) => `<url><loc>${BASE_URL}${route}</loc><changefreq>weekly</changefreq></url>`
  );

  const productUrls =
    products?.map(
      (p) =>
        `<url><loc>${BASE_URL}/product/${encodeURIComponent(
          p.slug
        )}</loc><changefreq>daily</changefreq></url>`
    ) || [];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                      http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
${[...urls, ...productUrls].join('\n')}
</urlset>
`;

  const outputPath = path.resolve('public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml.trim());
  console.log(`✅ Sitemap generated at: ${outputPath}`);
};

generateSitemap();
