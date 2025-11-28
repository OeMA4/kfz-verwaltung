import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import VorgangActions from "@/components/VorgangActions";

async function getVorgang(vorgangId: string, kundeId: string) {
  const vorgang = await prisma.vorgang.findUnique({
    where: { id: vorgangId },
    include: {
      kunde: true,
      fahrzeug: true,
      arbeiten: { orderBy: { position: "asc" } },
      rechnungen: {
        include: { rechnung: true },
      },
    },
  });

  // Sicherstellen dass der Vorgang zum Kunden gehört
  if (vorgang && vorgang.kundeId !== kundeId) {
    return null;
  }

  return vorgang;
}

export default async function VorgangDetailPage({
  params,
}: {
  params: { id: string; vorgangId: string };
}) {
  const vorgang = await getVorgang(params.vorgangId, params.id);

  if (!vorgang) {
    notFound();
  }

  const statusFarbe = (status: string) => {
    switch (status) {
      case "offen":
        return "bg-yellow-100 text-yellow-800";
      case "in_bearbeitung":
        return "bg-blue-100 text-blue-800";
      case "abgeschlossen":
        return "bg-purple-100 text-purple-800";
      case "abgerechnet":
        return "bg-green-100 text-green-800";
      case "erledigt":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusText = (status: string) => {
    switch (status) {
      case "in_bearbeitung":
        return "In Bearbeitung";
      case "abgeschlossen":
        return "Abgeschlossen";
      case "abgerechnet":
        return "Abgerechnet";
      case "erledigt":
        return "Erledigt";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const gesamtNetto = vorgang.arbeiten.reduce((sum, a) => sum + a.gesamtpreis, 0);
  const isAbgerechnet = vorgang.status === "abgerechnet" || vorgang.rechnungen.length > 0;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            href={`/kunden/${vorgang.kundeId}`}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Zurück zu {vorgang.kunde.vorname} {vorgang.kunde.nachname}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {vorgang.vorgangsnummer}: {vorgang.titel}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusFarbe(vorgang.status)}`}>
              {statusText(vorgang.status)}
            </span>
            <span className="text-gray-500">
              {vorgang.fahrzeug.kennzeichen} - {vorgang.fahrzeug.marke} {vorgang.fahrzeug.modell}
            </span>
          </div>
        </div>
        <VorgangActions
          vorgangId={vorgang.id}
          currentStatus={vorgang.status}
          kundeId={vorgang.kundeId}
          fahrzeugId={vorgang.fahrzeugId}
          isAbgerechnet={isAbgerechnet}
          backUrl={`/kunden/${vorgang.kundeId}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Eingang</dt>
              <dd className="text-sm text-gray-900">
                {new Date(vorgang.eingang).toLocaleDateString("de-DE")}
              </dd>
            </div>
            {vorgang.fertigstellung && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Fertigstellung</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(vorgang.fertigstellung).toLocaleDateString("de-DE")}
                </dd>
              </div>
            )}
            {vorgang.kmStandEingang && (
              <div>
                <dt className="text-sm font-medium text-gray-500">KM-Stand bei Eingang</dt>
                <dd className="text-sm text-gray-900">
                  {vorgang.kmStandEingang.toLocaleString("de-DE")} km
                </dd>
              </div>
            )}
            {vorgang.beschreibung && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Beschreibung</dt>
                <dd className="text-sm text-gray-900">{vorgang.beschreibung}</dd>
              </div>
            )}
            {vorgang.notizen && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Notizen</dt>
                <dd className="text-sm text-gray-900">{vorgang.notizen}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Kunde & Fahrzeug */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Kunde & Fahrzeug</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Kunde</dt>
              <dd className="text-sm text-gray-900">
                <Link
                  href={`/kunden/${vorgang.kundeId}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {vorgang.kunde.firma || `${vorgang.kunde.vorname} ${vorgang.kunde.nachname}`}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fahrzeug</dt>
              <dd className="text-sm text-gray-900">
                {vorgang.fahrzeug.kennzeichen}
                <br />
                <span className="text-gray-500">
                  {vorgang.fahrzeug.marke} {vorgang.fahrzeug.modell}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Verknüpfte Rechnungen */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Rechnungen</h2>
          {vorgang.rechnungen.length === 0 ? (
            <p className="text-sm text-gray-500">Keine Rechnungen verknüpft</p>
          ) : (
            <ul className="space-y-2">
              {vorgang.rechnungen.map((rv) => (
                <li key={rv.id}>
                  <Link
                    href={`/rechnungen/${rv.rechnung.id}`}
                    className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        {rv.rechnung.rechnungsnummer}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rv.rechnung.status === "bezahlt"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {rv.rechnung.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {rv.rechnung.bruttoGesamt.toFixed(2)} €
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Arbeiten */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Arbeiten</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschreibung</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Menge</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Einzelpreis</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gesamt</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vorgang.arbeiten.map((arbeit) => (
              <tr key={arbeit.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {arbeit.position}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {arbeit.beschreibung}
                  {arbeit.notizen && (
                    <p className="text-gray-500 text-xs mt-1">{arbeit.notizen}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusFarbe(arbeit.status)}`}>
                    {statusText(arbeit.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {arbeit.menge} {arbeit.einheit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {arbeit.einzelpreis.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {arbeit.gesamtpreis.toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={5} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                Gesamt (Netto):
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                {gesamtNetto.toFixed(2)} €
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
