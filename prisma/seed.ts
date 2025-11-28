import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starte Seeding...');

  // Lösche vorhandene Daten
  await prisma.rechnungVorgang.deleteMany();
  await prisma.vorgangsArbeit.deleteMany();
  await prisma.vorgang.deleteMany();
  await prisma.rechnungsPosition.deleteMany();
  await prisma.rechnung.deleteMany();
  await prisma.kalenderEintrag.deleteMany();
  await prisma.fahrzeug.deleteMany();
  await prisma.kunde.deleteMany();

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
