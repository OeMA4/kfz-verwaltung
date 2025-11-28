"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Kunde = {
  id: string;
  anrede: string | null;
  vorname: string;
  nachname: string;
  firma: string | null;
  email: string | null;
  telefon: string | null;
  mobil: string | null;
  strasse: string | null;
  hausnummer: string | null;
  plz: string | null;
  ort: string | null;
  _count: {
    fahrzeuge: number;
    rechnungen: number;
  };
};

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

export default function KundenListe({ kunden }: { kunden: Kunde[] }) {
  const [suchbegriff, setSuchbegriff] = useState("");
  const router = useRouter();

  const gefilterteKunden = kunden.filter((kunde) => {
    const suchText = suchbegriff.toLowerCase();
    return (
      kunde.vorname.toLowerCase().includes(suchText) ||
      kunde.nachname.toLowerCase().includes(suchText) ||
      (kunde.email && kunde.email.toLowerCase().includes(suchText)) ||
      (kunde.telefon && kunde.telefon.toLowerCase().includes(suchText)) ||
      (kunde.mobil && kunde.mobil.toLowerCase().includes(suchText)) ||
      (kunde.firma && kunde.firma.toLowerCase().includes(suchText))
    );
  });

  const handleRowDoubleClick = (kundeId: string) => {
    router.push(`/kunden/${kundeId}`);
  };

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Suchen nach Name, E-Mail, Telefon..."
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vorname
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nachname
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Firma
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-Mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fahrzeuge
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktion
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gefilterteKunden.map((kunde) => (
              <tr
                key={kunde.id}
                className="hover:bg-gray-50 cursor-pointer"
                onDoubleClick={() => handleRowDoubleClick(kunde.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {kunde.vorname}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {kunde.nachname}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {kunde.firma || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {kunde.email || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {kunde.telefon || kunde.mobil || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {kunde._count.fahrzeuge}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Link
                    href={`/kunden/${kunde.id}`}
                    className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors"
                    title="Kunde anzeigen"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gefilterteKunden.length === 0 && suchbegriff && (
          <div className="text-center py-12">
            <p className="text-gray-500">Keine Kunden gefunden für &quot;{suchbegriff}&quot;</p>
          </div>
        )}
        {kunden.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Noch keine Kunden vorhanden.</p>
            <Link
              href="/kunden/neu"
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Ersten Kunden anlegen
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
