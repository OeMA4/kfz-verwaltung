-- CreateTable
CREATE TABLE "Vorgang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vorgangsnummer" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offen',
    "eingang" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fertigstellung" DATETIME,
    "kmStandEingang" INTEGER,
    "notizen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kundeId" TEXT NOT NULL,
    "fahrzeugId" TEXT NOT NULL,
    CONSTRAINT "Vorgang_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vorgang_fahrzeugId_fkey" FOREIGN KEY ("fahrzeugId") REFERENCES "Fahrzeug" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VorgangsArbeit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "position" INTEGER NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offen',
    "menge" REAL NOT NULL DEFAULT 1,
    "einheit" TEXT NOT NULL DEFAULT 'Stk',
    "einzelpreis" REAL NOT NULL DEFAULT 0,
    "gesamtpreis" REAL NOT NULL DEFAULT 0,
    "notizen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "vorgangId" TEXT NOT NULL,
    CONSTRAINT "VorgangsArbeit_vorgangId_fkey" FOREIGN KEY ("vorgangId") REFERENCES "Vorgang" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RechnungVorgang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rechnungId" TEXT NOT NULL,
    "vorgangId" TEXT NOT NULL,
    CONSTRAINT "RechnungVorgang_rechnungId_fkey" FOREIGN KEY ("rechnungId") REFERENCES "Rechnung" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RechnungVorgang_vorgangId_fkey" FOREIGN KEY ("vorgangId") REFERENCES "Vorgang" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vorgang_vorgangsnummer_key" ON "Vorgang"("vorgangsnummer");

-- CreateIndex
CREATE UNIQUE INDEX "RechnungVorgang_rechnungId_vorgangId_key" ON "RechnungVorgang"("rechnungId", "vorgangId");
