import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DeleteKundeButton from "@/components/DeleteKundeButton";

async function getKunde(id: string) {
  const kunde = await prisma.kunde.findUnique({
    where: { id },
    include: {
      fahrzeuge: {
        include: {
          rechnungen: {
            orderBy: { datum: "desc" },
          },
          vorgaenge: {
            orderBy: { eingang: "desc" },
          },
        },
      },
      rechnungen: {
        where: { status: { not: "storniert" } },
        select: {
          bruttoGesamt: true,
          status: true,
        },
      },
    },
  });
  return kunde;
}

export default async function KundeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const kunde = await getKunde(params.id);

  if (!kunde) {
    notFound();
  }

  const statusFarbe = (status: string) => {
    switch (status) {
      case "bezahlt":
        return "bg-green-100 text-green-800";
      case "storniert":
        return "bg-red-100 text-red-800";
      case "offen":
        return "bg-yellow-100 text-yellow-800";
      case "in_bearbeitung":
        return "bg-blue-100 text-blue-800";
      case "abgeschlossen":
        return "bg-purple-100 text-purple-800";
      case "abgerechnet":
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
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Rechnungssummen berechnen
  const gesamtSumme = kunde.rechnungen.reduce((sum, r) => sum + r.bruttoGesamt, 0);
  const bezahltSumme = kunde.rechnungen
    .filter((r) => r.status === "bezahlt")
    .reduce((sum, r) => sum + r.bruttoGesamt, 0);
  const offenSumme = gesamtSumme - bezahltSumme;
  const allesBezahlt = offenSumme === 0 && gesamtSumme > 0;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            href="/kunden"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {kunde.vorname} {kunde.nachname}
          </h1>
          {kunde.firma && (
            <p className="text-lg text-gray-600">{kunde.firma}</p>
          )}
          {gesamtSumme > 0 && (
            <div className="mt-2">
              {allesBezahlt ? (
                <span className="text-lg font-semibold text-green-600">
                  {gesamtSumme.toFixed(2).replace(".", ",")} €
                </span>
              ) : (
                <span className="text-lg font-semibold">
                  <span className="text-red-600">{offenSumme.toFixed(2).replace(".", ",")} €</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-gray-600">{gesamtSumme.toFixed(2).replace(".", ",")} €</span>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/kunden/${kunde.id}/bearbeiten`}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Bearbeiten
          </Link>
          <DeleteKundeButton kundeId={kunde.id} kundeName={`${kunde.vorname} ${kunde.nachname}`} />
        </div>
      </div>

      {/* Kontaktdaten */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Kontaktdaten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Adresse</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {kunde.strasse} {kunde.hausnummer}
              <br />
              {kunde.plz} {kunde.ort}
            </dd>
          </div>
          {kunde.telefon && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Telefon</dt>
              <dd className="text-sm text-gray-900 mt-1">{kunde.telefon}</dd>
            </div>
          )}
          {kunde.mobil && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Mobil</dt>
              <dd className="text-sm text-gray-900 mt-1">{kunde.mobil}</dd>
            </div>
          )}
          {kunde.email && (
            <div>
              <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
              <dd className="text-sm text-gray-900 mt-1">
                <a
                  href={`mailto:${kunde.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {kunde.email}
                </a>
              </dd>
            </div>
          )}
        </div>
        {kunde.notizen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <dt className="text-sm font-medium text-gray-500">Notizen</dt>
            <dd className="text-sm text-gray-900 mt-1">{kunde.notizen}</dd>
          </div>
        )}
      </div>

      {/* Fahrzeuge mit Rechnungen und Vorgängen */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Fahrzeuge</h2>
        <Link
          href={`/kunden/${kunde.id}/fahrzeug-neu`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          + Neues Fahrzeug
        </Link>
      </div>

      {kunde.fahrzeuge.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">Keine Fahrzeuge vorhanden</p>
          <Link
            href={`/kunden/${kunde.id}/fahrzeug-neu`}
            className="text-blue-600 hover:text-blue-800"
          >
            Erstes Fahrzeug anlegen
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {kunde.fahrzeuge.map((fahrzeug) => (
            <div key={fahrzeug.id} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Fahrzeug Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {fahrzeug.kennzeichen}
                    </h3>
                    <p className="text-gray-600">
                      {fahrzeug.marke} {fahrzeug.modell}
                      {fahrzeug.baujahr && ` (${fahrzeug.baujahr})`}
                      {fahrzeug.farbe && ` • ${fahrzeug.farbe}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/kunden/${kunde.id}/vorgang/neu?fahrzeug=${fahrzeug.id}`}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      + Vorgang
                    </Link>
                    <Link
                      href={`/kunden/${kunde.id}/fahrzeug/${fahrzeug.id}/bearbeiten`}
                      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1"
                    >
                      Bearbeiten
                    </Link>
                  </div>
                </div>
                {(fahrzeug.kilometerstand || fahrzeug.fahrgestellnr) && (
                  <div className="mt-2 text-sm text-gray-500">
                    {fahrzeug.kilometerstand && (
                      <span className="mr-4">
                        KM-Stand: {fahrzeug.kilometerstand.toLocaleString("de-DE")} km
                      </span>
                    )}
                    {fahrzeug.fahrgestellnr && (
                      <span>FIN: {fahrzeug.fahrgestellnr}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vorgänge */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                      Vorgänge ({fahrzeug.vorgaenge.length})
                    </h4>
                    {fahrzeug.vorgaenge.length === 0 ? (
                      <p className="text-sm text-gray-400">Keine Vorgänge</p>
                    ) : (
                      <ul className="space-y-2">
                        {fahrzeug.vorgaenge.map((vorgang) => (
                          <li key={vorgang.id}>
                            <Link
                              href={`/kunden/${kunde.id}/vorgang/${vorgang.id}`}
                              className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {vorgang.vorgangsnummer}
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {vorgang.titel}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${statusFarbe(
                                    vorgang.status
                                  )}`}
                                >
                                  {statusText(vorgang.status)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {new Date(vorgang.eingang).toLocaleDateString("de-DE")}
                                {vorgang.kmStandEingang && (
                                  <span className="ml-2">
                                    • {vorgang.kmStandEingang.toLocaleString("de-DE")} km
                                  </span>
                                )}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Rechnungen */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                      Rechnungen ({fahrzeug.rechnungen.length})
                    </h4>
                    {fahrzeug.rechnungen.length === 0 ? (
                      <p className="text-sm text-gray-400">Keine Rechnungen</p>
                    ) : (
                      <ul className="space-y-2">
                        {fahrzeug.rechnungen.map((rechnung) => (
                          <li key={rechnung.id}>
                            <Link
                              href={`/rechnungen/${rechnung.id}`}
                              className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-900">
                                  {rechnung.rechnungsnummer}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${statusFarbe(
                                    rechnung.status
                                  )}`}
                                >
                                  {statusText(rechnung.status)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                                <span>
                                  {new Date(rechnung.datum).toLocaleDateString("de-DE")}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {rechnung.bruttoGesamt.toFixed(2)} €
                                </span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
