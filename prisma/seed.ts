import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starte Seeding...');

  // Lösche vorhandene Daten
  await prisma.reifenwechsel.deleteMany();
  await prisma.reifeneinlagerung.deleteMany();
  await prisma.kVPosition.deleteMany();
  await prisma.kostenvoranschlag.deleteMany();
  await prisma.vorgangsErsatzteil.deleteMany();
  await prisma.rechnungVorgang.deleteMany();
  await prisma.vorgangsArbeit.deleteMany();
  await prisma.vorgangMitarbeiter.deleteMany();
  await prisma.arbeitszeit.deleteMany();
  await prisma.vorgang.deleteMany();
  await prisma.rechnungsPosition.deleteMany();
  await prisma.rechnung.deleteMany();
  await prisma.kalenderEintrag.deleteMany();
  await prisma.ersatzteil.deleteMany();
  await prisma.fahrzeug.deleteMany();
  await prisma.abwesenheit.deleteMany();
  await prisma.mitarbeiterKapazitaet.deleteMany();
  await prisma.mitarbeiter.deleteMany();
  await prisma.kunde.deleteMany();

  // ============================================
  // MITARBEITER
  // ============================================
  const mitarbeiter1 = await prisma.mitarbeiter.create({
    data: {
      personalnummer: 'MA-001',
      vorname: 'Klaus',
      nachname: 'Meier',
      email: 'k.meier@werkstatt.de',
      telefon: '0170 1111111',
      rolle: 'meister',
      stundensatz: 55.0,
      aktiv: true,
      eintrittsdatum: new Date('2018-01-15'),
    },
  });

  const mitarbeiter2 = await prisma.mitarbeiter.create({
    data: {
      personalnummer: 'MA-002',
      vorname: 'Stefan',
      nachname: 'Braun',
      email: 's.braun@werkstatt.de',
      telefon: '0170 2222222',
      rolle: 'mechaniker',
      stundensatz: 45.0,
      aktiv: true,
      eintrittsdatum: new Date('2019-06-01'),
    },
  });

  const mitarbeiter3 = await prisma.mitarbeiter.create({
    data: {
      personalnummer: 'MA-003',
      vorname: 'Lisa',
      nachname: 'Wagner',
      email: 'l.wagner@werkstatt.de',
      rolle: 'buero',
      stundensatz: 35.0,
      aktiv: true,
      eintrittsdatum: new Date('2020-03-01'),
    },
  });

  const mitarbeiter4 = await prisma.mitarbeiter.create({
    data: {
      personalnummer: 'MA-004',
      vorname: 'Tim',
      nachname: 'Schulz',
      rolle: 'azubi',
      stundensatz: 15.0,
      aktiv: true,
      eintrittsdatum: new Date('2023-09-01'),
      notizen: 'Ausbildung zum KFZ-Mechatroniker, 2. Lehrjahr',
    },
  });

  console.log('Mitarbeiter erstellt');

  // ============================================
  // ERSATZTEILE
  // ============================================
  await prisma.ersatzteil.createMany({
    data: [
      {
        artikelnummer: 'OEL-5W30-5L',
        bezeichnung: 'Motoröl 5W-30 Longlife',
        beschreibung: 'Vollsynthetisches Motoröl für moderne Benzin- und Dieselmotoren',
        kategorie: 'oele',
        hersteller: 'Castrol',
        einkaufspreis: 32.50,
        verkaufspreis: 49.90,
        bestand: 25,
        mindestbestand: 10,
        lagerort: 'Regal A1',
        fahrzeugMarken: 'VW, Audi, Seat, Skoda, BMW, Mercedes',
      },
      {
        artikelnummer: 'OEL-0W20-5L',
        bezeichnung: 'Motoröl 0W-20 Hybrid',
        beschreibung: 'Speziell für Hybridfahrzeuge',
        kategorie: 'oele',
        hersteller: 'Mobil 1',
        einkaufspreis: 38.00,
        verkaufspreis: 59.90,
        bestand: 8,
        mindestbestand: 5,
        lagerort: 'Regal A1',
        fahrzeugMarken: 'Toyota, Honda, Lexus',
      },
      {
        artikelnummer: 'BRE-VW-GOLF-V',
        bezeichnung: 'Bremsbeläge vorne VW Golf',
        beschreibung: 'Bremsbeläge Vorderachse für VW Golf 7/8',
        kategorie: 'bremsen',
        hersteller: 'ATE',
        einkaufspreis: 45.00,
        verkaufspreis: 89.00,
        bestand: 12,
        mindestbestand: 6,
        lagerort: 'Regal B2',
        fahrzeugMarken: 'VW, Audi, Seat, Skoda',
      },
      {
        artikelnummer: 'BRE-BMW-3-V',
        bezeichnung: 'Bremsbeläge vorne BMW 3er',
        beschreibung: 'Bremsbeläge Vorderachse für BMW 3er (F30/G20)',
        kategorie: 'bremsen',
        hersteller: 'Brembo',
        einkaufspreis: 65.00,
        verkaufspreis: 129.00,
        bestand: 4,
        mindestbestand: 4,
        lagerort: 'Regal B2',
        fahrzeugMarken: 'BMW',
      },
      {
        artikelnummer: 'BRE-SCH-UNIV',
        bezeichnung: 'Bremsscheiben Set Universal',
        beschreibung: 'Bremsscheiben für verschiedene Modelle',
        kategorie: 'bremsen',
        hersteller: 'Zimmermann',
        einkaufspreis: 85.00,
        verkaufspreis: 159.00,
        bestand: 6,
        mindestbestand: 4,
        lagerort: 'Regal B3',
      },
      {
        artikelnummer: 'FIL-OEL-VW',
        bezeichnung: 'Ölfilter VW/Audi',
        beschreibung: 'Original-Ölfilter für VAG Motoren',
        kategorie: 'filter',
        hersteller: 'MANN',
        einkaufspreis: 8.50,
        verkaufspreis: 18.90,
        bestand: 35,
        mindestbestand: 15,
        lagerort: 'Regal C1',
        fahrzeugMarken: 'VW, Audi, Seat, Skoda',
      },
      {
        artikelnummer: 'FIL-LUFT-UNIV',
        bezeichnung: 'Luftfilter Universal',
        beschreibung: 'Luftfilter für diverse PKW',
        kategorie: 'filter',
        hersteller: 'Bosch',
        einkaufspreis: 12.00,
        verkaufspreis: 24.90,
        bestand: 20,
        mindestbestand: 10,
        lagerort: 'Regal C1',
      },
      {
        artikelnummer: 'FIL-INNEN-AKT',
        bezeichnung: 'Innenraumfilter Aktivkohle',
        kategorie: 'filter',
        hersteller: 'Bosch',
        einkaufspreis: 15.00,
        verkaufspreis: 32.90,
        bestand: 18,
        mindestbestand: 8,
        lagerort: 'Regal C2',
      },
      {
        artikelnummer: 'ZUE-KERZ-NGK',
        bezeichnung: 'Zündkerzen Set (4 Stück)',
        beschreibung: 'Iridium Zündkerzen',
        kategorie: 'motor',
        hersteller: 'NGK',
        einkaufspreis: 28.00,
        verkaufspreis: 54.90,
        bestand: 15,
        mindestbestand: 8,
        lagerort: 'Regal D1',
      },
      {
        artikelnummer: 'BAT-12V-60AH',
        bezeichnung: 'Starterbatterie 12V 60Ah',
        kategorie: 'elektrik',
        hersteller: 'Varta',
        einkaufspreis: 75.00,
        verkaufspreis: 129.00,
        bestand: 5,
        mindestbestand: 3,
        lagerort: 'Regal E1',
      },
      {
        artikelnummer: 'WISCH-UNIV-60',
        bezeichnung: 'Scheibenwischer 600mm',
        kategorie: 'karosserie',
        hersteller: 'Bosch',
        einkaufspreis: 8.00,
        verkaufspreis: 16.90,
        bestand: 25,
        mindestbestand: 10,
        lagerort: 'Regal F1',
      },
      {
        artikelnummer: 'KUEHL-G12-1L',
        bezeichnung: 'Kühlerfrostschutz G12+ 1L',
        kategorie: 'oele',
        hersteller: 'BASF',
        einkaufspreis: 6.50,
        verkaufspreis: 12.90,
        bestand: 30,
        mindestbestand: 15,
        lagerort: 'Regal A2',
      },
      {
        artikelnummer: 'BREMS-FL-DOT4',
        bezeichnung: 'Bremsflüssigkeit DOT 4 1L',
        kategorie: 'oele',
        hersteller: 'ATE',
        einkaufspreis: 7.00,
        verkaufspreis: 14.90,
        bestand: 20,
        mindestbestand: 10,
        lagerort: 'Regal A2',
      },
      {
        artikelnummer: 'STOSS-VA-GOLF',
        bezeichnung: 'Stoßdämpfer vorne Golf 7',
        kategorie: 'fahrwerk',
        hersteller: 'Bilstein',
        einkaufspreis: 95.00,
        verkaufspreis: 179.00,
        bestand: 2,
        mindestbestand: 2,
        lagerort: 'Regal G1',
        fahrzeugMarken: 'VW, Audi, Seat, Skoda',
      },
      {
        artikelnummer: 'KEIL-RIEMEN-6PK',
        bezeichnung: 'Keilrippenriemen 6PK1835',
        kategorie: 'motor',
        hersteller: 'Continental',
        einkaufspreis: 18.00,
        verkaufspreis: 34.90,
        bestand: 8,
        mindestbestand: 4,
        lagerort: 'Regal D2',
      },
    ],
  });

  console.log('Ersatzteile erstellt');

  // Kunde 1: Max Mustermann
  const kunde1 = await prisma.kunde.create({
    data: {
      anrede: 'Herr',
      vorname: 'Max',
      nachname: 'Mustermann',
      strasse: 'Hauptstraße',
      hausnummer: '123',
      plz: '12345',
      ort: 'Berlin',
      telefon: '030 12345678',
      mobil: '0170 1234567',
      email: 'max.mustermann@email.de',
      notizen: 'Stammkunde seit 2020',
    },
  });

  // Kunde 2: Erika Musterfrau
  const kunde2 = await prisma.kunde.create({
    data: {
      anrede: 'Frau',
      vorname: 'Erika',
      nachname: 'Musterfrau',
      strasse: 'Nebenstraße',
      hausnummer: '45a',
      plz: '12345',
      ort: 'Berlin',
      telefon: '030 87654321',
      email: 'erika.musterfrau@email.de',
    },
  });

  // Kunde 3: Firma Schmidt GmbH
  const kunde3 = await prisma.kunde.create({
    data: {
      vorname: 'Thomas',
      nachname: 'Schmidt',
      firma: 'Schmidt Transporte GmbH',
      strasse: 'Industrieweg',
      hausnummer: '10',
      plz: '12347',
      ort: 'Berlin',
      telefon: '030 55555555',
      email: 'info@schmidt-transporte.de',
      notizen: 'Firmenkunde - Flottenvertrag',
    },
  });

  // Kunde 4: Anna Müller
  const kunde4 = await prisma.kunde.create({
    data: {
      anrede: 'Frau',
      vorname: 'Anna',
      nachname: 'Müller',
      strasse: 'Gartenweg',
      hausnummer: '7',
      plz: '12346',
      ort: 'Potsdam',
      mobil: '0151 98765432',
      email: 'anna.mueller@web.de',
    },
  });

  // Kunde 5: Peter Weber
  const kunde5 = await prisma.kunde.create({
    data: {
      anrede: 'Herr',
      vorname: 'Peter',
      nachname: 'Weber',
      strasse: 'Waldstraße',
      hausnummer: '22',
      plz: '12348',
      ort: 'Berlin',
      telefon: '030 11111111',
      mobil: '0172 3333333',
      email: 'p.weber@gmx.de',
    },
  });

  console.log('Kunden erstellt');

  // Fahrzeuge für Kunde 1
  const fahrzeug1 = await prisma.fahrzeug.create({
    data: {
      kennzeichen: 'B-MM 1234',
      marke: 'Volkswagen',
      modell: 'Golf 8',
      baujahr: 2021,
      fahrgestellnr: 'WVWZZZ1KZMW123456',
      erstzulassung: new Date('2021-03-15'),
      naechsteHU: new Date('2025-03-15'),
      kilometerstand: 45000,
      farbe: 'Schwarz',
      kraftstoff: 'Benzin',
      kundeId: kunde1.id,
    },
  });

  const fahrzeug2 = await prisma.fahrzeug.create({
    data: {
      kennzeichen: 'B-MM 5678',
      marke: 'Audi',
      modell: 'A4 Avant',
      baujahr: 2019,
      fahrgestellnr: 'WAUZZZ8K9KA987654',
      erstzulassung: new Date('2019-07-20'),
      naechsteHU: new Date('2025-07-20'),
      kilometerstand: 78000,
      farbe: 'Silber',
      kraftstoff: 'Diesel',
      notizen: 'Firmenwagen der Ehefrau',
      kundeId: kunde1.id,
    },
  });

  // Fahrzeug für Kunde 2
  const fahrzeug3 = await prisma.fahrzeug.create({
    data: {
      kennzeichen: 'B-EM 999',
      marke: 'BMW',
      modell: '320i',
      baujahr: 2022,
      fahrgestellnr: 'WBA3A5C50FK111222',
      erstzulassung: new Date('2022-01-10'),
      naechsteHU: new Date('2026-01-10'),
      kilometerstand: 28000,
      farbe: 'Weiß',
      kraftstoff: 'Benzin',
      kundeId: kunde2.id,
    },
  });

  // Fahrzeuge für Firma Schmidt (Flottenfahrzeuge)
  const fahrzeug4 = await prisma.fahrzeug.create({
    data: {
      kennzeichen: 'B-ST 100',
      marke: 'Mercedes-Benz',
      modell: 'Sprinter 314',
      baujahr: 2020,
      kilometerstand: 125000,
      farbe: 'Weiß',
      kraftstoff: 'Diesel',
      notizen: 'Lieferfahrzeug 1',
      kundeId: kunde3.id,
    },
  });

  const fahrzeug5 = await prisma.fahrzeug.create({
    data: {
      kennzeichen: 'B-ST 101',
      marke: 'Mercedes-Benz',
      modell: 'Sprinter 314',
      baujahr: 2020,
      kilometerstand: 118000,
      farbe: 'Weiß',
      kraftstoff: 'Diesel',
      notizen: 'Lieferfahrzeug 2',
      kundeId: kunde3.id,
    },
  });

  const fahrzeug6 = await prisma.fahrzeug.create({
    data: {
      kennzeichen: 'B-ST 102',
      marke: 'Volkswagen',
      modell: 'Transporter T6',
      baujahr: 2021,
      kilometerstand: 89000,
      farbe: 'Blau',
      kraftstoff: 'Diesel',
      notizen: 'Kleintransporter',
      kundeId: kunde3.id,
    },
  });

  // Fahrzeug für Kunde 4
  const fahrzeug7 = await prisma.fahrzeug.create({
    data: {
      kennzeichen: 'P-AM 777',
      marke: 'Toyota',
      modell: 'Yaris Hybrid',
      baujahr: 2023,
      kilometerstand: 12000,
      farbe: 'Rot',
      kraftstoff: 'Hybrid',
      kundeId: kunde4.id,
    },
  });

  // Fahrzeug für Kunde 5
  const fahrzeug8 = await prisma.fahrzeug.create({
    data: {
      kennzeichen: 'B-PW 333',
      marke: 'Skoda',
      modell: 'Octavia Combi',
      baujahr: 2018,
      kilometerstand: 98000,
      farbe: 'Grau',
      kraftstoff: 'Diesel',
      kundeId: kunde5.id,
    },
  });

  console.log('Fahrzeuge erstellt');

  // Vorgänge
  const vorgang1 = await prisma.vorgang.create({
    data: {
      vorgangsnummer: 'V-2024-001',
      titel: 'Inspektion und Bremsenwechsel',
      beschreibung: 'Große Inspektion mit Ölwechsel, Bremsbeläge vorne erneuern',
      status: 'abgeschlossen',
      eingang: new Date('2024-10-28'),
      fertigstellung: new Date('2024-10-30'),
      kmStandEingang: 44800,
      kundeId: kunde1.id,
      fahrzeugId: fahrzeug1.id,
      arbeiten: {
        create: [
          {
            position: 1,
            beschreibung: 'Ölwechsel inkl. Öl 5W-30 (5 Liter)',
            status: 'erledigt',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 89.0,
            gesamtpreis: 89.0,
          },
          {
            position: 2,
            beschreibung: 'Ölfilter VW Original',
            status: 'erledigt',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 25.0,
            gesamtpreis: 25.0,
          },
          {
            position: 3,
            beschreibung: 'Bremsbeläge vorne (Satz)',
            status: 'erledigt',
            menge: 1,
            einheit: 'Satz',
            einzelpreis: 185.0,
            gesamtpreis: 185.0,
          },
          {
            position: 4,
            beschreibung: 'Arbeitszeit Bremsenwechsel',
            status: 'erledigt',
            menge: 1.5,
            einheit: 'Std',
            einzelpreis: 95.0,
            gesamtpreis: 142.5,
          },
          {
            position: 5,
            beschreibung: 'Fahrzeugcheck',
            status: 'erledigt',
            menge: 0.1,
            einheit: 'Std',
            einzelpreis: 85.0,
            gesamtpreis: 8.5,
          },
        ],
      },
    },
  });

  const vorgang2 = await prisma.vorgang.create({
    data: {
      vorgangsnummer: 'V-2024-002',
      titel: 'Große Inspektion Sprinter',
      beschreibung: 'Planmäßige Inspektion mit Bremsen hinten',
      status: 'abgeschlossen',
      eingang: new Date('2024-11-05'),
      fertigstellung: new Date('2024-11-08'),
      kmStandEingang: 124500,
      kundeId: kunde3.id,
      fahrzeugId: fahrzeug4.id,
      arbeiten: {
        create: [
          {
            position: 1,
            beschreibung: 'Große Inspektion Mercedes Sprinter',
            status: 'erledigt',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 450.0,
            gesamtpreis: 450.0,
          },
          {
            position: 2,
            beschreibung: 'Bremsscheiben hinten (Satz)',
            status: 'erledigt',
            menge: 1,
            einheit: 'Satz',
            einzelpreis: 320.0,
            gesamtpreis: 320.0,
          },
          {
            position: 3,
            beschreibung: 'Bremsbeläge hinten (Satz)',
            status: 'erledigt',
            menge: 1,
            einheit: 'Satz',
            einzelpreis: 145.0,
            gesamtpreis: 145.0,
          },
          {
            position: 4,
            beschreibung: 'Arbeitszeit',
            status: 'erledigt',
            menge: 3.5,
            einheit: 'Std',
            einzelpreis: 95.0,
            gesamtpreis: 332.5,
          },
        ],
      },
    },
  });

  const vorgang3 = await prisma.vorgang.create({
    data: {
      vorgangsnummer: 'V-2024-003',
      titel: 'Reifenwechsel und Einlagerung',
      beschreibung: 'Winterreifen aufziehen, Sommerreifen einlagern',
      status: 'abgeschlossen',
      eingang: new Date('2024-11-18'),
      fertigstellung: new Date('2024-11-18'),
      kmStandEingang: 27800,
      kundeId: kunde2.id,
      fahrzeugId: fahrzeug3.id,
      arbeiten: {
        create: [
          {
            position: 1,
            beschreibung: 'Reifenwechsel (4 Räder)',
            status: 'erledigt',
            menge: 4,
            einheit: 'Stk',
            einzelpreis: 15.0,
            gesamtpreis: 60.0,
          },
          {
            position: 2,
            beschreibung: 'Auswuchten',
            status: 'erledigt',
            menge: 4,
            einheit: 'Stk',
            einzelpreis: 8.0,
            gesamtpreis: 32.0,
          },
          {
            position: 3,
            beschreibung: 'Reifeneinlagerung (Saison)',
            status: 'erledigt',
            menge: 1,
            einheit: 'Saison',
            einzelpreis: 45.0,
            gesamtpreis: 45.0,
          },
          {
            position: 4,
            beschreibung: 'Ventile neu',
            status: 'erledigt',
            menge: 4,
            einheit: 'Stk',
            einzelpreis: 4.5,
            gesamtpreis: 18.0,
          },
        ],
      },
    },
  });

  // Offener Vorgang - in Bearbeitung
  const vorgang4 = await prisma.vorgang.create({
    data: {
      vorgangsnummer: 'V-2024-004',
      titel: 'Klimaanlage defekt',
      beschreibung: 'Klimaanlage kühlt nicht mehr, Diagnose erforderlich',
      status: 'in_bearbeitung',
      eingang: new Date('2024-11-25'),
      kmStandEingang: 45200,
      notizen: 'Kunde berichtet von merkwürdigem Geräusch',
      kundeId: kunde1.id,
      fahrzeugId: fahrzeug1.id,
      arbeiten: {
        create: [
          {
            position: 1,
            beschreibung: 'Klimaanlagen-Diagnose',
            status: 'in_bearbeitung',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 75.0,
            gesamtpreis: 75.0,
          },
          {
            position: 2,
            beschreibung: 'Kältemittel R134a nachfüllen',
            status: 'offen',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 120.0,
            gesamtpreis: 120.0,
          },
        ],
      },
    },
  });

  // Neuer offener Vorgang
  const vorgang5 = await prisma.vorgang.create({
    data: {
      vorgangsnummer: 'V-2024-005',
      titel: 'TÜV Vorbereitung',
      beschreibung: 'Fahrzeug für HU/AU vorbereiten',
      status: 'offen',
      eingang: new Date('2024-11-26'),
      kmStandEingang: 11800,
      kundeId: kunde4.id,
      fahrzeugId: fahrzeug7.id,
      arbeiten: {
        create: [
          {
            position: 1,
            beschreibung: 'HU/AU Vorbereitung',
            status: 'offen',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 49.0,
            gesamtpreis: 49.0,
          },
          {
            position: 2,
            beschreibung: 'Lichttest',
            status: 'offen',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 15.0,
            gesamtpreis: 15.0,
          },
          {
            position: 3,
            beschreibung: 'Bremsentest',
            status: 'offen',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 25.0,
            gesamtpreis: 25.0,
          },
        ],
      },
    },
  });

  // Noch ein offener Vorgang
  const vorgang6 = await prisma.vorgang.create({
    data: {
      vorgangsnummer: 'V-2024-006',
      titel: 'Getriebe ruckelt',
      beschreibung: 'Automatikgetriebe ruckelt beim Schalten',
      status: 'offen',
      eingang: new Date('2024-11-27'),
      kmStandEingang: 97500,
      notizen: 'Termin für nächste Woche vereinbart',
      kundeId: kunde5.id,
      fahrzeugId: fahrzeug8.id,
      arbeiten: {
        create: [
          {
            position: 1,
            beschreibung: 'Getriebe-Diagnose mit Auslesegerät',
            status: 'offen',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 95.0,
            gesamtpreis: 95.0,
          },
        ],
      },
    },
  });

  console.log('Vorgänge erstellt');

  // Rechnungen
  const rechnung1 = await prisma.rechnung.create({
    data: {
      rechnungsnummer: '2024-001',
      datum: new Date('2024-11-01'),
      faelligBis: new Date('2024-11-15'),
      status: 'bezahlt',
      nettoGesamt: 450.0,
      mwstSatz: 19,
      mwstBetrag: 85.5,
      bruttoGesamt: 535.5,
      kundeId: kunde1.id,
      fahrzeugId: fahrzeug1.id,
      positionen: {
        create: [
          {
            position: 1,
            beschreibung: 'Ölwechsel inkl. Öl 5W-30 (5 Liter)',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 89.0,
            gesamtpreis: 89.0,
          },
          {
            position: 2,
            beschreibung: 'Ölfilter VW Original',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 25.0,
            gesamtpreis: 25.0,
          },
          {
            position: 3,
            beschreibung: 'Bremsbeläge vorne (Satz)',
            menge: 1,
            einheit: 'Satz',
            einzelpreis: 185.0,
            gesamtpreis: 185.0,
          },
          {
            position: 4,
            beschreibung: 'Arbeitszeit Bremsenwechsel',
            menge: 1.5,
            einheit: 'Std',
            einzelpreis: 95.0,
            gesamtpreis: 142.5,
          },
          {
            position: 5,
            beschreibung: 'Fahrzeugcheck',
            menge: 0.1,
            einheit: 'Std',
            einzelpreis: 85.0,
            gesamtpreis: 8.5,
          },
        ],
      },
    },
  });

  const rechnung2 = await prisma.rechnung.create({
    data: {
      rechnungsnummer: '2024-002',
      datum: new Date('2024-11-10'),
      faelligBis: new Date('2024-11-24'),
      status: 'offen',
      nettoGesamt: 1250.0,
      mwstSatz: 19,
      mwstBetrag: 237.5,
      bruttoGesamt: 1487.5,
      kundeId: kunde3.id,
      fahrzeugId: fahrzeug4.id,
      notizen: 'Inspektion Sprinter #1',
      positionen: {
        create: [
          {
            position: 1,
            beschreibung: 'Große Inspektion Mercedes Sprinter',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 450.0,
            gesamtpreis: 450.0,
          },
          {
            position: 2,
            beschreibung: 'Bremsscheiben hinten (Satz)',
            menge: 1,
            einheit: 'Satz',
            einzelpreis: 320.0,
            gesamtpreis: 320.0,
          },
          {
            position: 3,
            beschreibung: 'Bremsbeläge hinten (Satz)',
            menge: 1,
            einheit: 'Satz',
            einzelpreis: 145.0,
            gesamtpreis: 145.0,
          },
          {
            position: 4,
            beschreibung: 'Arbeitszeit',
            menge: 3.5,
            einheit: 'Std',
            einzelpreis: 95.0,
            gesamtpreis: 332.5,
          },
          {
            position: 5,
            beschreibung: 'Sonstiges Material',
            menge: 1,
            einheit: 'Pausch.',
            einzelpreis: 2.5,
            gesamtpreis: 2.5,
          },
        ],
      },
    },
  });

  const rechnung3 = await prisma.rechnung.create({
    data: {
      rechnungsnummer: '2024-003',
      datum: new Date('2024-11-20'),
      faelligBis: new Date('2024-12-04'),
      status: 'offen',
      nettoGesamt: 195.0,
      mwstSatz: 19,
      mwstBetrag: 37.05,
      bruttoGesamt: 232.05,
      kundeId: kunde2.id,
      fahrzeugId: fahrzeug3.id,
      positionen: {
        create: [
          {
            position: 1,
            beschreibung: 'Reifenwechsel (4 Räder)',
            menge: 4,
            einheit: 'Stk',
            einzelpreis: 15.0,
            gesamtpreis: 60.0,
          },
          {
            position: 2,
            beschreibung: 'Auswuchten',
            menge: 4,
            einheit: 'Stk',
            einzelpreis: 8.0,
            gesamtpreis: 32.0,
          },
          {
            position: 3,
            beschreibung: 'Reifeneinlagerung (Saison)',
            menge: 1,
            einheit: 'Saison',
            einzelpreis: 45.0,
            gesamtpreis: 45.0,
          },
          {
            position: 4,
            beschreibung: 'Ventile neu',
            menge: 4,
            einheit: 'Stk',
            einzelpreis: 4.5,
            gesamtpreis: 18.0,
          },
          {
            position: 5,
            beschreibung: 'Fahrzeugwäsche',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 40.0,
            gesamtpreis: 40.0,
          },
        ],
      },
    },
  });

  console.log('Rechnungen erstellt');

  // Verknüpfungen zwischen Rechnungen und Vorgängen erstellen
  await prisma.rechnungVorgang.create({
    data: {
      rechnungId: rechnung1.id,
      vorgangId: vorgang1.id,
    },
  });

  await prisma.rechnungVorgang.create({
    data: {
      rechnungId: rechnung2.id,
      vorgangId: vorgang2.id,
    },
  });

  await prisma.rechnungVorgang.create({
    data: {
      rechnungId: rechnung3.id,
      vorgangId: vorgang3.id,
    },
  });

  // Vorgänge als abgerechnet markieren
  await prisma.vorgang.updateMany({
    where: {
      id: { in: [vorgang1.id, vorgang2.id, vorgang3.id] },
    },
    data: { status: 'abgerechnet' },
  });

  console.log('Rechnung-Vorgang Verknüpfungen erstellt');

  // Kalendereinträge
  const heute = new Date();
  const morgen = new Date(heute);
  morgen.setDate(morgen.getDate() + 1);
  const uebermorgen = new Date(heute);
  uebermorgen.setDate(uebermorgen.getDate() + 2);
  const inDreiTagen = new Date(heute);
  inDreiTagen.setDate(inDreiTagen.getDate() + 3);
  const inEinerWoche = new Date(heute);
  inEinerWoche.setDate(inEinerWoche.getDate() + 7);

  await prisma.kalenderEintrag.create({
    data: {
      titel: 'Golf Rückgabe - Mustermann',
      beschreibung: 'VW Golf nach Bremsenwechsel',
      startDatum: new Date(morgen.setHours(10, 0, 0, 0)),
      endDatum: new Date(morgen.setHours(11, 0, 0, 0)),
      typ: 'rueckgabe',
      farbe: '#3b82f6',
      fahrzeugId: fahrzeug1.id,
    },
  });

  await prisma.kalenderEintrag.create({
    data: {
      titel: 'Sprinter Abholung - Schmidt',
      beschreibung: 'Nach Inspektion',
      startDatum: new Date(morgen.setHours(14, 0, 0, 0)),
      endDatum: new Date(morgen.setHours(15, 0, 0, 0)),
      typ: 'rueckgabe',
      farbe: '#22c55e',
      fahrzeugId: fahrzeug4.id,
    },
  });

  await prisma.kalenderEintrag.create({
    data: {
      titel: 'BMW Rückgabe - Musterfrau',
      beschreibung: 'Reifenwechsel erledigt',
      startDatum: new Date(uebermorgen.setHours(9, 0, 0, 0)),
      endDatum: new Date(uebermorgen.setHours(10, 0, 0, 0)),
      typ: 'rueckgabe',
      farbe: '#3b82f6',
      fahrzeugId: fahrzeug3.id,
    },
  });

  await prisma.kalenderEintrag.create({
    data: {
      titel: 'TÜV Termin - Yaris',
      beschreibung: 'HU/AU beim TÜV',
      startDatum: new Date(inDreiTagen.setHours(8, 30, 0, 0)),
      endDatum: new Date(inDreiTagen.setHours(10, 30, 0, 0)),
      typ: 'termin',
      farbe: '#f59e0b',
      fahrzeugId: fahrzeug7.id,
    },
  });

  await prisma.kalenderEintrag.create({
    data: {
      titel: 'Sprinter #2 Inspektion',
      beschreibung: 'Planmäßige Inspektion Schmidt Transporte',
      startDatum: new Date(inEinerWoche.setHours(8, 0, 0, 0)),
      endDatum: new Date(inEinerWoche.setHours(17, 0, 0, 0)),
      typ: 'termin',
      farbe: '#8b5cf6',
      fahrzeugId: fahrzeug5.id,
    },
  });

  await prisma.kalenderEintrag.create({
    data: {
      titel: 'HU Erinnerung - Audi A4',
      beschreibung: 'HU läuft in 2 Monaten ab',
      startDatum: new Date(inEinerWoche.setHours(9, 0, 0, 0)),
      endDatum: new Date(inEinerWoche.setHours(9, 30, 0, 0)),
      typ: 'erinnerung',
      farbe: '#ef4444',
      fahrzeugId: fahrzeug2.id,
    },
  });

  console.log('Kalendereinträge erstellt');

  // ============================================
  // REIFENEINLAGERUNGEN
  // ============================================
  await prisma.reifeneinlagerung.create({
    data: {
      lagerplatznummer: 'R-001-A',
      reifenTyp: 'sommer',
      hersteller: 'Continental',
      modell: 'PremiumContact 6',
      groesse: '225/45 R17',
      dot: '2023',
      profiltiefe: 5.5,
      zustand: 'gut',
      eingelagertAm: new Date('2024-10-15'),
      naechsterWechsel: new Date('2025-04-01'),
      anzahl: 4,
      mitFelgen: true,
      felgenTyp: 'alu',
      notizen: 'Alufelgen 17 Zoll Original BMW',
      fahrzeugId: fahrzeug3.id,
      kundeId: kunde2.id,
    },
  });

  await prisma.reifeneinlagerung.create({
    data: {
      lagerplatznummer: 'R-002-A',
      reifenTyp: 'sommer',
      hersteller: 'Michelin',
      modell: 'Primacy 4',
      groesse: '205/55 R16',
      dot: '2022',
      profiltiefe: 4.2,
      zustand: 'mittel',
      eingelagertAm: new Date('2024-11-01'),
      naechsterWechsel: new Date('2025-04-15'),
      anzahl: 4,
      mitFelgen: true,
      felgenTyp: 'stahl',
      fahrzeugId: fahrzeug1.id,
      kundeId: kunde1.id,
    },
  });

  await prisma.reifeneinlagerung.create({
    data: {
      lagerplatznummer: 'R-003-B',
      reifenTyp: 'winter',
      hersteller: 'Dunlop',
      modell: 'Winter Sport 5',
      groesse: '195/65 R15',
      dot: '2021',
      profiltiefe: 3.8,
      zustand: 'mittel',
      eingelagertAm: new Date('2024-04-10'),
      naechsterWechsel: new Date('2024-11-01'),
      anzahl: 4,
      mitFelgen: false,
      notizen: 'Ohne Felgen - nur Reifen',
      fahrzeugId: fahrzeug7.id,
      kundeId: kunde4.id,
    },
  });

  await prisma.reifeneinlagerung.create({
    data: {
      lagerplatznummer: 'R-004-B',
      reifenTyp: 'sommer',
      hersteller: 'Goodyear',
      modell: 'EfficientGrip',
      groesse: '235/65 R16C',
      dot: '2023',
      profiltiefe: 6.5,
      zustand: 'gut',
      eingelagertAm: new Date('2024-10-20'),
      naechsterWechsel: new Date('2025-04-01'),
      anzahl: 4,
      mitFelgen: true,
      felgenTyp: 'stahl',
      notizen: 'Sprinter Sommerreifen',
      fahrzeugId: fahrzeug4.id,
      kundeId: kunde3.id,
    },
  });

  console.log('Reifeneinlagerungen erstellt');

  // ============================================
  // KOSTENVORANSCHLÄGE
  // ============================================
  await prisma.kostenvoranschlag.create({
    data: {
      kvNummer: 'KV-2024-001',
      titel: 'Zahnriemenwechsel Audi A4',
      beschreibung: 'Zahnriemenwechsel inkl. Wasserpumpe und Spannrolle',
      status: 'gesendet',
      gueltigBis: new Date('2024-12-15'),
      nettoGesamt: 850.00,
      mwstSatz: 19,
      mwstBetrag: 161.50,
      bruttoGesamt: 1011.50,
      kundeId: kunde1.id,
      fahrzeugId: fahrzeug2.id,
      positionen: {
        create: [
          {
            position: 1,
            typ: 'ersatzteil',
            beschreibung: 'Zahnriemensatz komplett',
            menge: 1,
            einheit: 'Satz',
            einzelpreis: 320.00,
            gesamtpreis: 320.00,
          },
          {
            position: 2,
            typ: 'ersatzteil',
            beschreibung: 'Wasserpumpe',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 180.00,
            gesamtpreis: 180.00,
          },
          {
            position: 3,
            typ: 'ersatzteil',
            beschreibung: 'Kühlmittel',
            menge: 5,
            einheit: 'Liter',
            einzelpreis: 12.00,
            gesamtpreis: 60.00,
          },
          {
            position: 4,
            typ: 'arbeit',
            beschreibung: 'Arbeitszeit Zahnriemenwechsel',
            menge: 4,
            einheit: 'Std',
            einzelpreis: 72.50,
            gesamtpreis: 290.00,
          },
        ],
      },
    },
  });

  await prisma.kostenvoranschlag.create({
    data: {
      kvNummer: 'KV-2024-002',
      titel: 'Klimaanlagenreparatur Golf',
      beschreibung: 'Kompressor und Kondensator tauschen',
      status: 'akzeptiert',
      gueltigBis: new Date('2024-12-01'),
      akzeptiertAm: new Date('2024-11-20'),
      nettoGesamt: 1250.00,
      mwstSatz: 19,
      mwstBetrag: 237.50,
      bruttoGesamt: 1487.50,
      kundeId: kunde1.id,
      fahrzeugId: fahrzeug1.id,
      vorgangId: vorgang4.id,
      positionen: {
        create: [
          {
            position: 1,
            typ: 'ersatzteil',
            beschreibung: 'Klimakompressor',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 650.00,
            gesamtpreis: 650.00,
          },
          {
            position: 2,
            typ: 'ersatzteil',
            beschreibung: 'Kondensator',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 280.00,
            gesamtpreis: 280.00,
          },
          {
            position: 3,
            typ: 'ersatzteil',
            beschreibung: 'Kältemittel R134a',
            menge: 1,
            einheit: 'Füllung',
            einzelpreis: 120.00,
            gesamtpreis: 120.00,
          },
          {
            position: 4,
            typ: 'arbeit',
            beschreibung: 'Demontage und Montage',
            menge: 2.5,
            einheit: 'Std',
            einzelpreis: 80.00,
            gesamtpreis: 200.00,
          },
        ],
      },
    },
  });

  await prisma.kostenvoranschlag.create({
    data: {
      kvNummer: 'KV-2024-003',
      titel: 'Getriebeölwechsel DSG',
      beschreibung: 'DSG-Getriebeöl und Filter wechseln',
      status: 'entwurf',
      gueltigBis: new Date('2024-12-31'),
      nettoGesamt: 380.00,
      mwstSatz: 19,
      mwstBetrag: 72.20,
      bruttoGesamt: 452.20,
      kundeId: kunde5.id,
      fahrzeugId: fahrzeug8.id,
      positionen: {
        create: [
          {
            position: 1,
            typ: 'ersatzteil',
            beschreibung: 'DSG-Getriebeöl 6 Liter',
            menge: 6,
            einheit: 'Liter',
            einzelpreis: 35.00,
            gesamtpreis: 210.00,
          },
          {
            position: 2,
            typ: 'ersatzteil',
            beschreibung: 'Getriebeölfilter',
            menge: 1,
            einheit: 'Stk',
            einzelpreis: 85.00,
            gesamtpreis: 85.00,
          },
          {
            position: 3,
            typ: 'arbeit',
            beschreibung: 'Ölwechsel mit Spülung',
            menge: 1,
            einheit: 'Std',
            einzelpreis: 85.00,
            gesamtpreis: 85.00,
          },
        ],
      },
    },
  });

  console.log('Kostenvoranschläge erstellt');
  console.log('Seeding abgeschlossen!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
