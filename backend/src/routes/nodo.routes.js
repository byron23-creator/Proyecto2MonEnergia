const { Router } = require('express');
const checkJwt = require('../middleware/auth');
const { listarNodos, obtenerNodo, crearNodo } = require('../controllers/nodo.controller');

const router = Router();

// all node routes are protected
router.get('/', checkJwt, listarNodos);
router.get('/:id', checkJwt, obtenerNodo);
router.post('/', checkJwt, crearNodo);

module.exports = router;
