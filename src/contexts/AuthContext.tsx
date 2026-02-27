import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('splash_signal_user');
    if (!savedUser) return null;
    return JSON.parse(savedUser) as User;
  });

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Login failed');
    }

    const data = await response.json();
    const newUser: User = {
      username: data.username,
      login: data.username,
      email: `${data.username.toLowerCase()}@splashsignal.io`,
      displayName: data.username,
      profilePicture: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.username}`,
      role: 'ANALYST',
      status: 'SECURE_LINK_ACTIVE',
      settings: {
        defaultLandingPage: 'home',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        units: 'USD',
        dataMode: 'light'
      }
    };
    
    setUser(newUser);
    localStorage.setItem('splash_signal_user', JSON.stringify(newUser));
    localStorage.setItem('signalos_token', data.token);
  };

  const signup = async (username: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Signup failed');
    }

    // After signup, we automatically login
    await login(username, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('splash_signal_user');
    localStorage.removeItem('signalos_token');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('splash_signal_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
