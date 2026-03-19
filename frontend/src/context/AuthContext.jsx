import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedSession = localStorage.getItem('@GrrrAPP:session');
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
    setLoading(false);
  }, []);

  const loginAdmin = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { role: 'admin', username, password });
      const userSession = { ...response.data, role: 'admin' };
      setSession(userSession);
      localStorage.setItem('@GrrrAPP:session', JSON.stringify(userSession));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.detail || 'Erro na conexão com API / Senha incorreta.' };
    }
  };

  const loginStudent = async (studentId, password) => {
    try {
      const response = await api.post('/auth/login', { role: 'student', username: studentId, password });
      const userSession = { ...response.data, role: 'student' };
      setSession(userSession);
      localStorage.setItem('@GrrrAPP:session', JSON.stringify(userSession));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.detail || 'ID do aluno ou senha incorretos.' };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('@GrrrAPP:session');
  };

  return (
    <AuthContext.Provider value={{ session, setSession, loading, loginAdmin, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
