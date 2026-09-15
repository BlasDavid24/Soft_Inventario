import Pagination from '../components/Pagination';
import '../styles/DataTable.css';

export default function DataTable({
  columnas = [],
  datos = [],
  renderFila,
  mensajeVacio = 'No se encontraron registros que coincidan con la búsqueda.',
  paginacionProps,
}) {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columnas.map((col, index) => {
              const label = typeof col === 'object' ? col.label : col;
              const alignRight = typeof col === 'object' && col.align === 'right';
              return (
                <th key={index} className={alignRight ? 'text-right' : ''}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td colSpan={columnas.length} className="data-table-empty">
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            datos.map((item, index) => renderFila(item, index))
          )}
        </tbody>
      </table>

      {paginacionProps && <Pagination {...paginacionProps} />}
    </div>
  );
}