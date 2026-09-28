import { useState } from 'react';
import { crearProductoApi } from '../../api/producto.api';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Productos/CrearProducto.css';

export default function ModalNuevoProducto({
    isOpen,
    onClose,
    categorias = [],
    onProductoCreado,
}) {
    const initialFormState = {
        nombre: '',
        sku: '',
        stock_actual: '',
        stock_minimo: 5,
        uni_medida: '',
        categoria_id: '',
        precio: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCerrar = () => {
        if (guardando) return;
        setFormData(initialFormState);
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError('');

        const catId = Number(formData.categoria_id);
        if (!catId) {
            setError('Por favor selecciona una categoría válida.');
            setGuardando(false);
            return;
        }

        // Payload exacto según el esquema de FastAPI
        const payload = {
            nombre: formData.nombre.trim(),
            sku: formData.sku.trim(),
            precio: Number(formData.precio) || 0,
            uni_medida: formData.uni_medida.toUpperCase(),
            stock_actual: Number(formData.stock_actual) || 0,
            stock_minimo: Number(formData.stock_minimo) || 0,
            categoria_id: catId,
        };

        try {
            const nuevo = await crearProductoApi(payload);
            if (onProductoCreado) onProductoCreado(nuevo);
            setExito(true);
            setTimeout(() => {
                handleCerrar();
            }, 1200);
        } catch (err) {
            console.error('Error al registrar producto (detalle API):', err.response?.data);

            let mensaje = 'Error al registrar el producto. Verifica los datos.';
            const resDetail = err.response?.data?.detail;

            if (typeof resDetail === 'string') {
                mensaje = resDetail;
            } else if (Array.isArray(resDetail) && resDetail.length > 0) {
                const itemError = resDetail[0];
                const campo = itemError.loc ? itemError.loc[itemError.loc.length - 1] : '';
                mensaje = campo ? `Campo "${campo}": ${itemError.msg}` : itemError.msg;
            }

            setError(mensaje);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div
                className="modal-card modal-producto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabecera del Modal */}
                <div className="modal-header">
                    <div className="modal-header-info">
                        <div className="modal-icon-circle purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                <path d="m3.3 7 8.7 5 8.7-5" />
                                <path d="M12 12v10" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="modal-title">Nuevo Producto</h3>
                            <p className="modal-subtitle">Ingresa la información básica y el stock inicial del producto.</p>
                        </div>
                    </div>
                </div>

                {error && <div className="modal-alerta-error">{error}</div>}

                {exito && (
                    <div className="modal-alert-success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>¡Proveedor creado exitosamente!</span>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
                    <div className="form-grid-2">
                        {/* Nombre del Producto */}
                        <div className="form-group span-2">
                            <label htmlFor="nombre">Nombre del Producto <span className="req">*</span></label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="Ej. Nugget Super Pollo 500gr"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            />
                        </div>

                        {/* SKU */}
                        <div className="form-group">
                            <label htmlFor="sku">SKU / Código <span className="req">*</span></label>
                            <input
                                id="sku"
                                name="sku"
                                type="text"
                                placeholder="Ej. SKUBEBID001"
                                value={formData.sku}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            />
                        </div>

                        {/* Categoría */}
                        <div className="form-group">
                            <label htmlFor="categoria_id">Categoría <span className="req">*</span></label>
                            <select
                                id="categoria_id"
                                name="categoria_id"
                                value={formData.categoria_id}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            >
                                <option value="" disabled hidden>Selecciona una categoría...</option>
                                {categorias.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Precio */}
                        <div className="form-group">
                            <label htmlFor="precio">Precio <span className="req">*</span></label>
                            <input
                                id="precio"
                                name="precio"
                                type="number"
                                min="0"
                                step="any"
                                placeholder="1500"
                                value={formData.precio}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            />
                        </div>

                        {/* Unidad de Medida */}
                        <div className="form-group">
                            <label htmlFor="uni_medida">Unidad de Medida</label>
                            <select
                                id="uni_medida"
                                name="uni_medida"
                                value={formData.uni_medida}
                                onChange={handleChange}
                                disabled={guardando}
                            >
                                <option value="" disabled hidden>Selecciona el tipo</option>
                                <option value="UNIDAD">Unidades (UNIDAD)</option>
                                <option value="KG">Kilogramos (KG)</option>
                            </select>
                        </div>

                        {/* Stock Actual */}
                        <div className="form-group">
                            <label htmlFor="stock_actual">Stock Inicial <span className="req">*</span></label>
                            <input
                                id="stock_actual"
                                name="stock_actual"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={formData.stock_actual}
                                onChange={handleChange}
                                required
                                disabled={guardando}
                            />
                        </div>

                        {/* Stock Mínimo */}
                        <div className="form-group">
                            <label htmlFor="stock_minimo">Stock Mínimo</label>
                            <input
                                id="stock_minimo"
                                name="stock_minimo"
                                type="number"
                                min="0"
                                placeholder="5"
                                value={formData.stock_minimo}
                                onChange={handleChange}
                                disabled={guardando}
                            />
                        </div>

                    </div>

                    {/* Acciones */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-modal-cancel"
                            onClick={() => setMostrarModal(true)}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-modal-submit"
                            disabled={guardando}
                        >
                            {guardando ? (
                                <>
                                    <span className="spinner-sm"></span> Guardando...
                                </>
                            ) : (
                                <>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ width: '18px', height: '18px', flexShrink: 0 }}
                                    >
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                        <polyline points="17 21 17 13 7 13 7 21" />
                                        <polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    <span>Crear Producto</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal flotante de confirmación */}
            <ConfirmModal
                isOpen={mostrarModal}
                title="¿Estás seguro de regresar?"
                description="Se perderán todos los datos ingresados en el formulario y regresarás al listado de productos"
                confirmText="Sí, salir"
                cancelText="Continuar"
                variant="danger"
                onConfirm={() => {
                    setMostrarModal(false);
                    handleCerrar()
                }}
                onCancel={() => setMostrarModal(false)}
            />
        </div>
    );
}