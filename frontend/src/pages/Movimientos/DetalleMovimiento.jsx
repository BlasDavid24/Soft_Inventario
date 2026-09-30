import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { obtenerMovimientoPorIdApi } from '../../api/movimiento.api'
import PageHeader from '../../components/PageHeader';
import '../../styles/Movimientos/DetalleMovimiento.css';

export default function DetalleMovimiento({ movimiento: movimientoProp, onVolver: onVolverProp }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [movimiento, setMovimiento] = useState(
        movimientoProp || location.state?.movimiento || null
    );
    const [cargando, setCargando] = useState(!movimiento && Boolean(id));
    const [error, setError] = useState('');

    // 2. Si se recarga la página y solo tenemos el ID de la URL, lo traemos de la API
    useEffect(() => {
        if (!movimiento && id) {
            const cargarMovimiento = async () => {
                setCargando(true);
                setError('');
                try {
                    const data = await obtenerMovimientoPorIdApi(id); // 👈 Llama a tu función
                    setMovimiento(data);
                } catch (err) {
                    console.error('Error al cargar detalle del movimiento:', err);
                    setError('No se pudo cargar la información del movimiento.');
                } finally {
                    setCargando(false);
                }
            };

            cargarMovimiento();
        }
    }, [id, movimiento]);

    // Manejador del botón volver (usa la prop o hace navigate al listado)
    const handleVolver = () => {
        if (onVolverProp) {
            onVolverProp();
        } else {
            navigate('/movimientos');
        }
    };

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

    const tipoMayus = (movimiento?.tipo || '').toUpperCase();

    const tipoConfig = useMemo(() => {
        switch (tipoMayus) {
            case 'ENTRADA':
                return {
                    clase: 'tipo-entrada',
                    titulo: 'ENTRADA',
                    subtexto: 'Ingreso de stock al inventario',
                    icono: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    ),
                };
            case 'SALIDA':
                return {
                    clase: 'tipo-salida',
                    titulo: 'SALIDA',
                    subtexto: 'Egreso de stock del inventario',
                    icono: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                    ),
                };
            case 'DEVOLUCION CLIENTE':
                return {
                    clase: 'tipo-dev-cliente',
                    titulo: 'DEV. CLIENTE',
                    subtexto: 'Retorno de producto por cliente',
                    icono: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 14 4 9l5-5" />
                            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                        </svg>
                    ),
                };
            case 'DEVOLUCION PROVEEDOR':
                return {
                    clase: 'tipo-dev-proveedor',
                    titulo: 'DEV. PROVEEDOR',
                    subtexto: 'Devolución de mercadería a proveedor',
                    icono: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                        </svg>
                    ),
                };
            default:
                return {
                    clase: 'tipo-ajuste',
                    titulo: movimiento?.tipo || 'AJUSTE',
                    subtexto: 'Ajuste manual de stock',
                    icono: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m8 7-5 5 5 5" />
                            <path d="M3 12h18" />
                            <path d="m16 17 5-5-5-5" />
                            <path d="M21 12H3" />
                        </svg>
                    ),
                };
        }
    }, [tipoMayus, movimiento?.tipo]);

    if (cargando) {
        return (
            <div className="detalle-mov-vacio">
                <span className="spinner-movimientos"></span>
                <p style={{ marginTop: '16px' }}>Cargando información del movimiento...</p>
            </div>
        );
    }

    if (error || !movimiento) {
        return (
            <div className="detalle-mov-vacio">
                <p>{error || 'No se encontró la información de este movimiento.'}</p>
                <button type="button" className="btn-volver-outline" onClick={handleVolver}>
                    ← Volver a Movimientos
                </button>
            </div>
        );
    }

    const detalles = movimiento.detalles || [];

    return (
        <div className="detalle-mov-container">
            {/* 1. Emcabezado*/}
            <PageHeader
                titulo="Detalle del Movimiento"
                subtitulo={`Consulta la información completa del movimiento #${movimiento?.id}`}
                rutaVolver={() => navigate('/movimientos')}
            >
            </PageHeader>

            {/* 2. Tarjeta Resumen General Superior */}
            <div className="detalle-card-resumen">
                {/* Banner izquierdo del tipo */}
                <div className={`resumen-tipo-banner ${tipoConfig.clase}`}>
                    <div className="resumen-tipo-icono">{tipoConfig.icono}</div>
                    <span className="resumen-tipo-texto">{tipoConfig.titulo}</span>
                    <span className="resumen-tipo-desc">{tipoConfig.subtexto}</span>
                </div>

                {/* Contenedor de datos dividido en dos columnas */}
                <div className="resumen-cuerpo-grid">
                    {/* Columna 1: ID, Costo Total y Fecha */}
                    <div className="resumen-col-datos">
                        <div className="meta-item">
                            <span className="meta-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" y1="9" x2="20" y2="9" />
                                    <line x1="4" y1="15" x2="20" y2="15" />
                                    <line x1="10" y1="3" x2="8" y2="21" />
                                    <line x1="16" y1="3" x2="14" y2="21" />
                                </svg>
                                ID
                            </span>
                            <span className="meta-valor-id">#{movimiento.id}</span>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                Costo Total
                            </span>
                            <span className="meta-pill-costo">{formatearPrecio(movimiento.costo_total)}</span>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Fecha
                            </span>
                            <span className="meta-valor">{formatearFecha(movimiento.fecha || movimiento.created_at)}</span>
                        </div>
                    </div>

                    {/* Columna 2: Motivo con área expandida */}
                    <div className="resumen-col-motivo">
                        <span className="meta-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            Motivo / Observación
                        </span>
                        <div className="motivo-caja-texto">
                            <p>{movimiento.motivo || 'Sin motivo especificado para este movimiento.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Tarjetas Usuario y Proveedor */}
            <div className="detalle-grid-actores">
                {/* Usuario */}
                <div className="actor-card">
                    <div className="actor-card-header">
                        <div className="actor-icon-circle blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h3 className="actor-card-title">Usuario que registró</h3>
                    </div>
                    <div className="actor-card-body">
                        <div className="actor-field">
                            <span className="actor-field-label">ID:</span>
                            <span className="actor-field-valor">{movimiento.usuario?.id || movimiento.usuario_id || '—'}</span>
                        </div>
                        <div className="actor-field">
                            <span className="actor-field-label">Nombre:</span>
                            <span className="actor-field-valor">{movimiento.usuario?.nombre || movimiento.usuario?.username || 'Sistema'}</span>
                        </div>
                        <div className="actor-field">
                            <span className="actor-field-label">Email:</span>
                            <span className="actor-field-valor">{movimiento.usuario?.email || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Proveedor */}
                <div className="actor-card">
                    <div className="actor-card-header">
                        <div className="actor-icon-circle green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13" />
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                        </div>
                        <h3 className="actor-card-title">Proveedor</h3>
                    </div>
                    <div className="actor-card-body">
                        <div className="actor-field">
                            <span className="actor-field-label">ID:</span>
                            <span className="actor-field-valor">{movimiento.proveedor?.id || movimiento.proveedor_id || '—'}</span>
                        </div>
                        <div className="actor-field">
                            <span className="actor-field-label">Nombre:</span>
                            <span className="actor-field-valor">
                                {movimiento.proveedor?.nombre || (movimiento.proveedor_id ? `Proveedor #${movimiento.proveedor_id}` : 'No aplica')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Tabla de Productos del Movimiento */}
            <div className="detalle-productos-card">
                <div className="productos-card-header">
                    <div className="productos-header-info">
                        <div className="productos-icon-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                <path d="m3.3 7 8.7 5 8.7-5" />
                                <path d="M12 12v10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="productos-title">Productos del Movimiento</h2>
                            <p className="productos-subtitle">
                                Lista de productos incluidos en este movimiento. Este movimiento contiene {detalles.length} {detalles.length === 1 ? 'producto' : 'productos'}.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="productos-table-wrapper">
                    <table className="detalle-productos-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>#</th>
                                <th style={{ textAlign: 'center' }}>PRODUCTO</th>
                                <th style={{ textAlign: 'center' }}>SKU</th>
                                <th style={{ textAlign: 'center' }}>TIPO</th>
                                <th style={{ textAlign: 'center' }}>CANTIDAD</th>
                                <th style={{ textAlign: 'center' }}>COSTO UNITARIO</th>
                                <th style={{ textAlign: 'center' }}>COSTO TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detalles.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="productos-vacio">
                                        No hay detalles ni productos registrados en este movimiento.
                                    </td>
                                </tr>
                            ) : (
                                detalles.map((det, index) => {
                                    const prod = det.producto || {};

                                    return (
                                        <tr key={det.id || index}>
                                            <td className="td-index">{index + 1}</td>
                                            <td>
                                                <div className="producto-info-cell">
                                                    <span className="prod-nombre-text">{prod.nombre || `Producto #${det.producto_id}`}</span>
                                                </div>
                                            </td>
                                            <td className="td-sku">{prod.sku || '—'}</td>
                                            <td className="td-unidad">{prod.unidad_medida || 'UNIDAD'}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '700' }}>{det.cantidad}</td>
                                            <td style={{ textAlign: 'center' }}>{formatearPrecio(det.costo_unitario)}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                                                {formatearPrecio(det.costo_total || det.cantidad * det.costo_unitario)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer del Total */}
                <div className="productos-card-footer">
                    <span className="footer-total-label">Total del Movimiento</span>
                    <span className="footer-total-pill">{formatearPrecio(movimiento.costo_total)}</span>
                </div>
            </div>
        </div>
    );
}