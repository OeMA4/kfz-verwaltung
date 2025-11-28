# KFZ-Meisterwerkstatt Verwaltungssystem

## Projektübersicht

Eine Webapp zur Verwaltung einer KFZ-Meisterwerkstatt. Das System ermöglicht die Verwaltung von Kunden, deren Fahrzeugen, automatisierte Rechnungserstellung mit PDF-Generierung und E-Mail-Versand sowie einen Kalender für Fahrzeugrückgaben.

## Tech-Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Datenbank**: SQLite (Entwicklung) / PostgreSQL (Produktion)
- **ORM**: Prisma
- **PDF-Generierung**: @react-pdf/renderer
- **E-Mail**: Nodemailer
- **Kalender**: react-big-calendar
- **Formulare**: React Hook Form + Zod Validierung

## Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── kunden/        # Kunden CRUD
│   │   ├── fahrzeuge/     # Fahrzeuge CRUD
│   │   ├── rechnungen/    # Rechnungen CRUD + PDF
│   │   ├── kalender/      # Kalender-Einträge
│   │   └── email/         # E-Mail Versand
│   ├── kunden/            # Kunden-Seiten
│   ├── fahrzeuge/         # Fahrzeuge-Seiten
│   ├── rechnungen/        # Rechnungen-Seiten
│   ├── kalender/          # Kalender-Ansicht
│   └── layout.tsx         # Root Layout
├── components/            # React Komponenten
│   ├── ui/               # Basis UI-Komponenten
│   ├── forms/            # Formular-Komponenten
│   └── kalender/         # Kalender-Komponenten
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma Client
│   ├── email.ts          # E-Mail Konfiguration
│   └── pdf.ts            # PDF Generierung
└── types/                 # TypeScript Types
```

## Datenbank-Schema

### Hauptentitäten

- **Kunde**: Name, Adresse, Kontaktdaten
- **Fahrzeug**: Kennzeichen, Marke, Modell, Baujahr, verknüpft mit Kunde
- **Rechnung**: Positionen, Beträge, Status, verknüpft mit Kunde/Fahrzeug
- **KalenderEintrag**: Datum, Uhrzeit, Beschreibung, Fahrzeugrückgabe

## Entwicklungs-Befehle

```bash
# Installation
npm install

# Datenbank migrieren
npx prisma migrate dev

# Testdaten laden
npx prisma db seed

# Entwicklungsserver starten
npm run dev

# Prisma Studio (Datenbank GUI)
npx prisma studio

# Build für Produktion
npm run build
```

## Umgebungsvariablen

```env
DATABASE_URL="file:./dev.db"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user@example.com"
SMTP_PASS="password"
SMTP_FROM="werkstatt@example.com"
```

## Wichtige Hinweise

- SQLite wird für Entwicklung verwendet, für Produktion PostgreSQL empfohlen
- E-Mail-Versand erfordert gültige SMTP-Konfiguration
- PDF-Rechnungen werden serverseitig generiert
- Alle Formulare haben clientseitige und serverseitige Validierung

## Coding Standards

- TypeScript strict mode aktiviert
- Prisma für alle Datenbankoperationen
- Server Actions für Formulare wo möglich
- Zod für Validierung
- Deutsche UI-Texte, englischer Code
