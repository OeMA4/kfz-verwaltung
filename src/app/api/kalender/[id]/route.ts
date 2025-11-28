import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eintrag = await prisma.kalenderEintrag.findUnique({
      where: { id: params.id },
      include: {
        fahrzeug: {
          include: { kunde: true },
        },
      },
    });

    if (!eintrag) {
      return NextResponse.json(
        { error: "Kalendereintrag nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(eintrag);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden des Kalendereintrags" },
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

    if (!data.titel || !data.startDatum || !data.endDatum) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const eintrag = await prisma.kalenderEintrag.update({
      where: { id: params.id },
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

    return NextResponse.json(eintrag);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Kalendereintrags" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.kalenderEintrag.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Löschen des Kalendereintrags" },
      { status: 500 }
    );
  }
}
