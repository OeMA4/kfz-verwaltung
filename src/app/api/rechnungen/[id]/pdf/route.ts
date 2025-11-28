import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateRechnungPDF } from "@/lib/pdf";

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

    const pdfBuffer = await generateRechnungPDF(rechnung);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Rechnung-${rechnung.rechnungsnummer}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF-Generierung fehlgeschlagen:", error);
    return NextResponse.json(
      { error: "Fehler bei der PDF-Generierung" },
      { status: 500 }
    );
  }
}
