import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: staffProfile, error } = await supabase
          .from('staff')
          .select('name, role')
          .eq('id', session.user.id)
          .maybeSingle(); // FIX: Use maybeSingle() to prevent error if no profile is found.

        if (error) {
          console.error("Error fetching staff profile:", error.message);
          await supabase.auth.signOut();
          setUser(null);
        } else if (staffProfile) {
          const fullUser: User = {
            id: session.user.id,
            email: session.user.email!,
            name: staffProfile.name,
            role: staffProfile.role as Role,
          };
          setUser(fullUser);
        } else {
          // Handle case where user exists in auth but not in staff table
          console.warn("No staff profile found for authenticated user. Logging out.");
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    }
    setUser(null);
    navigate('/login');
  };

  const register = async (name: string, email: string, password: string) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!data.user) {
        throw new Error("Registration succeeded but no user data was returned.");
    }

    const { error: insertError } = await supabase
      .from('staff')
      .insert({ id: data.user.id, name, email, role: Role.ASSISTANT });

    if (insertError) {
      // In a production app, you might want to handle this more gracefully,
      // perhaps by deleting the created auth user.
      throw new Error(`User created, but failed to create staff profile: ${insertError.message}`);
    }
  };


  const value = { user, loading, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};