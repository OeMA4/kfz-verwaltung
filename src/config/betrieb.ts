// Betriebskonfiguration
// Hier können die Kontaktdaten des Betriebs angepasst werden

export const betriebsConfig = {
  // Firmenname
  name: "Kfz-Meisterbetrieb Weiterstadt",

  // Zusatz (optional)
  zusatz: "Ihr Partner für alle Fahrzeuge",

  // Adresse
  strasse: "Im Rödling 9a",
  plz: "64331",
  ort: "Weiterstadt",

  // Kontakt
  telefon: "0173 2344338",
  fax: "",
  email: "info@kfz-weiterstadt.de",
  website: "www.kfz-weiterstadt.de",

  // Bankverbindung (für Rechnungen)
  bank: "Sparkasse Darmstadt",
  iban: "DE89 5085 0150 0000 1234 56",
  bic: "HELADEF1DAS",
  kontoinhaber: "Kfz-Meisterbetrieb Weiterstadt",

  // Steuerdaten
  steuernummer: "012/345/67890",
  ustIdNr: "DE123456789",

  // Handelsregister (optional)
  handelsregister: "",
  amtsgericht: "",

  // Inhaber/Geschäftsführer
  inhaber: "Max Mustermann",

  // Zahlungsbedingungen
  zahlungsziel: 14, // Tage
  skonto: 2, // Prozent
  skontoTage: 7, // Tage für Skonto

  // Öffnungszeiten (optional, für Briefkopf)
  oeffnungszeiten: "Mo-Fr 8:00-18:00 Uhr, Sa 9:00-13:00 Uhr",
};

// Formatierte Adresse für Anzeige
export function getFormattedAddress(): string {
  return `${betriebsConfig.strasse}, ${betriebsConfig.plz} ${betriebsConfig.ort}`;
}

// Vollständige Kontaktzeile
export function getContactLine(): string {
  const parts = [betriebsConfig.telefon];
  if (betriebsConfig.email) parts.push(betriebsConfig.email);
  if (betriebsConfig.website) parts.push(betriebsConfig.website);
  return parts.join(" • ");
}

// Bankverbindung formatiert
export function getBankDetails(): string {
  if (!betriebsConfig.iban) return "";
  let details = `IBAN: ${betriebsConfig.iban}`;
  if (betriebsConfig.bic) details += ` • BIC: ${betriebsConfig.bic}`;
  if (betriebsConfig.bank) details += ` • ${betriebsConfig.bank}`;
  return details;
}
