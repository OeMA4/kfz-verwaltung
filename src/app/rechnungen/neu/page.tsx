import { Suspense } from "react";
import prisma from "@/lib/prisma";
import RechnungForm from "@/components/RechnungForm";

async function getKunden() {
  return prisma.kunde.findMany({
    orderBy: { nachname: "asc" },
    select: { id: true, vorname: true, nachname: true, firma: true },
  });
}

async function getFahrzeuge() {
  return prisma.fahrzeug.findMany({
    orderBy: { kennzeichen: "asc" },
    select: { id: true, kennzeichen: true, marke: true, modell: true, kundeId: true },
  });
}

async function getVorgaenge(kundeId?: string, fahrzeugId?: string) {
  const where: {
    status?: { in: string[] };
    kundeId?: string;
    fahrzeugId?: string;
  } = {
    status: { in: ["offen", "in_bearbeitung", "abgeschlossen"] },
  };

  if (kundeId) where.kundeId = kundeId;
  if (fahrzeugId) where.fahrzeugId = fahrzeugId;

  return prisma.vorgang.findMany({
    where,
    orderBy: { eingang: "desc" },
    include: {
      fahrzeug: true,
      kunde: true,
      arbeiten: {
        orderBy: { position: "asc" },
      },
      rechnungen: true,
    },
  });
}

async function getNextRechnungsnummer() {
  const lastRechnung = await prisma.rechnung.findFirst({
    orderBy: { rechnungsnummer: "desc" },
    select: { rechnungsnummer: true },
  });

  const year = new Date().getFullYear();
  if (!lastRechnung || !lastRechnung.rechnungsnummer.startsWith(`${year}-`)) {
    return `${year}-001`;
  }

  const lastNumber = parseInt(lastRechnung.rechnungsnummer.split("-")[1]);
  return `${year}-${String(lastNumber + 1).padStart(3, "0")}`;
}

export default async function NeueRechnungPage({
  searchParams,
}: {
  searchParams: { kunde?: string; fahrzeug?: string; vorgang?: string };
}) {
  const [kunden, fahrzeuge, vorgaenge, nextRechnungsnummer] = await Promise.all([
    getKunden(),
    getFahrzeuge(),
    getVorgaenge(searchParams.kunde, searchParams.fahrzeug),
    getNextRechnungsnummer(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Neue Rechnung</h1>
      <Suspense fallback={<div>Laden...</div>}>
        <RechnungForm
          kunden={kunden}
          fahrzeuge={fahrzeuge}
          vorgaenge={vorgaenge}
          nextRechnungsnummer={nextRechnungsnummer}
          preselectedKundeId={searchParams.kunde}
          preselectedFahrzeugId={searchParams.fahrzeug}
          preselectedVorgangIds={searchParams.vorgang ? [searchParams.vorgang] : []}
        />
      </Suspense>
    </div>
  );
}
