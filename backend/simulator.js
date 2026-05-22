require('dotenv').config();

/**
 * simulator.js
 * Sends random POST requests to /api/metricas every 5 seconds
 * to simulate solar node data coming in.
 *
 * Usage: node simulator.js <auth_token>
 * The token needs to be a valid Auth0 access token for the API audience.
 */

const token = process.argv[2];

if (!token) {
  console.error('Usage: node simulator.js <auth_token>');
  process.exit(1);
}

const API_URL = `http://localhost:${process.env.PORT || 4000}/api`;

// fake node ids - in real life these would come from the DB
// we keep them hardcoded here so the simulator always sends data for known nodes
const NODE_IDS = [
  'node-mixco-01',
  'node-zona10-02',
  'node-antigua-03',
  'node-xela-04',
];

// status codes matching the project spec
const STATUS_CODES = [200, 400, 500];
const CRITICIDADES = ['info', 'info', 'info', 'warning', 'error']; // weighted towards info

// pick a random item from an array
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// generate a random float between min and max
function randomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// build a fake metric payload
function buildPayload() {
  const criticidad = randomPick(CRITICIDADES);
  const statusCode = criticidad === 'error' ? 500 : criticidad === 'warning' ? 400 : 200;

  const mensajes = {
    info: 'Operacion normal del nodo',
    warning: 'Voltaje ligeramente bajo, revisar conexiones',
    error: 'Falla critica detectada - nodo sin respuesta',
  };

  return {
    nodo_id: randomPick(NODE_IDS),
    vatios_generados: randomFloat(50, 3500),
    voltaje: randomFloat(110, 240),
    status_code: statusCode,
    criticidad,
    mensaje: mensajes[criticidad],
  };
}

// send one metric to the API
async function sendMetric() {
  const payload = buildPayload();

  try {
    // using native fetch (available in Node 18+)
    const res = await fetch(`${API_URL}/metricas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[${new Date().toISOString()}] Metrica enviada - Nodo: ${payload.nodo_id} | ${payload.vatios_generados}W | ${payload.criticidad}`);
    } else {
      const err = await res.text();
      console.error(`[ERROR] Status ${res.status}: ${err}`);
    }
  } catch (err) {
    console.error('[ERROR] No se pudo conectar con la API:', err.message);
  }
}

console.log('Simulador iniciado - enviando metricas cada 5 segundos...');
console.log('Presiona Ctrl+C para detener\n');

// send first one right away then every 5 seconds
sendMetric();
setInterval(sendMetric, 5000);
