import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, API_BASE_URL } from '../utils/api';
import { useAlert } from './AlertContext';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchUser = async () => {
      // Check for token in URL (for Google OAuth)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
        if (tokenFromUrl) {
          showAlert('Login successful! Welcome back!', 'success');
        }
      } catch (err) {
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  console.log(user);
  

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      
      setUser({user:userData} as unknown as User); // Type assertion to satisfy User type
      console.log(user);

      setError(null);
      showAlert('Login successful! Welcome back!', 'success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await authAPI.signup({ firstName, lastName, email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      setError(null);
      showAlert(`Welcome ${firstName}! Signup successful.`, 'success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Clear server-side cookie if present
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      // ignore network errors
    }

    try {
      // Ensure admin cookie is cleared server-side as well
      await fetch(`${API_BASE_URL}/api/admin/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      // ignore
    }

    // Clear local tokens
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, error, logout, login, signup }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};