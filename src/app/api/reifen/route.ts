import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const reifeneinlagerungen = await prisma.reifeneinlagerung.findMany({
      orderBy: { lagerplatznummer: "asc" },
      include: {
        fahrzeug: true,
        kunde: true,
        wechselHistorie: {
          orderBy: { datum: "desc" },
          take: 1,
        },
      },
    })
    return NextResponse.json(reifeneinlagerungen)
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Reifeneinlagerungen" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const reifeneinlagerung = await prisma.reifeneinlagerung.create({
      data: {
        lagerplatznummer: data.lagerplatznummer,
        reifenTyp: data.reifenTyp,
        hersteller: data.hersteller || null,
        modell: data.modell || null,
        groesse: data.groesse || null,
        dot: data.dot || null,
        profiltiefe: data.profiltiefe ? parseFloat(data.profiltiefe) : null,
        zustand: data.zustand || "gut",
        eingelagertAm: data.eingelagertAm ? new Date(data.eingelagertAm) : new Date(),
        naechsterWechsel: data.naechsterWechsel ? new Date(data.naechsterWechsel) : null,
        anzahl: data.anzahl ? parseInt(data.anzahl) : 4,
        mitFelgen: data.mitFelgen !== false,
        felgenTyp: data.felgenTyp || null,
        notizen: data.notizen || null,
        fahrzeugId: data.fahrzeugId,
        kundeId: data.kundeId,
      },
    })

    return NextResponse.json(reifeneinlagerung, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Lagerplatznummer bereits vergeben" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Reifeneinlagerung" },
      { status: 500 }
    )
  }
}
