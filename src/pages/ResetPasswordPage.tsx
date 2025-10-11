import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { isPasswordStrong } from '@/utils/passwordValidation';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the auth callback from Supabase
        const handleAuthCallback = async () => {
            try {
                // First, try to get the current session
                const { data: sessionData } = await supabase.auth.getSession();

                // If no session, check URL hash for tokens (Supabase sends them there)
                if (!sessionData.session) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');
                    const type = hashParams.get('type');

                    if (type === 'recovery' && accessToken && refreshToken) {
                        // Set the session with the tokens from the URL
                        await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        });

                        // Clear the hash from URL for security
                        window.history.replaceState(null, '', window.location.pathname);
                    } else {
                        // No valid tokens found
                        toast.error('Invalid or expired reset link. Please request a new one.');
                        setTimeout(() => navigate('/auth'), 2000);
                    }
                }
            } catch (error) {
                toast.error('Something went wrong. Please try requesting a new reset link.');
                setTimeout(() => navigate('/auth'), 2000);
            }
        };

        handleAuthCallback();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (!isPasswordStrong(password)) {
            toast.error('Password does not meet security requirements');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success('Password updated successfully! 🎉');
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Lock className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Reset Your Password
                    </CardTitle>
                    <CardDescription>
                        Enter your new password below (and try not to forget it this time! 😉)
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                    className="pr-10"
                                    autoComplete="new-password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm new password"
                                    className="pr-10"
                                    autoComplete="new-password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <PasswordStrengthIndicator password={password} />
                        )}

                        {password && confirmPassword && password !== confirmPassword && (
                            <p className="text-sm text-destructive">Passwords do not match</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || password !== confirmPassword || !isPasswordStrong(password)}
                        >
                            {loading ? 'Updating Password...' : 'Update Password'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Back to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}