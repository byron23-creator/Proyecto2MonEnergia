const { PrismaClient } = require('@prisma/client');

// single prisma instance reused across the whole app
// this avoids opening too many db connections
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});

module.exports = prisma;
