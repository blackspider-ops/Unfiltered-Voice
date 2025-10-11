-- Create email_notifications table to track sent notifications
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'new_post',
  recipients_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add excerpt column to posts table for email previews
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Enable RLS on email_notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy for email_notifications (only admins can view)
CREATE POLICY "Only admins can view email notifications" 
ON public.email_notifications 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage email notifications" 
ON public.email_notifications 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log when a post is published (for manual notification triggering)
CREATE OR REPLACE FUNCTION public.log_post_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if post is being published (is_published changed from false to true)
  IF OLD.is_published = false AND NEW.is_published = true THEN
    -- Insert a record to track that this post needs notification
    INSERT INTO public.email_notifications (post_id, notification_type, recipients_count, success_count, failure_count)
    VALUES (NEW.id, 'pending_notification', 0, 0, 0);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for logging post publications
CREATE TRIGGER on_post_published
  AFTER UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_post_publication();

-- Create index for better performance
CREATE INDEX idx_email_notifications_post_sent ON public.email_notifications(post_id, sent_at DESC);
CREATE INDEX idx_posts_published_created ON public.posts(is_published, created_at DESC);