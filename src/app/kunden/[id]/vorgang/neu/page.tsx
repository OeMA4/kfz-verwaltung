import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import VorgangForm from "@/components/VorgangForm";

async function getData(kundeId: string, fahrzeugId?: string) {
  const kunde = await prisma.kunde.findUnique({
    where: { id: kundeId },
    select: { id: true, vorname: true, nachname: true, firma: true },
  });

  const fahrzeuge = await prisma.fahrzeug.findMany({
    where: { kundeId },
    orderBy: { kennzeichen: "asc" },
  });

  const kunden = kunde ? [kunde] : [];

  // Nächste Vorgangsnummer generieren
  const lastVorgang = await prisma.vorgang.findFirst({
    orderBy: { vorgangsnummer: "desc" },
    select: { vorgangsnummer: true },
  });

  const year = new Date().getFullYear();
  let nextVorgangsnummer = `V-${year}-001`;

  if (lastVorgang) {
    const match = lastVorgang.vorgangsnummer.match(/V-(\d{4})-(\d+)/);
    if (match) {
      const lastYear = parseInt(match[1]);
      const lastNumber = parseInt(match[2]);
      if (lastYear === year) {
        nextVorgangsnummer = `V-${year}-${String(lastNumber + 1).padStart(3, "0")}`;
      }
    }
  }

  return { kunde, fahrzeuge, kunden, nextVorgangsnummer, preselectedFahrzeugId: fahrzeugId };
}

export default async function NeuerVorgangPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { fahrzeug?: string };
}) {
  const { kunde, fahrzeuge, kunden, nextVorgangsnummer, preselectedFahrzeugId } = await getData(
    params.id,
    searchParams.fahrzeug
  );

  if (!kunde) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/kunden/${kunde.id}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
      >
        ← Zurück zu {kunde.vorname} {kunde.nachname}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Neuer Vorgang für {kunde.firma || `${kunde.vorname} ${kunde.nachname}`}
      </h1>
      <VorgangForm
        kunden={kunden}
        fahrzeuge={fahrzeuge}
        nextVorgangsnummer={nextVorgangsnummer}
        preselectedKundeId={kunde.id}
        preselectedFahrzeugId={preselectedFahrzeugId}
        redirectUrl={`/kunden/${kunde.id}`}
      />
    </div>
  );
}
