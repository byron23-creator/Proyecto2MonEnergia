import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { getMetricasRecientes } from '../services/api';

// shows watts generated in the last 5 minutes for the selected node
// updates in real time via the nueva_metrica socket event
function LineChartRealtime({ nodoId, socket }) {
  const [data, setData] = useState([]);

  // load initial data when node changes
  useEffect(() => {
    if (!nodoId) return;

    getMetricasRecientes(nodoId)
      .then((res) => {
        const formatted = res.data.map((m) => ({
          time: format(new Date(m.timestamp), 'HH:mm:ss'),
          vatios: m.vatios_generados,
          voltaje: m.voltaje,
        }));
        setData(formatted);
      })
      .catch((err) => console.error('Error cargando metricas recientes:', err));
  }, [nodoId]);

  // listen for new metrics from socket and append to chart
  useEffect(() => {
    if (!socket || !nodoId) return;

    function handleNuevaMetrica(metrica) {
      // only add to chart if it's for the selected node
      if (metrica.nodo_id !== nodoId) return;

      const newPoint = {
        time: format(new Date(metrica.timestamp), 'HH:mm:ss'),
        vatios: metrica.vatios_generados,
        voltaje: metrica.voltaje,
      };

      setData((prev) => {
        // keep only last 5 minutes of data points (approx 60 points at 5s interval)
        const updated = [...prev, newPoint];
        return updated.slice(-60);
      });
    }

    socket.on('nueva_metrica', handleNuevaMetrica);

    return () => {
      socket.off('nueva_metrica', handleNuevaMetrica);
    };
  }, [socket, nodoId]);

  if (!nodoId) {
    return <p style={{ color: '#aaa', textAlign: 'center' }}>Selecciona un nodo para ver la gráfica</p>;
  }

  return (
    <div className="chart-card">
      <h3>⚡ Potencia en Tiempo Real - Últimos 5 min</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" tick={{ fill: '#aaa', fontSize: 11 }} />
          <YAxis tick={{ fill: '#aaa', fontSize: 11 }} unit="W" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #444' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="vatios"
            name="Vatios"
            stroke="#4ade80"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="voltaje"
            name="Voltaje"
            stroke="#60a5fa"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartRealtime;
