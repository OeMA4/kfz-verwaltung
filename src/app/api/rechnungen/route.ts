import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rechnungen = await prisma.rechnung.findMany({
      orderBy: { datum: "desc" },
      include: {
        kunde: true,
        fahrzeug: true,
        _count: { select: { positionen: true } },
      },
    });
    return NextResponse.json(rechnungen);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Rechnungen" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.rechnungsnummer || !data.kundeId || !data.positionen?.length) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const nettoGesamt = data.positionen.reduce(
      (sum: number, p: { gesamtpreis: number }) => sum + p.gesamtpreis,
      0
    );
    const mwstBetrag = nettoGesamt * (data.mwstSatz / 100);
    const bruttoGesamt = nettoGesamt + mwstBetrag;

    const rechnung = await prisma.rechnung.create({
      data: {
        rechnungsnummer: data.rechnungsnummer,
        datum: new Date(data.datum),
        faelligBis: data.faelligBis ? new Date(data.faelligBis) : null,
        kundeId: data.kundeId,
        fahrzeugId: data.fahrzeugId || null,
        mwstSatz: data.mwstSatz,
        nettoGesamt,
        mwstBetrag,
        bruttoGesamt,
        notizen: data.notizen,
        positionen: {
          create: data.positionen.map((p: {
            position: number;
            beschreibung: string;
            menge: number;
            einheit: string;
            einzelpreis: number;
            gesamtpreis: number;
          }) => ({
            position: p.position,
            beschreibung: p.beschreibung,
            menge: p.menge,
            einheit: p.einheit,
            einzelpreis: p.einzelpreis,
            gesamtpreis: p.gesamtpreis,
          })),
        },
      },
      include: {
        kunde: true,
        fahrzeug: true,
        positionen: true,
      },
    });

    // Verknüpfung mit Vorgängen erstellen und Status aktualisieren
    if (data.vorgangIds?.length) {
      await prisma.rechnungVorgang.createMany({
        data: data.vorgangIds.map((vorgangId: string) => ({
          rechnungId: rechnung.id,
          vorgangId,
        })),
      });

      // Vorgänge als abgerechnet markieren
      await prisma.vorgang.updateMany({
        where: { id: { in: data.vorgangIds } },
        data: { status: "abgerechnet" },
      });
    }

    return NextResponse.json(rechnung, { status: 201 });
  } catch (error: unknown) {
    console.error("Fehler beim Erstellen der Rechnung:", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Diese Rechnungsnummer existiert bereits" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Rechnung" },
      { status: 500 }
    );
  }
}
