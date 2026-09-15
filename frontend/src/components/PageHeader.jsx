import { useNavigate } from 'react-router-dom';
import '../styles/PageHeader.css';

export default function PageHeader({ titulo, subtitulo, icono, rutaVolver, children }) {
    const navigate = useNavigate();

    const handleVolver = async() => {
        // Caso 1: Si es una función personalizada de validación
        if (typeof rutaVolver === 'function') {
            await rutaVolver();
            return;
        }

        // Caso 2: Si es un string con la ruta (ej. "/proveedores")
        if (typeof rutaVolver === 'string') {
            navigate(rutaVolver);
            return;
        }

        // Caso 3: Si solo le pasaste true (vuelve al historial anterior)
        navigate(-1);
    };

    return (
        <div className="page-header">
            <div className="page-header-left">
                {/* Botón Volver (para vistas de Crear / Editar) */}
                {rutaVolver && (
                    <button
                        type="button"
                        className="btn-back-header"
                        onClick={handleVolver}
                        title="Volver"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                )}

                {/* Recuadro de ícono de sección */}
                {icono && <div className="header-icon-box">{icono}</div>}

                {/* Título y Subtítulo */}
                <div className="header-text-group">
                    <h1 className="page-title">{titulo}</h1>
                    {subtitulo && <p className="page-subtitle">{subtitulo}</p>}
                </div>
            </div>

            {/* Botones / Acciones del lado derecho */}
            {children && <div className="page-header-right">{children}</div>}
        </div>
    );
}