import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { actualizarUsuarioApi, obtenerUsuarioPorIdApi } from '../../api/usuario.api';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Usuario/EditarUsuario.css';

export default function EditarUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        rut: '',
        username: '',
        email: '',
        rol: 'ADMINISTRADOR',
    });

    const [activo, setActivo] = useState(true);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                setCargando(true);
                const u = await obtenerUsuarioPorIdApi(id);
                setFormData({
                    nombre: u.nombre || '',
                    apellido: u.apellido || '',
                    rut: u.rut || '',
                    username: u.username || '',
                    email: u.email || '',
                    rol: u.rol || 'ADMINISTRADOR',
                });
                setActivo(Boolean(u.activo));
            } catch (err) {
                setError('No se pudo cargar la información del usuario.');
            } finally {
                setCargando(false);
            }
        };

        if (id) cargarUsuario();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setGuardando(true);

        try {
            await actualizarUsuarioApi(id, formData);
            navigate('/usuarios');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al guardar los cambios.');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return <div className="edit-user-loading">Cargando datos del usuario...</div>;
    }

    return (
        <div className="edit-user-page">
            <div className="edit-user-header">
                <button
                    type="button"
                    className="btn-back"
                    onClick={() => setMostrarModal(true)}
                    title="Volver"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>
                <div>
                    <h2 className="edit-user-title">Editar Usuario</h2>
                    <p className="edit-user-subtitle">Modifica los datos del usuario seleccionado.</p>
                </div>
            </div>

            {error && <div className="edit-user-alert">{error}</div>}

            <div className="edit-user-layout">
                {/* Columna Izquierda: Formulario */}
                <div className="edit-user-card form-column">
                    {/* Encabezado: Información del Usuario */}
                    <div className="section-header-banner">
                        <div className="section-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                        </div>
                        <div className="section-header-texts">
                            <h3 className="section-title">Información del Usuario</h3>
                            <p className="section-subtitle">
                                Actualiza los datos del usuario. Los campos marcados con <span className="text-red">*</span> son obligatorios.
                            </p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="edit-user-form" autoComplete="off">
                        <div className="form-fields-grid">
                            <div className="edit-user-group">
                                <label className="edit-user-label">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    required
                                    className="edit-user-input"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="edit-user-group">
                                <label className="edit-user-label">Apellido</label>
                                <input
                                    type="text"
                                    name="apellido"
                                    required
                                    className="edit-user-input"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="edit-user-group">
                                <label className="edit-user-label">RUT</label>
                                <input
                                    type="text"
                                    name="rut"
                                    required
                                    className="edit-user-input"
                                    value={formData.rut}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="edit-user-group">
                                <label className="edit-user-label">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="edit-user-input"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="edit-user-group">
                                <label className="edit-user-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="edit-user-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="edit-user-group">
                                <label className="edit-user-label">Rol</label>
                                <select
                                    name="rol"
                                    className="edit-user-select"
                                    value={formData.rol}
                                    onChange={handleChange}
                                >
                                    <option value="ADMINISTRADOR">Administrador</option>
                                    <option value="ENCARGADO">Operador</option>
                                    <option value="CONSULTOR">Consultor</option>
                                </select>
                            </div>
                        </div>

                        <div className="edit-user-actions">
                            <button
                                type="button"
                                className="btn-action-cancel"
                                onClick={() => setMostrarModal(true)}
                                disabled={guardando}
                            >
                                {/* Icono X (Cancelar) */}
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="btn-icon"
                                >
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
                                {/* Icono Disquete / Guardar */}
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="btn-icon"
                                >
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Columna Derecha: Estado Solo Lectura */}
                <div className="edit-user-card side-column">
                    <h3 className="side-card-title">Estado en el Sistema</h3>
                    <p className="side-card-desc">Estado actual de la cuenta para iniciar sesión.</p>

                    <div className="status-container-readonly">
                        <span className="status-label-small">Estado actual</span>
                        <div className={`status-pill ${activo ? 'active' : 'inactive'}`}>
                            <span className="status-dot"></span>
                            <span>{activo ? 'Activo' : 'Inactivo'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={mostrarModal}
                title="¿Estás seguro de cancelar?"
                description="Se descartarán los cambios no guardados y regresarás al listado."
                confirmText="Sí, salir"
                cancelText="Continuar editando"
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