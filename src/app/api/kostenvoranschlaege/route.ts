import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const kostenvoranschlaege = await prisma.kostenvoranschlag.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        kunde: true,
        fahrzeug: true,
        vorgang: true,
        positionen: true,
      },
    })
    return NextResponse.json(kostenvoranschlaege)
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Kostenvoranschläge" },
      { status: 500 }
    )
  }
}

// Generiert eine neue KV-Nummer im Format KV-YYYY-XXXX
async function generateKVNummer(): Promise<string> {
  const jahr = new Date().getFullYear()
  const prefix = `KV-${jahr}-`

  const letzterKV = await prisma.kostenvoranschlag.findFirst({
    where: {
      kvNummer: {
        startsWith: prefix,
      },
    },
    orderBy: {
      kvNummer: "desc",
    },
  })

  let nummer = 1
  if (letzterKV) {
    const letzteNummer = parseInt(letzterKV.kvNummer.replace(prefix, ""))
    if (!isNaN(letzteNummer)) {
      nummer = letzteNummer + 1
    }
  }

  return `${prefix}${nummer.toString().padStart(4, "0")}`
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const kvNummer = await generateKVNummer()

    // Positionen verarbeiten und Gesamtbeträge berechnen
    const positionen = data.positionen || []
    let nettoGesamt = 0

    const positionenData = positionen.map((pos: any, index: number) => {
      const einzelpreis = parseFloat(pos.einzelpreis) || 0
      const menge = parseFloat(pos.menge) || 1
      const gesamtpreis = einzelpreis * menge
      nettoGesamt += gesamtpreis

      return {
        position: index + 1,
        typ: pos.typ || "arbeit",
        beschreibung: pos.beschreibung,
        menge: menge,
        einheit: pos.einheit || "Stk",
        einzelpreis: einzelpreis,
        gesamtpreis: gesamtpreis,
      }
    })

    const mwstSatz = parseFloat(data.mwstSatz) || 19
    const mwstBetrag = nettoGesamt * (mwstSatz / 100)
    const bruttoGesamt = nettoGesamt + mwstBetrag

    const kostenvoranschlag = await prisma.kostenvoranschlag.create({
      data: {
        kvNummer: kvNummer,
        titel: data.titel,
        beschreibung: data.beschreibung || null,
        status: data.status || "entwurf",
        gueltigBis: data.gueltigBis ? new Date(data.gueltigBis) : null,
        nettoGesamt: nettoGesamt,
        mwstSatz: mwstSatz,
        mwstBetrag: mwstBetrag,
        bruttoGesamt: bruttoGesamt,
        notizen: data.notizen || null,
        kundeId: data.kundeId,
        fahrzeugId: data.fahrzeugId || null,
        vorgangId: data.vorgangId || null,
        positionen: {
          create: positionenData,
        },
      },
      include: {
        kunde: true,
        fahrzeug: true,
        positionen: true,
      },
    })

    return NextResponse.json(kostenvoranschlag, { status: 201 })
  } catch (error: any) {
    console.error("Fehler beim Erstellen des Kostenvoranschlags:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "KV-Nummer bereits vorhanden" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Kostenvoranschlags" },
      { status: 500 }
    )
  }
}
