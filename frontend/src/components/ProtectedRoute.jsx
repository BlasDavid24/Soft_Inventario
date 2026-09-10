import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return <div>Cargando...</div>;
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}