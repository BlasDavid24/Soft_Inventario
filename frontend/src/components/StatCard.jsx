import '../styles/StatCard.css';

export default function StatCard({
  titulo,
  valor,
  subtexto,
  subtextoVerde = false,
  color = 'blue',
  colorsubtext = 'blue',
  icono,
  onClick,
}) {
  return (
    <div
      className={`stat-card stat-card-${color} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
    >
      <div className={`stat-icon-wrapper stat-icon-${color}`}>
        {icono}
      </div>

      <div className="stat-content">
        <span className="stat-label">{titulo}</span>
        <span className={`stat-value stat-value-${colorsubtext}`}>{valor}</span>
        {subtexto && (
          <span className={`stat-subtext ${subtextoVerde ? 'text-trend' : ''}`}>
            {subtexto}
          </span>
        )}
      </div>
    </div>
  );
}