require('dotenv').config();
const express = require('express');
const cors = require('cors');

const nodoRoutes = require('./routes/nodo.routes');
const metricaRoutes = require('./routes/metrica.routes');

const app = express();

// allow frontend to talk to this api
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
