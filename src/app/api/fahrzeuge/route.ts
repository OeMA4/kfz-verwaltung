import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const fahrzeuge = await prisma.fahrzeug.findMany({
      orderBy: { kennzeichen: "asc" },
      include: { kunde: true },
    });
    return NextResponse.json(fahrzeuge);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Fahrzeuge" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.kennzeichen || !data.marke || !data.modell || !data.kundeId) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const fahrzeug = await prisma.fahrzeug.create({
      data: {
        kennzeichen: data.kennzeichen.toUpperCase(),
        marke: data.marke,
        modell: data.modell,
        baujahr: data.baujahr,
        fahrgestellnr: data.fahrgestellnr?.toUpperCase(),
        erstzulassung: data.erstzulassung ? new Date(data.erstzulassung) : null,
        naechsteHU: data.naechsteHU ? new Date(data.naechsteHU) : null,
        kilometerstand: data.kilometerstand,
        farbe: data.farbe,
        kraftstoff: data.kraftstoff,
        notizen: data.notizen,
        kundeId: data.kundeId,
      },
    });

    return NextResponse.json(fahrzeug, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Fahrzeugs" },
      { status: 500 }
    );
  }
}
