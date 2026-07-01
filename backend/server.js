require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 4000;

// create http server from express app so socket.io can attach to it
const httpServer = http.createServer(app);

// start socket.io on the same port as express and store the instance on
// the express app (not a module-level global) so it flows through the
// request lifecycle via req.app.get('io')
const io = initSocket(httpServer);
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
