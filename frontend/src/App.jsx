import { useAuth0 } from '@auth0/auth0-react';
import Dashboard from './pages/Dashboard';

// simple login screen shown when user is not authenticated
function LoginScreen({ loginWithRedirect, isLoading }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <span style={{ fontSize: '48px' }}>☀️</span>
        <h1>IoT Energy Monitor</h1>
        <p style={{ color: '#aaa', marginBottom: '24px' }}>
          Monitoreo de energía solar en tiempo real
        </p>
        {isLoading ? (
          <p style={{ color: '#aaa' }}>Cargando...</p>
        ) : (
          <button className="login-btn" onClick={() => loginWithRedirect()}>
            Iniciar Sesión con Auth0
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  // show login if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen loginWithRedirect={loginWithRedirect} isLoading={isLoading} />;
  }

  return <Dashboard />;
}

export default App;
