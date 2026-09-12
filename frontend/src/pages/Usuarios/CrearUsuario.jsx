import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearUsuarioApi } from '../../api/usuario.api';
import '../../styles/Usuario/CrearUsuario.css';
import ConfirmModal from '../../components/ConfirmModal';

export default function CrearUsuario() {
    const navigate = useNavigate();
    const [mostrarModal, setMostrarModal] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        rut: '',
        username: '',
        email: '',
        rol: 'ADMINISTRADOR',
    });

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [passwordGenerada, setPasswordGenerada] = useState(null);
    const [copiado, setCopiado] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSeleccionarRol = (rolSeleccionado) => {
        setFormData((prev) => ({
            ...prev,
            rol: rolSeleccionado,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setGuardando(true);

        try {
            const respuesta = await crearUsuarioApi(formData);
            if (respuesta?.password_temporal) {
                setPasswordGenerada(respuesta.password_temporal);
            } else {
                navigate('/usuarios');
            }
        } catch (err) {
            console.error('Error al crear usuario:', err);
            if (err.response && err.response.data?.detail) {
                const detalle = err.response.data.detail;
                setError(typeof detalle === 'string' ? detalle : JSON.stringify(detalle));
            } else {
                setError('No se pudo registrar el usuario. Revisa la conexión con el servidor.');
            }
        } finally {
            setGuardando(false);
        }
    };

    const handleCopiarClave = () => {
        if (!passwordGenerada) return;
        navigator.clipboard.writeText(passwordGenerada);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="usuarios-container">
            {/* 1. Encabezado */}
            <div className="usuarios-header">
                <div className="usuarios-header-left">
                    <button
                        type="button"
                        className="btn-back"
                        onClick={() => setMostrarModal(true)}
                        title="Volver al listado"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <div className="header-text-group">
                        <h1 className="usuarios-title">Crear Nuevo Usuario</h1>
                        <p className="usuarios-subtitle">
                            Ingresa los datos del colaborador para registrarlo en el sistema.
                        </p>
                    </div>
                </div>
            </div>

            {/* Columnas */}
            <div className="create-user-layout">
                {/* Columna Izquierda: Formulario */}
                <div className="form-card-container">
                    <div className="form-card-header">
                        <div className="form-header-icon-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                        </div>
                        <div className="form-header-texts">
                            <h2 className="form-section-title">Información del Usuario</h2>
                            <p className="form-section-subtitle">
                                Todos los campos marcados con <span className="required-star">*</span> son obligatorios.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="form-error-alert">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form id="form-crear-usuario" onSubmit={handleSubmit} className="form-grid" autoComplete="off">
                        <div className="form-group">
                            <label className="form-label">Nombre <span className="required-star">*</span></label>
                            <input
                                type="text"
                                name="nombre"
                                required
                                className="form-input"
                                placeholder="Ej. Andrea"
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Apellido <span className="required-star">*</span></label>
                            <input
                                type="text"
                                name="apellido"
                                required
                                className="form-input"
                                placeholder="Ej. Castillo"
                                value={formData.apellido}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">RUT <span className="required-star">*</span></label>
                            <input
                                type="text"
                                name="rut"
                                required
                                className="form-input"
                                placeholder="Ej. 23242524-8"
                                value={formData.rut}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre de Usuario <span className="required-star">*</span></label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="form-input"
                                placeholder="Ej. AndreaCas"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Correo Electrónico <span className="required-star">*</span></label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="form-input"
                                placeholder="ejemplo@trabajo.cl"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Botones de acción */}
                        <div className="form-actions-left full-width">
                            <button
                                type="button"
                                className="btn-action-cancel"
                                onClick={() => setMostrarModal(true)}
                                disabled={guardando}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <span>Cancelar</span>
                            </button>

                            <button
                                type="submit"
                                className="btn-action-submit"
                                disabled={guardando}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                <span>{guardando ? 'Guardando...' : 'Crear Usuario'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Columna Derecha: Tarjetas */}
                <div className="side-cards-column">
                    <div className="role-card-container">
                        <div className="form-card-header">
                            <div className="form-header-icon-circle">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div className="form-header-texts">
                                <h2 className="form-section-title">Asignación de Roles</h2>
                                <p className="form-section-subtitle">
                                    Define el nivel de acceso del usuario en el sistema.
                                </p>
                            </div>
                        </div>

                        <div className="role-options-list">
                            <div
                                className={`role-option-item ${formData.rol === 'ADMINISTRADOR' ? 'selected' : ''}`}
                                onClick={() => handleSeleccionarRol('ADMINISTRADOR')}
                            >
                                <div className="custom-radio">
                                    <div className="radio-dot"></div>
                                </div>
                                <div className="role-icon-box role-icon-blue">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                                    </svg>
                                </div>
                                <div className="role-text-group">
                                    <span className="role-name">Administrador</span>
                                    <p className="role-desc">Acceso completo a la creación de usuarios y consultas del sistema.</p>
                                </div>
                            </div>

                            <div
                                className={`role-option-item ${formData.rol === 'ENCARGADO' ? 'selected' : ''}`}
                                onClick={() => handleSeleccionarRol('ENCARGADO')}
                            >
                                <div className="custom-radio">
                                    <div className="radio-dot"></div>
                                </div>
                                <div className="role-icon-box role-icon-gray">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div className="role-text-group">
                                    <span className="role-name">Operador</span>
                                    <p className="role-desc">Puede gestionar productos, proveedores y movimientos de inventario.</p>
                                </div>
                            </div>

                            <div
                                className={`role-option-item ${formData.rol === 'CONSULTOR' ? 'selected' : ''}`}
                                onClick={() => handleSeleccionarRol('CONSULTOR')}
                            >
                                <div className="custom-radio">
                                    <div className="radio-dot"></div>
                                </div>
                                <div className="role-icon-box role-icon-gray">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                        <line x1="9" y1="7" x2="15" y2="7" />
                                        <line x1="9" y1="11" x2="15" y2="11" />
                                    </svg>
                                </div>
                                <div className="role-text-group">
                                    <span className="role-name">Consultor</span>
                                    <p className="role-desc">Puede consultar productos e inventario.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para mostrar y copiar la Contraseña Temporal generada */}
            {passwordGenerada && (
                <div className="modal-overlay-custom">
                    <div className="modal-card-custom">
                        <div className="modal-success-icon-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <h3 className="modal-card-title">¡Usuario creado con éxito!</h3>
                        <p className="modal-card-desc">
                            El sistema generó una contraseña temporal para el primer acceso. Cópiala y entrégasela al usuario:
                        </p>

                        <div className="temp-password-box">
                            <code className="temp-password-text">{passwordGenerada}</code>
                            <button
                                type="button"
                                onClick={handleCopiarClave}
                                className={`btn-copy-temp ${copiado ? 'copied' : ''}`}
                            >
                                {copiado ? '¡Copiado!' : 'Copiar'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/usuarios')}
                            className="btn-confirm-return"
                        >
                            Listo, volver al listado
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para cancelar */}
            <ConfirmModal
                isOpen={mostrarModal}
                title="¿Estás seguro de cancelar?"
                description="Se perderán todos los datos ingresados en el formulario y regresarás al listado de usuarios."
                confirmText="Sí, salir"
                cancelText="Continuar"
                variant="danger"
                onConfirm={() => {
                    setMostrarModal(false);
                    navigate('/usuarios');
                }}
                onCancel={() => setMostrarModal(false)}
            />
        </div>
    );
}