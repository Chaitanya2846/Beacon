import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  useEffect(() => {
    // If we have a token but no user, we would ideally fetch /api/auth/me here.
    // For now, we'll rely on the login/register payload to set the user state.
    if (token && !user) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setUser(storedUser);
    }
  }, [token, user]);

  const login = async (email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/dashboard');
  };

  const register = async (companyName, adminName, email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/register-tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, adminName, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register account.');

    // TRADITIONAL FLOW: We do NOT set the token or user here.
    // We just return true so the Registration page knows it succeeded.
    return true; 
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};