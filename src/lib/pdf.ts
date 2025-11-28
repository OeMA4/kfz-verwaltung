import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React, { createElement } from "react";
import { betriebsConfig, getFormattedAddress } from "@/config/betrieb";

type Kunde = {
  vorname: string;
  nachname: string;
  firma: string | null;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
};

type Fahrzeug = {
  kennzeichen: string;
  marke: string;
  modell: string;
  fahrgestellnr?: string | null;
  kilometerstand?: number | null;
} | null;

type Position = {
  position: number;
  beschreibung: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
};

type Rechnung = {
  rechnungsnummer: string;
  datum: Date;
  faelligBis: Date | null;
  status: string;
  nettoGesamt: number;
  mwstSatz: number;
  mwstBetrag: number;
  bruttoGesamt: number;
  rabattProzent?: number;
  rabattBetrag?: number;
  notizen: string | null;
  kunde: Kunde;
  fahrzeug: Fahrzeug;
  positionen: Position[];
};

// Farben - Anthrazit/Dunkelgrau Farbschema
const colors = {
  primary: "#374151", // Anthrazit
  primaryLight: "#4b5563",
  secondary: "#6b7280",
  accent: "#9ca3af",
  dark: "#111827",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  border: "#e5e7eb",
  white: "#ffffff",
  success: "#059669", // Dunkleres Grün, passt besser zu Anthrazit
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: colors.dark,
  },
  // Header mit Firmenlogo-Bereich
  headerBar: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 2,
  },
  companySubtitle: {
    fontSize: 9,
    color: colors.white,
    opacity: 0.9,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 11,
    color: colors.white,
    opacity: 0.9,
  },
  // Hauptinhalt
  content: {
    padding: 40,
    paddingTop: 25,
  },
  // Absenderzeile (klein über Empfänger)
  senderLine: {
    fontSize: 7,
    color: colors.gray,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  // Adressbereich
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  addressBlock: {
    width: "48%",
  },
  addressLabel: {
    fontSize: 7,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  addressName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  // Rechnungsdetails Box
  detailsBox: {
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 7,
    color: colors.gray,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  // Fahrzeug-Info
  vehicleBox: {
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  vehicleTitle: {
    fontSize: 8,
    color: colors.gray,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  vehicleMain: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 9,
    color: colors.gray,
  },
  // Tabelle
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    backgroundColor: colors.lightGray,
  },
  colPos: { width: "6%", textAlign: "center" },
  colDesc: { width: "44%" },
  colMenge: { width: "12%", textAlign: "center" },
  colEinheit: { width: "10%", textAlign: "center" },
  colPreis: { width: "14%", textAlign: "right" },
  colGesamt: { width: "14%", textAlign: "right" },
  // Summenbereich
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalsBox: {
    width: 250,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    padding: 15,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalsLabel: {
    fontSize: 9,
    color: colors.gray,
  },
  totalsValue: {
    fontSize: 9,
    textAlign: "right",
  },
  totalsDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginVertical: 8,
  },
  totalsGrandLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalsGrandValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  // Zahlungsinformationen
  paymentSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  paymentTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.dark,
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  paymentLabel: {
    width: 100,
    fontSize: 9,
    color: colors.gray,
  },
  paymentValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  paymentIban: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 4,
  },
  paymentNote: {
    marginTop: 10,
    fontSize: 8,
    color: colors.gray,
    fontStyle: "italic",
  },
  // Notizen
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#92400e",
  },
  notesText: {
    fontSize: 9,
    color: colors.dark,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.lightGray,
    padding: 15,
    paddingTop: 12,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerColumn: {
    width: "32%",
  },
  footerTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: colors.primary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  footerText: {
    fontSize: 7,
    color: colors.gray,
    lineHeight: 1.4,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 10,
    paddingTop: 8,
  },
  footerBottom: {
    textAlign: "center",
    fontSize: 7,
    color: colors.gray,
  },
});

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function RechnungDocument({ rechnung }: { rechnung: Rechnung }) {
  const faelligDatum = rechnung.faelligBis
    ? new Date(rechnung.faelligBis)
    : new Date(new Date(rechnung.datum).getTime() + betriebsConfig.zahlungsziel * 24 * 60 * 60 * 1000);

  return createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: styles.page },

      // === HEADER BAR ===
      createElement(
        View,
        { style: styles.headerBar },
        createElement(
          View,
          { style: styles.headerContent },
          // Links: Firmenname
          createElement(
            View,
            {},
            createElement(Text, { style: styles.companyName }, betriebsConfig.name),
            betriebsConfig.zusatz
              ? createElement(Text, { style: styles.companySubtitle }, betriebsConfig.zusatz)
              : null
          ),
          // Rechts: Rechnung Titel
          createElement(
            View,
            { style: styles.headerRight },
            createElement(Text, { style: styles.invoiceTitle }, "RECHNUNG"),
            createElement(
              Text,
              { style: styles.invoiceNumber },
              `Nr. ${rechnung.rechnungsnummer}`
            )
          )
        )
      ),

      // === HAUPTINHALT ===
      createElement(
        View,
        { style: styles.content },

        // Absenderzeile
        createElement(
          Text,
          { style: styles.senderLine },
          `${betriebsConfig.name} • ${betriebsConfig.strasse} • ${betriebsConfig.plz} ${betriebsConfig.ort}`
        ),

        // Adressbereich
        createElement(
          View,
          { style: styles.addressSection },
          // Empfänger
          createElement(
            View,
            { style: styles.addressBlock },
            createElement(Text, { style: styles.addressLabel }, "Rechnungsempfänger"),
            createElement(
              Text,
              { style: styles.addressName },
              rechnung.kunde.firma || `${rechnung.kunde.vorname} ${rechnung.kunde.nachname}`
            ),
            rechnung.kunde.firma
              ? createElement(
                  Text,
                  { style: styles.addressText },
                  `${rechnung.kunde.vorname} ${rechnung.kunde.nachname}`
                )
              : null,
            createElement(
              Text,
              { style: styles.addressText },
              `${rechnung.kunde.strasse} ${rechnung.kunde.hausnummer}`
            ),
            createElement(
              Text,
              { style: styles.addressText },
              `${rechnung.kunde.plz} ${rechnung.kunde.ort}`
            )
          ),
          // Rechnungsdetails rechts
          createElement(
            View,
            { style: { width: "40%" } },
            createElement(
              View,
              { style: { marginBottom: 8 } },
              createElement(Text, { style: styles.addressLabel }, "Rechnungsdatum"),
              createElement(
                Text,
                { style: { fontSize: 11, fontWeight: "bold" } },
                formatDate(rechnung.datum)
              )
            ),
            createElement(
              View,
              { style: { marginBottom: 8 } },
              createElement(Text, { style: styles.addressLabel }, "Fällig bis"),
              createElement(
                Text,
                { style: { fontSize: 11, fontWeight: "bold", color: colors.primary } },
                formatDate(faelligDatum)
              )
            ),
            rechnung.kunde.firma
              ? createElement(
                  View,
                  {},
                  createElement(Text, { style: styles.addressLabel }, "Kundennummer"),
                  createElement(Text, { style: { fontSize: 10 } }, "-")
                )
              : null
          )
        ),

        // Fahrzeug-Info
        rechnung.fahrzeug
          ? createElement(
              View,
              { style: styles.vehicleBox },
              createElement(Text, { style: styles.vehicleTitle }, "Fahrzeugdaten"),
              createElement(
                Text,
                { style: styles.vehicleMain },
                `${rechnung.fahrzeug.kennzeichen}`
              ),
              createElement(
                Text,
                { style: styles.vehicleDetails },
                `${rechnung.fahrzeug.marke} ${rechnung.fahrzeug.modell}` +
                  (rechnung.fahrzeug.fahrgestellnr ? ` • FIN: ${rechnung.fahrzeug.fahrgestellnr}` : "") +
                  (rechnung.fahrzeug.kilometerstand ? ` • ${rechnung.fahrzeug.kilometerstand.toLocaleString("de-DE")} km` : "")
              )
            )
          : null,

        // === POSITIONEN TABELLE ===
        createElement(
          View,
          { style: styles.table },
          // Header
          createElement(
            View,
            { style: styles.tableHeader },
            createElement(Text, { style: [styles.colPos, styles.tableHeaderText] }, "Pos"),
            createElement(Text, { style: [styles.colDesc, styles.tableHeaderText] }, "Beschreibung"),
            createElement(Text, { style: [styles.colMenge, styles.tableHeaderText] }, "Menge"),
            createElement(Text, { style: [styles.colEinheit, styles.tableHeaderText] }, "Einheit"),
            createElement(Text, { style: [styles.colPreis, styles.tableHeaderText] }, "Einzelpreis"),
            createElement(Text, { style: [styles.colGesamt, styles.tableHeaderText] }, "Gesamt")
          ),
          // Rows
          ...rechnung.positionen.map((pos, index) =>
            createElement(
              View,
              {
                style: [styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}],
                key: pos.position,
              },
              createElement(Text, { style: styles.colPos }, String(pos.position)),
              createElement(Text, { style: styles.colDesc }, pos.beschreibung),
              createElement(Text, { style: styles.colMenge }, pos.menge.toString().replace(".", ",")),
              createElement(Text, { style: styles.colEinheit }, pos.einheit),
              createElement(Text, { style: styles.colPreis }, formatCurrency(pos.einzelpreis)),
              createElement(
                Text,
                { style: [styles.colGesamt, { fontWeight: "bold" }] },
                formatCurrency(pos.gesamtpreis)
              )
            )
          )
        ),

        // === SUMMEN ===
        createElement(
          View,
          { style: styles.totalsSection },
          createElement(
            View,
            { style: styles.totalsBox },
            createElement(
              View,
              { style: styles.totalsRow },
              createElement(Text, { style: styles.totalsLabel }, "Zwischensumme (Netto)"),
              createElement(Text, { style: styles.totalsValue }, formatCurrency(rechnung.nettoGesamt))
            ),
            rechnung.rabattBetrag && rechnung.rabattBetrag > 0
              ? createElement(
                  View,
                  { style: styles.totalsRow },
                  createElement(
                    Text,
                    { style: styles.totalsLabel },
                    `Rabatt (${rechnung.rabattProzent || 0}%)`
                  ),
                  createElement(
                    Text,
                    { style: [styles.totalsValue, { color: colors.success }] },
                    `-${formatCurrency(rechnung.rabattBetrag)}`
                  )
                )
              : null,
            createElement(
              View,
              { style: styles.totalsRow },
              createElement(
                Text,
                { style: styles.totalsLabel },
                `MwSt. ${rechnung.mwstSatz}%`
              ),
              createElement(Text, { style: styles.totalsValue }, formatCurrency(rechnung.mwstBetrag))
            ),
            createElement(View, { style: styles.totalsDivider }),
            createElement(
              View,
              { style: [styles.totalsRow, { marginBottom: 0 }] },
              createElement(Text, { style: styles.totalsGrandLabel }, "Gesamtbetrag"),
              createElement(Text, { style: styles.totalsGrandValue }, formatCurrency(rechnung.bruttoGesamt))
            )
          )
        ),

        // === ZAHLUNGSINFORMATIONEN ===
        createElement(
          View,
          { style: styles.paymentSection },
          createElement(Text, { style: styles.paymentTitle }, "Zahlungsinformationen"),
          createElement(
            View,
            { style: styles.paymentRow },
            createElement(Text, { style: styles.paymentLabel }, "Empfänger:"),
            createElement(Text, { style: styles.paymentValue }, betriebsConfig.kontoinhaber || betriebsConfig.name)
          ),
          createElement(
            View,
            { style: styles.paymentRow },
            createElement(Text, { style: styles.paymentLabel }, "Bank:"),
            createElement(Text, { style: styles.paymentValue }, betriebsConfig.bank)
          ),
          createElement(
            View,
            { style: styles.paymentRow },
            createElement(Text, { style: styles.paymentLabel }, "IBAN:"),
            createElement(Text, { style: styles.paymentIban }, betriebsConfig.iban)
          ),
          betriebsConfig.bic
            ? createElement(
                View,
                { style: styles.paymentRow },
                createElement(Text, { style: styles.paymentLabel }, "BIC:"),
                createElement(Text, { style: styles.paymentValue }, betriebsConfig.bic)
              )
            : null,
          createElement(
            View,
            { style: styles.paymentRow },
            createElement(Text, { style: styles.paymentLabel }, "Verwendungszweck:"),
            createElement(Text, { style: styles.paymentValue }, `Rechnung ${rechnung.rechnungsnummer}`)
          ),
          betriebsConfig.skonto > 0
            ? createElement(
                Text,
                { style: styles.paymentNote },
                `Bei Zahlung innerhalb von ${betriebsConfig.skontoTage} Tagen gewähren wir ${betriebsConfig.skonto}% Skonto (${formatCurrency(rechnung.bruttoGesamt * (1 - betriebsConfig.skonto / 100))})`
              )
            : null
        ),

        // === NOTIZEN ===
        rechnung.notizen
          ? createElement(
              View,
              { style: styles.notesSection },
              createElement(Text, { style: styles.notesTitle }, "Hinweise"),
              createElement(Text, { style: styles.notesText }, rechnung.notizen)
            )
          : null
      ),

      // === FOOTER ===
      createElement(
        View,
        { style: styles.footer },
        createElement(
          View,
          { style: styles.footerContent },
          // Spalte 1: Kontakt
          createElement(
            View,
            { style: styles.footerColumn },
            createElement(Text, { style: styles.footerTitle }, "Kontakt"),
            createElement(Text, { style: styles.footerText }, betriebsConfig.name),
            createElement(Text, { style: styles.footerText }, `${betriebsConfig.strasse}`),
            createElement(Text, { style: styles.footerText }, `${betriebsConfig.plz} ${betriebsConfig.ort}`),
            betriebsConfig.telefon
              ? createElement(Text, { style: styles.footerText }, `Tel: ${betriebsConfig.telefon}`)
              : null
          ),
          // Spalte 2: Bankverbindung
          createElement(
            View,
            { style: styles.footerColumn },
            createElement(Text, { style: styles.footerTitle }, "Bankverbindung"),
            createElement(Text, { style: styles.footerText }, betriebsConfig.bank),
            createElement(Text, { style: styles.footerText }, `IBAN: ${betriebsConfig.iban}`),
            betriebsConfig.bic
              ? createElement(Text, { style: styles.footerText }, `BIC: ${betriebsConfig.bic}`)
              : null
          ),
          // Spalte 3: Steuerdaten
          createElement(
            View,
            { style: styles.footerColumn },
            createElement(Text, { style: styles.footerTitle }, "Steuerdaten"),
            betriebsConfig.steuernummer
              ? createElement(Text, { style: styles.footerText }, `St.-Nr.: ${betriebsConfig.steuernummer}`)
              : null,
            betriebsConfig.ustIdNr
              ? createElement(Text, { style: styles.footerText }, `USt-IdNr.: ${betriebsConfig.ustIdNr}`)
              : null,
            betriebsConfig.inhaber
              ? createElement(Text, { style: styles.footerText }, `Inhaber: ${betriebsConfig.inhaber}`)
              : null
          )
        ),
        createElement(
          View,
          { style: styles.footerDivider },
          createElement(
            Text,
            { style: styles.footerBottom },
            `${betriebsConfig.email ? betriebsConfig.email + " • " : ""}${betriebsConfig.website || ""}`
          )
        )
      )
    )
  );
}

export async function generateRechnungPDF(rechnung: Rechnung): Promise<Buffer> {
  const doc = createElement(RechnungDocument, { rechnung });
  const buffer = await renderToBuffer(doc as React.ReactElement);
  return Buffer.from(buffer);
}
