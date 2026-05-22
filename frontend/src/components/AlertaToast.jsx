import { useState, useEffect } from 'react';

// shows a popup alert when an alerta_critica socket event arrives
// auto-dismisses after 6 seconds
function AlertaToast({ socket }) {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    if (!socket) return;

    function handleAlerta(data) {
      const id = Date.now();
      const nueva = { id, ...data };

      setAlertas((prev) => [...prev, nueva]);

      // auto remove after 6 seconds
      setTimeout(() => {
        setAlertas((prev) => prev.filter((a) => a.id !== id));
      }, 6000);
    }

    socket.on('alerta_critica', handleAlerta);

    return () => {
      socket.off('alerta_critica', handleAlerta);
    };
  }, [socket]);

  if (alertas.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {alertas.map((alerta) => (
        <div key={alerta.id} className="alerta-toast">
          <strong>🚨 Alerta Crítica</strong>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
            Nodo: <code>{alerta.nodo_id}</code>
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#fca5a5' }}>
            {alerta.mensaje}
          </p>
          <button
            onClick={() => setAlertas((prev) => prev.filter((a) => a.id !== alerta.id))}
            style={{ position: 'absolute', top: '8px', right: '10px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default AlertaToast;
