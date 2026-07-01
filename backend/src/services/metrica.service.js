const prisma = require('../config/prisma');

// save a new metric to db and emit socket event right away
// `io` comes from req.app.get('io') in the controller - not a global
async function createMetrica(data, io) {
  const metrica = await prisma.metricaLog.create({ data });

  // emit to all connected clients
  io.emit('nueva_metrica', metrica);

  // if it's an error, emit a separate alert event too
  if (metrica.criticidad === 'error') {
    io.emit('alerta_critica', {
      nodo_id: metrica.nodo_id,
      mensaje: metrica.mensaje,
      timestamp: metrica.timestamp,
    });
  }

  return metrica;
}

// get last 5 minutes of metrics for a specific node (for line chart)
async function getMetricasRecientes(nodoId) {
  const since = new Date(Date.now() - 5 * 60 * 1000);
  return prisma.metricaLog.findMany({
    where: {
      nodo_id: nodoId,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: 'asc' },
  });
}

// get metrics with filters (date range, criticidad, search by nodo_id or ubicacion)
async function getMetricasFiltradas({ rango, criticidad, search, page = 1, limit = 50 }) {
  const where = {};

  // date range filter
  if (rango === 'hoy') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.timestamp = { gte: start };
  } else if (rango === 'ayer') {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    where.timestamp = { gte: start, lt: end };
  } else if (rango === 'mes') {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    where.timestamp = { gte: start };
  }

  // criticidad filter
  if (criticidad && criticidad !== 'todos') {
    where.criticidad = criticidad;
  }

  // search by nodo_id directly - ubicacion search is handled via join
  if (search) {
    where.OR = [
      { nodo_id: { contains: search } },
      { nodo: { ubicacion: { contains: search } } },
    ];
  }

  const skip = (page - 1) * limit;

  const [total, data] = await Promise.all([
    prisma.metricaLog.count({ where }),
    prisma.metricaLog.findMany({
      where,
      include: { nodo: { select: { nombre: true, ubicacion: true } } },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return { total, page, limit, data };
}

// aggregated generation by day for bar chart
async function getGeneracionPorDia() {
  // raw query because prisma doesn't have great date grouping for sqlite
  const rows = await prisma.$queryRaw`
    SELECT
      DATE(timestamp) as dia,
      SUM(vatios_generados) as total_vatios
    FROM MetricaLog
    GROUP BY DATE(timestamp)
    ORDER BY dia DESC
    LIMIT 30
  `;
  return rows;
}

// aggregated generation by month
async function getGeneracionPorMes() {
  const rows = await prisma.$queryRaw`
    SELECT
      strftime('%Y-%m', timestamp) as mes,
      SUM(vatios_generados) as total_vatios
    FROM MetricaLog
    GROUP BY strftime('%Y-%m', timestamp)
    ORDER BY mes DESC
    LIMIT 12
  `;
  return rows;
}

// node status distribution for donut chart
// checks last metric per node to determine status
async function getEstadoNodos() {
  const nodos = await prisma.nodo.findMany({
    include: {
      metricas: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  });

  const result = { online: 0, offline: 0, alerta: 0 };

  nodos.forEach((nodo) => {
    const last = nodo.metricas[0];
    if (!last) {
      result.offline++;
      return;
    }

    const minutesAgo = (Date.now() - new Date(last.timestamp).getTime()) / 60000;

    if (minutesAgo > 10) {
      // no data in 10 min = offline
      result.offline++;
    } else if (last.criticidad === 'error') {
      result.alerta++;
    } else {
      result.online++;
    }
  });

  return result;
}

module.exports = {
  createMetrica,
  getMetricasRecientes,
  getMetricasFiltradas,
  getGeneracionPorDia,
  getGeneracionPorMes,
  getEstadoNodos,
};
