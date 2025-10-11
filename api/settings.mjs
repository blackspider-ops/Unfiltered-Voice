import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      console.error('Settings API error:', error);
      return res.status(500).json({
        error: 'Failed to fetch settings',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}