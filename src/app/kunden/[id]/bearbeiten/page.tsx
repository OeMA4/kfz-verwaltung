import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import KundeForm from "@/components/KundeForm";

async function getKunde(id: string) {
  return prisma.kunde.findUnique({ where: { id } });
}

export default async function KundeBearbeitenPage({
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Kunde bearbeiten
      </h1>
      <KundeForm kunde={kunde} />
    </div>
  );
}
