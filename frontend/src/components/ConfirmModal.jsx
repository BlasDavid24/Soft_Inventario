import React from 'react';
import '../styles/Usuario/CrearUsuario.css'; // o donde tengas centralizados tus estilos de modales

export default function ConfirmModal({
  isOpen,
  title = '¿Estás seguro?',
  description = 'Esta acción no se puede deshacer.',
  confirmText = 'Sí, continuar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' (rojo) o 'primary' (azul)
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      {/* stopPropagation evita que al hacer clic dentro de la tarjeta se cierre el modal */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Icono dinámico según la variante */}
        <div className={`modal-icon-alert ${variant === 'primary' ? 'icon-blue' : ''}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h3 className="modal-title">{title}</h3>
        <p className="modal-description">{description}</p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-modal-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={variant === 'primary' ? 'btn-modal-primary' : 'btn-modal-danger'}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}