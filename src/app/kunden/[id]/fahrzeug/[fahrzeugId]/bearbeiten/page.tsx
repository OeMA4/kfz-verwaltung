import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import FahrzeugForm from "@/components/FahrzeugForm";

async function getKundeAndFahrzeug(kundeId: string, fahrzeugId: string) {
  const kunde = await prisma.kunde.findUnique({
    where: { id: kundeId },
    select: { id: true, vorname: true, nachname: true, firma: true },
  });

  const fahrzeug = await prisma.fahrzeug.findUnique({
    where: { id: fahrzeugId },
  });

  return { kunde, fahrzeug };
}

export default async function FahrzeugBearbeitenPage({
  params,
}: {
  params: { id: string; fahrzeugId: string };
}) {
  const { kunde, fahrzeug } = await getKundeAndFahrzeug(params.id, params.fahrzeugId);

  if (!kunde || !fahrzeug || fahrzeug.kundeId !== kunde.id) {
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
        Fahrzeug bearbeiten: {fahrzeug.kennzeichen}
      </h1>
      <FahrzeugForm
        fahrzeug={fahrzeug}
        kundeId={kunde.id}
        redirectUrl={`/kunden/${kunde.id}`}
      />
    </div>
  );
}
