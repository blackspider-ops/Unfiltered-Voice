import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  site_name: string;
  site_tagline: string;
  hero_title: string;
  hero_subtitle: string;
  typing_quotes: string[];
  about_title: string;
  about_description: string;
  words_to_live_by_title: string;
  words_to_live_by: string[];
  footer_text: string;
  contact_email: string;
  social_instagram: string;
  social_linkedin: string;
  meta_description: string;
  meta_keywords: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  site_name: 'The Unfiltered Voice',
  site_tagline: 'by Niyati Singhal',
  hero_title: 'Welcome to my unfiltered world',
  hero_subtitle: 'Where thoughts flow freely, emotions run deep, and authenticity reigns supreme. This is my space to share the raw, unpolished truths of life.',
  typing_quotes: [
    'Sometimes the most profound thoughts come in the quiet moments between chaos.',
    'Mental health isn\'t a destination, it\'s a journey with no final stop.',
    'In a world of filters, I choose to be unfiltered.',
    'Words have power. I choose to use mine wisely.',
    'Every story matters, including yours.'
  ],
  about_title: 'About The Voice',
  about_description: 'This blog is my sanctuary – a place where I can be completely honest about the human experience. Here, you\'ll find my thoughts on mental health, current events, creative expressions, and book reflections. No sugar-coating, no pretense, just authentic conversations about life.',
  words_to_live_by_title: 'Words to Live By',
  words_to_live_by: [
    'Be kind to yourself – you\'re doing better than you think.',
    'Your mental health is just as important as your physical health.',
    'It\'s okay to not be okay, but it\'s not okay to stay that way.',
    'Progress, not perfection.',
    'You are not your thoughts; you are the observer of your thoughts.'
  ],
  footer_text: 'Made with ❤️ and a lot of coffee',
  contact_email: 'hello@niyatisinghal.com',
  social_instagram: 'https://instagram.com',
  social_linkedin: 'https://linkedin.com',
  meta_description: 'The Unfiltered Voice - Authentic thoughts on mental health, current affairs, creative writing, and book reflections by Niyati Singhal',
  meta_keywords: 'mental health, blog, current affairs, creative writing, books, authentic, unfiltered, Niyati Singhal'
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {}
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      console.log('Fetching settings...');
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      console.log('Settings query result:', { data, error });

      if (error) {
        console.error('Settings fetch error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as any);

        setSettings({
          site_name: settingsMap.site_name || defaultSettings.site_name,
          site_tagline: settingsMap.site_tagline || defaultSettings.site_tagline,
          hero_title: settingsMap.hero_title || defaultSettings.hero_title,
          hero_subtitle: settingsMap.hero_subtitle || defaultSettings.hero_subtitle,
          typing_quotes: settingsMap.typing_quotes || defaultSettings.typing_quotes,
          about_title: settingsMap.about_title || defaultSettings.about_title,
          about_description: settingsMap.about_description || defaultSettings.about_description,
          words_to_live_by_title: settingsMap.words_to_live_by_title || defaultSettings.words_to_live_by_title,
          words_to_live_by: settingsMap.words_to_live_by || defaultSettings.words_to_live_by,
          footer_text: settingsMap.footer_text || defaultSettings.footer_text,
          contact_email: settingsMap.contact_email || defaultSettings.contact_email,
          social_instagram: settingsMap.social_instagram || defaultSettings.social_instagram,
          social_linkedin: settingsMap.social_linkedin || defaultSettings.social_linkedin,
          meta_description: settingsMap.meta_description || defaultSettings.meta_description,
          meta_keywords: settingsMap.meta_keywords || defaultSettings.meta_keywords
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();

    // Listen for settings changes
    const channel = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}