import '../styles/Pagination.css';


export default function Pagination({
  paginaActual,
  totalPaginas,
  primerRegistro,
  ultimoRegistro,
  totalFiltrados,
  onCambioPagina,
  nombreEntidad = 'usuarios',
}) {
  return (
    <div className="pagination-footer">
      <div className="pagination-info">
        Mostrando {primerRegistro} a {ultimoRegistro} de {totalFiltrados} {nombreEntidad}
      </div>

      <div className="pagination-controls">
        {/* Flecha anterior */}
        <button
          type="button"
          className="btn-pagination-arrow"
          onClick={() => onCambioPagina(Math.max(paginaActual - 1, 1))}
          disabled={paginaActual === 1}
          title="Página anterior"
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
            onClick={() => onCambioPagina(num)}
          >
            {num}
          </button>
        ))}

        {/* Flecha siguiente */}
        <button
          type="button"
          className="btn-pagination-arrow"
          onClick={() => onCambioPagina(Math.min(paginaActual + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas || totalFiltrados === 0}
          title="Página siguiente"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}