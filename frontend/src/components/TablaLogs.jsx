import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { getMetricas } from '../services/api';

// badge colors for criticidad
const CRITICIDAD_COLORS = {
  info: '#60a5fa',
  warning: '#facc15',
  error: '#f87171',
};

// status code labels
function getStatusLabel(code) {
  if (code === 200) return '✅ OK';
  if (code === 400) return '⚠️ Baja eficiencia';
  if (code === 500) return '🔴 Falla';
  return `${code}`;
}

// advanced log table with date range, criticidad, and search filters
function TablaLogs({ socket }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // filter state
  const [rango, setRango] = useState('hoy');
  const [criticidad, setCriticidad] = useState('todos');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const LIMIT = 20;

  const fetchLogs = useCallback(() => {
    setLoading(true);
    getMetricas({ rango, criticidad, search, page, limit: LIMIT })
      .then((res) => {
        setLogs(res.data.data);
        setTotal(res.data.total);
      })
      .catch((err) => console.error('Error cargando logs:', err))
      .finally(() => setLoading(false));
  }, [rango, criticidad, search, page]);

  // reload when filters or page change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // auto refresh table when new metric arrives via socket
  useEffect(() => {
    if (!socket) return;

    function handleNewMetrica() {
      // only refresh if we're on page 1 and viewing today
      if (page === 1 && rango === 'hoy') {
        fetchLogs();
      }
    }

    socket.on('nueva_metrica', handleNewMetrica);
    return () => socket.off('nueva_metrica', handleNewMetrica);
  }, [socket, page, rango, fetchLogs]);

  // handle search with enter key or button
  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
      <h3>📋 Historial de Logs</h3>

      {/* filters row */}
      <div className="filters-row">
        {/* date range */}
        <div className="filter-group">
          <label>Rango de fecha</label>
          <select value={rango} onChange={(e) => { setRango(e.target.value); setPage(1); }}>
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="mes">Último Mes</option>
          </select>
        </div>

        {/* criticidad */}
        <div className="filter-group">
          <label>Criticidad</label>
          <select value={criticidad} onChange={(e) => { setCriticidad(e.target.value); setPage(1); }}>
            <option value="todos">Todos</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* search */}
        <div className="filter-group" style={{ flex: 2 }}>
          <label>Buscar (ID nodo o ubicación)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="ej: node-mixco-01"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="toggle-btn active" onClick={handleSearch}>Buscar</button>
          </div>
        </div>
      </div>

      {/* table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Nodo</th>
              <th>Ubicación</th>
              <th>Vatios</th>
              <th>Voltaje</th>
              <th>Estado</th>
              <th>Criticidad</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#aaa' }}>Cargando...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#aaa' }}>Sin resultados</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '12px' }}>
                    {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                  </td>
                  <td style={{ fontSize: '12px' }}>{log.nodo?.nombre || log.nodo_id}</td>
                  <td style={{ fontSize: '12px' }}>{log.nodo?.ubicacion || '-'}</td>
                  <td>{log.vatios_generados.toFixed(1)} W</td>
                  <td>{log.voltaje.toFixed(1)} V</td>
                  <td>{getStatusLabel(log.status_code)}</td>
                  <td>
                    <span
                      style={{
                        color: CRITICIDAD_COLORS[log.criticidad] || '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                      }}
                    >
                      {log.criticidad}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#aaa' }}>{log.mensaje}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="pagination">
        <span style={{ color: '#aaa', fontSize: '13px' }}>
          {total} resultados - Página {page} de {totalPages || 1}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="toggle-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Anterior
          </button>
          <button
            className="toggle-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

export default TablaLogs;
