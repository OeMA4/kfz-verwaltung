import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const ersatzteile = await prisma.ersatzteil.findMany({
      orderBy: { bezeichnung: "asc" },
      include: {
        _count: {
          select: {
            vorgangsErsatzteile: true,
          },
        },
      },
    })
    return NextResponse.json(ersatzteile)
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Ersatzteile" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const ersatzteil = await prisma.ersatzteil.create({
      data: {
        artikelnummer: data.artikelnummer,
        bezeichnung: data.bezeichnung,
        beschreibung: data.beschreibung || null,
        kategorie: data.kategorie || null,
        hersteller: data.hersteller || null,
        einkaufspreis: data.einkaufspreis ? parseFloat(data.einkaufspreis) : 0,
        verkaufspreis: data.verkaufspreis ? parseFloat(data.verkaufspreis) : 0,
        bestand: data.bestand ? parseInt(data.bestand) : 0,
        mindestbestand: data.mindestbestand ? parseInt(data.mindestbestand) : 0,
        lagerort: data.lagerort || null,
        fahrzeugMarken: data.fahrzeugMarken || null,
      },
    })

    return NextResponse.json(ersatzteil, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Artikelnummer bereits vergeben" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Ersatzteils" },
      { status: 500 }
    )
  }
}
