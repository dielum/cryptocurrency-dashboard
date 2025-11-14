-- CreateTable
CREATE TABLE "crypto_pairs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "prices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pairId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "volume" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prices_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "crypto_pairs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hourly_averages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pairId" TEXT NOT NULL,
    "hour" DATETIME NOT NULL,
    "average" REAL NOT NULL,
    "high" REAL NOT NULL,
    "low" REAL NOT NULL,
    "count" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hourly_averages_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "crypto_pairs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "crypto_pairs_symbol_key" ON "crypto_pairs"("symbol");

-- CreateIndex
CREATE INDEX "idx_pair_timestamp" ON "prices"("pairId", "timestamp");

-- CreateIndex
CREATE INDEX "idx_timestamp" ON "prices"("timestamp");

-- CreateIndex
CREATE INDEX "idx_pair_hour" ON "hourly_averages"("pairId", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "hourly_averages_pairId_hour_key" ON "hourly_averages"("pairId", "hour");
