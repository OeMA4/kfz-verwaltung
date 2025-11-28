import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import FahrzeugForm from "@/components/FahrzeugForm";

async function getKunde(id: string) {
  return prisma.kunde.findUnique({
    where: { id },
    select: { id: true, vorname: true, nachname: true, firma: true },
  });
}

export default async function NeuesFahrzeugPage({
  params,
}: {
  params: { id: string };
}) {
  const kunde = await getKunde(params.id);

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
        Neues Fahrzeug für {kunde.firma || `${kunde.vorname} ${kunde.nachname}`}
      </h1>
      <FahrzeugForm
        kundeId={kunde.id}
        redirectUrl={`/kunden/${kunde.id}`}
      />
    </div>
  );
}
