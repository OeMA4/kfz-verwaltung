import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fahrzeug = await prisma.fahrzeug.findUnique({
      where: { id: params.id },
      include: {
        kunde: true,
        rechnungen: { orderBy: { datum: "desc" } },
        kalenderEintraege: { orderBy: { startDatum: "desc" } },
      },
    });

    if (!fahrzeug) {
      return NextResponse.json(
        { error: "Fahrzeug nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(fahrzeug);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden des Fahrzeugs" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    if (!data.kennzeichen || !data.marke || !data.modell || !data.kundeId) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const fahrzeug = await prisma.fahrzeug.update({
      where: { id: params.id },
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

    return NextResponse.json(fahrzeug);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Fahrzeugs" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.fahrzeug.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Löschen des Fahrzeugs" },
      { status: 500 }
    );
  }
}
