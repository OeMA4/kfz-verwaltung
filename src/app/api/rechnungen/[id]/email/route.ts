import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateRechnungPDF } from "@/lib/pdf";
import { sendEmail, generateRechnungEmailHtml } from "@/lib/email";

export async function POST(
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

    if (!rechnung.kunde.email) {
      return NextResponse.json(
        { error: "Der Kunde hat keine E-Mail-Adresse hinterlegt" },
        { status: 400 }
      );
    }

    // PDF generieren
    const pdfBuffer = await generateRechnungPDF(rechnung);

    // E-Mail-Inhalt generieren
    const kundenName = rechnung.kunde.firma ||
      `${rechnung.kunde.vorname} ${rechnung.kunde.nachname}`;

    const fahrzeugInfo = rechnung.fahrzeug
      ? `${rechnung.fahrzeug.kennzeichen} - ${rechnung.fahrzeug.marke} ${rechnung.fahrzeug.modell}`
      : undefined;

    const { subject, text, html } = generateRechnungEmailHtml(
      rechnung.rechnungsnummer,
      kundenName,
      rechnung.bruttoGesamt,
      fahrzeugInfo
    );

    // E-Mail senden
    await sendEmail({
      to: rechnung.kunde.email,
      subject,
      text,
      html,
      attachments: [
        {
          filename: `Rechnung-${rechnung.rechnungsnummer}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("E-Mail-Versand fehlgeschlagen:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler beim E-Mail-Versand" },
      { status: 500 }
    );
  }
}
