import Link from "next/link";
import prisma from "@/lib/prisma";

async function getRechnungen() {
  return prisma.rechnung.findMany({
    orderBy: { datum: "desc" },
    include: {
      kunde: true,
      fahrzeug: true,
      _count: { select: { positionen: true } },
    },
  });
}

export default async function RechnungenPage() {
  const rechnungen = await getRechnungen();

  const statusColor = (status: string) => {
    switch (status) {
      case "bezahlt":
        return "bg-green-100 text-green-800";
      case "storniert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
        <Link
          href="/rechnungen/neu"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Neue Rechnung
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rechnungsnr.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kunde
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fahrzeug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Betrag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rechnungen.map((rechnung) => (
              <tr key={rechnung.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">
                    {rechnung.rechnungsnummer}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rechnung.datum).toLocaleDateString("de-DE")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/kunden/${rechnung.kunde.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {rechnung.kunde.firma ||
                      `${rechnung.kunde.vorname} ${rechnung.kunde.nachname}`}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rechnung.fahrzeug ? (
                    <Link
                      href={`/fahrzeuge/${rechnung.fahrzeug.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {rechnung.fahrzeug.kennzeichen}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {rechnung.bruttoGesamt.toFixed(2)} €
                  </div>
                  <div className="text-xs text-gray-500">
                    {rechnung._count.positionen} Position(en)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${statusColor(
                      rechnung.status
                    )}`}
                  >
                    {rechnung.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/rechnungen/${rechnung.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Anzeigen
                  </Link>
                  <Link
                    href={`/api/rechnungen/${rechnung.id}/pdf`}
                    className="text-gray-600 hover:text-gray-900"
                    target="_blank"
                  >
                    PDF
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rechnungen.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Noch keine Rechnungen vorhanden.</p>
            <Link
              href="/rechnungen/neu"
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Erste Rechnung erstellen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
