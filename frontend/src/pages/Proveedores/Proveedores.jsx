import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProveedoresApi, desactivarProveedorApi } from '../../api/proveedor.api';
import { obtenerProveProducApi } from '../../api/proveedorProducto.api';
import '../../styles/Proveedores/Proveedores.css';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import FilterBar, { FilterSelect } from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal'
import ModalNuevoProveedor from './CrearProveedor';


export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [productosAsociados, setProductosAsociados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  //Controla la ventana de la creacion de proveedores
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);

  // Estados de Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Control de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const proveedoresPorPagina = 3;

  //Control de ventana emergente de desactivar/activar
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  //Estado en donde se consultara el detalle de cada proveedor
  const [proveedorDetalle, setProveedorDetalle] = useState(null);

  // Carga paralela de información inicial
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError('');
      try {
        const [dataProveedores, dataProdAsoc] = await Promise.all([
          obtenerProveedoresApi(),
          obtenerProveProducApi(),
        ]);
        setProveedores(dataProveedores);
        setProductosAsociados(dataProdAsoc);
      } catch (err) {
        if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError('Error al cargar el listado de proveedores y productos asociados.');
        }
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Métricas calculadas en memoria para las tarjetas
  const totalProveedores = proveedores.length;
  const proveedoresActivos = proveedores.filter((u) => u.activo).length;
  const proveedoresInactivos = totalProveedores - proveedoresActivos;
  const totalProductosAsociados = productosAsociados.length;

  const pctActivos = totalProveedores > 0 ? Math.round((proveedoresActivos / totalProveedores) * 100) : 0;
  const pctInactivos = totalProveedores > 0 ? Math.round((proveedoresInactivos / totalProveedores) * 100) : 0;

  // Filtros reactivos
  const proveedoresFiltrados = proveedores.filter((u) => {
    const termino = busqueda.toLowerCase().trim();
    const coincideTexto =
      !termino ||
      (u.nombre && u.nombre.toLowerCase().includes(termino)) ||
      (u.apellido && u.apellido.toLowerCase().includes(termino)) ||
      (u.rut && u.rut.toLowerCase().includes(termino));

    const coincideEstado =
      filtroEstado === '' ||
      (filtroEstado === 'activo' && u.activo) ||
      (filtroEstado === 'inactivo' && !u.activo);

    return coincideTexto && coincideEstado;
  });

  // Reiniciar a página 1 si cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado]);

  // Cálculos para la paginación
  const totalFiltrados = proveedoresFiltrados.length;
  const totalPaginas = Math.ceil(totalFiltrados / proveedoresPorPagina) || 1;
  const indiceInicial = (paginaActual - 1) * proveedoresPorPagina;
  const indiceFinal = indiceInicial + proveedoresPorPagina;
  const proveedoresPaginados = proveedoresFiltrados.slice(indiceInicial, indiceFinal);

  const primerRegistro = totalFiltrados === 0 ? 0 : indiceInicial + 1;
  const ultimoRegistro = Math.min(indiceFinal, totalFiltrados);

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
  };

  // Encabezados de la tabla
  const columnasProveedores = [
    'NOMBRE / RAZON SOCIAL',
    'RUT',
    'EMAIL',
    'TELÉFONO',
    'ESTADO',
    { label: 'ACCIONES', align: 'right' },
  ];

  // Manejo de activación / desactivación
  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    try {
      
      await desactivarProveedorApi(id, nuevoEstado);

      setProveedores((prev) =>
        prev.map((p) => (p.id === id ? { ...p, activo: nuevoEstado } : p))
      );
    } catch (err) {
      console.error('Error detallado al desactivar proveedor:', err.response?.data || err);
      alert(err.response?.data?.detail || 'Error al conectar con el servidor.');
    }
  };

  return (
    <div className="proveedores-contenedor">
      {/* 1. Encabezado */}
      <PageHeader
        titulo="Proveedores"
        subtitulo="Administra la información de tus proveedores de productos."
        icono={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="4" width="14" height="12" rx="2" />
            <path d="M15 8h4l3 4v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="17.5" cy="18.5" r="2.5" />
          </svg>
        }
      >
        <button className="btn-primary" onClick={() => setModalNuevoAbierto(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon-plus">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Nuevo Proveedor</span>
        </button>
      </PageHeader>

      {/* 2. Tarjetas de Métricas */}
      <div className="stats-grid">
        {/*Total proveedores */}
        <StatCard
          colorsubtext="defect"
          titulo="Total de Proveedores"
          valor={totalProveedores}
          subtexto="↗ +1 este mes"
          subtextoVerde={true}
          color="blue"
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />

        {/*Proveedores activos */}
        <StatCard
          colorsubtext="defect"
          color="green"
          titulo="Proveedores Activos"
          valor={proveedoresActivos}
          subtexto={`${pctActivos}% del total`}
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        {/*Proveedores inactivos */}
        <StatCard
          colorsubtext="defect"
          color="gray"
          titulo="Proveedores Inactivos"
          valor={proveedoresInactivos}
          subtexto={`${pctInactivos}% del total`}
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        {/*Productos asociados */}
        <StatCard
          colorsubtext="purple"
          color="purple"
          titulo="Productos Asociados"
          valor={totalProductosAsociados}
          subtexto="En total"
          icono={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 12v10" />
            </svg>
          }
        />
      </div>

      {/* 3. Barra de búsqueda y filtros */}
      <FilterBar
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        placeholder="Buscar por nombre o rut..."
        onLimpiar={handleLimpiarFiltros}
      >
        <FilterSelect
          valor={filtroEstado}
          onChange={setFiltroEstado}
          placeholder="Filtrar por estado"
          opciones={[
            { value: 'activo', label: 'Activo' },
            { value: 'inactivo', label: 'Inactivo' },
          ]}
          icono={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          }
        />
      </FilterBar>

      {/* Mensaje de error si la API falla */}
      {error && <div className="proveedores-alerta-error">{error}</div>}

      {/* 4. Tabla de Datos y Paginación */}
      {cargando ? (
        <div className="proveedores-mensaje-estado">Cargando proveedores...</div>
      ) : (
        <DataTable
          columnas={columnasProveedores}
          datos={proveedoresPaginados}
          mensajeVacio="No se encontraron proveedores que coincidan con la búsqueda."
          paginacionProps={{
            paginaActual,
            totalPaginas,
            primerRegistro,
            ultimoRegistro,
            totalFiltrados,
            onCambioPagina: setPaginaActual,
            nombreEntidad: 'proveedores',
          }}
          renderFila={(prov) => (
            <tr key={prov.id}>
              <td className="col-name" style={{ fontWeight: 600 }}>
                {prov.nombre} {prov.apellido || ''}
              </td>
              <td className="col-rut">{prov.rut || '—'}</td>
              <td>{prov.email || '—'}</td>
              <td>{prov.telefono || '—'}</td>
              <td>
                <div className={`badge-status-pill ${prov.activo ? 'active' : 'inactive'}`}>
                  <span className="badge-status-dot"></span>
                  <span>{prov.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
              </td>
              <td className="text-right">
                <div className="actions-cell">
                  <button
                    type="button"
                    className={`btn-action-toggle ${prov.activo ? 'deactivate' : 'activate'}`}
                    onClick={() => setProveedorSeleccionado(prov)}
                    title={prov.activo ? 'Desactivar proveedor' : 'Activar proveedor'}
                  >
                    {prov.activo ? (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        <span>Desactivar</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        <span>Activar</span>
                      </>
                    )}
                  </button>
                  {/* Botón Ver Detalles (Ojo) */}
                  <button
                    type="button"
                    className="btn-action-view"
                    title="Ver detalle del proveedor"
                    onClick={() => navigate(`/proveedores/detalles/${prov.id}`)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}
      {/* Modal flotante de confirmación */}
      <ConfirmModal
        isOpen={proveedorSeleccionado !== null}
        title={`¿Estás seguro de ${proveedorSeleccionado?.activo ? 'desactivar' : 'activar'} a este proveedor?`}
        description={`El proveedor "${proveedorSeleccionado?.nombre}" ${proveedorSeleccionado?.activo
          ? 'quedará marcado como inactivo en el sistema.'
          : 'volverá a estar activo para nuevas operaciones.'
          }`}
        confirmText={proveedorSeleccionado?.activo ? 'Sí, desactivar' : 'Sí, activar'}
        cancelText="Cancelar"
        variant={proveedorSeleccionado?.activo ? 'danger' : 'primary'}
        onConfirm={() => {
          if (proveedorSeleccionado) {
            handleToggleEstado(proveedorSeleccionado.id, proveedorSeleccionado.activo);
          }
          setProveedorSeleccionado(null);
        }}
        onCancel={() => setProveedorSeleccionado(null)}
      />

      {/* Modal flotante de creacion */}
      <ModalNuevoProveedor
        isOpen={modalNuevoAbierto}
        onClose={() => setModalNuevoAbierto(false)}
        onProveedorCreado={(nuevoProveedor) => {
          setProveedores((prev) => [nuevoProveedor, ...prev]);
        }}
      />
    </div>
  );
}