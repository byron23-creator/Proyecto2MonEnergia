const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

/**
 * Creates the socket.io server and attaches it to the http server.
 * We validate the JWT on the handshake so only auth users connect.
 * No module-level state: the caller (server.js) stores the returned
 * instance on `app` (app.set('io', io)) so it travels through the
 * Express request lifecycle instead of living in a global variable.
 */
function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // fetch/cache Auth0's signing keys - used to verify the JWT signature below
  const jwks = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
  });

  function getSigningKey(header, callback) {
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      callback(null, key.getPublicKey());
    });
  }

  // validate jwt on socket handshake against Auth0's JWKS directly -
  // avoids depending on express-oauth2-jwt-bearer, which requires a real
  // Express req/res and crashes when given a fake one
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Auth token missing'));
    }

    jwt.verify(
      token,
      getSigningKey,
      {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          return next(new Error('Invalid token'));
        }
        socket.user = decoded;
        next();
      }
    );
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = { initSocket };
