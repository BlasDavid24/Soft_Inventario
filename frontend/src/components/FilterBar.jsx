import '../styles/FilterBar.css';

/**
 * Selector desplegable estilizado con ícono a la izquierda.
 */
export function FilterSelect({ valor, onChange, placeholder, opciones = [], icono }) {
  return (
    <div className="select-wrapper">
      {icono && <span className="select-prefix-icon">{icono}</span>}
      <select
        className="filter-select"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opciones.map((opcion) => {
          const value = typeof opcion === 'object' ? opcion.value : opcion;
          const label = typeof opcion === 'object' ? opcion.label : opcion;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

/**
 * Barra completa de búsqueda, filtros dinámicos y botón limpiar.
 */
export default function FilterBar({
  busqueda,
  onBusquedaChange,
  placeholder = 'Buscar...',
  onLimpiar,
  children,
}) {
  return (
    <div className="filter-bar-card">
      {/* Input de Búsqueda */}
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
          placeholder={placeholder}
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </div>

      {/* Selectores y Botón Limpiar */}
      <div className="filter-controls-group">
        {children}

        {onLimpiar && (
          <button
            type="button"
            className="btn-filter-reset"
            onClick={onLimpiar}
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
        )}
      </div>
    </div>
  );
}