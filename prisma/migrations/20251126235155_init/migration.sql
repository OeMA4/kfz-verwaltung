-- CreateTable
CREATE TABLE "Kunde" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anrede" TEXT,
    "vorname" TEXT NOT NULL,
    "nachname" TEXT NOT NULL,
    "firma" TEXT,
    "strasse" TEXT NOT NULL,
    "hausnummer" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    "ort" TEXT NOT NULL,
    "telefon" TEXT,
    "mobil" TEXT,
    "email" TEXT,
    "notizen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Fahrzeug" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kennzeichen" TEXT NOT NULL,
    "marke" TEXT NOT NULL,
    "modell" TEXT NOT NULL,
    "baujahr" INTEGER,
    "fahrgestellnr" TEXT,
    "erstzulassung" DATETIME,
    "naechsteHU" DATETIME,
    "kilometerstand" INTEGER,
    "farbe" TEXT,
    "kraftstoff" TEXT,
    "notizen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kundeId" TEXT NOT NULL,
    CONSTRAINT "Fahrzeug_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rechnung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rechnungsnummer" TEXT NOT NULL,
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "faelligBis" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'offen',
    "notizen" TEXT,
    "nettoGesamt" REAL NOT NULL DEFAULT 0,
    "mwstSatz" REAL NOT NULL DEFAULT 19,
    "mwstBetrag" REAL NOT NULL DEFAULT 0,
    "bruttoGesamt" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kundeId" TEXT NOT NULL,
    "fahrzeugId" TEXT,
    CONSTRAINT "Rechnung_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rechnung_fahrzeugId_fkey" FOREIGN KEY ("fahrzeugId") REFERENCES "Fahrzeug" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RechnungsPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "position" INTEGER NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "menge" REAL NOT NULL DEFAULT 1,
    "einheit" TEXT NOT NULL DEFAULT 'Stk',
    "einzelpreis" REAL NOT NULL,
    "gesamtpreis" REAL NOT NULL,
    "rechnungId" TEXT NOT NULL,
    CONSTRAINT "RechnungsPosition_rechnungId_fkey" FOREIGN KEY ("rechnungId") REFERENCES "Rechnung" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KalenderEintrag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "startDatum" DATETIME NOT NULL,
    "endDatum" DATETIME NOT NULL,
    "ganztaegig" BOOLEAN NOT NULL DEFAULT false,
    "typ" TEXT NOT NULL DEFAULT 'rueckgabe',
    "farbe" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fahrzeugId" TEXT,
    CONSTRAINT "KalenderEintrag_fahrzeugId_fkey" FOREIGN KEY ("fahrzeugId") REFERENCES "Fahrzeug" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Rechnung_rechnungsnummer_key" ON "Rechnung"("rechnungsnummer");
