import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

//Interceptor de salida (Request):
// Antes de que cualquier petición viaje a FastAPI, revisa si hay un token JWT guardado.
// Si existe, le pega el encabezado Authorization con el Bearer token automáticamente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Interceptor de llegada (Response):
// Si FastAPI responde con error 401 (token expirado o no autorizado),
// limpia los datos guardados y manda al usuario a la pantalla de login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;