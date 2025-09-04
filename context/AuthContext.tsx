import React, { createContext, useState, useEffect } from 'react';
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
    // onAuthStateChange is called once on init with the current session.
    // This will handle the initial session check on page load/refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            // A session exists. Fetch the associated profile from the 'staff' table.
            const { data: staffProfile, error } = await supabase
                .from('staff')
                .select('name, role')
                .eq('id', session.user.id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching staff profile on auth change:", error.message);
                setUser(null);
            } else if (staffProfile) {
                // Profile found, set the user state.
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: staffProfile.name,
                    role: staffProfile.role as Role,
                });
            } else {
                // Edge case: user exists in Supabase Auth but not in our 'staff' table.
                // This can happen if profile insertion fails during registration.
                // Log them out to prevent a broken state.
                console.warn("Auth user found without a staff profile. Forcing sign-out.");
                await supabase.auth.signOut();
                setUser(null);
            }
        } else {
            // No session, or user signed out.
            setUser(null);
        }
        // Whether a user was found or not, the check is complete.
        setLoading(false);
    });

    // Cleanup the subscription when the component unmounts.
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