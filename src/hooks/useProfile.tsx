import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Comment = Tables<'comments'>;

interface ProfileStats {
  commentsCount: number;
  daysActive: number;
  profileUpdates: number;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    commentsCount: 0,
    daysActive: 0,
    profileUpdates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // First try to create profile if missing
      try {
        await supabase.rpc('create_user_profile_if_missing');
      } catch (createError) {
        console.warn('Could not create missing profile:', createError);
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (commentsError) {
        // Handle error silently
      }

      // Calculate stats
      const daysActive = profileData?.created_at 
        ? Math.floor((Date.now() - new Date(profileData.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const profileUpdates = profileData?.updated_at !== profileData?.created_at ? 1 : 0;

      setStats({
        commentsCount: commentsCount || 0,
        daysActive,
        profileUpdates,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name'>>) => {
    if (!user || !profile) {
      throw new Error('No user or profile found');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // Refresh profile data
    await fetchProfileData();
  };

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    refetch: fetchProfileData,
  };
}