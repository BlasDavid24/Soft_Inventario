import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
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

    const { access_token, nombre, rol, username: userLogin, primer_login } = respuesta.data;

    // Guardar token
    localStorage.setItem('token', access_token);
    setToken(access_token);

    // Armar y guardar datos del usuario con su estado de primer_login
    const datosUsuario = {
      nombre: nombre || userLogin,
      rol: rol || 'Usuario',
      username: userLogin,
      primer_login: primer_login ?? false,
    };

    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);

    return respuesta.data;
  };

  // Función para marcar primer_login como false tras actualizar la clave
  const completarPrimerLogin = () => {
    setUsuario((prev) => {
      if (!prev) return null;
      const actualizado = { ...prev, primer_login: false };
      localStorage.setItem('usuario', JSON.stringify(actualizado));
      return actualizado;
    });
  };

  // Función logout: limpia token y usuario
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        login,
        logout,
        completarPrimerLogin,
        estaAutenticado: !!token,
        cargando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}