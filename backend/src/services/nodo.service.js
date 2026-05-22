const prisma = require('../config/prisma');

// get all nodes from db
async function getAllNodos() {
  return prisma.nodo.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

// get a single node by id
async function getNodoById(id) {
  return prisma.nodo.findUnique({ where: { id } });
}

// create a new node
async function createNodo(data) {
  return prisma.nodo.create({ data });
}

module.exports = { getAllNodos, getNodoById, createNodo };
