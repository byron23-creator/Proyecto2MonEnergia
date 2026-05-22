const nodoService = require('../services/nodo.service');

// GET /api/nodos
async function listarNodos(req, res) {
  try {
    const nodos = await nodoService.getAllNodos();
    res.json(nodos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener nodos' });
  }
}

// GET /api/nodos/:id
async function obtenerNodo(req, res) {
  try {
    const nodo = await nodoService.getNodoById(req.params.id);
    if (!nodo) return res.status(404).json({ error: 'Nodo no encontrado' });
    res.json(nodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener nodo' });
  }
}

// POST /api/nodos
async function crearNodo(req, res) {
  try {
    const { nombre, ubicacion, version_fw } = req.body;
    if (!nombre || !ubicacion || !version_fw) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const nodo = await nodoService.createNodo({ nombre, ubicacion, version_fw });
    res.status(201).json(nodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear nodo' });
  }
}

module.exports = { listarNodos, obtenerNodo, crearNodo };
