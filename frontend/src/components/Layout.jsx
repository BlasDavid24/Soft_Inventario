import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';
import logoBox from '../assets/logo-gestion.png';
import Navbar from './Navbar.jsx';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className='layout-container'>
      <aside className='layout-sidebar'>

        {/* Logo y lema superior */}
        <div className='logo-box'>
          <img src={logoBox} alt='Logo Gestión' className='logo-size' />
          <div className='bar-texto-sub'>
            <p className='model-p1'>Gestión Stock</p>
            <p className='model-p2'>Controla hoy, crece mañana</p>
          </div>
        </div>

        {/* Navegacion con NavLink */}
        <nav className='sidebar-nav'>
          {/* Panel principal */}
          <NavLink
            to='/'
            end
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <svg
              className='nav-icon'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
              <polyline points='9 22 9 12 15 12 15 22' />
            </svg>
            <span>Panel Principal</span>
          </NavLink>

          {/* Productos */}
          <NavLink
            to='/productos'
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <svg className='nav-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
              <polyline points='3.27 6.96 12 12.01 20.73 6.96' />
              <line x1='12' y1='22.08' x2='12' y2='12' />
            </svg>
            <span>Productos</span>
          </NavLink>

          {/* Proveedores */}
          <NavLink
            to='/proveedores'
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <svg className='nav-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <rect x='1' y='3' width='15' height='13' />
              <polygon points='16 8 20 8 23 11 23 16 16 16 8' />
              <circle cx='5.5' cy='18.5' r='2.5' />
              <circle cx='18.5' cy='18.5' r='2.5' />
            </svg>
            <span>Proveedores</span>
          </NavLink>

          {/* Entradas y Salidas */}
          <NavLink
            to='/movimientos'
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <svg className='nav-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M8 4l-4 4 4 4' />
              <path d='M4 8h16' />
              <path d='M16 20l4-4-4-4' />
              <path d='M20 16H4' />
            </svg>
            <span>Entradas y Salidas</span>
          </NavLink>

          {/* Reportes */}
          <NavLink
            to='/reportes'
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <svg className='nav-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <line x1='18' y1='20' x2='18' y2='10' />
              <line x1='12' y1='20' x2='12' y2='4' />
              <line x1='6' y1='20' x2='6' y2='14' />
              <line x1='2' y1='20' x2='22' y2='20' />
            </svg>
            <span>Reportes</span>
          </NavLink>

          {/* Usuarios */}
          <NavLink
            to='/Usuarios'
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <svg className='nav-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
              <path d='M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
            <span>Usuarios</span>
          </NavLink>

          {/* Configuración */}
          <NavLink
            to='/configuracion'
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <svg className='nav-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='12' cy='12' r='3' />
              <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
            </svg>
            <span>Configuración</span>
          </NavLink>
        </nav>

        <hr className='sidebar-divider' />

        {/* Boton Cerrar Sesion */}
        <div className='sidebar-logout'>
          <button onClick={handleCerrarSesion} className='btn-login'>
            <svg
              className='logout-icon'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
              <polyline points='16 17 21 12 16 7' />
              <line x1='21' y1='12' x2='9' y2='12' />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Frase inferior */}
        <div className='sidebar-subtext'>
          <p className='model-p3'>“Un buen inventario hoy, menos problemas mañana”</p>
        </div>
      </aside>

      {/* Area principal de la aplicacion */}
      <main className='layout-main'>
        <Navbar />
        <div className='content-wrapper'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}