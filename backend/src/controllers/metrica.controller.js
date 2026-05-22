const metricaService = require('../services/metrica.service');

// POST /api/metricas - receives data from nodes or simulator
async function recibirMetrica(req, res) {
  try {
    const { nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje } = req.body;

    // basic validation
    if (!nodo_id || vatios_generados == null || voltaje == null) {
      return res.status(400).json({ error: 'Datos de metrica incompletos' });
    }

    const metrica = await metricaService.createMetrica({
      nodo_id,
      vatios_generados,
      voltaje,
      status_code: status_code || 200,
      criticidad: criticidad || 'info',
      mensaje: mensaje || '',
    });

    res.status(201).json(metrica);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar metrica' });
  }
}

// GET /api/metricas/recientes?nodoId=xxx - last 5 min for line chart
async function metricasRecientes(req, res) {
  try {
    const { nodoId } = req.query;
    if (!nodoId) return res.status(400).json({ error: 'nodoId es requerido' });
    const data = await metricaService.getMetricasRecientes(nodoId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener metricas recientes' });
  }
}

// GET /api/metricas?rango=hoy&criticidad=info&search=Mixco&page=1
async function listarMetricas(req, res) {
  try {
    const { rango, criticidad, search, page, limit } = req.query;
    const result = await metricaService.getMetricasFiltradas({
      rango,
      criticidad,
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar metricas' });
  }
}

// GET /api/metricas/generacion?agrupacion=dia|mes - for bar chart
async function generacionAgregada(req, res) {
  try {
    const { agrupacion } = req.query;
    let data;
    if (agrupacion === 'mes') {
      data = await metricaService.getGeneracionPorMes();
    } else {
      data = await metricaService.getGeneracionPorDia();
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener generacion' });
  }
}

// GET /api/metricas/estado - for donut chart
async function estadoNodos(req, res) {
  try {
    const data = await metricaService.getEstadoNodos();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estado de nodos' });
  }
}

module.exports = {
  recibirMetrica,
  metricasRecientes,
  listarMetricas,
  generacionAgregada,
  estadoNodos,
};
