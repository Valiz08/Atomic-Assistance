import React, { createContext, useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../store/slices/app.slice';

const TWO_HOURS = 2 * 60 * 60 * 1000;

const isSessionValid = (): boolean => {
  try {
    const raw = localStorage.getItem('session');
    if (!raw) return false;
    const session = JSON.parse(raw);
    return Date.now() - session.loginTime <= TWO_HOURS;
  } catch {
    return false;
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isSessionValid);
  const dispatch = useDispatch();

  const setAuthenticated = (value: boolean) => setIsAuthenticated(value);

  const logout = () => {
    localStorage.removeItem('session');
    dispatch(auth({ id: undefined, username: '', password: '' }));
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
