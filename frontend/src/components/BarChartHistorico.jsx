import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getGeneracion } from '../services/api';

// historical generation bar chart - can group by day or month
function BarChartHistorico() {
  const [data, setData] = useState([]);
  const [agrupacion, setAgrupacion] = useState('dia');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGeneracion(agrupacion)
      .then((res) => {
        // format the data for recharts
        const formatted = res.data.map((row) => ({
          label: row.dia || row.mes || '',
          total: parseFloat(row.total_vatios || 0).toFixed(0),
        }));
        setData(formatted);
      })
      .catch((err) => console.error('Error cargando generacion:', err))
      .finally(() => setLoading(false));
  }, [agrupacion]);

  // color bars based on value - higher is greener
  const getBarColor = (value) => {
    if (value > 50000) return '#4ade80';
    if (value > 20000) return '#facc15';
    return '#f87171';
  };

  return (
    <div className="chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>📊 Generación Histórica</h3>
        <div className="toggle-group">
          <button
            className={agrupacion === 'dia' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setAgrupacion('dia')}
          >
            Por Día
          </button>
          <button
            className={agrupacion === 'mes' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setAgrupacion('mes')}
          >
            Por Mes
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa' }}>Cargando...</p>
      ) : data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa' }}>Sin datos todavía</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="label" tick={{ fill: '#aaa', fontSize: 11 }} />
            <YAxis tick={{ fill: '#aaa', fontSize: 11 }} unit="W" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value) => [`${Number(value).toLocaleString()} W`, 'Total']}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.total)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BarChartHistorico;
