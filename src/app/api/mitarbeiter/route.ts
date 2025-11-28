import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const mitarbeiter = await prisma.mitarbeiter.findMany({
      orderBy: { nachname: "asc" },
      include: {
        _count: {
          select: {
            arbeitszeiten: true,
            vorgaenge: true,
          },
        },
      },
    })
    return NextResponse.json(mitarbeiter)
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Mitarbeiter" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const mitarbeiter = await prisma.mitarbeiter.create({
      data: {
        personalnummer: data.personalnummer,
        vorname: data.vorname,
        nachname: data.nachname,
        email: data.email || null,
        telefon: data.telefon || null,
        rolle: data.rolle || "mechaniker",
        stundensatz: data.stundensatz ? parseFloat(data.stundensatz) : 0,
        aktiv: data.aktiv !== false,
        eintrittsdatum: data.eintrittsdatum ? new Date(data.eintrittsdatum) : new Date(),
        notizen: data.notizen || null,
      },
    })

    return NextResponse.json(mitarbeiter, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Personalnummer bereits vergeben" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Mitarbeiters" },
      { status: 500 }
    )
  }
}
