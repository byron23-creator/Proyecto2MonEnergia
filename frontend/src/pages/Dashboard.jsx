import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth0 } from '@auth0/auth0-react';
import LineChartRealtime from '../components/LineChartRealtime';
import BarChartHistorico from '../components/BarChartHistorico';
import DonutEstado from '../components/DonutEstado';
import TablaLogs from '../components/TablaLogs';
import AlertaToast from '../components/AlertaToast';
import { getNodos } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

// main dashboard page - handles socket lifecycle and nodo selection
function Dashboard() {
  const { getAccessTokenSilently, user, logout } = useAuth0();
  const [nodos, setNodos] = useState([]);
  const [selectedNodo, setSelectedNodo] = useState('');
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // get token, save to localStorage for axios interceptor, and connect socket
  useEffect(() => {
    async function setup() {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });

        // save token so the axios interceptor can grab it
        localStorage.setItem('access_token', token);

        // load node list
        const res = await getNodos();
        setNodos(res.data);
        if (res.data.length > 0) {
          setSelectedNodo(res.data[0].id);
        }

        // connect socket with the token
        const sock = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket'],
        });

        sock.on('connect', () => {
          console.log('Socket ok:', sock.id);
          setConnected(true);
        });

        sock.on('disconnect', () => setConnected(false));
        sock.on('connect_error', (err) => {
          console.error('Socket error:', err.message);
          setConnected(false);
        });

        setSocket(sock);

        return () => sock.disconnect();
      } catch (err) {
        console.error('Setup error:', err);
      }
    }

    setup();
  }, [getAccessTokenSilently]);

  return (
    <div className="dashboard">
      {/* top bar */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>☀️</span>
          <h1 style={{ margin: 0, fontSize: '18px' }}>IoT Energy Monitor</h1>
          <span className={`status-dot ${connected ? 'online' : 'offline'}`}>
            {connected ? '● Conectado' : '○ Desconectado'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* node selector */}
          <select
            value={selectedNodo}
            onChange={(e) => setSelectedNodo(e.target.value)}
            className="node-select"
          >
            {nodos.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nombre} - {n.ubicacion}
              </option>
            ))}
          </select>

          <span style={{ fontSize: '13px', color: '#aaa' }}>{user?.email}</span>
          <button
            className="toggle-btn"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Salir
          </button>
        </div>
      </header>

      {/* charts grid */}
      <main className="grid">
        {/* line chart - full width on top */}
        <div style={{ gridColumn: '1 / -1' }}>
          <LineChartRealtime nodoId={selectedNodo} socket={socket} />
        </div>

        {/* bar chart and donut side by side */}
        <BarChartHistorico />
        <DonutEstado socket={socket} />

        {/* full width log table */}
        <TablaLogs socket={socket} />
      </main>

      {/* critical alert toast notifications */}
      <AlertaToast socket={socket} />
    </div>
  );
}

export default Dashboard;
