import { useState, useEffect, useMemo } from 'react'; // <-- Se agrega useMemo
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerProveedoresApi } from '../../api/proveedor.api';
import { obtenerProductosPorProveedorApi } from '../../api/proveedorProducto.api';
import PageHeader from '../../components/PageHeader';
import FilterBar from '../../components/FilterBar';
import '../../styles/Proveedores/DetalleProveedor.css';

export default function DetalleProveedor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proveedor, setProveedor] = useState(null);
  const [productosAsociados, setProductosAsociados] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDetalleCompleto = async () => {
      setCargando(true);
      setError('');
      try {
        const [listaProveedores, dataProductos] = await Promise.all([
          obtenerProveedoresApi(),
          obtenerProductosPorProveedorApi(id),
        ]);

        const provEncontrado = listaProveedores.find((p) => String(p.id) === String(id));

        if (!provEncontrado) {
          setError('El proveedor solicitado no existe o no fue encontrado.');
        } else {
          setProveedor(provEncontrado);
          setProductosAsociados(Array.isArray(dataProductos) ? dataProductos : []);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Ocurrió un error al obtener la información del proveedor.');
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      cargarDetalleCompleto();
    }
  }, [id]);

  // Filtrado reactivo por nombre o código/sku
  const productosFiltrados = useMemo(() => {
    const termino = busquedaProducto.toLowerCase().trim();
    if (!termino) return productosAsociados;

    return productosAsociados.filter((item) => {
      const nombre = (item.producto?.nombre || item.producto_nombre || '').toLowerCase();
      const sku = (item.producto?.sku || item.codigo || '').toLowerCase();
      return nombre.includes(termino) || sku.includes(termino);
    });
  }, [productosAsociados, busquedaProducto]);

  if (cargando) {
    return (
      <div className="detalle-page-container">
        <div className="detalle-page-loading">Cargando información del proveedor...</div>
      </div>
    );
  }

  if (error || !proveedor) {
    return (
      <div className="detalle-page-container">
        <div className="modal-alert-error">{error || 'Proveedor no encontrado.'}</div>
        <button type="button" className="btn-secondary" onClick={() => navigate('/proveedores')}>
          Volver a Proveedores
        </button>
      </div>
    );
  }

  return (
    <div className="detalle-page-container">
      {/* 1. Header */}
      <PageHeader
        rutaVolver={() => navigate('/proveedores')}
        titulo="Detalle del Proveedor"
        subtitulo="Gestión de ficha técnica y suministros"
      >
        <div className="header-actions-group">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(`/proveedores/actualizar/${proveedor.id}`)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Editar Proveedor</span>
          </button>
        </div>
      </PageHeader>

      {/* 2. Cuadrícula de 2 Columnas */}
      <div className="detalle-layout-grid">
        {/* Columna Izquierda: Información del Proveedor */}
        <div className="detalle-card-panel">
          <div className="panel-card-header">
            <div className="header-title-flex">
              <div className="panel-icon-circle blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="14" height="12" rx="2" />
                  <path d="M15 8h4l3 4v4h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="17.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <h3>Información General</h3>
                <p>Datos de contacto y registro de la empresa</p>
              </div>
            </div>
          </div>

          <div className="panel-table-wrapper">
            <table className="tabla-vertical-info">
              <tbody>
                <tr>
                  <th>RUT / Identificador</th>
                  <td>{proveedor.rut || '—'}</td>
                </tr>
                <tr>
                  <th>Nombre / Razón Social</th>
                  <td className="font-bold">{proveedor.nombre} {proveedor.apellido || ''}</td>
                </tr>
                <tr>
                  <th>Correo Electrónico</th>
                  <td>
                    {proveedor.email ? (
                      <a href={`mailto:${proveedor.email}`} className="link-text">
                        {proveedor.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Teléfono</th>
                  <td>{proveedor.telefono || '—'}</td>
                </tr>
                <tr>
                  <th>Dirección Comercial</th>
                  <td>{proveedor.direccion || '—'}</td>
                </tr>
                <tr>
                  <th>Estado en Sistema</th>
                  <td>
                    <div className={`badge-status-pill ${proveedor.activo ? 'active' : 'inactive'}`}>
                      <span className="badge-status-dot"></span>
                      <span>{proveedor.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha: Productos Suministrados */}
        <div className="detalle-card-panel">
          <div className="panel-card-header">
            <div className="header-title-flex">
              <div className="panel-icon-circle purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 12v10" />
                </svg>
              </div>
              <div>
                <h3>Productos Suministrados</h3>
                <p>
                  {busquedaProducto
                    ? `${productosFiltrados.length} de ${productosAsociados.length} productos`
                    : `${productosAsociados.length} producto${productosAsociados.length === 1 ? '' : 's'} vinculado${productosAsociados.length === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
          </div>

          <div className="panel-content-body">
            <div style={{ marginBottom: '16px' }}>
              <FilterBar
                busqueda={busquedaProducto}
                onBusquedaChange={setBusquedaProducto}
                placeholder="Buscar producto por nombre o SKU..."
                onLimpiar={() => setBusquedaProducto('')}
              />
            </div>

            {productosAsociados.length === 0 ? (
              <div className="panel-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <p>Este proveedor aún no cuenta con productos asociados en el catálogo.</p>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="panel-empty-state">
                <p>No se encontraron productos que coincidan con "{busquedaProducto}".</p>
              </div>
            ) : (
              <div className="panel-table-wrapper">
                <table className="tabla-horizontal-data">
                  <thead>
                    <tr>
                      <th>PRODUCTO</th>
                      <th>CÓDIGO</th>
                      <th className="text-right">COSTO COMPRA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map((item) => (
                      <tr key={item.id || item.prov_produ_id}>
                        <td className="font-bold">
                          {item.producto?.nombre || item.producto_nombre || `Producto #${item.producto_id}`}
                        </td>
                        <td className="col-sku">
                          {item.producto?.sku || item.producto?.codigo || item.codigo || '—'}
                        </td>
                        <td className="text-right col-precio">
                          ${Number(item.costo_compra || item.precio || 0).toLocaleString('es-CL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}