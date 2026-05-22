-- CreateTable
CREATE TABLE "Nodo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "version_fw" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MetricaLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nodo_id" TEXT NOT NULL,
    "vatios_generados" REAL NOT NULL,
    "voltaje" REAL NOT NULL,
    "status_code" INTEGER NOT NULL,
    "criticidad" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    CONSTRAINT "MetricaLog_nodo_id_fkey" FOREIGN KEY ("nodo_id") REFERENCES "Nodo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
