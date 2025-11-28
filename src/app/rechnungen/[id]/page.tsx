import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RechnungActions from "@/components/RechnungActions";

async function getRechnung(id: string) {
  return prisma.rechnung.findUnique({
    where: { id },
    include: {
      kunde: true,
      fahrzeug: true,
      positionen: {
        orderBy: { position: "asc" },
      },
    },
  });
}

export default async function RechnungDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const rechnung = await getRechnung(params.id);

  if (!rechnung) {
    notFound();
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "bezahlt":
        return "bg-green-100 text-green-800 border-green-200";
      case "storniert":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            href="/rechnungen"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Rechnung {rechnung.rechnungsnummer}
          </h1>
          <p className="text-gray-600">
            vom {new Date(rechnung.datum).toLocaleDateString("de-DE")}
          </p>
        </div>
        <RechnungActions rechnungId={rechnung.id} currentStatus={rechnung.status} kundeEmail={rechnung.kunde.email} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rechnungsdetails */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className={`p-4 rounded-lg border ${statusColor(rechnung.status)}`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Status: </span>
                <span className="capitalize">{rechnung.status}</span>
              </div>
              {rechnung.faelligBis && (
                <div className="text-sm">
                  Fällig bis:{" "}
                  {new Date(rechnung.faelligBis).toLocaleDateString("de-DE")}
                </div>
              )}
            </div>
          </div>

          {/* Positionen */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Positionen</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pos.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Beschreibung
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Menge
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Einzelpreis
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Gesamt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rechnung.positionen.map((pos) => (
                  <tr key={pos.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pos.position}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {pos.beschreibung}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {pos.menge} {pos.einheit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {pos.einzelpreis.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {pos.gesamtpreis.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-sm text-gray-500 text-right">
                    Netto:
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">
                    {rechnung.nettoGesamt.toFixed(2)} €
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-sm text-gray-500 text-right">
                    MwSt. ({rechnung.mwstSatz}%):
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">
                    {rechnung.mwstBetrag.toFixed(2)} €
                  </td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={4} className="px-6 py-3 text-sm text-gray-900 text-right">
                    Brutto:
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">
                    {rechnung.bruttoGesamt.toFixed(2)} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {rechnung.notizen && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Notizen</h2>
              <p className="text-gray-600">{rechnung.notizen}</p>
            </div>
          )}
        </div>

        {/* Seitenleiste */}
        <div className="space-y-6">
          {/* Kunde */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Kunde</h2>
            <Link
              href={`/kunden/${rechnung.kunde.id}`}
              className="block p-4 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <div className="font-medium text-gray-900">
                {rechnung.kunde.firma ||
                  `${rechnung.kunde.vorname} ${rechnung.kunde.nachname}`}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {rechnung.kunde.strasse} {rechnung.kunde.hausnummer}
                <br />
                {rechnung.kunde.plz} {rechnung.kunde.ort}
              </div>
              {rechnung.kunde.email && (
                <div className="text-sm text-blue-600 mt-1">
                  {rechnung.kunde.email}
                </div>
              )}
            </Link>
          </div>

          {/* Fahrzeug */}
          {rechnung.fahrzeug && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Fahrzeug</h2>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-medium text-gray-900">
                  {rechnung.fahrzeug.kennzeichen}
                </div>
                <div className="text-sm text-gray-500">
                  {rechnung.fahrzeug.marke} {rechnung.fahrzeug.modell}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
