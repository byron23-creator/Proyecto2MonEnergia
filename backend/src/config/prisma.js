const { PrismaClient } = require('@prisma/client');
const path = require('path');

// use absolute path so the db file is always found no matter where node is run from
const dbPath = path.join(__dirname, '..', '..', 'prisma', 'dev.db');

// single prisma instance reused across the whole app
// this avoids opening too many db connections
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

module.exports = prisma;
