import '../styles/Navbar.css';
import { useAuth } from '../context/AuthContext';
import { obtenerIniciales } from '../utils/formatters';

export default function Navbar() {
  const { usuario } = useAuth();
  const nombreMostrar = usuario?.nombre || 'Usuario';
  const rolMostrar = usuario?.rol || '';

  return (
    <header className='top-header'>
      <div className='header-user-actions'>
        {/* Campana de notificaciones */}
        <button className='btn-notification' aria-label='Notificaciones'>
          <svg
            className='notification-icon'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
            <path d='M13.73 21a2 2 0 0 1-3.46 0' />
          </svg>
          <span className='notification-badge'></span>
        </button>

        {/* Perfil de Usuario */}
        <div className='user-profile'>
          <div className='avatar-circle'>
            <span>{obtenerIniciales(nombreMostrar)}</span>
          </div>
          <div className='user-info'>
            <span className='user-name'>{nombreMostrar}</span>
            <span className='user-role'>{rolMostrar}</span>
          </div>
          <svg
            className='arrow-down-icon'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <polyline points='6 9 12 15 18 9' />
          </svg>
        </div>
      </div>
    </header>
  );
}