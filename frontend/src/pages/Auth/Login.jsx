import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const data = await login(username, password);

      // Si es el primer inicio de sesión, redirige a cambiar la clave temporal
      if (data?.primer_login) {
        navigate('/cambiar-password');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al conectar con el servidor. Verifica que FastAPI esté corriendo.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ width: '320px', padding: '24px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sistema de Inventario</h2>
        
        {error && (
          <div style={{ backgroundColor: '#ffe6e6', color: '#d32f2f', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Usuario</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}