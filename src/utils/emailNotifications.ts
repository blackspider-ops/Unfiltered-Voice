import { supabase } from '@/integrations/supabase/client';

export interface EmailNotificationResult {
  success: boolean;
  message: string;
  details?: {
    successCount: number;
    failureCount: number;
    totalSubscribers: number;
  };
}

/**
 * Manually trigger email notification for a published post
 */
export async function sendBlogNotification(postId: string): Promise<EmailNotificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-blog-notification', {
      body: { postId }
    });

    if (error) {
      console.error('Email notification error:', error);
      return {
        success: false,
        message: 'Failed to send email notifications'
      };
    }

    return {
      success: true,
      message: `Email notifications sent successfully`,
      details: data?.details
    };
  } catch (error) {
    console.error('Email notification error:', error);
    return {
      success: false,
      message: 'Failed to send email notifications'
    };
  }
}

/**
 * Get email notification history for a post
 */
export async function getEmailNotificationHistory(postId: string) {
  try {
    const { data, error } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('post_id', postId)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return [];
  }
}

/**
 * Get total subscriber count
 */
export async function getSubscriberCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null);

    if (error) {
      console.error('Error fetching subscriber count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching subscriber count:', error);
    return 0;
  }
}