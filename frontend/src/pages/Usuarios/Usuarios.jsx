import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerUsuariosApi, desactivarUsuarioApi } from '../../api/usuario.api';
import RoleBadge from '../../components/RoleBadge';
import StatusBadge from '../../components/StatusBadge';
import { obtenerIniciales } from '../../utils/formatters';
import '../../styles/Usuario/Usuario.css';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';


export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const navigate = useNavigate();
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    // Control de paginación (3 registros por página)
    const [paginaActual, setPaginaActual] = useState(1);
    const usuariosPorPagina = 3;

    // Sesión del usuario autenticado
    const { usuario: usuarioSesion } = useAuth();

    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const data = await obtenerUsuariosApi();
                setUsuarios(data);
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
                setError('No se pudo conectar con el servidor o cargar los usuarios.');
            } finally {
                setCargando(false);
            }
        };

        cargarUsuarios();
    }, []);

    // Manejo de activación / desactivación con protección por username
    const handleToggleEstado = async (id, estadoActual, filaUsername) => {
        const esMismoUsuario =
            usuarioSesion?.username &&
            filaUsername?.toLowerCase() === usuarioSesion.username.toLowerCase();

        if (esMismoUsuario) {
            alert('Operación no permitida: no puedes desactivar tu propia cuenta en sesión.');
            return;
        }

        const nuevoEstado = !estadoActual;

        try {
            await desactivarUsuarioApi(id, nuevoEstado);

            setUsuarios((prevUsuarios) =>
                prevUsuarios.map((u) =>
                    u.id === id ? { ...u, activo: nuevoEstado } : u
                )
            );
        } catch (err) {
            console.error('Error al cambiar el estado del usuario:', err);
            alert('No se pudo cambiar el estado del usuario. Intente nuevamente.');
        }
    };

    // Roles únicos presentes en los datos para el selector
    const rolesUnicos = [...new Set(usuarios.map((u) => u.rol).filter(Boolean))];

    // Filtrado reactivo en memoria
    const usuariosFiltrados = usuarios.filter((u) => {
        const termino = busqueda.toLowerCase().trim();
        const coincideTexto =
            !termino ||
            (u.nombre && u.nombre.toLowerCase().includes(termino)) ||
            (u.apellido && u.apellido.toLowerCase().includes(termino)) ||
            (u.username && u.username.toLowerCase().includes(termino)) ||
            (u.rut && u.rut.toLowerCase().includes(termino));

        const coincideRol = !filtroRol || u.rol === filtroRol;

        const coincideEstado =
            filtroEstado === '' ||
            (filtroEstado === 'activo' && u.activo) ||
            (filtroEstado === 'inactivo' && !u.activo);

        return coincideTexto && coincideRol && coincideEstado;
    });

    // Reiniciar a página 1 al cambiar cualquier filtro
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtroRol, filtroEstado]);

    // Cálculos para paginación
    const totalFiltrados = usuariosFiltrados.length;
    const totalPaginas = Math.ceil(totalFiltrados / usuariosPorPagina) || 1;
    const indiceInicial = (paginaActual - 1) * usuariosPorPagina;
    const indiceFinal = indiceInicial + usuariosPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(indiceInicial, indiceFinal);

    const primerRegistro = totalFiltrados === 0 ? 0 : indiceInicial + 1;
    const ultimoRegistro = Math.min(indiceFinal, totalFiltrados);

    // Limpiar todos los filtros
    const handleLimpiarFiltros = () => {
        setBusqueda('');
        setFiltroRol('');
        setFiltroEstado('');
    };

    // Métricas calculadas en memoria
    const totalUsuarios = usuarios.length;
    const usuariosActivos = usuarios.filter((u) => u.activo).length;
    const usuariosInactivos = totalUsuarios - usuariosActivos;

    const pctActivos = totalUsuarios > 0 ? Math.round((usuariosActivos / totalUsuarios) * 100) : 0;
    const pctInactivos = totalUsuarios > 0 ? Math.round((usuariosInactivos / totalUsuarios) * 100) : 0;

    if (cargando) {
        return (
            <div style={{ padding: '24px', color: '#64748b', fontSize: '1rem' }}>
                Cargando usuarios del sistema...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <strong>Error:</strong> {error}
            </div>
        );
    }

    return (
        <div className="usuarios-container">
            {/* 1. Encabezado */}
            <div className="usuarios-header">
                <div className="usuarios-header-left">
                    <div className="header-icon-box">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="header-text-group">
                        <h1 className="usuarios-title">Gestión de Usuarios</h1>
                        <p className="usuarios-subtitle">
                            Administra los accesos, roles y estados de los usuarios del sistema.
                        </p>
                    </div>
                </div>

                <button className="btn-primary" onClick={() => navigate('/usuarios/nuevo')}>
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
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {/* 2. Tarjetas de Métricas (3 Cards) */}
            <div className="stats-grid">
                {/* Card 1: Total */}
                <div className="stat-card stat-card-blue">
                    <div className="stat-icon-wrapper stat-icon-blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total de Usuarios</span>
                        <span className="stat-value">{totalUsuarios}</span>
                        <span className="stat-subtext text-trend">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7" />
                                <polyline points="7 7 17 7 17 17" />
                            </svg>
                            +1 este mes
                        </span>
                    </div>
                </div>

                {/* Card 2: Activos */}
                <div className="stat-card stat-card-green">
                    <div className="stat-icon-wrapper stat-icon-green">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Usuarios Activos</span>
                        <span className="stat-value">{usuariosActivos}</span>
                        <span className="stat-subtext">{pctActivos}% del total</span>
                    </div>
                </div>

                {/* Card 3: Inactivos */}
                <div className="stat-card stat-card-gray">
                    <div className="stat-icon-wrapper stat-icon-gray">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Usuarios Inactivos</span>
                        <span className="stat-value">{usuariosInactivos}</span>
                        <span className="stat-subtext">{pctInactivos}% del total</span>
                    </div>
                </div>
            </div>

            {/* 3. Barra de búsqueda y filtros */}
            <div className="filter-bar-card">
                <div className="search-input-wrapper">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="search-icon"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className="filter-search-input"
                        placeholder="Buscar por nombre o usuario..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="filter-controls-group">
                    {/* Selector de Rol */}
                    <div className="select-wrapper">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="select-prefix-icon"
                        >
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        <select
                            className="filter-select"
                            value={filtroRol}
                            onChange={(e) => setFiltroRol(e.target.value)}
                        >
                            <option value="">Filtrar por rol</option>
                            {rolesUnicos.map((rol) => (
                                <option key={rol} value={rol}>
                                    {rol}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Estado */}
                    <div className="select-wrapper">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="select-prefix-icon"
                        >
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
                        <select
                            className="filter-select"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">Filtrar por estado</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>

                    {/* Botón Limpiar */}
                    <button
                        type="button"
                        className="btn-filter-reset"
                        onClick={handleLimpiarFiltros}
                        title="Restablecer filtros"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="reset-icon"
                        >
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        <span>Limpiar</span>
                    </button>
                </div>
            </div>

            {/* 4. Tabla de datos con contenedor común */}
            <div className="usuarios-table-container">
                <table className="usuarios-table">
                    <thead>
                        <tr>
                            <th>USUARIO</th>
                            <th>NOMBRE COMPLETO</th>
                            <th>RUT</th>
                            <th>ROL</th>
                            <th>ESTADO</th>
                            <th className="text-right">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                                    No se encontraron usuarios que coincidan con la búsqueda.
                                </td>
                            </tr>
                        ) : (
                            usuariosPaginados.map((u) => {
                                const esPropioUsuario =
                                    Boolean(usuarioSesion?.username) &&
                                    u.username?.toLowerCase() === usuarioSesion.username.toLowerCase();

                                return (
                                    <tr key={u.id}>
                                        <td className="col-username">
                                            <div className="user-cell">
                                                <div className="user-avatar-badge">
                                                    {obtenerIniciales(u.nombre, u.apellido, u.username)}
                                                </div>
                                                <span>{u.username}</span>
                                                {esPropioUsuario && <span className="badge-you">Tú</span>}
                                            </div>
                                        </td>
                                        <td className="col-name">{u.nombre} {u.apellido}</td>
                                        <td className="col-rut">{u.rut || '-'}</td>
                                        <td>
                                            <RoleBadge rol={u.rol} />
                                        </td>
                                        <td>
                                            <StatusBadge activo={u.activo} />
                                        </td>
                                        <td className="text-right">
                                            {/* Botón Editar */}
                                            <button
                                                className="btn-action-edit"
                                                title="Editar usuario"
                                                onClick={() => navigate(`/usuarios/actualizar/${u.id}`)}
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>

                                            {/* Botón Activar / Desactivar */}
                                            <button
                                                className={`btn-action-toggle ${u.activo ? 'deactivate' : 'activate'}`}
                                                onClick={() => setUsuarioSeleccionado(u)}
                                                disabled={esPropioUsuario}
                                                title={
                                                    esPropioUsuario
                                                        ? 'No puedes desactivar tu propia cuenta'
                                                        : u.activo
                                                            ? 'Desactivar usuario'
                                                            : 'Activar usuario'
                                                }
                                            >
                                                {u.activo ? (
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
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* 5. Footer de Paginación */}
                <div className="pagination-footer">
                    <div className="pagination-info">
                        Mostrando {primerRegistro} a {ultimoRegistro} de {totalFiltrados} usuarios
                    </div>

                    <div className="pagination-controls">
                        {/* Flecha anterior */}
                        <button
                            type="button"
                            className="btn-pagination-arrow"
                            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                            disabled={paginaActual === 1}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>

                        {/* Números de página */}
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                type="button"
                                className={`btn-pagination-number ${paginaActual === num ? 'active' : ''}`}
                                onClick={() => setPaginaActual(num)}
                            >
                                {num}
                            </button>
                        ))}

                        {/* Flecha siguiente */}
                        <button
                            type="button"
                            className="btn-pagination-arrow"
                            onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas || totalFiltrados === 0}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/*Modal flotante de confirmación */}
            <ConfirmModal
                isOpen={usuarioSeleccionado !== null}
                title={`¿Estás seguro de ${usuarioSeleccionado?.activo ? 'desactivar' : 'activar'} a este usuario?`}
                description={`El usuario "${usuarioSeleccionado?.username}" ${usuarioSeleccionado?.activo
                        ? 'perderá el acceso al sistema inmediatamente.'
                        : 'volverá a tener acceso al sistema.'
                    }`}
                confirmText={usuarioSeleccionado?.activo ? 'Sí, desactivar' : 'Sí, activar'}
                cancelText="Cancelar"
                variant={usuarioSeleccionado?.activo ? 'danger' : 'primary'}
                onConfirm={() => {
                    if (usuarioSeleccionado) {
                        handleToggleEstado(
                            usuarioSeleccionado.id,
                            usuarioSeleccionado.activo,
                            usuarioSeleccionado.username
                        );
                    }
                    setUsuarioSeleccionado(null); 
                }}
                onCancel={() => setUsuarioSeleccionado(null)}
            />
        </div>
    );
}