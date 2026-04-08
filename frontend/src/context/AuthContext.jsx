import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token }); 
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData);
    const { access_token } = response.data;
    
    localStorage.setItem('token', access_token);
    setUser({ token: access_token });
    return response.data;
  };

  const googleLogin = async (tokenId) => {
    try {
      const response = await api.post('/auth/google-login?token_id=' + tokenId);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      setUser({ token: access_token });
      return response.data;
    } catch (error) {
      console.error("❌ AuthContext: Google Login Failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (email, password) => {
    return await api.post('/auth/register', { email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
