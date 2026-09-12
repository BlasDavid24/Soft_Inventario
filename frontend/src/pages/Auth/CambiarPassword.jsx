import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cambiarPasswordInicialApi } from '../../api/usuario.api';

export default function CambiarPassword() {
  const navigate = useNavigate();
  const { usuario, completarPrimerLogin, logout } = useAuth();

  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones en cliente
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (nuevaPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (passwordActual === nuevaPassword) {
      setError('La nueva contraseña no puede ser idéntica a la clave temporal.');
      return;
    }

    setCargando(true);

    try {
      await cambiarPasswordInicialApi({
        password_actual: passwordActual,
        nueva_password: nuevaPassword,
      });

      // Actualiza en AuthContext y localStorage para que primer_login sea false
      completarPrimerLogin();

      // Entra al panel principal
      navigate('/');
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al conectar con el servidor para actualizar la contraseña.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5' }}>
      <form onSubmit={handleSubmit} style={{ width: '340px', padding: '24px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Actualizar Contraseña</h2>
        <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', marginBottom: '16px' }}>
          Hola <strong>{usuario?.nombre || usuario?.username}</strong>. Por seguridad debes cambiar tu contraseña temporal antes de continuar.
        </p>

        {error && (
          <div style={{ backgroundColor: '#ffe6e6', color: '#d32f2f', padding: '10px', borderRadius: '4px', marginBottom: '14px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Contraseña Temporal</label>
          <input
            type="password"
            required
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Nueva Contraseña (mínimo 8 caracteres)</label>
          <input
            type="password"
            required
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Confirmar Nueva Contraseña</label>
          <input
            type="password"
            required
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {cargando ? 'Guardando...' : 'Establecer Contraseña'}
        </button>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '12px' }}
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}