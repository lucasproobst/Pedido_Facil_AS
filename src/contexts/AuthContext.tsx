
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  phone?: string;
  street?: string;
  number?: string;
  complement?: string;
  postal_code?: string;
  city_state?: string;
  order_count?: number;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>;
  register: (userData: { name: string; email: string; phone?: string; password: string }) => Promise<{ success?: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isAuthenticated: false,
    loading: true,
  });

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        let profile = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        setState({
          user: session?.user ?? null,
          session,
          profile,
          isAuthenticated: !!session,
          loading: false,
        });

        console.log('Auth state changed: INITIAL_SESSION', {
          user: session?.user ? 'authenticated' : 'not authenticated',
          session: session ? 'exists' : 'null'
        });
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, {
          user: session?.user ? 'authenticated' : 'not authenticated',
          session: session ? 'exists' : 'null'
        });

        let profile = null;
        if (session?.user) {
          // Defer profile fetch to avoid blocking auth state change
          setTimeout(async () => {
            const fetchedProfile = await fetchProfile(session.user.id);
            setState(prev => ({ ...prev, profile: fetchedProfile }));
          }, 0);
        }

        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          profile: session ? prev.profile : null,
          isAuthenticated: !!session,
          loading: false,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { error: error.message };
      }

      toast.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: error.message || 'Erro ao fazer login' };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const register = async (userData: { name: string; email: string; phone?: string; password: string }) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
          },
        },
      });

      if (error) {
        console.error('Register error:', error);
        return { error: error.message };
      }

      toast.success('Cadastro realizado com sucesso!');
      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error);
      return { error: error.message || 'Erro ao criar conta' };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
