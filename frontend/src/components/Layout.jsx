import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';
import logoBox from '../assets/logo-gestion.png';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="layout-sidebar">
        <div class='logo-box'>
        <img src={logoBox} alt="Logo Gestión" className="logo-size" />
          <p className='model-p1'>Gestión Stock</p>
          <p>Controla hoy, crece mañana</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '8px', borderRadius: '4px' }}>
            Panel Principal
          </Link>
          <Link to="/inventario" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '8px', borderRadius: '4px' }}>
            Productos
          </Link>
        <Link to="/inventario" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '8px', borderRadius: '4px' }}>
          Proveedores
          </Link>
          <Link to="/movimientos" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '8px', borderRadius: '4px' }}>
            Entradas y Salidas
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <button
            onClick={handleCerrarSesion}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cerrar Sesión
          </button>
       </div>
      </aside>

      {/* Contenido dinámico */}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}