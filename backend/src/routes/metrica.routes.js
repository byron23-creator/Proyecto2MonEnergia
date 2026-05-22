const { Router } = require('express');
const checkJwt = require('../middleware/auth');
const {
  recibirMetrica,
  metricasRecientes,
  listarMetricas,
  generacionAgregada,
  estadoNodos,
} = require('../controllers/metrica.controller');

const router = Router();

// POST - simulator or real nodes send data here (protected)
router.post('/', checkJwt, recibirMetrica);

// GET - specific routes before the generic one to avoid conflicts
router.get('/recientes', checkJwt, metricasRecientes);
router.get('/generacion', checkJwt, generacionAgregada);
router.get('/estado', checkJwt, estadoNodos);

// GET - filtered log table
router.get('/', checkJwt, listarMetricas);

module.exports = router;
