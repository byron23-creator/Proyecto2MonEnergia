import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getEstadoNodos } from '../services/api';

// colors for each status
const COLORS = {
  online: '#4ade80',
  offline: '#6b7280',
  alerta: '#f87171',
};

// donut chart showing node status distribution
// updates when a new_metrica or alerta_critica socket event comes in
function DonutEstado({ socket }) {
  const [estado, setEstado] = useState({ online: 0, offline: 0, alerta: 0 });

  function fetchEstado() {
    getEstadoNodos()
      .then((res) => setEstado(res.data))
      .catch((err) => console.error('Error cargando estado:', err));
  }

  // initial load
  useEffect(() => {
    fetchEstado();
  }, []);

  // refresh donut when new data arrives
  useEffect(() => {
    if (!socket) return;

    socket.on('nueva_metrica', fetchEstado);
    socket.on('alerta_critica', fetchEstado);

    return () => {
      socket.off('nueva_metrica', fetchEstado);
      socket.off('alerta_critica', fetchEstado);
    };
  }, [socket]);

  const chartData = [
    { name: 'Online', value: estado.online },
    { name: 'Offline', value: estado.offline },
    { name: 'Alerta', value: estado.alerta },
  ].filter((d) => d.value > 0);

  const total = estado.online + estado.offline + estado.alerta;

  return (
    <div className="chart-card">
      <h3>🔵 Estado de Nodos</h3>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <span className="badge badge-online">● Online: {estado.online}</span>
        <span className="badge badge-offline">● Offline: {estado.offline}</span>
        <span className="badge badge-alerta">● Alerta: {estado.alerta}</span>
      </div>

      {total === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa' }}>Sin nodos registrados</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase()] || '#888'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default DonutEstado;
