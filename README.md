# KFZ-Meisterwerkstatt Verwaltungssystem

Ein modernes Verwaltungssystem für KFZ-Meisterwerkstätten zur Kunden- und Fahrzeugverwaltung, Auftragsverwaltung, Rechnungserstellung und Terminplanung.

## Features

### Kernfunktionen
- **Dashboard**: Übersicht über aktuelle Aufträge, offene Rechnungen, anstehende Termine und HU-Warnungen
- **Kundenverwaltung**: Anlegen, Bearbeiten und Löschen von Kunden mit allen relevanten Kontaktdaten
- **Fahrzeugverwaltung**: Verwaltung von Kundenfahrzeugen mit HU/AU-Terminen, Kilometerstand und Kraftstoffart
- **Auftragsverwaltung**: Komplette Werkstattaufträge mit Status-Tracking und Mitarbeiterzuordnung
- **Mitarbeiterverwaltung**: Team-Übersicht mit Rollen, Stundensätzen und Verfügbarkeit

### Finanzen
- **Rechnungserstellung**: Professionelle PDF-Rechnungen mit IBAN, Skonto und vollständiger Bankverbindung
- **Kostenvoranschläge**: Angebote erstellen mit Gültigkeitsdatum und Status-Tracking (Entwurf, Gesendet, Akzeptiert, Abgelehnt)
- **E-Mail-Versand**: Direkter Versand von Rechnungen und Kostenvoranschlägen per E-Mail

### Lager & Service
- **Ersatzteileverwaltung**: Lagerbestand mit Mindestbestand-Warnungen und Kategorien
- **Reifeneinlagerung**: Kundenreifen verwalten mit Lagerplatz, Profiltiefe und Wechseltermin-Erinnerungen

### Weitere Features
- **Kalender**: Übersicht über Fahrzeugrückgaben, Termine und Erinnerungen
- **HU/AU-Erinnerungen**: Automatische Warnungen bei fälligen Hauptuntersuchungen
- **Responsive Design**: Modernes UI mit shadcn/ui Komponenten

## Tech-Stack

- [Next.js 14](https://nextjs.org/) - React Framework mit App Router
- [Prisma](https://www.prisma.io/) - Datenbank ORM
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI Komponenten
- [TypeScript](https://www.typescriptlang.org/) - Typsicherheit
- [@react-pdf/renderer](https://react-pdf.org/) - PDF-Generierung
- [Nodemailer](https://nodemailer.com/) - E-Mail-Versand
- [Radix UI](https://www.radix-ui.com/) - Accessible UI Primitives

## Voraussetzungen

- Node.js 18+
- npm oder yarn

## Installation

```bash
# Repository klonen
git clone <repository-url>
cd kfz-werkstatt

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env

# Datenbank initialisieren
npx prisma migrate dev

# Testdaten laden
npx prisma db seed
```

## Entwicklung

```bash
# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Umgebungsvariablen

Erstellen Sie eine `.env` Datei mit folgenden Variablen:

```env
DATABASE_URL="file:./dev.db"

# E-Mail Konfiguration (optional für Entwicklung)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user@example.com"
SMTP_PASS="password"
SMTP_FROM="werkstatt@example.com"
```

## Datenbank

### Prisma Studio

Für eine grafische Oberfläche zur Datenbankverwaltung:

```bash
npx prisma studio
```

### Schema-Änderungen

Nach Änderungen am Prisma-Schema:

```bash
npx prisma migrate dev --name beschreibung
```

## Projektstruktur

```
├── prisma/
│   ├── schema.prisma      # Datenbank-Schema
│   └── seed.ts            # Testdaten
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── kunden/        # Kundenverwaltung
│   │   ├── fahrzeuge/     # Fahrzeugverwaltung
│   │   ├── auftraege/     # Auftragsverwaltung
│   │   ├── rechnungen/    # Rechnungsverwaltung
│   │   ├── kostenvoranschlaege/  # Kostenvoranschläge
│   │   ├── mitarbeiter/   # Mitarbeiterverwaltung
│   │   ├── ersatzteile/   # Ersatzteileverwaltung
│   │   ├── reifen/        # Reifeneinlagerung
│   │   └── kalender/      # Kalenderansicht
│   ├── components/        # React Komponenten
│   │   ├── ui/            # shadcn/ui Basis-Komponenten
│   │   └── layout/        # Layout-Komponenten (Sidebar, Header)
│   ├── config/            # Konfigurationsdateien
│   │   └── betrieb.ts     # Betriebsdaten (Name, IBAN, etc.)
│   └── lib/               # Hilfsfunktionen
│       ├── prisma.ts      # Prisma Client
│       ├── pdf.ts         # PDF-Generierung
│       ├── email.ts       # E-Mail-Versand
│       └── utils.ts       # Utility-Funktionen
└── public/                # Statische Dateien
```

## Konfiguration

### Betriebsdaten anpassen

Die Betriebsdaten (Firmenname, Adresse, Bankverbindung) können in `src/config/betrieb.ts` angepasst werden:

```typescript
export const betriebsConfig = {
  name: "Kfz-Meisterbetrieb Weiterstadt",
  strasse: "Im Rödling 9a",
  plz: "64331",
  ort: "Weiterstadt",
  telefon: "0173 2344338",
  email: "info@kfz-weiterstadt.de",
  bank: "Sparkasse Darmstadt",
  iban: "DE89 5085 0150 0000 1234 56",
  bic: "HELADEF1DAS",
  // ... weitere Einstellungen
}
```

## Screenshots

Die Anwendung bietet ein modernes, responsives Design mit:
- Dashboard mit Statistiken und Warnungen
- Übersichtliche Tabellen mit Filter- und Suchfunktionen
- Professionelle PDF-Rechnungen mit Firmenlogo-Bereich
- Kalenderansicht für Terminplanung

## Lizenz

Privat - Alle Rechte vorbehalten
