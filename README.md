# Proyecto 2 - Dashboard de Monitoreo de Energía IoT

Dashboard en tiempo real para monitoreo de nodos solares ficticios. Los nodos mandan datos cada 5 segundos, el backend los guarda en base de datos y los manda al dashboard por WebSockets sin necesidad de recargar la página.

<img width="1895" height="896" alt="Captura de pantalla 2026-05-21 a la(s) 10 00 54 p  m" src="https://github.com/user-attachments/assets/d9b76ce6-123a-4a47-9516-dd277c88bafb" />

<img width="1893" height="941" alt="Captura de pantalla 2026-05-21 a la(s) 9 59 24 p  m" src="https://github.com/user-attachments/assets/41b9a56d-4f14-411d-8f5c-e1ad1ef01100" />


## Arquitectura general

```
frontend (React)  ←──WebSocket──→  backend (Node.js/Express)  ←──→  SQLite (Prisma)
                  ←──REST API───→
                                                ↑
                                         simulator.js
                                    (manda datos cada 5s)
```

## Fases del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| I - Auth | Auth0 JWT en API y Socket | ✅ |
| II - API | Express 3 capas (Rutas/Controllers/Services) | ✅ |
| III - Tiempo Real | Socket.io con eventos | ✅ |
| IV - Simulador | simulator.js cada 5 segundos | ✅ |
| V - Frontend | Dashboard React con gráficas | ✅ |

## Estructura del proyecto

```
Proyecto 2/
├── backend/        # API REST + Socket.io server
└── frontend/       # Dashboard en React
```

## Cómo correr todo

### Prerequisitos

- Node.js 18+
- Cuenta en Auth0 (gratis)

### Paso 1 - Configurar Auth0

1. Crear tenant en [auth0.com](https://auth0.com)
2. Crear una **Single Page Application** (SPA)
   - Agregar `http://localhost:5173` en Allowed Callback URLs, Logout URLs y Web Origins
3. Crear una **API**
   - Identifier: `https://iot-energy-api`
4. Copiar los valores al `.env` de backend y frontend

### Paso 2 - Backend

```bash
cd backend
npm install
# editar .env con tus credenciales de Auth0
npm run db:migrate      # crea la base de datos SQLite
npm run db:seed         # carga los 4 nodos de prueba
npm run dev             # inicia el servidor en puerto 4000
```

### Paso 3 - Frontend

```bash
cd frontend
npm install
# editar .env con tus credenciales de Auth0
npm run dev             # inicia en http://localhost:5173
```

### Paso 4 - Correr el simulador (opcional pero recomendado)

Primero necesitas un access token de Auth0. Lo puedes obtener desde el Test tab de tu API en el dashboard de Auth0.

```bash
cd backend
node simulator.js <tu_access_token>
```

El simulador manda una métrica aleatoria cada 5 segundos a los 4 nodos registrados.

## Stack técnico

### Backend
- Node.js + Express
- Socket.io
- Prisma ORM + SQLite
- Auth0 (express-oauth2-jwt-bearer)

### Frontend
- React + Vite
- Recharts (gráficas)
- Socket.io-client
- Auth0 React SDK
- Axios

## Notas importantes

- Los `.env` de backend y frontend **no se suben al repositorio** (están en .gitignore)
- No se usan variables globales para el socket - el `io` instance se maneja dentro del ciclo de vida de Express y se pasa por props en React
- La base de datos SQLite se crea automáticamente al correr `npm run db:migrate`
- El archivo `prisma/dev.db` tampoco se sube al repo
