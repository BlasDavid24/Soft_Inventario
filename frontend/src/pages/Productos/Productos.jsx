import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    obtenerCatalogoProductosApi,
    cambiarEstadoProductoApi
} from '../../api/producto.api';
import { obtenerCategoriaApi } from '../../api/categoria.api';
import ModalNuevoProducto from './CrearProducto';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import FilterBar, { FilterSelect } from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import ModalListaCategorias from '../Categorias/Categorias';
import '../../styles/Productos/Productos.css';

export default function Productos() {
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Control de ventanas emergentes (Modales)
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false);

    // Estados de Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');

    // Control de paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const productosPorPagina = 8;

    // Carga inicial paralela
    const cargarDatos = async () => {
        setCargando(true);
        setError('');
        try {
            const [listaProductos, listaCategorias] = await Promise.all([
                obtenerCatalogoProductosApi(),
                obtenerCategoriaApi(),
            ]);
            setProductos(Array.isArray(listaProductos) ? listaProductos : []);
            setCategorias(Array.isArray(listaCategorias) ? listaCategorias : []);
        } catch (err) {
            console.error('Error al cargar datos de productos:', err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Error al cargar el listado de productos y categorías.');
            }
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Métricas calculadas para las tarjetas
    const totalProductos = productos.length;
    const productosActivos = productos.filter((p) => p.activo).length;
    const productosCriticos = productos.filter(
        (p) => Number(p.stock_actual) <= Number(p.stock_minimo)
    ).length;
    const totalCategorias = categorias.length;

    const pctActivos = totalProductos > 0 ? Math.round((productosActivos / totalProductos) * 100) : 0;

    // Filtros reactivos
    const productosFiltrados = productos.filter((p) => {
        const termino = busqueda.toLowerCase().trim();
        const coincideTexto =
            !termino ||
            (p.nombre && p.nombre.toLowerCase().includes(termino)) ||
            (p.sku && p.sku.toLowerCase().includes(termino));

        const coincideEstado =
            filtroEstado === '' ||
            (filtroEstado === 'activo' && p.activo) ||
            (filtroEstado === 'inactivo' && !p.activo);

        const coincideCategoria =
            filtroCategoria === '' ||
            (p.categoria && String(p.categoria.id) === String(filtroCategoria));

        return coincideTexto && coincideEstado && coincideCategoria;
    });

    // Reiniciar a página 1 si cambian los filtros
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtroEstado, filtroCategoria]);

    // Cálculos para la paginación
    const totalFiltrados = productosFiltrados.length;
    const totalPaginas = Math.ceil(totalFiltrados / productosPorPagina) || 1;
    const indiceInicial = (paginaActual - 1) * productosPorPagina;
    const indiceFinal = indiceInicial + productosPorPagina;
    const productosPaginados = productosFiltrados.slice(indiceInicial, indiceFinal);

    const primerRegistro = totalFiltrados === 0 ? 0 : indiceInicial + 1;
    const ultimoRegistro = Math.min(indiceFinal, totalFiltrados);

    // Limpiar filtros
    const handleLimpiarFiltros = () => {
        setBusqueda('');
        setFiltroEstado('');
        setFiltroCategoria('');
    };

    // Encabezados de la tabla
    const columnasProductos = [
        'PRODUCTO',
        'CATEGORÍA',
        'SKU',
        { label: 'STOCK ACTUAL', align: 'right' },
        'ESTADO',
        { label: 'ACCIONES', align: 'right' },
    ];

    // Manejo de activación / desactivación
    const handleToggleEstado = async (id, estadoActual) => {
        const nuevoEstado = !estadoActual;
        try {
            if (typeof cambiarEstadoProductoApi === 'function') {
                await cambiarEstadoProductoApi(id, nuevoEstado);
            }
            setProductos((prev) =>
                prev.map((p) => (p.id === id ? { ...p, activo: nuevoEstado } : p))
            );
        } catch (err) {
            console.error('Error al cambiar estado del producto:', err);
            alert(err.response?.data?.detail || 'Error al conectar con el servidor.');
        }
    };

    const handleCategoriaActualizada = (categoriaActualizada) => {
        setCategorias((prev) =>
            prev.map((cat) => (cat.id === categoriaActualizada.id ? categoriaActualizada : cat))
        );

        setProductos((prev) =>
            prev.map((prod) => {
                const prodCatId = prod.categoria?.id || prod.categoria_id;
                if (prodCatId === categoriaActualizada.id) {
                    return {
                        ...prod,
                        categoria: {
                            ...prod.categoria,
                            id: categoriaActualizada.id,
                            nombre: categoriaActualizada.nombre,
                        },
                    };
                }
                return prod;
            })
        );
    };

    return (
        <div className="productos-page-container">
            {/* 1. Encabezado */}
            <PageHeader
                titulo="Productos"
                subtitulo="Administra el catálogo de productos, inventario y categorías del sistema."
                icono={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 12v10" />
                    </svg>
                }
            >
                <button className="btn-primary" onClick={() => setModalNuevoAbierto(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-icon-plus">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Nuevo Producto</span>
                </button>
            </PageHeader>

            {/* 2. Tarjetas de Métricas */}
            <div className="stats-grid">
                <StatCard
                    colorsubtext="defect"
                    titulo="Total Productos"
                    valor={totalProductos}
                    subtexto="En catálogo"
                    color="blue"
                    icono={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 12v10" />
                        </svg>
                    }
                />

                <StatCard
                    colorsubtext="defect"
                    color="green"
                    titulo="Productos Activos"
                    valor={productosActivos}
                    subtexto={`${pctActivos}% del total`}
                    icono={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    }
                />

                <StatCard
                    colorsubtext="red"
                    color="red"
                    titulo="Stock Crítico"
                    valor={productosCriticos}
                    subtexto="Bajo stock mínimo"
                    icono={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    }
                />

                <StatCard
                    colorsubtext="purple"
                    color="purple"
                    onClick={() => setModalCategoriasAbierto(true)}
                    titulo="Categorías"
                    valor={totalCategorias}
                    subtexto="En el sistema"
                    icono={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                            <path d="M7 7h.01" />
                        </svg>
                    }
                />
            </div>

            {/* 3. Barra de búsqueda y filtros */}
            <FilterBar
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                placeholder="Buscar por nombre o SKU..."
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

                {categorias.length > 0 && (
                    <FilterSelect
                        valor={filtroCategoria}
                        onChange={setFiltroCategoria}
                        placeholder="Filtrar por categoría"
                        opciones={categorias.map((c) => ({
                            value: String(c.id),
                            label: c.nombre,
                        }))}
                        icono={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                                <path d="M7 7h.01" />
                            </svg>
                        }
                    />
                )}
            </FilterBar>

            {/* Mensaje de error si la API falla */}
            {error && <div className="alerta-error">{error}</div>}

            {/* 4. Tabla de Datos y Paginación */}
            {cargando ? (
                <div className="productos-loading">Cargando productos...</div>
            ) : (
                <DataTable
                    columnas={columnasProductos}
                    datos={productosPaginados}
                    mensajeVacio="No se encontraron productos que coincidan con la búsqueda."
                    paginacionProps={{
                        paginaActual,
                        totalPaginas,
                        primerRegistro,
                        ultimoRegistro,
                        totalFiltrados,
                        onCambioPagina: setPaginaActual,
                        nombreEntidad: 'productos',
                    }}
                    renderFila={(item) => (
                        <tr key={item.id}>
                            <td className="font-bold">{item.nombre}</td>
                            <td>
                                <span className="categoria-tag">
                                    {item.categoria?.nombre || 'Sin categoría'}
                                </span>
                            </td>
                            <td className="col-sku">{item.sku || '—'}</td>
                            <td className="text-right font-medium">
                                {Math.round(Number(item.stock_actual) || 0).toLocaleString('es-CL')}{' '}
                                <span className="uni-medida-text">{item.uni_medida || 'unid'}</span>
                            </td>
                            <td>
                                <div className={`badge-status-pill ${item.activo ? 'active' : 'inactive'}`}>
                                    <span className="badge-status-dot"></span>
                                    <span>{item.activo ? 'Activo' : 'Inactivo'}</span>
                                </div>
                            </td>
                            <td className="text-right">
                                <div className="actions-cell">
                                    {/* Activar / Desactivar con ConfirmModal */}
                                    <button
                                        type="button"
                                        className={`btn-action-toggle ${item.activo ? 'deactivate' : 'activate'}`}
                                        onClick={() => setProductoSeleccionado(item)}
                                        title={item.activo ? 'Desactivar producto' : 'Activar producto'}
                                    >
                                        {item.activo ? (
                                            <>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                                    {/* Ver Detalles */}
                                    <button
                                        type="button"
                                        className="btn-action-view"
                                        title="Ver detalle del producto"
                                        onClick={() => navigate(`/productos/detalles/${item.id}`)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                isOpen={productoSeleccionado !== null}
                title={`¿Estás seguro de ${productoSeleccionado?.activo ? 'desactivar' : 'activar'} este producto?`}
                description={`El producto "${productoSeleccionado?.nombre}" ${productoSeleccionado?.activo
                    ? 'quedará marcado como inactivo en el catálogo.'
                    : 'volverá a estar activo para registrar ventas y compras.'
                    }`}
                confirmText={productoSeleccionado?.activo ? 'Sí, desactivar' : 'Sí, activar'}
                cancelText="Cancelar"
                variant={productoSeleccionado?.activo ? 'danger' : 'primary'}
                onConfirm={() => {
                    if (productoSeleccionado) {
                        handleToggleEstado(productoSeleccionado.id, productoSeleccionado.activo);
                    }
                    setProductoSeleccionado(null);
                }}
                onCancel={() => setProductoSeleccionado(null)}
            />

            {/* Modal flotante para crear un producto */}
            <ModalNuevoProducto
                isOpen={modalNuevoAbierto}
                onClose={() => setModalNuevoAbierto(false)}
                categorias={categorias}
                onProductoCreado={(nuevoProducto) => {
                    // Inserta el nuevo producto al principio de la tabla reactivamente
                    setProductos((prev) => [nuevoProducto, ...prev]);
                }}
            />

            <ModalListaCategorias
                isOpen={modalCategoriasAbierto}
                onClose={() => setModalCategoriasAbierto(false)}
                categorias={categorias}
                productos={productos}
                onCategoriaCreada={(nuevaCat) => {
                    setCategorias((prev) => [...prev, nuevaCat].sort((a, b) => a.id - b.id));
                }}
                onCategoriaActualizada={handleCategoriaActualizada}
            />
        </div>
    );
}