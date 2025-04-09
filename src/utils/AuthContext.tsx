import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { userApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isLoggedIn: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,
  });

  // Check if the token is valid on initial load
  useEffect(() => {
    if (state.token) {
      // TODO: Add token validation if needed
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setState((prev) => ({
            ...prev,
            user: JSON.parse(userData),
          }));
        } catch (error) {
          // If user data is corrupted, log the user out
          logout();
        }
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await userApi.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState({
        user,
        token,
        isLoggedIn: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Login failed',
      }));
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await userApi.signup({ username, email, password });
      // Auto-login after successful signup
      await login(email, password);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Signup failed',
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
    });
  };

  const forgotPassword = async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await userApi.forgotPassword({ email });
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Password reset request failed',
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await userApi.resetPassword({ email, otp, new_password: newPassword });
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Password reset failed',
      }));
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 