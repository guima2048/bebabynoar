'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { signOut } from "next-auth/react";

const AuthContext = createContext({
  user: null,
  login: (userData: any) => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Forçar remoção do cookie de sessão do NextAuth
    document.cookie = 'next-auth.session-token=; Max-Age=0; path=/;';
    signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 