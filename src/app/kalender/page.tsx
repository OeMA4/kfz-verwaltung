import prisma from "@/lib/prisma";
import KalenderView from "@/components/KalenderView";

async function getKalenderEintraege() {
  return prisma.kalenderEintrag.findMany({
    include: {
      fahrzeug: {
        include: { kunde: true },
      },
    },
  });
}

async function getFahrzeuge() {
  return prisma.fahrzeug.findMany({
    include: { kunde: true },
    orderBy: { kennzeichen: "asc" },
  });
}

export default async function KalenderPage() {
  const [eintraege, fahrzeuge] = await Promise.all([
    getKalenderEintraege(),
    getFahrzeuge(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kalender</h1>
      <KalenderView initialEintraege={eintraege} fahrzeuge={fahrzeuge} />
    </div>
  );
}
