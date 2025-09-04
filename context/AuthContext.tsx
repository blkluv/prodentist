import React, { createContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { supabase } from '../services/supabase';

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

  useEffect(() => {
    // This function checks for an active session and fetches the user's profile.
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
            // If a session exists, fetch the profile from the 'staff' table.
            const { data: staffProfile, error } = await supabase
                .from('staff')
                .select('name, role')
                .eq('id', session.user.id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching staff profile on session check:", error.message);
                setUser(null);
            } else if (staffProfile && session.user.email) {
                // If profile is found, set the user state.
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    name: staffProfile.name,
                    role: staffProfile.role as Role,
                });
            } else {
                // This can happen if the staff profile creation failed after sign up.
                // Treat as not logged in.
                setUser(null);
            }
        } else {
            // No session, so no user.
            setUser(null);
        }
        setLoading(false);
    };

    // Run the check on initial component mount.
    checkUser();

    // Set up a listener for authentication state changes (login/logout).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
        // When a user signs in or out, the session changes. Re-run the check.
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            checkUser();
        }
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
    // The onAuthStateChange listener will handle setting user to null.
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