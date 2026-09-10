import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    totalProductos: 0,
    stockCritico: 0,
    movimientosHoy: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Aquí conectaremos con el endpoint resumen de FastAPI (ej: /reportes/resumen o /productos)
    // Por ahora dejamos la estructura lista
    setCargando(false);
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: '#0f172a' }}>Panel de Control</h1>

      {/* Tarjetas de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Total Fardos / Ítems</h3>
          <p style={{ margin: '10px 0 0', fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
            {cargando ? '...' : metricas.totalProductos}
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Stock Crítico</h3>
          <p style={{ margin: '10px 0 0', fontSize: '28px', fontWeight: 'bold', color: '#e11d48' }}>
            {cargando ? '...' : metricas.stockCritico}
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Movimientos del Día</h3>
          <p style={{ margin: '10px 0 0', fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>
            {cargando ? '...' : metricas.movimientosHoy}
          </p>
        </div>
      </div>

      {/* Área informativa */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#0f172a' }}>Bienvenido al Sistema</h2>
        <p style={{ color: '#475569', lineHeight: '1.5' }}>
          Desde aquí puedes monitorear los niveles de mercadería, auditar entradas y salidas, y gestionar los registros de bodega.
        </p>
      </div>
    </div>
  );
}