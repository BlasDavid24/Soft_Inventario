import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerProveedoresApi, actualizarProveedorApi } from '../../api/proveedor.api';
import { obtenerProductosPorProveedorApi, crearProveedorProductoApi, eliminarProveedorProductoApi } from '../../api/proveedorProducto.api';
import { obtenerCatalogoProductosApi } from '../../api/producto.api';
import PageHeader from '../../components/PageHeader';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Proveedores/EditarProveedor.css';

export default function ActualizarProveedor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        rut: '',
        email: '',
        telefono: '',
        direccion: '',
    });
    const [productosAsociados, setProductosAsociados] = useState([]);
    const [catalogoGeneral, setCatalogoGeneral] = useState([]);
    const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
    const [costoCompra, setCostoCompra] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardandoProveedor, setGuardandoProveedor] = useState(false);
    const [asociandoProducto, setAsociandoProducto] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [error, setError] = useState('');

    // Carga inicial de datos concurrentes
    useEffect(() => {
        const cargarDatosIniciales = async () => {
            setCargando(true);
            setError('');
            try {
                const [listaProveedores, prodsAsoc, catalogo] = await Promise.all([
                    obtenerProveedoresApi(),
                    obtenerProductosPorProveedorApi(id),
                    obtenerCatalogoProductosApi(),
                ]);

                const prov = listaProveedores.find((p) => String(p.id) === String(id));
                if (!prov) {
                    setError('El proveedor no existe o fue dado de baja.');
                } else {
                    setFormData({
                        nombre: prov.nombre || '',
                        rut: prov.rut || '',
                        email: prov.email || '',
                        telefono: prov.telefono || '',
                        direccion: prov.direccion || '',
                    });
                    setProductosAsociados(Array.isArray(prodsAsoc) ? prodsAsoc : []);
                    setCatalogoGeneral(Array.isArray(catalogo) ? catalogo : []);
                }
            } catch (err) {
                console.error('Error al sincronizar datos iniciales:', err);
                setError('Error al sincronizar datos con el servidor.');
            } finally {
                setCargando(false);
            }
        };

        if (id) {
            cargarDatosIniciales();
        }
    }, [id]);

    // Manejador de campos del proveedor
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Guardar cambios generales del proveedor
    const handleGuardarProveedor = async (e) => {
        e.preventDefault();
        setGuardandoProveedor(true);
        setError('');
        setMensajeExito('');
        try {
            if (typeof actualizarProveedorApi === 'function') {
                await actualizarProveedorApi(id, formData);
            }
            setMensajeExito('Datos del proveedor actualizados con éxito.');
            setTimeout(() => {
                setMensajeExito('');
                navigate(`/proveedores/detalles/${id}`);
            }, 550)
        } catch (err) {
            console.error('Error al actualizar proveedor:', err);
            setError(err.response?.data?.detail || 'No se pudieron guardar los cambios del proveedor.');
        } finally {
            setGuardandoProveedor(false);
        }
    };

    // Asociar producto con costo de compra
    const handleAsociarProducto = async (e) => {
        e.preventDefault();
        if (!productoSeleccionadoId || !costoCompra) return;

        setAsociandoProducto(true);
        setError('');
        try {
            const payload = {
                proveedor_id: Number(id),
                producto_id: Number(productoSeleccionadoId),
                costo_compra: Number(costoCompra),
            };

            const nuevaRelacion = await crearProveedorProductoApi(payload);

            // Localizamos los datos del producto para visualización inmediata en tabla
            const infoProd = catalogoGeneral.find((p) => p.id === Number(productoSeleccionadoId));

            const itemVisual = {
                ...nuevaRelacion,
                producto: infoProd || { nombre: `Producto #${productoSeleccionadoId}` },
            };

            setProductosAsociados((prev) => [...prev, itemVisual]);
            setProductoSeleccionadoId('');
            setCostoCompra('');
        } catch (err) {
            console.error('Error al asociar producto:', err);
            setError(err.response?.data?.detail || 'Error al vincular el producto al proveedor.');
        } finally {
            setAsociandoProducto(false);
        }
    };

    // Desvincular producto
    const handleDesvincular = async (relacionId) => {
        if (!window.confirm('¿Seguro que deseas desvincular este producto?')) return;
        try {
            await eliminarProveedorProductoApi(relacionId);
            setProductosAsociados((prev) => prev.filter((item) => item.id !== relacionId));
        } catch (err) {
            console.error('Error al desvincular producto:', err);
            alert('No se pudo desvincular el producto.');
        }
    };

    // Excluir productos ya asignados para el dropdown
    const idsVinculados = productosAsociados.map((item) => item.producto_id || item.producto?.id);
    const productosDisponibles = catalogoGeneral.filter((p) => !idsVinculados.includes(p.id));

    if (cargando) {
        return (
            <div className="actualizar-page-container">
                <div className="actualizar-loading">Cargando editor del proveedor...</div>
            </div>
        );
    }

    return (
        <div className="actualizar-page-container">
            <PageHeader
                rutaVolver={() => setMostrarModal(true)}
                titulo="Editar Proveedor"
                subtitulo="Modifica la información comercial y administra los productos suministrados con sus costos."
            />

            {mensajeExito && <div className="alerta-success">{mensajeExito}</div>}
            {error && <div className="alerta-error">{error}</div>}

            <div className="actualizar-layout-grid">
                {/* PANEL IZQUIERDO: Formulario de datos con Ícono de Usuario */}
                <div className="actualizar-card-panel">
                    <div className="panel-header">
                        <div className="header-title-flex">
                            <div className="panel-icon-circle blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div>
                                <h3>Información General</h3>
                                <p>Datos fiscales y de contacto</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleGuardarProveedor} className="panel-form" autoComplete="off">
                        <div className="form-group">
                            <label>Nombre / Razón Social *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>RUT</label>
                                <input
                                    type="text"
                                    name="rut"
                                    value={formData.rut}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Dirección Comercial</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-footer">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={guardandoProveedor}
                            >
                                {guardandoProveedor ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* PANEL DERECHO: Asignación de suministros con Ícono de Caja */}
                <div className="actualizar-card-panel">
                    <div className="panel-header">
                        <div className="header-title-flex">
                            <div className="panel-icon-circle purple">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                    <path d="m3.3 7 8.7 5 8.7-5" />
                                    <path d="M12 12v10" />
                                </svg>
                            </div>
                            <div>
                                <h3>Productos y Costos de Compra</h3>
                                <p>Asocia artículos del catálogo y define el costo pactado</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleAsociarProducto} className="panel-subform-asociar">
                        <div className="subform-grid">
                            <div className="form-group select-col">
                                <label>Seleccionar Producto</label>
                                <select
                                    value={productoSeleccionadoId}
                                    onChange={(e) => setProductoSeleccionadoId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Elige un producto del catálogo --</option>
                                    {productosDisponibles.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} {p.sku || p.codigo ? `(${p.sku || p.codigo})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group precio-col">
                                <label>Costo Compra ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="Ej: 1200"
                                    value={costoCompra}
                                    onChange={(e) => setCostoCompra(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary btn-asociar"
                                disabled={asociandoProducto || !productoSeleccionadoId || !costoCompra}
                            >
                                {asociandoProducto ? 'Vinculando...' : 'Asociar'}
                            </button>
                        </div>
                    </form>

                    <div className="tabla-asociados-wrapper">
                        <table className="tabla-horizontal-data">
                            <thead>
                                <tr>
                                    <th>PRODUCTO</th>
                                    <th>CÓDIGO</th>
                                    <th className="text-right">COSTO COMPRA</th>
                                    <th className="text-right">ACCIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosAsociados.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center empty-cell">
                                            No hay productos asociados a este proveedor todavía.
                                        </td>
                                    </tr>
                                ) : (
                                    productosAsociados.map((item) => (
                                        <tr key={item.id}>
                                            <td className="font-bold">
                                                {item.producto?.nombre || item.producto_nombre || `Producto #${item.producto_id}`}
                                            </td>
                                            <td className="col-sku">
                                                {item.producto?.sku || item.producto?.codigo || item.codigo || '—'}
                                            </td>
                                            <td className="text-right font-medium">
                                                ${Number(item.costo_compra || 0).toLocaleString('es-CL')}
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    type="button"
                                                    className="btn-action-delete"
                                                    title="Desvincular producto"
                                                    onClick={() => handleDesvincular(item.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación para cancelar */}
            <ConfirmModal
                isOpen={mostrarModal}
                title="¿Estás seguro de regresar?"
                description="Se perderán todos los datos ingresados en el formulario y regresarás al detalle del proveedor."
                confirmText="Sí, salir"
                cancelText="Continuar"
                variant="danger"
                onConfirm={() => {
                    setMostrarModal(false);
                    navigate(`/proveedores/detalles/${id}`);
                }}
                onCancel={() => setMostrarModal(false)}
            />
        </div>
    );
}