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

    const { access_token, nombre, rol, username: userLogin } = respuesta.data;

    //Guardar token
    localStorage.setItem('token', access_token);
    setToken(access_token);

    //Armar y guardar datos del usuario
    const datosUsuario = {

      nombre: nombre || userLogin,
      rol: rol || 'Usuario',
      username: userLogin,
    };

    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);

    return respuesta.data;
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