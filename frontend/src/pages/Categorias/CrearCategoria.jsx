import { useState } from 'react';
import { crearCategoriaApi } from '../../api/categoria.api';
import '../../styles/Productos/CrearProducto.css';
import ConfirmModal from '../../components/ConfirmModal';

export default function ModalCrearCategoria({
    isOpen,
    onClose,
    onCategoriaCreada,
}) {
    const [nombre, setNombre] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);
    const [error, setError] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);


    if (!isOpen) return null;

    const handleCerrar = () => {
        if (guardando) return;
        setNombre('');
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError('El nombre de la categoría es obligatorio.');
            return;
        }

        setGuardando(true);
        setError('');

        try {
            const nuevaCategoria = await crearCategoriaApi({ nombre: nombre.trim() });
            if (onCategoriaCreada) {
                onCategoriaCreada(nuevaCategoria);
            }
            setExito(true);
            setTimeout(() => {
                handleCerrar();
            }, 1200);
        } catch (err) {
            console.error('Error al crear categoría:', err);
            let msg = 'No se pudo crear la categoría.';
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                msg = detail;
            } else if (Array.isArray(detail) && detail.length > 0) {
                msg = detail[0]?.msg || msg;
            }
            setError(msg);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div
                className="modal-card modal-producto"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '440px' }}
            >
                {/* Cabecera */}
                <div className="modal-header">
                    <div className="modal-header-info">
                        <div className="modal-icon-circle purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                                <path d="M7 7h.01" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="modal-title">Nueva Categoría</h3>
                            <p className="modal-subtitle">Crea una nueva clasificación para tus productos.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="modal-btn-close"
                        onClick={handleCerrar}
                        disabled={guardando}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {error && <div className="modal-alerta-error">{error}</div>}

                {exito && (
                    <div className="modal-alert-success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Categoria creado exitosamente!</span>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="nombre-categoria">Nombre de la categoría <span className="req">*</span></label>
                        <input
                            id="nombre-categoria"
                            type="text"
                            placeholder="Ej. Abarrotes, Ropa, Limpieza..."
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            autoFocus
                            disabled={guardando}
                            required
                        />
                    </div>

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
                                    <span className="spinner-sm"></span>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                        <polyline points="17 21 17 13 7 13 7 21" />
                                        <polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    <span>Crear Categoría</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de confirmación para cancelar */}
            <ConfirmModal
                isOpen={mostrarModal}
                title="¿Estás seguro de cancelar?"
                description="No se guardara la informacion ingresada"
                confirmText="Sí, salir"
                cancelText="Continuar"
                variant="danger"
                onConfirm={() => {
                    setMostrarModal(false);
                    handleCerrar();
                }}
                onCancel={() => setMostrarModal(false)}
            />
        </div>
    );
}