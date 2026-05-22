# Backend - IoT Energy Monitoring API

Este es el servidor backend hecho con Node.js y Express. Recibe datos de nodos solares, los guarda en SQLite con Prisma y manda eventos en tiempo real usando Socket.io.

## Stack usado

- **Node.js + Express** - servidor HTTP
- **Socket.io** - comunicación en tiempo real
- **Prisma ORM** - manejo de la base de datos
- **SQLite** - base de datos local (fácil de correr sin instalar nada)
- **Auth0 (express-oauth2-jwt-bearer)** - validación de tokens JWT

## Estructura de carpetas

```
backend/
├── prisma/
│   ├── schema.prisma    # modelos de la BD
│   ├── seed.js          # datos iniciales de nodos
│   └── dev.db           # archivo de SQLite (se crea al migrar)
├── src/
│   ├── config/
│   │   ├── prisma.js    # instancia de prisma client
│   │   └── socket.js    # setup de socket.io
│   ├── middleware/
│   │   └── auth.js      # middleware de Auth0
│   ├── routes/
│   │   ├── nodo.routes.js
│   │   └── metrica.routes.js
│   ├── controllers/
│   │   ├── nodo.controller.js
│   │   └── metrica.controller.js
│   ├── services/
│   │   ├── nodo.service.js
│   │   └── metrica.service.js
│   └── app.js           # configuracion de express
├── server.js            # entry point
├── simulator.js         # script para simular datos
└── .env                 # variables de entorno
```

## Cómo correrlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar el .env

Copiar el archivo `.env` y poner tus credenciales de Auth0:

```
DATABASE_URL="file:./dev.db"
PORT=4000
AUTH0_DOMAIN=tu-tenant.us.auth0.com
AUTH0_AUDIENCE=https://iot-energy-api
FRONTEND_URL=http://localhost:5173
```

### 3. Crear la base de datos

```bash
npm run db:migrate
```

### 4. Cargar datos iniciales (nodos)

```bash
npm run db:seed
```

### 5. Iniciar el servidor

```bash
npm run dev
```

El servidor corre en `http://localhost:4000`

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | checar si el servidor está up |
| GET | /api/nodos | listar todos los nodos |
| POST | /api/nodos | crear un nodo nuevo |
| POST | /api/metricas | guardar una métrica (simulator la usa) |
| GET | /api/metricas | listar métricas con filtros |
| GET | /api/metricas/recientes?nodoId=xxx | últimos 5 min para gráfica de línea |
| GET | /api/metricas/generacion?agrupacion=dia | datos para gráfica de barras |
| GET | /api/metricas/estado | distribución de nodos para dona |

Todos los endpoints (menos /health) requieren un token JWT válido de Auth0.

## Correr el simulador

El simulador manda datos aleatorios a la API cada 5 segundos:

```bash
node simulator.js <tu_access_token_de_auth0>
```

## Configurar Auth0

1. Ir a [auth0.com](https://auth0.com) y crear una cuenta
2. Crear un nuevo **Tenant**
3. En "Applications" → crear una **Single Page Application** (para el frontend)
4. En "APIs" → crear una nueva API con el audience `https://iot-energy-api`
5. Copiar el dominio y el audience al `.env`

## Eventos de Socket.io

| Evento | Cuándo se emite |
|--------|-----------------|
| `nueva_metrica` | Cada vez que llega una métrica nueva |
| `alerta_critica` | Solo cuando la criticidad es "error" |

El frontend se suscribe a estos eventos para actualizar las gráficas sin recargar la página.
