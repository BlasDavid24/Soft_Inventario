import { useState, useEffect } from 'react';
import { actualizarCategoriaApi } from '../../api/categoria.api';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/Productos/CrearProducto.css';
import '../../styles/Categorias/Categorias.css';

export default function ModalEditarCategoria({
  isOpen,
  onClose,
  categoria,
  onCategoriaActualizada,
}) {
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (categoria && isOpen) {
      setNombre(categoria.nombre || '');
      setError('');
      setExito(false);
    }
  }, [categoria, isOpen]);

  // Limpiar temporizador si se desmonta o cierra repentinamente
  useEffect(() => {
    let timer;
    if (exito) {
      timer = setTimeout(() => {
        handleCerrar();
      }, 1200);
    }
    return () => clearTimeout(timer);
  }, [exito]);

  if (!isOpen || !categoria) return null;

  const handleCerrar = () => {
    if (guardando) return;
    setError('');
    setExito(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError('El nombre no puede estar vacío.');
      return;
    }

    // Si no cambió el nombre, cerramos sin hacer petición innecesaria
    if (nombreLimpio === categoria.nombre) {
      handleCerrar();
      return;
    }

    setGuardando(true);
    setError('');

    try {
      const payload = { nombre: nombreLimpio };
      const respuesta = await actualizarCategoriaApi(categoria.id, payload);

      const actualizada = {
        ...categoria,
        nombre: nombreLimpio,
        ...(typeof respuesta === 'object' ? respuesta : {}),
      };

      if (onCategoriaActualizada) {
        onCategoriaActualizada(actualizada);
      }

      setExito(true);
    } catch (err) {
      console.error('Error al editar categoría:', err);
      setError(err.response?.data?.detail || 'No se pudo actualizar la categoría.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-producto" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-icon-circle purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h3 className="modal-title">Editar Categoría</h3>
              <p className="modal-subtitle">Modificando categoría #{categoria.id}</p>
            </div>
          </div>
          <button type="button" className="modal-btn-close" onClick={handleCerrar} disabled={guardando || exito}>
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
            <span>¡Categoría actualizada exitosamente!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="nombre-cat-edit">Nombre de la categoría <span className="req">*</span></label>
            <input
              id="nombre-cat-edit"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={guardando || exito}
              autoFocus
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={() => {
                // Si el nombre cambió, pedimos confirmación; si no, cerramos directo
                if (nombre.trim() !== categoria.nombre) {
                  setMostrarModal(true);
                } else {
                  handleCerrar();
                }
              }}
              disabled={guardando || exito}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-modal-submit" disabled={guardando || exito}>
              {guardando ? (
                <>
                  <span className="spinner-sm"></span> Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={mostrarModal}
        title="¿Estás seguro de cancelar?"
        description="No se guardará la información ingresada."
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