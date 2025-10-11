import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, FileText, Image, Save, Eye, X, Edit } from 'lucide-react';
import { StorageSetupGuide } from './StorageSetupGuide';

interface BlogPost {
    title: string;
    category: string;
    slug: string;
    content?: string;
    pdf_url?: string;
    cover_url?: string;
    read_time_min: number;
    is_published: boolean;
}

interface BlogEditorProps {
    onPostCreated: () => void;
    editingPost?: {
        id: string;
        title: string;
        category: string;
        slug: string;
        content?: string;
        pdf_url?: string;
        cover_url?: string;
        read_time_min: number;
        is_published: boolean;
    } | null;
    onCancelEdit?: () => void;
}

export function BlogEditor({ onPostCreated, editingPost, onCancelEdit }: BlogEditorProps) {
    const { toast } = useToast();
    const [post, setPost] = useState<BlogPost>({
        title: '',
        category: 'mental-health',
        slug: '',
        content: '',
        pdf_url: '',
        cover_url: '',
        read_time_min: 5,
        is_published: false
    });

    const [contentType, setContentType] = useState<'text' | 'pdf'>('text');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [storageAvailable, setStorageAvailable] = useState(true);
    const [manualPdfUrl, setManualPdfUrl] = useState('');
    const [manualCoverUrl, setManualCoverUrl] = useState('');

    // Load editing post data
    useEffect(() => {
        if (editingPost) {
            setPost({
                title: editingPost.title,
                category: editingPost.category,
                slug: editingPost.slug,
                content: editingPost.content || '',
                pdf_url: editingPost.pdf_url || '',
                cover_url: editingPost.cover_url || '',
                read_time_min: editingPost.read_time_min,
                is_published: editingPost.is_published
            });
            setContentType(editingPost.pdf_url ? 'pdf' : 'text');
            setIsEditing(true);
        } else {
            // Reset form when not editing
            setPost({
                title: '',
                category: 'mental-health',
                slug: '',
                content: '',
                pdf_url: '',
                cover_url: '',
                read_time_min: 5,
                is_published: false
            });
            setContentType('text');
            setIsEditing(false);
        }
    }, [editingPost]);

    const categories = [
        { value: 'mental-health', label: 'Mind Matters' },
        { value: 'current-affairs', label: 'News & Views' },
        { value: 'creative-writing', label: 'Bleeding Ink' },
        { value: 'books', label: 'Reading Reflections' }
    ];

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setPost(prev => ({
            ...prev,
            title,
            slug: prev.slug || generateSlug(title)
        }));
    };

    const uploadFile = async (file: File, path: string): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('blog-content')
            .upload(filePath, file);

        if (uploadError) {
            // Provide more helpful error messages
            if (uploadError.message.includes('Bucket not found')) {
                throw new Error('Storage bucket not found. Please contact the administrator to set up file storage.');
            } else if (uploadError.message.includes('File size')) {
                throw new Error('File is too large. Please choose a file smaller than 10MB.');
            } else if (uploadError.message.includes('not allowed')) {
                throw new Error('File type not allowed. Please upload images (JPG, PNG, GIF) or PDF files only.');
            } else if (uploadError.message.includes('policy')) {
                throw new Error('Upload permission denied. Please check storage policies in Supabase.');
            }
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data } = supabase.storage
            .from('blog-content')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleFileUpload = async (file: File, type: 'pdf' | 'cover') => {
        setUploading(true);
        try {
            const path = type === 'pdf' ? 'pdfs' : 'covers';
            const url = await uploadFile(file, path);

            if (type === 'pdf') {
                setPost(prev => ({ ...prev, pdf_url: url }));
                setPdfFile(null);
            } else {
                setPost(prev => ({ ...prev, cover_url: url }));
                setCoverFile(null);
            }

            toast({
                title: "Upload successful",
                description: `${type === 'pdf' ? 'PDF' : 'Cover image'} uploaded successfully`,
            });
        } catch (error) {
            // If storage is not available, show manual URL input option
            if (error instanceof Error && (
                error.message.includes('Storage bucket') || 
                error.message.includes('Bucket not found') ||
                error.message.includes('permission denied')
            )) {
                setStorageAvailable(false);
                toast({
                    title: "Storage not available",
                    description: "File upload failed. You can enter URLs manually below.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Upload failed",
                    description: error instanceof Error ? error.message : "Failed to upload file",
                    variant: "destructive",
                });
            }
        } finally {
            setUploading(false);
        }
    };

    const estimateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        return Math.max(1, Math.ceil(words / wordsPerMinute));
    };

    const handleContentChange = (content: string) => {
        const readTime = estimateReadTime(content);
        setPost(prev => ({
            ...prev,
            content,
            read_time_min: readTime
        }));
    };

    const handleSave = async (publish: boolean = false) => {
        if (!post.title.trim()) {
            toast({
                title: "Error",
                description: "Title is required",
                variant: "destructive",
            });
            return;
        }

        if (contentType === 'pdf' && !post.pdf_url) {
            toast({
                title: "Error",
                description: "PDF file is required for PDF posts",
                variant: "destructive",
            });
            return;
        }

        if (contentType === 'text' && !post.content?.trim()) {
            toast({
                title: "Error",
                description: "Content is required for text posts",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            const postData = {
                title: post.title,
                category: post.category,
                slug: post.slug || generateSlug(post.title),
                pdf_url: contentType === 'pdf' ? post.pdf_url : '',
                cover_url: post.cover_url || '',
                read_time_min: post.read_time_min,
                is_published: publish,
                updated_at: new Date().toISOString(),
                // Store text content in a separate field if needed
                ...(contentType === 'text' && { content: post.content })
            };

            // Check if user is owner
            const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
            
            const isOwner = userRoles?.some(r => r.role === 'owner');

            if (!isOwner) {
                // Submit change request for admin users
                const changeType = isEditing ? 'post_edit' : 'post_create';
                const targetId = isEditing ? editingPost!.id : crypto.randomUUID();
                
                const { error } = await supabase.rpc('submit_change_request', {
                    _change_type: changeType,
                    _target_id: targetId,
                    _original_data: isEditing ? editingPost : null,
                    _proposed_changes: postData,
                    _change_summary: isEditing 
                        ? `Edit post: ${post.title}`
                        : `Create new post: ${post.title}`
                });

                if (error) throw error;

                toast({
                    title: "Change Request Submitted",
                    description: "Your post changes have been submitted for owner approval",
                });

                handleCancelEdit();
                return;
            }

            // Owner can make direct changes
            let error;
            if (isEditing && editingPost) {
                // Update existing post
                const result = await supabase
                    .from('posts')
                    .update(postData)
                    .eq('id', editingPost.id);
                error = result.error;
            } else {
                // Create new post
                const result = await supabase
                    .from('posts')
                    .insert(postData);
                error = result.error;
            }

            if (error) {
                throw error;
            }

            toast({
                title: "Success",
                description: `Post ${isEditing ? 'updated' : (publish ? 'published' : 'saved as draft')} successfully`,
            });

            // Reset form
            handleCancelEdit();
            onPostCreated();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'save'} post`,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setPost({
            title: '',
            category: 'mental-health',
            slug: '',
            content: '',
            pdf_url: '',
            cover_url: '',
            read_time_min: 5,
            is_published: false
        });
        setContentType('text');
        setIsEditing(false);
        onCancelEdit?.();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isEditing ? <Edit className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        {isEditing ? 'Edit Blog Post' : 'Blog Editor'}
                    </div>
                    {isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2"
                        >
                            <X className="h-4 w-4" />
                            Cancel Edit
                        </Button>
                    )}
                </CardTitle>
                <CardDescription>
                    {isEditing ? 'Edit and update your blog post' : 'Create and publish new blog posts'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={post.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Enter post title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={post.category} onValueChange={(value) => setPost(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input
                            id="slug"
                            value={post.slug}
                            onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="auto-generated-from-title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="readTime">Read Time (minutes)</Label>
                        <Input
                            id="readTime"
                            type="number"
                            min="1"
                            value={post.read_time_min}
                            onChange={(e) => setPost(prev => ({ ...prev, read_time_min: parseInt(e.target.value) || 1 }))}
                        />
                    </div>
                </div>

                {/* Content Type Selection */}
                <div className="space-y-4">
                    <Label>Content Type</Label>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant={contentType === 'text' ? 'default' : 'outline'}
                            onClick={() => setContentType('text')}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Text Content
                        </Button>
                        <Button
                            type="button"
                            variant={contentType === 'pdf' ? 'default' : 'outline'}
                            onClick={() => setContentType('pdf')}
                            className="flex items-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            PDF Upload
                        </Button>
                    </div>
                </div>

                {/* Content Editor */}
                {contentType === 'text' ? (
                    <div className="space-y-2">
                        <Label htmlFor="content">Content *</Label>
                        <Textarea
                            id="content"
                            value={post.content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Write your blog post content here..."
                            className="min-h-[300px]"
                        />
                        <p className="text-sm text-muted-foreground">
                            Estimated read time: {post.read_time_min} minute{post.read_time_min !== 1 ? 's' : ''}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>PDF File *</Label>
                            {storageAvailable ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                        disabled={uploading}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => pdfFile && handleFileUpload(pdfFile, 'pdf')}
                                        disabled={!pdfFile || uploading}
                                        size="sm"
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        Upload
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        type="url"
                                        placeholder="Enter PDF URL (e.g., https://example.com/document.pdf)"
                                        value={manualPdfUrl}
                                        onChange={(e) => setManualPdfUrl(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (manualPdfUrl.trim()) {
                                                setPost(prev => ({ ...prev, pdf_url: manualPdfUrl.trim() }));
                                                setManualPdfUrl('');
                                                toast({
                                                    title: "PDF URL added",
                                                    description: "PDF URL has been set successfully",
                                                });
                                            }
                                        }}
                                        disabled={!manualPdfUrl.trim()}
                                        size="sm"
                                        variant="outline"
                                    >
                                        Set PDF URL
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        File upload is not available. Please upload your PDF to a hosting service and enter the URL above.
                                    </p>
                                </div>
                            )}
                            {post.pdf_url && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">PDF Set</Badge>
                                    <a href={post.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                        View PDF
                                    </a>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPost(prev => ({ ...prev, pdf_url: '' }))}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Cover Image Upload */}
                <div className="space-y-2">
                    <Label>Cover Image (Optional)</Label>
                    {storageAvailable ? (
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                disabled={uploading}
                            />
                            <Button
                                type="button"
                                onClick={() => coverFile && handleFileUpload(coverFile, 'cover')}
                                disabled={!coverFile || uploading}
                                size="sm"
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                                Upload
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Input
                                type="url"
                                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                                value={manualCoverUrl}
                                onChange={(e) => setManualCoverUrl(e.target.value)}
                            />
                            <Button
                                type="button"
                                onClick={() => {
                                    if (manualCoverUrl.trim()) {
                                        setPost(prev => ({ ...prev, cover_url: manualCoverUrl.trim() }));
                                        setManualCoverUrl('');
                                        toast({
                                            title: "Cover image URL added",
                                            description: "Cover image URL has been set successfully",
                                        });
                                    }
                                }}
                                disabled={!manualCoverUrl.trim()}
                                size="sm"
                                variant="outline"
                            >
                                Set Image URL
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                File upload is not available. Please upload your image to a hosting service and enter the URL above.
                            </p>
                        </div>
                    )}
                    {post.cover_url && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Cover Image Set</Badge>
                            <a href={post.cover_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                View Image
                            </a>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPost(prev => ({ ...prev, cover_url: '' }))}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Publish Options */}
                <div className="flex items-center space-x-2">
                    <Switch
                        id="publish"
                        checked={post.is_published}
                        onCheckedChange={(checked) => setPost(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label htmlFor="publish">Publish immediately</Label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isEditing ? 'Update Draft' : 'Save Draft'}
                    </Button>
                    <Button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                        {isEditing ? 'Update & Publish' : 'Publish Now'}
                    </Button>
                </div>
                {/* Storage Setup Guide */}
                {!storageAvailable && (
                    <div className="space-y-4">
                        <StorageSetupGuide />
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStorageAvailable(true);
                                    toast({
                                        title: "Storage test enabled",
                                        description: "Try uploading a file again to test storage.",
                                    });
                                }}
                            >
                                Test Storage Again
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}