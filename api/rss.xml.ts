import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const categoryLabels: Record<string, string> = {
    'mental-health': 'Mind Matters',
    'current-affairs': 'News & Views',
    'creative-writing': 'Bleeding Ink',
    'books': 'Reading Reflections'
};

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export default async function handler(req: any, res: any) {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    const baseUrl = 'https://www.unfilteredvoice.me';
    
    // Fetch all published posts
    const { data: posts } = await supabase
        .from('posts')
        .select('title, slug, category, excerpt, content, published_at, cover_url')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(50);

    const buildDate = new Date().toUTCString();

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>The Unfiltered Voice</title>
    <description>A personal blog by Niyati Singhal exploring mental health, current affairs, creative writing, and book reflections.</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <managingEditor>preeniyati2101@gmail.com (Niyati Singhal)</managingEditor>
    <webMaster>preeniyati2101@gmail.com (Niyati Singhal)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} The Unfiltered Voice</copyright>
    <image>
      <url>${baseUrl}/favicon.png</url>
      <title>The Unfiltered Voice</title>
      <link>${baseUrl}</link>
    </image>
`;

    if (posts) {
        for (const post of posts) {
            const pubDate = new Date(post.published_at).toUTCString();
            const postUrl = `${baseUrl}/${post.category}/${post.slug}`;
            const description = post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '');
            
            rss += `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(categoryLabels[post.category] || post.category)}</category>
      <description>${escapeXml(description)}</description>
      <author>preeniyati2101@gmail.com (Niyati Singhal)</author>
`;
            if (post.cover_url) {
                rss += `      <enclosure url="${escapeXml(post.cover_url)}" type="image/jpeg"/>
`;
            }
            rss += `    </item>
`;
        }
    }

    rss += `  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(rss);
}
