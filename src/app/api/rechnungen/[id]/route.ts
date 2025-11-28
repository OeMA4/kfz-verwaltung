import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rechnung = await prisma.rechnung.findUnique({
      where: { id: params.id },
      include: {
        kunde: true,
        fahrzeug: true,
        positionen: { orderBy: { position: "asc" } },
      },
    });

    if (!rechnung) {
      return NextResponse.json(
        { error: "Rechnung nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(rechnung);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Rechnung" },
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

    const rechnung = await prisma.rechnung.update({
      where: { id: params.id },
      data: {
        status: data.status,
      },
    });

    return NextResponse.json(rechnung);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Rechnung" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.rechnung.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Löschen der Rechnung" },
      { status: 500 }
    );
  }
}
