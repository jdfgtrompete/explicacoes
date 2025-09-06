import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

interface SimpleAuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType>({ 
  user: null, 
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {}
});

export const SimpleAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('simple_auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('simple_auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Get stored users
    const storedUsers = JSON.parse(localStorage.getItem('simple_auth_users') || '[]');
    
    // Find user
    const foundUser = storedUsers.find((u: any) => 
      u.username === username && u.password === password
    );

    if (foundUser) {
      const userData = { id: foundUser.id, username: foundUser.username };
      setUser(userData);
      localStorage.setItem('simple_auth_user', JSON.stringify(userData));
      return true;
    }
    
    return false;
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    // Get stored users
    const storedUsers = JSON.parse(localStorage.getItem('simple_auth_users') || '[]');
    
    // Check if username already exists
    if (storedUsers.some((u: any) => u.username === username)) {
      return false;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      password
    };

    storedUsers.push(newUser);
    localStorage.setItem('simple_auth_users', JSON.stringify(storedUsers));
    
    // Log in the user
    const userData = { id: newUser.id, username: newUser.username };
    setUser(userData);
    localStorage.setItem('simple_auth_user', JSON.stringify(userData));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('simple_auth_user');
  };

  return (
    <SimpleAuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  return useContext(SimpleAuthContext);
};