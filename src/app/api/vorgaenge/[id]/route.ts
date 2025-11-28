import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vorgang = await prisma.vorgang.findUnique({
      where: { id: params.id },
      include: {
        kunde: true,
        fahrzeug: true,
        arbeiten: { orderBy: { position: "asc" } },
        rechnungen: {
          include: { rechnung: true },
        },
      },
    });

    if (!vorgang) {
      return NextResponse.json(
        { error: "Vorgang nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(vorgang);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden des Vorgangs" },
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

    if (!data.vorgangsnummer || !data.titel || !data.kundeId || !data.fahrzeugId) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    // Erst alle bestehenden Arbeiten löschen, dann neu erstellen
    await prisma.vorgangsArbeit.deleteMany({
      where: { vorgangId: params.id },
    });

    const vorgang = await prisma.vorgang.update({
      where: { id: params.id },
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

    return NextResponse.json(vorgang);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Vorgangs:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Vorgangs" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const updateData: {
      status?: string;
      fertigstellung?: Date | null;
    } = {};

    if (data.status) {
      updateData.status = data.status;
      if (data.status === "abgeschlossen") {
        updateData.fertigstellung = new Date();
      }
    }

    const vorgang = await prisma.vorgang.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(vorgang);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Vorgangs" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Prüfen ob Vorgang mit Rechnungen verknüpft ist
    const vorgang = await prisma.vorgang.findUnique({
      where: { id: params.id },
      include: { rechnungen: true },
    });

    if (vorgang?.rechnungen.length) {
      return NextResponse.json(
        { error: "Vorgang kann nicht gelöscht werden, da er mit Rechnungen verknüpft ist" },
        { status: 400 }
      );
    }

    await prisma.vorgang.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Löschen des Vorgangs" },
      { status: 500 }
    );
  }
}
