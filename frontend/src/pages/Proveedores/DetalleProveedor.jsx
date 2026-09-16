import { useState, useEffect } from 'react';
import { obtenerProductosPorProveedorApi } from '../../api/proveedorProducto.api';
import '../../styles/Proveedores/DetalleProveedor.css';

export default function ModalDetalleProveedor({ isOpen, onClose, proveedor }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && proveedor?.id) {
      const cargarProductos = async () => {
        setCargando(true);
        setError('');
        try {
          const data = await obtenerProductosPorProveedorApi(proveedor.id);
          setProductos(Array.isArray(data) ? data : []);
        } catch (err) {
          setError('No se pudieron obtener los productos de este proveedor.');
        } finally {
          setCargando(false);
        }
      };

      cargarProductos();
    }
  }, [isOpen, proveedor]);

  if (!isOpen || !proveedor) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-detalle-container">
        {/* Encabezado con ícono del Ojo */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="modal-title-group">
              <h3>Ficha del Proveedor</h3>
              <p>Datos generales y productos asociados registrados.</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-detalle-body">
          {/* Tarjeta de datos generales */}
          <div className="detalle-info-grid">
            <div className="info-item">
              <span className="info-label">RUT</span>
              <span className="info-value">{proveedor.rut || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nombre / Razón Social</span>
              <span className="info-value font-bold">{proveedor.nombre}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Correo Electrónico</span>
              <span className="info-value">{proveedor.email || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Teléfono</span>
              <span className="info-value">{proveedor.telefono || '—'}</span>
            </div>
            <div className="info-item full-col">
              <span className="info-label">Dirección</span>
              <span className="info-value">{proveedor.direccion || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado</span>
              <span className={`badge-status-pill ${proveedor.activo ? 'active' : 'inactive'}`} style={{ width: 'fit-content' }}>
                <span className="badge-status-dot"></span>
                <span>{proveedor.activo ? 'Activo' : 'Inactivo'}</span>
              </span>
            </div>
          </div>

          <div className="detalle-divider" />

          {/* Listado de Productos Suministrados */}
          <div className="detalle-productos-header">
            <h4>Productos Suministrados ({productos.length})</h4>
          </div>

          {error && <div className="modal-alert-error">{error}</div>}

          {cargando ? (
            <div className="modal-loading-text">Cargando productos asociados...</div>
          ) : productos.length === 0 ? (
            <div className="modal-empty-text">
              Este proveedor no tiene productos vinculados en el catálogo.
            </div>
          ) : (
            <div className="modal-tabla-wrapper">
              <table className="modal-tabla">
                <thead>
                  <tr>
                    <th>PRODUCTO</th>
                    <th>PRECIO COMPRA</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((item) => (
                    <tr key={item.id || item.prov_produ_id}>
                      <td className="font-medium">
                        {item.producto?.nombre || item.producto_nombre || `Producto #${item.producto_id}`}
                      </td>
                      <td>
                        ${Number(item.precio_compra || item.precio || 0).toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}