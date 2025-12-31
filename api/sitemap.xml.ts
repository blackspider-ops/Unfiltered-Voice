import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(req: any, res: any) {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    const baseUrl = 'https://www.unfilteredvoice.me';
    
    // Fetch all published posts
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, category, updated_at, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    const staticPages = [
        { url: '', priority: '1.0', changefreq: 'daily' },
        { url: '/categories', priority: '0.9', changefreq: 'weekly' },
        { url: '/mental-health', priority: '0.8', changefreq: 'weekly' },
        { url: '/current-affairs', priority: '0.8', changefreq: 'weekly' },
        { url: '/creative-writing', priority: '0.8', changefreq: 'weekly' },
        { url: '/books', priority: '0.8', changefreq: 'weekly' },
        { url: '/meet-niyati', priority: '0.7', changefreq: 'monthly' },
        { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    ];

    const today = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
        sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add blog posts
    if (posts) {
        for (const post of posts) {
            const lastmod = post.updated_at 
                ? new Date(post.updated_at).toISOString().split('T')[0]
                : new Date(post.published_at).toISOString().split('T')[0];
            
            sitemap += `  <url>
    <loc>${baseUrl}/${post.category}/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        }
    }

    sitemap += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(sitemap);
}
