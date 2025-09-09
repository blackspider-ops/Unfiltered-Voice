import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    BookOpen,
    FileText,
    Users,
    Settings,
    Mail,
    Tag,
    User,
    BarChart3,
    Crown,
    Shield,
    Database,
    Globe,
    Palette,
    Code,
    Zap,
    Heart,
    Coffee,
    Lightbulb,
    AlertTriangle,
    CheckCircle,
    ExternalLink
} from 'lucide-react';

export function OwnerCheatsheet() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Crown className="h-8 w-8 text-primary" />
                    Niyati's Super Secret Owner Manual 🎉
                </h1>
                <p className="text-muted-foreground text-lg">
                    Everything my little sister needs to know (and probably forgot 5 minutes after I explained it) 😅
                </p>
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Top Secret - Owner Eyes Only
                    </Badge>
                    <Badge variant="outline">
                        Made with ❤️ by Big Bro
                    </Badge>
                    <Badge variant="outline">
                        Updated: When you ask "How do I...?" for the 100th time 😂
                    </Badge>
                </div>
            </div>

            {/* Quick Start */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Quick Start Guide (AKA "Help, I Forgot Everything!" 🤦‍♀️)
                    </CardTitle>
                    <CardDescription>Essential stuff you should probably do daily (but let's be real, you'll forget half of it)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Pro Tip from Big Bro:</strong> Set phone reminders for these tasks, because I know you'll get distracted by TikTok and forget 😏
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Daily Tasks (Yes, DAILY! 📅)
                            </h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Check pending comments (Don't let trolls wait too long 😈)</li>
                                <li>• Review analytics (See how famous you're getting! 📈)</li>
                                <li>• Write and publish new posts (Your thoughts won't share themselves!)</li>
                                <li>• Respond to contact messages (Be nice, they're your fans! 💕)</li>
                                <li>• Drink coffee ☕ (Most important task tbh)</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                Weekly Tasks (When you remember 🙃)
                            </h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Update About page (Add new fun facts about yourself!)</li>
                                <li>• Review categories (Keep them organized, unlike your room 😂)</li>
                                <li>• Check user management (Make sure no weirdos got in)</li>
                                <li>• Backup content (It's automatic, but check anyway!)</li>
                                <li>• Call your brother and say thanks 😉</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Admin Panel Features */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Admin Panel Features Guide (Your New Best Friend 🤝)
                    </CardTitle>
                    <CardDescription>Complete breakdown of every button, tab, and thingy you can click on</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Analytics */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-primary">
                            <BarChart3 className="h-4 w-4" />
                            Analytics Dashboard 📊 (AKA "Am I Famous Yet?")
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm mb-2"><strong>What it shows:</strong> How many people are reading your genius thoughts (hopefully more than just mom and dad 😅)</p>
                            <p className="text-sm mb-2"><strong>How to use:</strong> Check daily to see if you're going viral or if you need to write better content 📈</p>
                            <p className="text-sm mb-2"><strong>Key metrics:</strong> Page views (higher = better), unique visitors (real people, not bots), bounce rate (lower = people actually read your stuff)</p>
                            <p className="text-sm"><strong>Fun fact:</strong> If your bounce rate is 100%, it means people run away faster than you run from doing dishes 🏃‍♀️💨</p>
                        </div>
                    </div>

                    {/* Blog Editor */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-secondary">
                            <FileText className="h-4 w-4" />
                            Blog Editor ✍️ (Where the Magic Happens)
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm mb-2"><strong>Features:</strong> Rich text editor (fancy!), image uploads (for your aesthetic pics), PDF attachments (for when you're feeling academic), auto-save (because I know you forget to save)</p>
                            <p className="text-sm mb-2"><strong>Categories:</strong>
                                • Mental Health (your therapy sessions in public 😌)<br />
                                • Current Affairs (your hot takes on the world 🔥)<br />
                                • Creative Writing (when you're feeling poetic 🎭)<br />
                                • Books (your book reviews that are better than Goodreads 📚)
                            </p>
                            <p className="text-sm mb-2"><strong>Pro Tips:</strong> Use catchy titles (clickbait is okay sometimes 😉), add pretty cover images (people judge books by covers), estimate read time honestly (don't lie, we can count!)</p>
                            <p className="text-sm"><strong>SEO Stuff:</strong> Write good descriptions so Google loves you more than it loves cat videos 🐱</p>
                        </div>
                    </div>

                    {/* Posts Management */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-accent">
                            <FileText className="h-4 w-4" />
                            Posts Management 📝 (Your Content Kingdom)
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm mb-2"><strong>Actions:</strong> Edit (fix your typos), publish/unpublish (make it live or hide your embarrassing posts), delete (nuclear option - use wisely!)</p>
                            <p className="text-sm mb-2"><strong>Status Guide:</strong> Published = everyone can see it, Draft = your secret thoughts (for now)</p>
                            <p className="text-sm mb-2"><strong>Organization:</strong> Filter by category (when you can't find that one post), sort by date (newest first, obviously)</p>
                            <p className="text-sm"><strong>Warning:</strong> Don't delete posts when you're angry. Sleep on it. Trust me on this one 😴</p>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-primary">
                            <Mail className="h-4 w-4" />
                            Comments & Engagement 💬 (Your Fan Club Management)
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm mb-2"><strong>Moderation:</strong> Approve the nice comments, reject the mean ones (you're the queen here 👑)</p>
                            <p className="text-sm mb-2"><strong>Engagement Tips:</strong> Reply to comments! People love when you talk back (in a good way). Build your little community of awesome humans 🤗</p>
                            <p className="text-sm mb-2"><strong>Spam Detection:</strong> If it says "Great post! Check out my crypto site!" - it's spam. Delete with prejudice 🗑️</p>
                            <p className="text-sm"><strong>Golden Rule:</strong> Be nice, but don't let trolls live rent-free in your comment section 🧌</p>
                        </div>
                    </div>

                    {/* About Page */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-secondary">
                            <User className="h-4 w-4" />
                            About Page Editor 👤 (Your Personal Brand HQ)
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm mb-2"><strong>Sections:</strong> Bio (tell your story!), photos (look cute), interests (show your personality), fun facts (be quirky!), social links (let people stalk you legally), favorite quote (be inspirational)</p>
                            <p className="text-sm mb-2"><strong>Photo Tips:</strong> Use good lighting (ring lights are your friend), smile (or don't, mysterious works too), update regularly (people get bored of the same face 📸)</p>
                            <p className="text-sm mb-2"><strong>Fun Facts Ideas:</strong> "I can eat an entire pizza by myself" or "I once binge-watched 3 seasons in one day" - relatable stuff!</p>
                            <p className="text-sm"><strong>Update Schedule:</strong> Whenever you learn something new about yourself or get a new obsession (monthly-ish?) 🔄</p>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-accent">
                            <Tag className="h-4 w-4" />
                            Categories Management 🏷️ (Your Content Filing System)
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm mb-2"><strong>What it does:</strong> Organize your posts so people can find stuff (and so you look professional 💼)</p>
                            <p className="text-sm mb-2"><strong>Current Categories:</strong> Don't mess with these unless you really know what you're doing (call me first!)</p>
                            <p className="text-sm"><strong>Pro Tip:</strong> If you want to add new categories, think about it for at least a week. Categories are like tattoos - hard to remove later 😅</p>
                        </div>
                    </div>

                    {/* Mail */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-primary">
                            <Mail className="h-4 w-4" />
                            Mail Management 📧 (Your Digital Mailbox)
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm mb-2"><strong>What you'll get:</strong> Contact form messages, fan mail (hopefully!), collaboration requests, and the occasional weird message</p>
                            <p className="text-sm mb-2"><strong>Response Time:</strong> Try to reply within 24-48 hours (people appreciate quick responses, unlike your WhatsApp habits 📱)</p>
                            <p className="text-sm"><strong>Red Flags:</strong> Anything asking for money, personal info, or "business opportunities" that sound too good to be true 🚩</p>
                        </div>
                    </div>

                    {/* Users */}
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-secondary">
                            <Users className="h-4 w-4" />
                            User Management 👥 (Your Kingdom's Citizens)
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm mb-2"><strong>Who's who:</strong> You're the Owner (obviously), there might be Admins (trusted people), and regular Users (your readers)</p>
                            <p className="text-sm mb-2"><strong>Powers:</strong> You can promote people to Admin, ban troublemakers, or just see who's part of your community</p>
                            <p className="text-sm"><strong>Be careful:</strong> Don't accidentally demote yourself (yes, it's possible, and yes, it would be hilarious but also bad 😂)</p>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Content Strategy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Content Strategy & Best Practices 📚 (How to Not Suck at Writing)
                    </CardTitle>
                    <CardDescription>Your guide to creating content that doesn't make people want to close the tab immediately</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Big Brother's Writing Wisdom 🧠</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Remember: You're not writing for your English teacher anymore. Write like you're texting your best friend about something you're passionate about.
                            People can smell fake authenticity from miles away (and it stinks worse than your gym socks 🧦).
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary">Writing Tips That Actually Work ✍️</h4>
                            <ul className="text-sm space-y-3 text-muted-foreground">
                                <li>• <strong>Be authentic:</strong> Share your real thoughts, not what you think people want to hear. Your weird is your superpower! 🦸‍♀️</li>
                                <li>• <strong>Hook readers:</strong> Start with something that makes people go "Wait, what?!" or "OMG same!" Don't start with "In this blog post, I will discuss..." 😴</li>
                                <li>• <strong>Use subheadings:</strong> People have the attention span of goldfish these days. Break it up or lose them! 🐠</li>
                                <li>• <strong>Add images:</strong> A wall of text is scarier than a horror movie. Pretty pictures = happy readers 📸</li>
                                <li>• <strong>End with questions:</strong> "What do you think?" gets more responses than "Thanks for reading" 💭</li>
                                <li>• <strong>Write drunk, edit sober:</strong> Not literally drunk (you're too young!), but write with passion, edit with logic 🍷➡️☕</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-secondary">Your Content Categories Explained 🏷️</h4>
                            <div className="space-y-4">
                                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded border border-purple-200 dark:border-purple-800">
                                    <Badge variant="outline" className="mb-2 bg-purple-100 dark:bg-purple-900">Mental Health 🧠</Badge>
                                    <p className="text-xs text-muted-foreground mb-1"><strong>What to write:</strong> Your therapy sessions but make them public, anxiety rants, self-discovery journeys, mindfulness tips</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400"><strong>Vibe:</strong> "Let me trauma dump but make it helpful for others"</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-800">
                                    <Badge variant="outline" className="mb-2 bg-red-100 dark:bg-red-900">Current Affairs 🔥</Badge>
                                    <p className="text-xs text-muted-foreground mb-1"><strong>What to write:</strong> Your hot takes on world events, social issues that make you mad, Gen-Z perspectives on boomer problems</p>
                                    <p className="text-xs text-red-600 dark:text-red-400"><strong>Vibe:</strong> "Let me explain why everyone else is wrong (respectfully)"</p>
                                </div>
                                <div className="bg-pink-50 dark:bg-pink-950/20 p-3 rounded border border-pink-200 dark:border-pink-800">
                                    <Badge variant="outline" className="mb-2 bg-pink-100 dark:bg-pink-900">Creative Writing 🎭</Badge>
                                    <p className="text-xs text-muted-foreground mb-1"><strong>What to write:</strong> Poetry that hits different, short stories, random creative bursts, artistic word vomit</p>
                                    <p className="text-xs text-pink-600 dark:text-pink-400"><strong>Vibe:</strong> "I'm feeling poetic and you're gonna deal with it"</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800">
                                    <Badge variant="outline" className="mb-2 bg-green-100 dark:bg-green-900">Books 📚</Badge>
                                    <p className="text-xs text-muted-foreground mb-1"><strong>What to write:</strong> Book reviews that are better than Goodreads, literary analysis, reading recommendations, bookish rants</p>
                                    <p className="text-xs text-green-600 dark:text-green-400"><strong>Vibe:</strong> "Let me tell you why this book changed my life (or ruined my week)"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold text-accent">SEO & Discoverability 🔍 (Getting Found on the Internet)</h4>
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>SEO = Search Engine Optimization</strong> = Making Google love you more than it loves cat videos.
                                It's like being popular in high school, but for websites 📈
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    Title Optimization
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2">Use titles that make people click. Think BuzzFeed but classier.</p>
                                <p className="text-xs text-green-600 dark:text-green-400"><strong>Good:</strong> "Why I Stopped Caring What People Think (And You Should Too)"</p>
                                <p className="text-xs text-red-600 dark:text-red-400"><strong>Bad:</strong> "My Thoughts on Self-Confidence"</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    Meta Descriptions
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2">The little preview text in Google results. Make it juicy! 🍑</p>
                                <p className="text-xs text-muted-foreground">Think of it as your post's Tinder bio - you have one shot to make them swipe right</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-pink-500" />
                                    Social Sharing
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2">Your posts automatically look pretty when shared on social media ✨</p>
                                <p className="text-xs text-muted-foreground">No more ugly link previews! Your content will look professional AF</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-primary">Content Ideas When You're Stuck 💡</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h5 className="font-medium text-sm mb-2">When You're Feeling Deep 🌊</h5>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• "Things I wish I knew at 16"</li>
                                    <li>• "Unpopular opinions I'll die on a hill for"</li>
                                    <li>• "Why [insert trend] is actually toxic"</li>
                                    <li>• "Letters to my past/future self"</li>
                                </ul>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h5 className="font-medium text-sm mb-2">When You're Feeling Fun 🎉</h5>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• "Rating [anything] as a Gen-Z"</li>
                                    <li>• "Books that made me cry in public"</li>
                                    <li>• "My villain origin story"</li>
                                    <li>• "Things that give me the ick"</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Technical Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Technical Information
                    </CardTitle>
                    <CardDescription>Behind-the-scenes details about your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary">Platform Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hosting:</span>
                                    <span>Vercel (Auto-deploy from GitHub)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Database:</span>
                                    <span>Supabase (PostgreSQL)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Framework:</span>
                                    <span>React + TypeScript</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Styling:</span>
                                    <span>Tailwind CSS + shadcn/ui</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-secondary">Security Features</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• <strong>Authentication:</strong> Secure user login system</li>
                                <li>• <strong>Role-based access:</strong> Admin vs Owner permissions</li>
                                <li>• <strong>Content moderation:</strong> Comment approval system</li>
                                <li>• <strong>Data protection:</strong> Encrypted database storage</li>
                                <li>• <strong>Backup system:</strong> Automatic daily backups</li>
                            </ul>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold text-accent">Performance & SEO</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800">
                                <h5 className="font-medium text-sm mb-1 text-green-700 dark:text-green-400">Fast Loading</h5>
                                <p className="text-xs text-green-600 dark:text-green-500">Optimized images, code splitting, CDN</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                                <h5 className="font-medium text-sm mb-1 text-blue-700 dark:text-blue-400">SEO Ready</h5>
                                <p className="text-xs text-blue-600 dark:text-blue-500">Meta tags, sitemaps, structured data</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded border border-purple-200 dark:border-purple-800">
                                <h5 className="font-medium text-sm mb-1 text-purple-700 dark:text-purple-400">Mobile First</h5>
                                <p className="text-xs text-purple-600 dark:text-purple-500">Responsive design, touch-friendly</p>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                        <AlertTriangle className="h-5 w-5" />
                        Troubleshooting & Support
                    </CardTitle>
                    <CardDescription>Common issues and how to resolve them</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="space-y-4">
                        <h4 className="font-semibold">Common Issues & Solutions</h4>

                        <div className="space-y-3">
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded border border-orange-200 dark:border-orange-800">
                                <h5 className="font-medium text-sm mb-2">Can't see admin panel</h5>
                                <p className="text-xs text-muted-foreground mb-2"><strong>Solution:</strong> Make sure you're logged in with an admin account</p>
                                <p className="text-xs text-muted-foreground">If still not working, check with the developer to verify your user role</p>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded border border-orange-200 dark:border-orange-800">
                                <h5 className="font-medium text-sm mb-2">Images not uploading</h5>
                                <p className="text-xs text-muted-foreground mb-2"><strong>Solution:</strong> Check file size (max 5MB) and format (JPG, PNG, WebP)</p>
                                <p className="text-xs text-muted-foreground">Try refreshing the page and uploading again</p>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded border border-orange-200 dark:border-orange-800">
                                <h5 className="font-medium text-sm mb-2">Post not showing on website</h5>
                                <p className="text-xs text-muted-foreground mb-2"><strong>Solution:</strong> Make sure the post is marked as "Published"</p>
                                <p className="text-xs text-muted-foreground">Check that all required fields are filled out</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold">Getting Help</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h5 className="font-medium text-sm">For Technical Issues:</h5>
                                <p className="text-xs text-muted-foreground">Contact the developer with:</p>
                                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                                    <li>• What you were trying to do</li>
                                    <li>• What happened instead</li>
                                    <li>• Screenshots if possible</li>
                                    <li>• Browser and device info</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h5 className="font-medium text-sm">For Content Questions:</h5>
                                <p className="text-xs text-muted-foreground">Remember:</p>
                                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                                    <li>• Your voice is unique and valuable</li>
                                    <li>• Authenticity resonates with readers</li>
                                    <li>• Consistency builds audience</li>
                                    <li>• Engagement creates community</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Personal Message */}
            <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
                <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">A Note from Your Only Brother 😎</h3>
                    <p className="text-muted-foreground mb-4">
                        Hey little sis! 👋 I built this entire platform because you kept asking me to make you a blog and I got tired of explaining WordPress 😅
                        Every button, every feature, every little detail was coded with caffeine and the occasional "why did I agree to this?" moment ☕
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Your thoughts are... well, they're definitely unique 😏 Just remember to actually use this thing after I spent weeks building it. 
                        And maybe don't write anything that'll get us both in trouble, yeah? 💪
                    </p>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium mb-2">Remember:</p>
                        <ul className="text-xs text-left space-y-1">
                            <li>• Your weird is your wonderful 🌟</li>
                            <li>• Authenticity &gt; Perfection, always 💯</li>
                            <li>• It's okay to write about pizza at 2 AM 🍕</li>
                            <li>• Don't break my code (I'll know if you do) �</li>
                            <li>• When in doubt, add more emojis 😂</li>
                        </ul>
                    </div>
                    <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                            <Coffee className="h-4 w-4" />
                            <span>Built with ☕ and lots of late nights</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Code className="h-4 w-4" />
                            <span>Coded with ❤️ by Big Bro</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                        P.S. - If you break something, don't panic. Just call me and pretend it wasn't your fault 😅
                    </p>
                </CardContent>
            </Card>

        </div>
    );
}