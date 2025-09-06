import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
}

interface CustomAuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const CustomAuthContext = createContext<CustomAuthContextType>({ 
  user: null, 
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {}
});

export const CustomAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('custom_auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('custom_auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { username, password, action: 'login' }
      });

      if (error) throw error;

      if (data.success) {
        const userData = { id: data.user.id, username: data.user.username };
        setUser(userData);
        localStorage.setItem('custom_auth_user', JSON.stringify(userData));
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { username, password, action: 'register' }
      });

      if (error) throw error;

      if (data.success) {
        const userData = { id: data.user.id, username: data.user.username };
        setUser(userData);
        localStorage.setItem('custom_auth_user', JSON.stringify(userData));
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('custom_auth_user');
  };

  return (
    <CustomAuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </CustomAuthContext.Provider>
  );
};

export const useCustomAuth = () => {
  return useContext(CustomAuthContext);
};