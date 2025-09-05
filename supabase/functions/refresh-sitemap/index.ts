// supabase/functions/refresh-sitemap/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Serve function
serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch product slugs
  const { data: products, error } = await supabase
    .from("products")
    .select("slug");

  if (error || !products) {
    console.error("Failed to fetch products:", error);
    return new Response("Error fetching products", { status: 500 });
  }

  // Build XML sitemap
  const baseUrl = "https://cauverystore.in";
  const staticRoutes = [
    "",
    "/store",
    "/support",
    "/wishlist",
    "/track-order",
    "/cancel-order",
    "/contact",
    "/about",
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  for (const route of staticRoutes) {
    sitemap += `  <url><loc>${baseUrl}${route}</loc></url>\n`;
  }

  // Product pages
  for (const product of products) {
    sitemap += `  <url><loc>${baseUrl}/product/${product.slug}</loc></url>\n`;
  }

  sitemap += `</urlset>`;

  // Upload to Supabase Storage (optional), or save elsewhere
  const uploadRes = await supabase.storage
    .from("public-assets")
    .upload("sitemap.xml", new Blob([sitemap], { type: "application/xml" }), {
      upsert: true,
    });

  if (uploadRes.error) {
    console.error("Upload failed", uploadRes.error);
    return new Response("Upload failed", { status: 500 });
  }

  return new Response("Sitemap updated successfully", { status: 200 });
});
