import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app, revisa si ya había un token guardado previamente
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    if (tokenGuardado) {
      setToken(tokenGuardado);
    }
    setCargando(false);
  }, []);

  // Función login: envía credenciales a FastAPI
  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const respuesta = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const access_token = respuesta.data.access_token;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    return respuesta.data;
  };

  // Función logout: borra el token de memoria y del navegador
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, estaAutenticado: !!token, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto fácilmente desde cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}