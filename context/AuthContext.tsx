
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkUser = useCallback(async () => {
    setLoading(true);
    const currentUser = await supabase.auth.getUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const loggedInUser = await supabase.auth.signInWithPassword(email, password);
    setUser(loggedInUser);
    setLoading(false);
    if (loggedInUser) {
      navigate('/dashboard');
    } else {
        throw new Error("Invalid login credentials");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
