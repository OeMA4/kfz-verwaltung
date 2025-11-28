import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const eintraege = await prisma.kalenderEintrag.findMany({
      include: {
        fahrzeug: {
          include: { kunde: true },
        },
      },
      orderBy: { startDatum: "asc" },
    });
    return NextResponse.json(eintraege);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Kalendereinträge" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.titel || !data.startDatum || !data.endDatum) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const eintrag = await prisma.kalenderEintrag.create({
      data: {
        titel: data.titel,
        beschreibung: data.beschreibung,
        startDatum: new Date(data.startDatum),
        endDatum: new Date(data.endDatum),
        ganztaegig: data.ganztaegig || false,
        typ: data.typ || "rueckgabe",
        farbe: data.farbe,
        fahrzeugId: data.fahrzeugId || null,
      },
      include: {
        fahrzeug: {
          include: { kunde: true },
        },
      },
    });

    return NextResponse.json(eintrag, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Kalendereintrags" },
      { status: 500 }
    );
  }
}
