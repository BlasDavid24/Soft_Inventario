import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  permitirPrimerLogin = false, 
  rolesPermitidos = null 
}) {
  const { usuario, estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return <div>Cargando...</div>;
  }

 
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }


  if (usuario?.primer_login && !permitirPrimerLogin) {
    return <Navigate to="/cambiar-password" replace />;
  }


  if (!usuario?.primer_login && permitirPrimerLogin) {
    return <Navigate to="/" replace />;
  }


  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}