export default function StatusBadge({ activo }) {
  return (
    <span className={`badge-status-pill ${activo ? 'active' : 'inactive'}`}>
      <span className="badge-status-dot" />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}