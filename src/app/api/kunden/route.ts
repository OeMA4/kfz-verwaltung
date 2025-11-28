import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const kunden = await prisma.kunde.findMany({
      orderBy: { nachname: "asc" },
      include: {
        _count: {
          select: { fahrzeuge: true, rechnungen: true },
        },
      },
    });
    return NextResponse.json(kunden);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Kunden" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.vorname || !data.nachname || !data.strasse || !data.hausnummer || !data.plz || !data.ort) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const kunde = await prisma.kunde.create({
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

    return NextResponse.json(kunde, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Kunden" },
      { status: 500 }
    );
  }
}
