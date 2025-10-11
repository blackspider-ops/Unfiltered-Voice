import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, ExternalLink, Info } from 'lucide-react';

export function StorageSetupGuide() {
  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Database className="h-5 w-5" />
          Storage Setup Required
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          File uploads require a Supabase storage bucket to be configured.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The <code>blog-content</code> storage bucket needs to be created in your Supabase project.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Quick Setup (Recommended):</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
              Run this SQL in your Supabase dashboard → SQL Editor:
            </p>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-md text-xs font-mono overflow-x-auto">
              <pre>{`-- Create the blog-content storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-content', 'blog-content', true, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- Set up storage policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-content');

CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'blog-content');`}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Manual Setup:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700 dark:text-orange-300">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to Storage → Buckets</li>
              <li>Click "Create a new bucket"</li>
              <li>Name it <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">blog-content</code></li>
              <li>Set it as Public bucket</li>
              <li>Configure allowed file types: images and PDFs</li>
              <li>Set file size limit to 10MB</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Supabase Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            Refresh Page
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Alternative:</strong> You can use manual URL input for now by uploading files to any hosting service 
            (like Cloudinary, AWS S3, or Google Drive) and entering the URLs directly.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}