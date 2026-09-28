import { useState } from 'react';
import { crearProveedorApi } from '../../api/proveedor.api';
import '../../styles/Proveedores/CrearProveedor.css';

export default function ModalNuevoProveedor({ isOpen, onClose, onProveedorCreado }) {
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm('');

    if (!formData.nombre.trim()) {
      setErrorForm('El nombre de la empresa o proveedor es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      const nuevo = await crearProveedorApi(formData);
      onProveedorCreado(nuevo);
      
      // Mostrar confirmación de éxito antes de cerrar
      setExito(true);
      setTimeout(() => {
        handleCerrar();
      }, 1200);
    } catch (err) {
      if (err.response?.data?.detail) {
        setErrorForm(err.response.data.detail);
      } else {
        setErrorForm('Error al guardar el proveedor. Revisa los datos.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrar = () => {
    setFormData({
      rut: '',
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
    });
    setErrorForm('');
    setExito(false);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        {/* Cabecera con Ícono Circular */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-badge">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="4" width="14" height="12" rx="2" />
                <path d="M15 8h4l3 4v4h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="17.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className="modal-title-group">
              <h3>Nuevo Proveedor</h3>
              <p>Ingresa los datos para registrar un nuevo proveedor en el sistema.</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={handleCerrar} disabled={guardando}>
            &times;
          </button>
        </div>

        {/* Notificación de Error */}
        {errorForm && <div className="modal-alert-error">{errorForm}</div>}

        {/* Notificación de Éxito */}
        {exito && (
          <div className="modal-alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Producto creado exitosamente!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="rut">RUT</label>
              <input
                id="rut"
                type="text"
                name="rut"
                placeholder="Ej: 76.123.456-7"
                value={formData.rut}
                onChange={handleChange}
                disabled={guardando || exito}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nombre">
                Nombre / Razón Social <span className="req">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                placeholder="Ej: Distribuidora Textil SpA"
                value={formData.nombre}
                onChange={handleChange}
                disabled={guardando || exito}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="contacto@proveedor.cl"
                value={formData.email}
                onChange={handleChange}
                disabled={guardando || exito}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="text"
                name="telefono"
                placeholder="+56 9 1234 5678"
                value={formData.telefono}
                onChange={handleChange}
                disabled={guardando || exito}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                type="text"
                name="direccion"
                placeholder="Calle, número, comuna o ciudad"
                value={formData.direccion}
                onChange={handleChange}
                disabled={guardando || exito}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={handleCerrar}
              disabled={guardando || exito}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-modal-save" disabled={guardando || exito}>
              {guardando ? 'Guardando...' : exito ? 'Guardado' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}