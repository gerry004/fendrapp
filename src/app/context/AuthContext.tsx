'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '../lib/session';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser?: UserSession | null }) {
  const [user, setUser] = useState<UserSession | null>(initialUser || null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    if (!initialUser) {
      loadUserFromSession();
    } else {
      setLoading(false);
    }
  }, [initialUser]);

  // Logout function
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setUser(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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