import { useState, useEffect, useMemo } from 'react';
import { obtenerCatalogoProductosApi } from '../../api/producto.api';
import { obtenerCategoriaApi } from '../../api/categoria.api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import '../../styles/Reportes/InventarioValorizado.css';

export default function InventarioValorizado() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS' | 'BAJO' | 'OPTIMO'

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          obtenerCatalogoProductosApi().catch(() => []),
          obtenerCategoriaApi().catch(() => []),
        ]);

        const listaProd = Array.isArray(resProd) ? resProd : (resProd?.data || []);
        const listaCat = Array.isArray(resCat) ? resCat : (resCat?.data || []);

        setProductos(listaProd);
        setCategorias(listaCat);
      } catch (err) {
        console.error('Error al cargar datos del reporte:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Formateadores
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(valor) || 0);
  };

  // Filtrado reactivo de productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchTexto =
        (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(busqueda.toLowerCase()));

      const matchCategoria =
        !categoriaSeleccionada ||
        String(p.categoria_id || p.categoria?.id) === String(categoriaSeleccionada);

      const stockActual = Number(p.stock_actual ?? p.stock ?? 0);
      const stockMinimo = Number(p.stock_minimo ?? 5);

      let matchEstado = true;
      if (filtroEstado === 'BAJO') matchEstado = stockActual <= stockMinimo;
      if (filtroEstado === 'OPTIMO') matchEstado = stockActual > stockMinimo;

      return matchTexto && matchCategoria && matchEstado;
    });
  }, [productos, busqueda, categoriaSeleccionada, filtroEstado]);

  // Totales calculados en base a lo filtrado
  const totales = useMemo(() => {
    return productosFiltrados.reduce(
      (acc, p) => {
        const cant = Number(p.stock_actual ?? p.stock ?? 0);
        const costo = Number(p.precio ?? p.precio_costo ?? p.costo ?? 0);
        acc.unidades += cant;
        acc.valorTotal += cant * costo;
        return acc;
      },
      { unidades: 0, valorTotal: 0 }
    );
  }, [productosFiltrados]);

  // Exportar reporte a formato CSV (Compatible con Microsoft Excel)
  const exportarAExcel = () => {
    if (productosFiltrados.length === 0) return;

    const encabezados = ['ID', 'Producto', 'SKU', 'Categoría', 'Unidad', 'Stock Actual', 'Stock Mínimo', 'Costo Unitario ($)', 'Valor Total ($)'];

    const filas = productosFiltrados.map((p) => {
      const stock = Number(p.stock_actual ?? p.stock ?? 0);
      const costo = Number(p.precio ?? p.precio_costo ?? p.costo ?? 0);
      const cat = p.categoria?.nombre || 'General';

      return [
        p.id,
        `"${p.nombre?.replace(/"/g, '""') || ''}"`,
        `"${p.sku || ''}"`,
        `"${cat}"`,
        p.uni_medida || 'UNIDAD',
        stock,
        p.stock_minimo ?? 5,
        costo,
        stock * costo,
      ].join(';');
    });

    const contenidoCSV = '\uFEFF' + [encabezados.join(';'), ...filas].join('\r\n');
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inventario_Valorizado_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reporte-page">
      <div className="reporte-header-container">
        <PageHeader
          titulo="Inventario Valorizado"
          subtitulo="Auditoría del capital en bodega, costos unitarios y valoración del stock actual."
        />

        <div className="reporte-top-actions">
          <button
            type="button"
            className="btn-exportar-excel"
            onClick={exportarAExcel}
            disabled={productosFiltrados.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Exportar a Excel (.csv)</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Rápido de la Valorización */}
      <div className="reporte-kpi-grid">
        <StatCard
          colorsubtext="defect"
          titulo="Capital Total en Stock"
          valor={cargando ? '...' : formatearPrecio(totales.valorTotal)}
          subtexto={"Valorizado en costo directo"}
          color="green"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />

        <StatCard
          colorsubtext="defect"
          titulo="Unidades Totales"
          valor={cargando ? '...' : totales.unidades}
          subtexto={productosFiltrados.length + " productos coincidentes"}
          color="blue"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
        />

        <StatCard
          colorsubtext="defect"
          titulo="Costo Promedio por Ítem"
          valor={cargando || totales.unidades === 0
            ? '—'
            : formatearPrecio(totales.valorTotal / totales.unidades)}
          subtexto={"Promedio general de compra"}
          color="purple"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
        />
      </div>

      {/* Barra de Filtros */}
      <div className="card-seccion reporte-filtros-bar">
        <div className="filtros-grid">
          {/* Buscador de Producto */}
          <div className="filtro-campo flex-2">
            <label className="form-label">Buscar Producto o SKU</label>
            <div className="input-con-icono">
              <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar por nombre o SKU..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por Categoría */}
          <div className="filtro-campo">
            <label className="form-label">Categoría</label>
            <select
              className="form-control"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado de Stock */}
          <div className="filtro-campo">
            <label className="form-label">Condición de Stock</label>
            <select
              className="form-control"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="OPTIMO">Stock Saludable</option>
              <option value="BAJO">Bajo o Crítico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla del Inventario Valorizado */}
      <div className="card-seccion tabla-reporte-card">
        <div className="tabla-mov-wrapper">
          <table className="tabla-mov">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>PRODUCTO</th>
                <th style={{ textAlign: 'center' }}>SKU</th>
                <th style={{ textAlign: 'center' }}>CATEGORÍA</th>
                <th style={{ textAlign: 'center' }}>TIPO</th>
                <th style={{ textAlign: 'center' }}>STOCK</th>
                <th style={{ textAlign: 'center' }}>COSTO UNITARIO</th>
                <th style={{ textAlign: 'right' }}>VALOR TOTAL</th>
                <th style={{ textAlign: 'center' }}>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="9" className="tabla-vacia-msg">Cargando inventario valorizado...</td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="9" className="tabla-vacia-msg">No se encontraron productos con los filtros seleccionados.</td>
                </tr>
              ) : (
                productosFiltrados.map((p, index) => {
                  const stock = Number(p.stock_actual ?? p.stock ?? 0);
                  const costo = Number(p.precio ?? p.precio_costo ?? p.costo ?? 0);
                  const totalFila = stock * costo;
                  const stockMin = Number(p.stock_minimo ?? 5);
                  const esCritico = stock <= stockMin;

                  return (
                    <tr key={p.id || index}>
                      <td className="td-muted">{index + 1}</td>
                      <td>
                        <span className="prod-fila-nombre">{p.nombre}</span>
                      </td>
                      <td className="td-sku" style={{ textAlign: 'center' }}>{p.sku || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="categoria-tag">{p.categoria?.nombre || 'General'}</span>
                      </td>
                      <td className="td-muted" style={{ textAlign: 'center' }}>
                        {p.uni_medida || 'UNIDAD'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700' }}>
                        {stock}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {formatearPrecio(costo)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                        {formatearPrecio(totalFila)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={esCritico ? 'badge-estado-bajo' : 'badge-estado-optimo'}>
                          {esCritico ? 'Bajo Stock' : 'Saludable'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Pie de tabla con totales consolidados */}
            {productosFiltrados.length > 0 && (
              <tfoot>
                <tr className="fila-total-consolidado">
                  <td colSpan="5" style={{ textAlign: 'right', fontWeight: '800' }}>
                    TOTALES CONSOLIDADOS:
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '800' }}>
                    {totales.unidades}
                  </td>
                  <td></td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#16a34a', fontSize: '0.95rem' }}>
                    {formatearPrecio(totales.valorTotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}