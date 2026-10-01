import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import FilterBar, { FilterSelect } from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import { obtenerMovimientosApi } from '../../api/movimiento.api';
import '../../styles/Movimientos/Movimientos.css';

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const navigate = useNavigate();

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 10;

  useEffect(() => {
    const cargarMovimientos = async () => {
      setCargando(true);
      setError('');
      try {
        const data = await obtenerMovimientosApi();
        setMovimientos(Array.isArray(data) ? data : (data?.data || []));
      } catch (err) {
        console.error('Error al cargar movimientos:', err);
        setError('No se pudo cargar la lista de movimientos.');
      } finally {
        setCargando(false);
      }
    };

    cargarMovimientos();
  }, []);

  // Reiniciar a la primera página al filtrar
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo]);

  // Formateadores
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    const fecha = new Date(fechaStr);
    return isNaN(fecha.getTime())
      ? fechaStr
      : fecha.toLocaleDateString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(valor) || 0);
  };

  // Filtrado reactivo (por ID, proveedor, usuario o fecha)
  const movimientosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return movimientos.filter((mov) => {
      const proveedorNombre =
        mov.proveedor?.nombre || (typeof mov.proveedor === 'string' ? mov.proveedor : '');
      const usuarioNombre =
        mov.usuario?.nombre ||
        mov.usuario?.username ||
        (typeof mov.usuario === 'string' ? mov.usuario : '');
      const idTexto = String(mov.id);

      const fechaFormateada = formatearFecha(mov.fecha || mov.created_at).toLowerCase();
      const fechaIso = (mov.fecha || mov.created_at || '').toLowerCase();

      const coincideBusqueda =
        !termino ||
        idTexto.includes(termino) ||
        proveedorNombre.toLowerCase().includes(termino) ||
        usuarioNombre.toLowerCase().includes(termino) ||
        fechaFormateada.includes(termino) ||
        fechaIso.includes(termino);

      const coincideTipo =
        !filtroTipo || (mov.tipo || '').toUpperCase() === filtroTipo.toUpperCase();

      return coincideBusqueda && coincideTipo;
    });
  }, [movimientos, busqueda, filtroTipo]);

  // Exportar los datos filtrados a Excel (.csv compatible con UTF-8)
  const exportarAExcel = () => {
    if (movimientosFiltrados.length === 0) return;

    const encabezados = ['ID Mov.', 'Fecha', 'Tipo', 'Proveedor', 'Usuario', 'Motivo', 'Costo Total ($)'];

    const filas = movimientosFiltrados.map((m) => {
      const prov = m.proveedor?.nombre || (typeof m.proveedor === 'string' ? m.proveedor : '—');
      const usr = m.usuario?.nombre || m.usuario?.username || 'Sistema';
      const motivo = m.motivo || 'Sin motivo';
      const costo = Number(m.costo_total || 0);

      return [
        m.id,
        `"${formatearFecha(m.fecha || m.created_at)}"`,
        `"${m.tipo || ''}"`,
        `"${prov.replace(/"/g, '""')}"`,
        `"${usr.replace(/"/g, '""')}"`,
        `"${motivo.replace(/"/g, '""')}"`,
        costo,
      ].join(';');
    });

    const contenidoCSV = '\uFEFF' + [encabezados.join(';'), ...filas].join('\r\n');
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Movimientos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginación en memoria
  const totalItems = movimientosFiltrados.length;
  const totalPaginas = Math.ceil(totalItems / filasPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * filasPorPagina;
  const indiceFin = Math.min(indiceInicio + filasPorPagina, totalItems);

  const movimientosPaginados = useMemo(() => {
    return movimientosFiltrados.slice(indiceInicio, indiceFin);
  }, [movimientosFiltrados, indiceInicio, indiceFin]);

  const primerRegistro = totalItems === 0 ? 0 : indiceInicio + 1;
  const ultimoRegistro = indiceFin;

  // Métricas para StatCards
  const totalEntradas = movimientos.filter(
    (m) => (m.tipo || '').toUpperCase() === 'ENTRADA'
  ).length;
  const totalSalidas = movimientos.filter(
    (m) => (m.tipo || '').toUpperCase() === 'SALIDA'
  ).length;
  const totalAjustes = movimientos.filter(
    (m) => (m.tipo || '').toUpperCase() === 'AJUSTE'
  ).length;
  const totalADevolucionCliente = movimientos.filter(
    (m) => (m.tipo || '').toUpperCase() === 'DEVOLUCION CLIENTE'
  ).length;
  const totalADevolucionProveedor = movimientos.filter(
    (m) => (m.tipo || '').toUpperCase() === 'DEVOLUCION PROVEEDOR'
  ).length;

  // Columnas
  const columnas = [
    { label: 'ID' },
    { label: 'FECHA' },
    { label: 'TIPO' },
    { label: 'PROVEEDOR' },
    { label: 'USUARIO' },
    { label: 'COSTO TOTAL' },
    { label: 'ACCIONES', align: 'right' },
  ];

  // Renderizado de fila
  const renderFila = (mov) => {
    const tipoMayus = (mov.tipo || '').toUpperCase();
    let badgeClass = '';
    let label = mov.tipo;

    if (tipoMayus === 'ENTRADA') {
      badgeClass = 'badge-tipo-entrada';
      label = '↓ Entrada';
    } else if (tipoMayus === 'SALIDA') {
      badgeClass = 'badge-tipo-salida';
      label = '↑ Salida';
    } else if (tipoMayus === 'DEVOLUCION CLIENTE') {
      badgeClass = 'badge-tipo-dev-cliente';
      label = '↩ Dev. Cliente';
    } else if (tipoMayus === 'DEVOLUCION PROVEEDOR') {
      badgeClass = 'badge-tipo-dev-proveedor';
      label = '↪ Dev. Proveedor';
    } else if (tipoMayus === 'AJUSTE') {
      badgeClass = 'badge-tipo-ajuste';
      label = ' <-> AJUSTE';
    }

    return (
      <tr key={mov.id} className="movimiento-fila">
        <td className="mov-td-id">
          <span className="mov-id-badge">#{mov.id}</span>
        </td>
        <td className="mov-td-fecha">
          {formatearFecha(mov.fecha || mov.created_at)}
        </td>
        <td>
          <span className={`badge-tipo ${badgeClass}`}>{label}</span>
        </td>
        <td className="mov-td-proveedor">
          {mov.proveedor?.nombre || <span className="mov-texto-vacio">—</span>}
        </td>
        <td className="mov-td-usuario">
          <div className="mov-user-pill">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{mov.usuario?.nombre || mov.usuario?.username || 'Sistema'}</span>
          </div>
        </td>
        <td className="text-right mov-td-costo">
          {formatearPrecio(mov.costo_total)}
        </td>
        <td className="text-right mov-td-acciones">
          <button
            type="button"
            className="btn-accion-ver"
            title="Ver detalles del movimiento"
            onClick={() => navigate(`/movimientos/detalles/${mov.id}`)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icono-ojo"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="movimientos-container">
      {/* Encabezado con ambos botones de acción */}
      <PageHeader
        titulo="Movimientos"
        subtitulo="Administra y consulta los movimientos de inventario del sistema."
        icono={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m8 7-5 5 5 5" />
            <path d="M3 12h18" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H3" />
          </svg>
        }
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Botón Exportar a Excel */}
          <button
            type="button"
            className="btn-exportar-excel"
            onClick={exportarAExcel}
            disabled={cargando || movimientosFiltrados.length === 0}
            title="Exportar registros filtrados a formato Excel / CSV"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Exportar Excel</span>
          </button>

          {/* Botón Nuevo Movimiento */}
          <button
            className="btn-primary"
            type="button"
            onClick={() => navigate('/movimientos/nuevo')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="btn-icon-plus"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </PageHeader>

      {/* Tarjetas de Estadísticas */}
      <div className="movimientos-stats-grid">
        <StatCard
          titulo="Entradas"
          valor={totalEntradas}
          color="blue"
          colorsubtext="defect"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          }
        />
        <StatCard
          titulo="Salidas"
          valor={totalSalidas}
          color="red"
          colorsubtext="red"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          }
        />
        <StatCard
          titulo="Ajustes"
          valor={totalAjustes}
          color="purple"
          colorsubtext="purple"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 7-5 5 5 5" />
              <path d="M3 12h18" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H3" />
            </svg>
          }
        />
        <StatCard
          titulo="Devolución Cliente"
          valor={totalADevolucionCliente}
          color="amber"
          colorsubtext="amber"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          }
        />
        <StatCard
          titulo="Devolución Proveedor"
          valor={totalADevolucionProveedor}
          color="green"
          colorsubtext="green"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          }
        />
      </div>

      {/* Filtros */}
      <FilterBar
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        placeholder="Buscar por ID, Fecha, proveedor, usuario..."
        onLimpiar={
          busqueda || filtroTipo
            ? () => {
                setBusqueda('');
                setFiltroTipo('');
              }
            : undefined
        }
      >
        <FilterSelect
          valor={filtroTipo}
          onChange={setFiltroTipo}
          placeholder="Todos los tipos"
          opciones={[
            { value: 'ENTRADA', label: 'Entradas' },
            { value: 'SALIDA', label: 'Salidas' },
            { value: 'AJUSTE', label: 'Ajustes' },
            { value: 'DEVOLUCION CLIENTE', label: 'Devolución Cliente' },
            { value: 'DEVOLUCION PROVEEDOR', label: 'Devolución Proveedor' },
          ]}
        />
      </FilterBar>

      {/* Error */}
      {error && <div className="movimientos-alerta-error">{error}</div>}

      {/* Componente DataTable */}
      {cargando ? (
        <div className="movimientos-cargando">
          <span className="spinner-movimientos"></span>
          <p>Cargando movimientos de inventario...</p>
        </div>
      ) : (
        <DataTable
          columnas={columnas}
          datos={movimientosPaginados}
          renderFila={renderFila}
          mensajeVacio={
            busqueda || filtroTipo
              ? 'No se encontraron movimientos con los filtros aplicados.'
              : 'No hay movimientos registrados en el sistema.'
          }
          paginacionProps={{
            paginaActual,
            totalPaginas,
            primerRegistro,
            ultimoRegistro,
            totalItems,
            itemsPorPagina: filasPorPagina,
            onCambiarPagina: setPaginaActual,
            nombreEntidad: 'movimientos',
          }}
        />
      )}
    </div>
  );
}