export default function RoleBadge({ rol }) {
  const rolNormalizado = rol?.toLowerCase() || '';

  // Caso 1: Administrador (Corona)
  if (rolNormalizado.includes('admin')) {
    return (
      <span className="badge-role administrador">
        <svg className="badge-role-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
        </svg>
        {rol}
      </span>
    );
  }

  // Caso 2: Consultor (Icono de documento/notas)
  if (rolNormalizado.includes('consultor')) {
    return (
      <span className="badge-role consultor">
        <svg
          className="badge-role-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        {rol}
      </span>
    );
  }

  // Caso 3: Operador u otros (Icono de usuario)
  return (
    <span className="badge-role operador">
      <svg
        className="badge-role-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {rol || 'Operador'}
    </span>
  );
}