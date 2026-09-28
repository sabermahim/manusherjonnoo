import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, VolunteerProfile } from '../types/index.ts';
import { api, getStoredToken, removeStoredToken, setStoredToken } from '../lib/api.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  volunteerInfo: VolunteerProfile | null;
  loading: boolean;
  unreadCount: number;
  login: (email: string, pass: string) => Promise<User>;
  registerUser: (data: any) => Promise<void>;
  registerVolunteer: (data: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  demoLogin: (role: 'USER' | 'VOLUNTEER') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [volunteerInfo, setVolunteerInfo] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setVolunteerInfo(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setVolunteerInfo(data.volunteerInfo);
      setUnreadCount(data.unreadNotificationsCount || 0);
    } catch (error) {
      console.warn('Session expired or invalid, logging out:', error);
      removeStoredToken();
      setUser(null);
      setVolunteerInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const notifs = await api.getNotifications();
      const unread = notifs.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.token);
      await refreshUser();
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.registerUser(data);
      setStoredToken(res.token);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const registerVolunteer = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.registerVolunteer(data);
      setStoredToken(res.token);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      setStoredToken(idToken);
      await refreshUser();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      throw new Error(err.message || 'গুগল দিয়ে লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'USER' | 'VOLUNTEER') => {
    setLoading(true);
    try {
      const res = await api.demoLogin(role);
      setStoredToken(res.token);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    setVolunteerInfo(null);
    setUnreadCount(0);
    // Clear browser history state to prevent back navigation into protected pages
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        volunteerInfo,
        loading,
        unreadCount,
        login,
        registerUser,
        registerVolunteer,
        loginWithGoogle,
        demoLogin,
        logout,
        refreshUser,
        refreshUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
