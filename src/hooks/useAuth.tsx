import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signInWithGoogle: () => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Get initial session first
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check roles for initial session
        if (session?.user) {
          try {
            // Just check roles, let useProfile handle profile creation
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .in('role', ['admin', 'owner']);
            
            const roles = data || [];
            const hasOwner = roles.some(r => r.role === 'owner');
            const hasAdmin = roles.some(r => r.role === 'admin');
            
            setIsOwner(hasOwner);
            setIsAdmin(hasAdmin || hasOwner);
          } catch (error) {
            console.error('Error checking roles:', error);
            setIsAdmin(false);
            setIsOwner(false);
          }
        } else {
          setIsAdmin(false);
          setIsOwner(false);
        }
      } catch (error) {
        setIsAdmin(false);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const checkRoles = async () => {
            try {
              // Just check roles, let useProfile handle profile creation
              const { data } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .in('role', ['admin', 'owner']);
              
              const roles = data || [];
              const hasOwner = roles.some(r => r.role === 'owner');
              const hasAdmin = roles.some(r => r.role === 'admin');
              
              setIsOwner(hasOwner);
              setIsAdmin(hasAdmin || hasOwner);
            } catch (error) {
              console.error('Error checking roles:', error);
              setIsAdmin(false);
              setIsOwner(false);
            }
          };
          
          checkRoles();
        } else {
          setIsAdmin(false);
          setIsOwner(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      isAdmin,
      isOwner
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}