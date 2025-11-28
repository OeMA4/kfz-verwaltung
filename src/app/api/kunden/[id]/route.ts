import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kunde = await prisma.kunde.findUnique({
      where: { id: params.id },
      include: {
        fahrzeuge: true,
        rechnungen: {
          orderBy: { datum: "desc" },
        },
      },
    });

    if (!kunde) {
      return NextResponse.json(
        { error: "Kunde nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(kunde);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden des Kunden" },
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

    if (!data.vorname || !data.nachname || !data.strasse || !data.hausnummer || !data.plz || !data.ort) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const kunde = await prisma.kunde.update({
      where: { id: params.id },
      data: {
        anrede: data.anrede,
        vorname: data.vorname,
        nachname: data.nachname,
        firma: data.firma,
        strasse: data.strasse,
        hausnummer: data.hausnummer,
        plz: data.plz,
        ort: data.ort,
        telefon: data.telefon,
        mobil: data.mobil,
        email: data.email,
        notizen: data.notizen,
      },
    });

    return NextResponse.json(kunde);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Kunden" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.kunde.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Löschen des Kunden" },
      { status: 500 }
    );
  }
}
