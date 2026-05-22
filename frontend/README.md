# Frontend - IoT Energy Dashboard

Dashboard en React para monitoreo de energía solar en tiempo real. Se conecta al backend por API REST y por WebSockets para mostrar datos sin necesidad de recargar la página.

## Stack usado

- **React + Vite** - framework y build tool
- **Recharts** - librería para las gráficas
- **Socket.io-client** - para recibir eventos en tiempo real
- **Auth0 (auth0/auth0-react)** - autenticación
- **Axios** - para llamar a la API REST
- **date-fns** - para formatear fechas

## Estructura de carpetas

```
frontend/src/
├── components/
│   ├── LineChartRealtime.jsx   # gráfica de línea - últimos 5 min
│   ├── BarChartHistorico.jsx   # gráfica de barras - generación por día/mes
│   ├── DonutEstado.jsx         # dona - estado de nodos (online/offline/alerta)
│   ├── TablaLogs.jsx           # tabla con filtros avanzados
│   └── AlertaToast.jsx         # notificación cuando hay alerta crítica
├── hooks/
│   └── useSocket.js            # hook para conectar con socket.io
├── pages/
│   └── Dashboard.jsx           # página principal
├── services/
│   └── api.js                  # funciones para llamar al backend
├── App.jsx                     # ruteador simple (login vs dashboard)
├── main.jsx                    # entry point con Auth0Provider
└── index.css                   # estilos globales
```

## Cómo correrlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar el .env

```
VITE_AUTH0_DOMAIN=tu-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id-de-la-spa
VITE_AUTH0_AUDIENCE=https://iot-energy-api
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

Los valores de Auth0 los consigues en el dashboard de Auth0:
- Domain: está en Settings de tu tenant
- Client ID: está en la aplicación SPA que creaste
- Audience: el identifier de la API que creaste

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

## Componentes del Dashboard

### Gráfica de Línea (Tiempo Real)
Muestra los vatios generados en los últimos 5 minutos para el nodo seleccionado. Cada vez que el backend emite un evento `nueva_metrica`, se agrega un punto nuevo sin recargar.

### Gráfica de Barras (Histórica)
Comparativa de generación total. Se puede cambiar entre vista por día y por mes con los botones de toggle.

### Gráfica de Dona (Estado)
Muestra cuántos nodos están Online, Offline o en Alerta. Se actualiza automáticamente con cada evento de socket.

### Tabla de Logs
Historial completo con filtros:
- **Rango de fechas**: Hoy / Ayer / Último Mes
- **Criticidad**: Todos / Info / Warning / Error
- **Buscador**: por ID de nodo o ubicación
- Paginación de 20 registros por página

### Alertas Toast
Cuando llega un evento `alerta_critica` del socket, aparece un cuadro rojo en la esquina superior derecha. Se cierra solo después de 6 segundos.

## Notas

- El token de Auth0 se guarda en localStorage para que el interceptor de axios lo pueda usar
- El socket se conecta en el Dashboard y se pasa como prop a los componentes que lo necesitan
- Esto evita crear múltiples conexiones de socket innecesarias
