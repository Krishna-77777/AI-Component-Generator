import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // If a token exists, we consider the user authenticated.
      setUser({ token });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
      email,
      password,
    });
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };
  
  const register = async (email, password) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        email,
        password,
    });
    // Automatically log in after registration
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Add the `token` to the value so other components can access it for API calls
  const value = { token, user, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};