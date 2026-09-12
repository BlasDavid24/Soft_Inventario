import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios/Usuarios';
import CrearUsuario from './pages/Usuarios/CrearUsuario';
import EditarUsuario from './pages/Usuarios/EditarUsuario';
import CambiarPassword from './pages/Auth/CambiarPassword';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Vista limpia sin Layout para actualizar la clave temporal */}
          <Route
            path="/cambiar-password"
            element={
              <ProtectedRoute permitirPrimerLogin={true}>
                <CambiarPassword />
              </ProtectedRoute>
            }
          />

          {/* Rutas del sistema dentro del Layout (bloqueadas si primer_login es true) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="usuarios/nuevo" element={<CrearUsuario />} />
            <Route path="usuarios/actualizar/:id" element={<EditarUsuario />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}