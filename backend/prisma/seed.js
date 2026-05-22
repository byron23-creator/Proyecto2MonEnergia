const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// seed some initial nodes so the simulator has real DB nodes to reference
async function main() {
  console.log('Seeding nodos...');

  const nodos = [
    { id: 'node-mixco-01', nombre: 'Inversor Central Mixco', ubicacion: 'Techo A1 - Mixco', version_fw: '1.2.3' },
    { id: 'node-zona10-02', nombre: 'Panel Zona 10', ubicacion: 'Azotea Zona 10', version_fw: '1.1.0' },
    { id: 'node-antigua-03', nombre: 'Sistema Antigua', ubicacion: 'Finca Santa Lucia - Antigua', version_fw: '2.0.1' },
    { id: 'node-xela-04', nombre: 'Inversor Xela Norte', ubicacion: 'Bodega Norte - Xela', version_fw: '1.3.5' },
  ];

  for (const nodo of nodos) {
    // upsert so we can run seed multiple times without duplicates
    await prisma.nodo.upsert({
      where: { id: nodo.id },
      update: {},
      create: nodo,
    });
    console.log(`  - Nodo creado: ${nodo.nombre}`);
  }

  console.log('Seed completado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
