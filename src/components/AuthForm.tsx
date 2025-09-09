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
  const { signIn, signUp } = useAuth();

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
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
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
            disabled={loading || (!isLogin && !isResetPassword && !isPasswordStrong(password))}
          >
            {loading ? 'Please wait...' : (
              isResetPassword ? 'Send Reset Email' : (isLogin ? 'Sign In' : 'Create Account')
            )}
          </Button>
        </form>
        
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