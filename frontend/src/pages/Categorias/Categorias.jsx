import { useState, useEffect, useMemo } from 'react';
import FilterBar from '../../components/FilterBar';
import ModalCrearCategoria from './CrearCategoria';
import ModalEditarCategoria from './EditarCategoria';
import '../../styles/Productos/CrearProducto.css';
import '../../styles/Categorias/Categorias.css';

export default function ModalListaCategorias({
    isOpen,
    onClose,
    categorias = [],
    productos = [],
    onCategoriaCreada,
    onCategoriaActualizada,
}) {
    const [listaCategorias, setListaCategorias] = useState(categorias);
    const [busqueda, setBusqueda] = useState('');
    const [modalCrearCatAbierto, setModalCrearCatAbierto] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

    useEffect(() => {
        setListaCategorias(categorias);
    }, [categorias]);

    // Limpiar el filtro cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setBusqueda('');
        }
    }, [isOpen]);

    // Filtrado reactivo por nombre
    const categoriasFiltradas = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        if (!termino) return listaCategorias;
        return listaCategorias.filter((cat) =>
            cat.nombre.toLowerCase().includes(termino)
        );
    }, [listaCategorias, busqueda]);

    if (!isOpen) return null;

    const contarProductos = (categoriaId) => {
        return productos.filter(
            (p) => (p.categoria?.id || p.categoria_id) === categoriaId
        ).length;
    };

    const handleNuevaCategoria = (nuevaCat) => {
        setListaCategorias((prev) => [...prev, nuevaCat]);
        if (onCategoriaCreada) onCategoriaCreada(nuevaCat);
    };

    const handleActualizarCategoria = (catActualizada) => {
        setListaCategorias((prev) =>
            prev.map((c) => (c.id === catActualizada.id ? catActualizada : c))
        );
        if (onCategoriaActualizada) {
            onCategoriaActualizada(catActualizada);
        }
    };

    return (
        <>
            <div className="modal-overlay">
                <div
                    className="modal-card modal-producto"
                    onClick={(e) => e.stopPropagation()}
                    style={{ maxWidth: '520px' }}
                >
                    {/* Cabecera */}
                    <div className="modal-header">
                        <div className="modal-header-info">
                            <div className="modal-icon-circle purple">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                                    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="modal-title">Categorías Registradas</h3>
                                <p className="modal-subtitle">
                                    Total: {listaCategorias.length} {listaCategorias.length === 1 ? 'categoría' : 'categorías'} en el sistema
                                </p>
                            </div>
                        </div>
                        <button type="button" className="modal-btn-close" onClick={onClose}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Componente FilterBar */}
                    <div style={{ padding: '16px 24px 0 24px' }}>
                        <FilterBar
                            busqueda={busqueda}
                            onBusquedaChange={setBusqueda}
                            placeholder="Buscar categoría por nombre..."
                            onLimpiar={busqueda ? () => setBusqueda('') : undefined}
                        />
                    </div>

                    {/* Lista de Categorías */}
                    <div className="modal-body-categorias">
                        {categoriasFiltradas.length === 0 ? (
                            <div style={{ padding: '24px 12px', textAlign: 'center' }}>
                                <p className="categoria-vacio">
                                    {busqueda
                                        ? `No se encontraron categorías con "${busqueda}".`
                                        : 'No hay categorías registradas en el sistema.'}
                                </p>
                            </div>
                        ) : (
                            <div className="categorias-list-wrapper">
                                {categoriasFiltradas.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="categoria-list-item categoria-clickable"
                                        onClick={() => setCategoriaSeleccionada(cat)}
                                        title="Haz clic para editar esta categoría"
                                    >
                                        <div className="categoria-item-left">
                                            <span className="categoria-id-pill">#{cat.id}</span>
                                            <span className="categoria-nombre-text">{cat.nombre}</span>
                                        </div>
                                        <div className="categoria-item-right">
                                            <span className="categoria-conteo-badge">
                                                {contarProductos(cat.id)} {contarProductos(cat.id) === 1 ? 'producto' : 'productos'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-modal-submit"
                            onClick={() => setModalCrearCatAbierto(true)}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            + Nueva Categoría
                        </button>
                    </div>
                    <div className="modal-actions" style={{ padding: '16px 24px', display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            className="btn-modal-cancel"
                            onClick={onClose}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            <ModalCrearCategoria
                isOpen={modalCrearCatAbierto}
                onClose={() => setModalCrearCatAbierto(false)}
                onCategoriaCreada={handleNuevaCategoria}
            />

            <ModalEditarCategoria
                isOpen={Boolean(categoriaSeleccionada)}
                categoria={categoriaSeleccionada}
                onClose={() => setCategoriaSeleccionada(null)}
                onCategoriaActualizada={handleActualizarCategoria}
            />
        </>
    );
}