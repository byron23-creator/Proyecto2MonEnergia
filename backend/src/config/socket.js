const { Server } = require('socket.io');
const { auth } = require('express-oauth2-jwt-bearer');

// store io instance here so we can attach it to req inside express
let io;

/**
 * Creates the socket.io server and attaches it to the http server.
 * We validate the JWT on the handshake so only auth users connect.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // validate jwt on socket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Auth token missing'));
    }

    // manually verify the bearer token using the same logic as express middleware
    // we just call the auth0 JWKS check by faking a tiny express-like flow
    const fakeReq = {
      headers: { authorization: `Bearer ${token}` },
    };
    const fakeRes = {};
    const checkJwt = auth({
      audience: process.env.AUTH0_AUDIENCE,
      issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    });

    checkJwt(fakeReq, fakeRes, (err) => {
      if (err) {
        return next(new Error('Invalid token'));
      }
      socket.user = fakeReq.auth;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Returns the io instance so services can emit events.
 * Throws if called before initSocket.
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized yet');
  }
  return io;
}

module.exports = { initSocket, getIO };
