import nodemailer from "nodemailer";

type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    throw new Error("E-Mail ist nicht konfiguriert. Bitte SMTP-Einstellungen in .env prüfen.");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "werkstatt@example.com",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  });
}

export function generateRechnungEmailHtml(
  rechnungsnummer: string,
  kundenName: string,
  bruttoGesamt: number,
  fahrzeugInfo?: string
): { subject: string; text: string; html: string } {
  const subject = `Ihre Rechnung Nr. ${rechnungsnummer}`;

  const text = `
Sehr geehrte(r) ${kundenName},

anbei erhalten Sie Ihre Rechnung Nr. ${rechnungsnummer}.

${fahrzeugInfo ? `Fahrzeug: ${fahrzeugInfo}\n` : ""}
Gesamtbetrag: ${bruttoGesamt.toFixed(2).replace(".", ",")} €

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Ihre KFZ-Meisterwerkstatt
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #1e3a8a; }
    .total { font-size: 1.2em; font-weight: bold; color: #1e3a8a; }
    .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KFZ-Meisterwerkstatt</h1>
    </div>
    <div class="content">
      <p>Sehr geehrte(r) ${kundenName},</p>
      <p>anbei erhalten Sie Ihre Rechnung Nr. <strong>${rechnungsnummer}</strong>.</p>

      <div class="info-box">
        ${fahrzeugInfo ? `<p><strong>Fahrzeug:</strong> ${fahrzeugInfo}</p>` : ""}
        <p class="total">Gesamtbetrag: ${bruttoGesamt.toFixed(2).replace(".", ",")} €</p>
      </div>

      <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>

      <p>Mit freundlichen Grüßen<br>
      <strong>Ihre KFZ-Meisterwerkstatt</strong></p>
    </div>
    <div class="footer">
      <p>KFZ-Meisterwerkstatt • Musterstraße 1 • 12345 Musterstadt<br>
      Tel: 030 12345678 • E-Mail: info@werkstatt.de</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}
