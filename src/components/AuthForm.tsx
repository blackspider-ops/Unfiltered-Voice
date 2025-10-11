import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { isPasswordStrong } from '@/utils/passwordValidation';

interface AuthFormProps {
  onClose?: () => void;
}

export function AuthForm({ onClose }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        
        if (!error) {
          toast.success('Password reset email sent! Check your inbox 📧');
          setIsResetPassword(false);
          setIsLogin(true);
        } else {
          toast.error(error.message);
        }
      } else if (isLogin) {
        result = await signIn(email, password);
        if (!result.error) {
          toast.success('Welcome back!');
          onClose?.();
        } else {
          toast.error(result.error.message);
        }
      } else {
        if (!isPasswordStrong(password)) {
          toast.error('Password does not meet security requirements');
          return;
        }
        
        result = await signUp(email, password, displayName);
        if (!result.error) {
          toast.success('Account created! Please check your email to verify.');
          onClose?.();
        } else {
          toast.error(result.error.message);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
        toast.error(errorMessage);
      }
      // Note: Success handling happens automatically via auth state change
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
        ? error.message 
        : 'Failed to sign in with Google';
      toast.error(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-surface border-subtle">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-display text-foreground">
          {isResetPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Join the Conversation')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isResetPassword 
            ? 'Enter your email to receive a password reset link'
            : (isLogin 
              ? 'Sign in to leave comments and engage with posts'
              : 'Create an account to join The Unfiltered Voice community'
            )
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isResetPassword && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLogin}
                placeholder="How should we call you?"
                autoComplete="name"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
          
          {!isResetPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              {/* Show password strength for signup */}
              {!isLogin && password && (
                <PasswordStrengthIndicator password={password} />
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || googleLoading || (!isLogin && !isResetPassword && !isPasswordStrong(password))}
          >
            {loading ? 'Please wait...' : (
              isResetPassword ? 'Send Reset Email' : (isLogin ? 'Sign In' : 'Create Account')
            )}
          </Button>
        </form>

        {/* Google Sign-In - only show for login/signup, not password reset */}
        {!isResetPassword && (
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-subtle" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                'Connecting...'
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          </div>
        )}
        
        <div className="mt-6 text-center space-y-2">
          {!isResetPassword && (
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 block w-full"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </Button>
          )}
          
          {isLogin && !isResetPassword && (
            <Button
              variant="ghost"
              onClick={() => {
                setIsResetPassword(true);
                setPassword('');
              }}
              className="text-muted-foreground hover:text-foreground text-sm block w-full"
            >
              Forgot your password? 🤦‍♀️
            </Button>
          )}
          
          {isResetPassword && (
            <Button
              variant="ghost"
              onClick={() => {
                setIsResetPassword(false);
                setIsLogin(true);
              }}
              className="text-primary hover:text-primary/80 block w-full"
            >
              Back to Sign In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}