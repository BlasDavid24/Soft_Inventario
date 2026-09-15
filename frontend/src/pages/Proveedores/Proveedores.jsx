import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProveedoresApi } from '../../api/proveedor.api';
import '../../styles/Proveedores/Proveedores.css';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cargarProveedores = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerProveedoresApi();
      setProveedores(data);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al cargar el listado de proveedores.');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  return (
    <div className="proveedores-contenedor">
      <div className="proveedores-header">
        <div>
          <h2 className="proveedores-titulo">Proveedores</h2>
          <p className="proveedores-subtitulo">
            Directorio de proveedores registrados en el sistema
          </p>
        </div>

        <button
          className="btn-nuevo-proveedor"
          onClick={() => navigate('/proveedores/nuevo')}
        >
          + Nuevo Proveedor
        </button>
      </div>

      {error && (
        <div className="proveedores-alerta-error">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="proveedores-mensaje-estado">
          Cargando proveedores...
        </div>
      ) : proveedores.length === 0 ? (
        <div className="proveedores-vacio">
          No hay proveedores registrados aún.
        </div>
      ) : (
        <div className="proveedores-tabla-wrapper">
          <table className="proveedores-tabla">
            <thead>
              <tr>
                <th className="proveedores-th">RUT</th>
                <th className="proveedores-th">Nombre</th>
                <th className="proveedores-th">Email</th>
                <th className="proveedores-th">Teléfono</th>
                <th className="proveedores-th">Dirección</th>
                <th className="proveedores-th">Estado</th>
                <th className="proveedores-th proveedores-th-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((prov) => (
                <tr key={prov.id} className="proveedores-fila">
                  <td className="proveedores-td proveedores-td-rut">
                    {prov.rut || '—'}
                  </td>
                  <td className="proveedores-td proveedores-td-nombre">
                    {prov.nombre}
                  </td>
                  <td className="proveedores-td">
                    {prov.email || '—'}
                  </td>
                  <td className="proveedores-td">
                    {prov.telefono || '—'}
                  </td>
                  <td className="proveedores-td">
                    {prov.direccion || '—'}
                  </td>
                  <td className="proveedores-td">
                    <span className={`badge-estado ${prov.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                      {prov.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="proveedores-td proveedores-td-acciones">
                    <button
                      className="btn-editar-proveedor"
                      onClick={() => navigate(`/proveedores/actualizar/${prov.id}`)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}