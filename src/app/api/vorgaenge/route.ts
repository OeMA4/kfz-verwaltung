import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vorgaenge = await prisma.vorgang.findMany({
      orderBy: { eingang: "desc" },
      include: {
        kunde: true,
        fahrzeug: true,
        arbeiten: true,
      },
    });
    return NextResponse.json(vorgaenge);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Vorgänge" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.vorgangsnummer || !data.titel || !data.kundeId || !data.fahrzeugId) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const vorgang = await prisma.vorgang.create({
      data: {
        vorgangsnummer: data.vorgangsnummer,
        titel: data.titel,
        beschreibung: data.beschreibung,
        eingang: new Date(data.eingang),
        kmStandEingang: data.kmStandEingang,
        notizen: data.notizen,
        kundeId: data.kundeId,
        fahrzeugId: data.fahrzeugId,
        arbeiten: {
          create: data.arbeiten?.map((a: {
            position: number;
            beschreibung: string;
            status: string;
            menge: number;
            einheit: string;
            einzelpreis: number;
            gesamtpreis: number;
            notizen: string | null;
          }) => ({
            position: a.position,
            beschreibung: a.beschreibung,
            status: a.status || "offen",
            menge: a.menge,
            einheit: a.einheit,
            einzelpreis: a.einzelpreis,
            gesamtpreis: a.gesamtpreis,
            notizen: a.notizen,
          })) || [],
        },
      },
      include: {
        kunde: true,
        fahrzeug: true,
        arbeiten: true,
      },
    });

    return NextResponse.json(vorgang, { status: 201 });
  } catch (error: unknown) {
    console.error("Fehler beim Erstellen des Vorgangs:", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Diese Vorgangsnummer existiert bereits" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Vorgangs" },
      { status: 500 }
    );
  }
}
