import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { GOOGLE_CLIENT_ID } from '../constants';
import { callBackend } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdminUnlocked: boolean;
  login: (credentialResponse: any) => Promise<void>;
  logout: () => void;
  unlockAdmin: (pin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  // Parse JWT helper (frontend only decoding, verify on backend)
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const login = async (credentialResponse: any) => {
    setIsLoading(true);
    const idToken = credentialResponse.credential;
    const profile = parseJwt(idToken);
    
    setToken(idToken);

    // Initial basic user info from Google
    const initialUser: User = {
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      role: UserRole.GUEST, // Default until backend verification
    };

    // Verify with backend to get Role and Tenant ID
    const apiRes = await callBackend<{ role: UserRole, tenantId: string, name: string }>({
      action: 'verifyAuth',
      token: idToken
    });

    if (apiRes.success && apiRes.data) {
      setUser({
        ...initialUser,
        role: apiRes.data.role,
        tenantId: apiRes.data.tenantId
      });
    } else {
      // Fallback if user is not in system, they remain guest (or could be auto-registered)
      console.warn("User not found in system or verify failed", apiRes.error);
      setUser(initialUser);
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdminUnlocked(false);
    // Optional: google.accounts.id.disableAutoSelect();
  };

  const unlockAdmin = async (pin: string): Promise<boolean> => {
    if (!token) return false;
    
    const apiRes = await callBackend({
      action: 'verifyPin',
      token: token,
      pin: pin
    });

    if (apiRes.success) {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdminUnlocked, login, logout, unlockAdmin }}>
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