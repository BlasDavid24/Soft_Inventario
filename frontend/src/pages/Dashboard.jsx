import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCatalogoProductosApi } from '../api/producto.api';
import { obtenerMovimientosApi } from '../api/movimiento.api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProd, resMov] = await Promise.all([
          obtenerCatalogoProductosApi().catch(() => []),
          obtenerMovimientosApi ? obtenerMovimientosApi().catch(() => []) : Promise.resolve([]),
        ]);

        const listaProd = Array.isArray(resProd) ? resProd : (resProd?.data || []);
        const listaMov = Array.isArray(resMov) ? resMov : (resMov?.data || []);

        setProductos(listaProd);
        setMovimientos(listaMov);
      } catch (err) {
        console.error('Error al cargar datos del Dashboard:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Cálculos de métricas (KPIs)
  const totalProductos = productos.length;

  const totalUnidadesStock = useMemo(() => {
    return productos.reduce((acc, p) => acc + Number(p.stock_actual ?? p.stock ?? 0), 0);
  }, [productos]);

  const valorizacionTotal = useMemo(() => {
    return productos.reduce((acc, p) => {
      const stock = Number(p.stock_actual ?? p.stock ?? 0);
      const precio = Number(p.precio ?? p.precio_costo ?? p.costo ?? 0);
      return acc + (stock * precio);
    }, 0);
  }, [productos]);

  // Alertas de Stock Bajo o Crítico
  const productosBajoStock = useMemo(() => {
    return productos
      .filter((p) => {
        const stockActual = Number(p.stock_actual ?? p.stock ?? 0);
        const stockMinimo = Number(p.stock_minimo ?? 5);
        return stockActual <= stockMinimo;
      })
      .slice(0, 5); // Mostramos los primeros 5 prioritarios
  }, [productos]);

  // Últimos 6 movimientos registrados
  const ultimosMovimientos = useMemo(() => {
    return [...movimientos].slice(0, 6);
  }, [movimientos]);

  const formatearMoneda = (val) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    try {
      const f = new Date(fechaStr);
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(f.getDate())}-${pad(f.getMonth() + 1)}-${f.getFullYear()} ${pad(f.getHours())}:${pad(f.getMinutes())}`;
    } catch {
      return fechaStr;
    }
  };

  const getTipoBadgeClass = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return 'tipo-pill-entrada';
      case 'SALIDA': return 'tipo-pill-salida';
      case 'DEVOLUCION CLIENTE': return 'tipo-pill-dev-cliente';
      case 'DEVOLUCION PROVEEDOR': return 'tipo-pill-dev-proveedor';
      case 'AJUSTE': return 'tipo-pill-ajuste';
      default: return '';
    }
  };

  return (
    <div className="dashboard-page">
      {/* Encabezado y Barra de Acciones */}
      <div className="dashboard-header-container">
        <PageHeader
          titulo="Panel Principal"
          subtitulo="Resumen general del estado de inventario, stock y actividad reciente."
        />

        <div className="dashboard-top-actions">
          <button
            type="button"
            className="btn-dash-primary"
            onClick={() => navigate('/movimientos/nuevo')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nuevo Movimiento</span>
          </button>

          <button
            type="button"
            className="btn-dash-outline"
            onClick={() => navigate('/productos')}
          >
            Lista de Productos
          </button>
        </div>
      </div>

      {/* 1. Tarjetas de Métricas (KPI Cards) */}
      <div className="dashboard-kpi-grid">
        {/* Total Productos */}
        <StatCard
          colorsubtext="defect"
          titulo="Productos Catálogo"
          valor={cargando ? '...' : totalProductos}
          subtexto={totalUnidadesStock + ' unidades físicas totales'}
          color="blue"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 12v10" />
            </svg>
          }
        />

        {/* Valorización Total */}
        <StatCard
          colorsubtext="defect"
          titulo="Valorización del Stock"
          valor={cargando ? '...' : formatearMoneda(valorizacionTotal)}
          subtexto={"Total inventario"}
          color="green"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />

        {/* Alertas Críticas */}
        <StatCard
          colorsubtext="defect"
          titulo="Stock Bajo o Crítico"
          valor={cargando ? '...' : productosBajoStock.length}
          subtexto={"Requieren reposición"}
          color="red"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />

        {/* Movimientos Totales */}
        <StatCard
          colorsubtext="defect"
          titulo="Movimientos Registrados"
          valor={cargando ? '...' : movimientos.length}
          subtexto={"Histórico de flujo total"}
          color="purple"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 4l-4 4 4 4" />
              <path d="M4 8h16" />
              <path d="M16 20l4-4-4-4" />
              <path d="M20 16H4" />
            </svg>
          }
        />
      </div>

      {/* 2. Sección Principal: Tablas de Operación */}
      <div className="dashboard-content-grid">
        {/* Bloque Izquierdo: Alertas de Stock */}
        <div className="card-seccion dash-card">
          <div className="card-seccion-header dash-card-header">
            <div className="header-icon-box red-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="card-seccion-titulo">Alertas de Stock</h2>
              <p className="card-seccion-sub">Productos con existencias al límite del mínimo establecido.</p>
            </div>
          </div>

          <div className="tabla-mov-wrapper">
            <table className="tabla-mov">
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th style={{ textAlign: 'center' }}>SKU</th>
                  <th style={{ textAlign: 'center' }}>ACTUAL</th>
                  <th style={{ textAlign: 'center' }}>MÍNIMO</th>
                  <th style={{ textAlign: 'center' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {productosBajoStock.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="tabla-vacia-msg">
                      No hay productos en estado crítico actualmente.
                    </td>
                  </tr>
                ) : (
                  productosBajoStock.map((prod) => {
                    const actual = Number(prod.stock_actual ?? prod.stock ?? 0);
                    const esAgotado = actual <= 0;

                    return (
                      <tr key={prod.id}>
                        <td>
                          <span className="prod-fila-nombre">{prod.nombre}</span>
                        </td>
                        <td className="td-sku" style={{ textAlign: 'center' }}>{prod.sku || '—'}</td>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: esAgotado ? '#dc2626' : '#ea580c' }}>
                          {actual}
                        </td>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>
                          {prod.stock_minimo ?? 5}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={esAgotado ? 'badge-estado-agotado' : 'badge-estado-bajo'}>
                            {esAgotado ? 'Agotado' : 'Bajo Stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloque Derecho: Actividad Reciente */}
        <div className="card-seccion dash-card">
          <div className="card-seccion-header dash-card-header">
            <div className="header-icon-box blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h2 className="card-seccion-titulo">Actividad Reciente</h2>
              <p className="card-seccion-sub">Últimos movimientos de entrada y salida registrados.</p>
            </div>
          </div>

          <div className="dash-lista-movimientos">
            {ultimosMovimientos.length === 0 ? (
              <p className="tabla-vacia-msg">No hay registros de movimientos recientes.</p>
            ) : (
              ultimosMovimientos.map((mov) => (
                <div key={mov.id} className="dash-mov-item">
                  <div className="dash-mov-info-left">
                    <span className={`custom-select-opcion ${getTipoBadgeClass(mov.tipo)} dash-badge-mini`}>
                      {mov.tipo}
                    </span>
                    <div className="dash-mov-textos">
                      <span className="dash-mov-motivo">{mov.motivo || 'Movimiento general'}</span>
                      <span className="dash-mov-fecha">{formatearFecha(mov.fecha || mov.created_at)}</span>
                    </div>
                  </div>
                  <div className="dash-mov-detalles-right">
                    <span className="dash-mov-cant">
                      {mov.detalles ? `${mov.detalles.length} productos` : `#${mov.id}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}