
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthService } from '@/services/authService';
import { UserProfile } from '@/services/types';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Setting up auth state listener
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      // Auth state changed
      setUser(user);
      
      // Always clear profile immediately when auth state changes
      setProfile(null);
      
      if (user) {
        // Defer profile fetch to avoid blocking
        setTimeout(() => {
          fetchUserProfile(user.id);
        }, 0);
      } else {
        // Clear all user data and invalidate queries on sign out
        setSession(null);
        // Clear all cached data to prevent stale data
        queryClient.clear();
      }
      setLoading(false);
    });

    // THEN check for existing session
    AuthService.getSession().then((sessionResponse) => {
      // Initial session response
      const session = sessionResponse;
      // Extracted session
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('AuthProvider: Error getting initial session:', error);
      setLoading(false);
    });

    return () => {
      // Cleaning up auth subscription
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetching user profile
      // Clear profile first to avoid showing stale data
      setProfile(null);
      const userProfile = await AuthService.getUserProfile();
      // User profile fetched
      setProfile(userProfile);
    } catch (error) {
      console.error('AuthProvider: Error fetching user profile:', error);
      // Don't set profile to null here - the user might just not have a profile yet
      // The trigger should create it automatically for new users
    }
  };

  const signIn = async (email: string, password: string) => {
    // Sign in attempt
    try {
      // Clear any existing cached data and profile before signing in
      queryClient.clear();
      setProfile(null);
      
      const result = await AuthService.signIn(email, password);
      const user = result?.user;
      const session = result?.session;
      setUser(user);
      setSession(session);
      if (user) {
        await fetchUserProfile(user.id);
        // Invalidate and refetch all queries for the new user
        queryClient.invalidateQueries();
      }
      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Sign in catch:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Sign up attempt
    try {
      const result = await AuthService.signUp(email, password, fullName);
      // Note: user profile will be created automatically by the database trigger
      // Sign up successful, user profile should be created automatically
      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Sign up catch:', error);
      return { error };
    }
  };

  const signOut = async () => {
    // Sign out attempt
    try {
      await AuthService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      // Clear all cached data to prevent stale data
      queryClient.clear();
    } catch (error) {
      console.error('AuthProvider: Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // Update profile attempt
    try {
      const updatedProfile = await AuthService.updateProfile(updates);
      setProfile(updatedProfile);
      // Invalidate user-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return updatedProfile;
    } catch (error) {
      console.error('AuthProvider: Update profile error:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
