import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import VorgangForm from "@/components/VorgangForm";

async function getData(kundeId: string, vorgangId: string) {
  const kunde = await prisma.kunde.findUnique({
    where: { id: kundeId },
    select: { id: true, vorname: true, nachname: true, firma: true },
  });

  const vorgang = await prisma.vorgang.findUnique({
    where: { id: vorgangId },
    include: {
      arbeiten: { orderBy: { position: "asc" } },
    },
  });

  const fahrzeuge = await prisma.fahrzeug.findMany({
    where: { kundeId },
    orderBy: { kennzeichen: "asc" },
  });

  const kunden = kunde ? [kunde] : [];

  return { kunde, vorgang, fahrzeuge, kunden };
}

export default async function VorgangBearbeitenPage({
  params,
}: {
  params: { id: string; vorgangId: string };
}) {
  const { kunde, vorgang, fahrzeuge, kunden } = await getData(params.id, params.vorgangId);

  if (!kunde || !vorgang || vorgang.kundeId !== kunde.id) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/kunden/${kunde.id}/vorgang/${vorgang.id}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
      >
        ← Zurück zum Vorgang
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Vorgang bearbeiten: {vorgang.vorgangsnummer}
      </h1>
      <VorgangForm
        vorgang={vorgang}
        kunden={kunden}
        fahrzeuge={fahrzeuge}
        preselectedKundeId={kunde.id}
        redirectUrl={`/kunden/${kunde.id}/vorgang/${vorgang.id}`}
      />
    </div>
  );
}
