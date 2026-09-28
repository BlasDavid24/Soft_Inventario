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
import Proveedores from './pages/Proveedores/Proveedores';
import DetalleProveedor from './pages/Proveedores/DetalleProveedor'
import EditarProveedor from './pages/Proveedores/EditarProveedor';
import Productos from './pages/Productos/Productos';
import DetalleProducto from './pages/Productos/DetalleProducto';

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
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="proveedores/detalles/:id" element={<DetalleProveedor />} />
            <Route path="proveedores/actualizar/:id" element={<EditarProveedor />} />
            <Route path="productos" element={<Productos />} />
            <Route path="productos/detalles/:id" element={<DetalleProducto />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}