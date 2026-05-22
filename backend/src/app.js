require('dotenv').config();
const express = require('express');
const cors = require('cors');

const nodoRoutes = require('./routes/nodo.routes');
const metricaRoutes = require('./routes/metrica.routes');

const app = express();

// allow frontend to talk to this api - in demo mode accept any localhost port
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, mobile apps) or any localhost port
    if (!origin || origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json());

// health check - useful to see if server is up
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// mount routes
app.use('/api/nodos', nodoRoutes);
app.use('/api/metricas', metricaRoutes);

// generic error handler for auth errors from express-oauth2-jwt-bearer
app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.status(401).json({ error: 'No autorizado - token invalido o expirado' });
  }
  if (err.status === 403) {
    return res.status(403).json({ error: 'Prohibido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
