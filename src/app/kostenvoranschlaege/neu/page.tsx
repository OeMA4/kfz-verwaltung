import { Suspense } from "react"
import prisma from "@/lib/prisma"
import KostenvoranschlagForm from "@/components/KostenvoranschlagForm"

async function getKunden() {
  return prisma.kunde.findMany({
    orderBy: { nachname: "asc" },
    select: { id: true, vorname: true, nachname: true, firma: true },
  })
}

async function getFahrzeuge() {
  return prisma.fahrzeug.findMany({
    orderBy: { kennzeichen: "asc" },
    select: { id: true, kennzeichen: true, marke: true, modell: true, kundeId: true },
  })
}

export default async function NeuerKostenvoranschlagPage({
  searchParams,
}: {
  searchParams: { kunde?: string; fahrzeug?: string }
}) {
  const [kunden, fahrzeuge] = await Promise.all([
    getKunden(),
    getFahrzeuge(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Neuer Kostenvoranschlag</h1>
        <p className="text-muted-foreground">
          Erstellen Sie ein Angebot für einen Kunden
        </p>
      </div>
      <Suspense fallback={<div>Laden...</div>}>
        <KostenvoranschlagForm
          kunden={kunden}
          fahrzeuge={fahrzeuge}
          preselectedKundeId={searchParams.kunde}
          preselectedFahrzeugId={searchParams.fahrzeug}
        />
      </Suspense>
    </div>
  )
}
