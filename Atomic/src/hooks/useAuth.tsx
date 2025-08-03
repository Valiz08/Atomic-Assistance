import React, { createContext, useContext, useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  sub: string;
  exp: number;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: JwtPayload | null;
  logout: () => void;
  checkToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<JwtPayload | null>(null);

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return logout();

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        logout();
      } else {
        setIsAuthenticated(true);
        setUser(decoded);
      }
    } catch (e) {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
