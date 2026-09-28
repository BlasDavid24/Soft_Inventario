import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerProductoPorIdApi } from '../../api/producto.api';
import ModalEditarProducto from './EditarProducto';
import { obtenerCategoriaApi } from '../../api/categoria.api';
import PageHeader from '../../components/PageHeader';
import '../../styles/Productos/DetalleProducto.css';

export default function DetalleProducto() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            setError('');
            try {
                const [dataProducto, dataCategorias] = await Promise.all([
                    obtenerProductoPorIdApi(id),
                    obtenerCategoriaApi(),
                ]);

                const item = Array.isArray(dataProducto) ? dataProducto[0] : dataProducto;
                setProducto(item);
                setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);
            } catch (err) {
                console.error('Error al cargar datos del detalle:', err);
                setError(
                    err.response?.data?.detail ||
                    'No se pudo encontrar o cargar la información del producto.'
                );
            } finally {
                setCargando(false);
            }
        };

        if (id) {
            cargarDatos();
        }
    }, [id]);

    // Helpers de formateo
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '—';
        try {
            return new Date(fechaStr).toLocaleString('es-CL', {
                dateStyle: 'medium',
                timeStyle: 'short',
            });
        } catch {
            return fechaStr;
        }
    };

    const formatearNumero = (valor) => {
        const num = Number(valor);
        return isNaN(num) ? '0' : Math.round(num).toLocaleString('es-CL');
    };

    const formatearPrecio = (valor) => {
        const num = Number(valor);
        return isNaN(num) ? '$0' : `$${Math.round(num).toLocaleString('es-CL')}`;
    };

    if (cargando) {
        return (
            <div className="detalle-producto-container">
                <div className="detalle-mensaje-estado">Cargando detalles del producto...</div>
            </div>
        );
    }

    if (error || !producto) {
        return (
            <div className="detalle-producto-container">
                <div className="alerta-error">{error || 'Producto no encontrado.'}</div>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/productos')}
                    style={{ marginTop: '16px' }}
                >
                    ← Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="detalle-producto-container">
            {/* 1. Encabezado con botón volver y acción de editar */}
            <PageHeader
                titulo={'Detalle del Producto'}
                subtitulo={'Consulta la informacion completa del producto'}
                rutaVolver={() => navigate('/productos')}

            >
                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setModalEditarAbierto(true)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Editar</span>
                </button>
            </PageHeader>

            {/* 2. Cuadrícula de 2 columnas */}
            <div className="detalle-grid-layout">
                {/* === COLUMNA IZQUIERDA === */}
                <div className="detalle-columna-izq">
                    {/* Sección 1: Información General */}
                    <div className="detalle-card">
                        <div className="detalle-card-header">
                            <div className="detalle-card-icon blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6" />
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                    <polyline points="3.29 7 12 12 20.71 7" />
                                    <line x1="12" y1="22" x2="12" y2="12" />
                                </svg>
                            </div>
                            <h3 className="detalle-card-title">Información general</h3>
                        </div>

                        <div className="detalle-datos-grid">
                            <div className="dato-item">
                                <span className="dato-label">ID Sistema</span>
                                <span className="dato-valor font-mono">#{producto.id}</span>
                            </div>

                            <div className="dato-item">
                                <span className="dato-label">SKU / Código</span>
                                <span className="dato-valor font-mono">{producto.sku || '—'}</span>
                            </div>

                            <div className="dato-item">
                                <span className="dato-label">Nombre del Producto</span>
                                <span className="dato-valor font-bold">{producto.nombre}</span>
                            </div>

                            <div className="dato-item">
                                <span className="dato-label">Categoría</span>
                                <span className="dato-valor">
                                    <span className="categoria-tag-purple">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="categoria-tag-icon"
                                        >
                                            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                                            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                                        </svg>
                                        <span>{producto.categoria?.nombre || 'Sin categoría'}</span>
                                    </span>
                                </span>
                            </div>

                            <div className="dato-item">
                                <span className="dato-label">Unidad de Medida</span>
                                <span className="dato-valor badge-plain">
                                    {producto.uni_medida || 'UNIDAD'}
                                </span>
                            </div>

                            <div className="dato-item">
                                <span className="dato-label">Precio Unitario</span>
                                <span className="dato-valor precio-destacado">
                                    {formatearPrecio(producto.precio)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Información del Stock */}
                    <div className="detalle-card">
                        <div className="detalle-card-header">
                            <div className="detalle-card-icon green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                    <polyline points="2 17 12 22 22 17" />
                                    <polyline points="2 12 12 17 22 12" />
                                </svg>
                            </div>
                            <h3 className="detalle-card-title">Información del stock</h3>
                        </div>

                        {/* Recuadros de Stock (Naranja y Rojo) */}
                        <div className="stock-boxes-grid">
                            {/* Recuadro Stock Actual (Naranja) */}
                            <div className="stock-box orange">
                                <span className="stock-box-label">Stock Actual</span>
                                <div className="stock-box-valor">
                                    <span className="stock-numero">{formatearNumero(producto.stock_actual)}</span>
                                    <span className="stock-unidad">{producto.uni_medida || 'KG'}</span>
                                </div>
                            </div>

                            {/* Recuadro Stock Mínimo (Rojo) */}
                            <div className="stock-box red">
                                <span className="stock-box-label">Stock Mínimo Permitido</span>
                                <div className="stock-box-valor">
                                    <span className="stock-numero">{formatearNumero(producto.stock_minimo)}</span>
                                    <span className="stock-unidad">{producto.uni_medida || 'KG'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === COLUMNA DERECHA === */}
                <div className="detalle-columna-der">
                    {/* Sección 1: Estado */}
                    <div className="detalle-card">
                        <div className="detalle-card-header">
                            <div className="detalle-card-icon purple">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h3 className="detalle-card-title">Estado</h3>
                        </div>

                        <div className="estado-contenido">
                            <div className={`badge-status-pill ${producto.activo ? 'active' : 'inactive'}`}>
                                <span className="badge-status-dot"></span>
                                <span>{producto.activo ? 'Activo' : 'Inactivo'}</span>
                            </div>
                            <p className="estado-descripcion">
                                {producto.activo
                                    ? 'Este producto está habilitado para compras, ventas y control de inventario.'
                                    : 'Este producto se encuentra deshabilitado temporalmente.'}
                            </p>
                        </div>
                    </div>

                    {/* Sección 2: Registro y Fechas */}
                    <div className="detalle-card">
                        <div className="detalle-card-header">
                            <div className="detalle-card-icon gray">
                                {/* Ícono de reloj/calendario */}
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 14 14" />
                                </svg>
                            </div>
                            <h3 className="detalle-card-title">Historial de registro</h3>
                        </div>

                        <div className="detalle-fechas-lista">
                            <div className="fecha-item">
                                <span className="fecha-label">Fecha de creación</span>
                                <span className="fecha-valor">{formatearFecha(producto.fecha_creacion)}</span>
                            </div>

                            <div className="fecha-divider"></div>

                            <div className="fecha-item">
                                <span className="fecha-label">Última actualización</span>
                                <span className="fecha-valor">{formatearFecha(producto.fecha_act)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModalEditarProducto
                isOpen={modalEditarAbierto}
                onClose={() => setModalEditarAbierto(false)}
                producto={producto}
                categorias={categorias}
                onProductoActualizado={(prodActualizado) => {
                    setProducto(prodActualizado);
                }}
            />
        </div>
    );
}