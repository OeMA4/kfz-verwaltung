"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type Kunde = {
  id: string;
  vorname: string;
  nachname: string;
  firma: string | null;
};

type Fahrzeug = {
  id: string;
  kennzeichen: string;
  marke: string;
  modell: string;
  baujahr: number | null;
  fahrgestellnr: string | null;
  erstzulassung: Date | null;
  naechsteHU: Date | null;
  kilometerstand: number | null;
  farbe: string | null;
  kraftstoff: string | null;
  notizen: string | null;
  kundeId: string;
};

export default function FahrzeugForm({
  fahrzeug,
  kunden,
  preselectedKundeId,
  kundeId,
  redirectUrl,
}: {
  fahrzeug?: Fahrzeug;
  kunden?: Kunde[];
  preselectedKundeId?: string;
  kundeId?: string;
  redirectUrl?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fixedKundeId = kundeId || preselectedKundeId;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      kennzeichen: formData.get("kennzeichen"),
      marke: formData.get("marke"),
      modell: formData.get("modell"),
      baujahr: formData.get("baujahr") ? parseInt(formData.get("baujahr") as string) : null,
      fahrgestellnr: formData.get("fahrgestellnr") || null,
      erstzulassung: formData.get("erstzulassung") || null,
      naechsteHU: formData.get("naechsteHU") || null,
      kilometerstand: formData.get("kilometerstand") ? parseInt(formData.get("kilometerstand") as string) : null,
      farbe: formData.get("farbe") || null,
      kraftstoff: formData.get("kraftstoff") || null,
      notizen: formData.get("notizen") || null,
      kundeId: fixedKundeId || formData.get("kundeId"),
    };

    try {
      const url = fahrzeug ? `/api/fahrzeuge/${fahrzeug.id}` : "/api/fahrzeuge";
      const method = fahrzeug ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push(redirectUrl || `/kunden/${data.kundeId}`);
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ein Fehler ist aufgetreten");
      }
    } catch {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 max-w-2xl">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kunde - nur anzeigen wenn keine fixedKundeId */}
        {!fixedKundeId && kunden && (
          <div className="md:col-span-2">
            <label htmlFor="kundeId" className="block text-sm font-medium text-gray-700 mb-1">
              Kunde *
            </label>
            <select
              id="kundeId"
              name="kundeId"
              required
              defaultValue={fahrzeug?.kundeId || ""}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bitte wählen...</option>
              {kunden.map((kunde) => (
                <option key={kunde.id} value={kunde.id}>
                  {kunde.firma || `${kunde.vorname} ${kunde.nachname}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Kennzeichen */}
        <div>
          <label htmlFor="kennzeichen" className="block text-sm font-medium text-gray-700 mb-1">
            Kennzeichen *
          </label>
          <input
            type="text"
            id="kennzeichen"
            name="kennzeichen"
            required
            defaultValue={fahrzeug?.kennzeichen || ""}
            placeholder="B-AB 1234"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
        </div>

        {/* Marke */}
        <div>
          <label htmlFor="marke" className="block text-sm font-medium text-gray-700 mb-1">
            Marke *
          </label>
          <input
            type="text"
            id="marke"
            name="marke"
            required
            defaultValue={fahrzeug?.marke || ""}
            placeholder="z.B. Volkswagen"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Modell */}
        <div>
          <label htmlFor="modell" className="block text-sm font-medium text-gray-700 mb-1">
            Modell *
          </label>
          <input
            type="text"
            id="modell"
            name="modell"
            required
            defaultValue={fahrzeug?.modell || ""}
            placeholder="z.B. Golf 8"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Baujahr */}
        <div>
          <label htmlFor="baujahr" className="block text-sm font-medium text-gray-700 mb-1">
            Baujahr
          </label>
          <input
            type="number"
            id="baujahr"
            name="baujahr"
            min="1900"
            max="2099"
            defaultValue={fahrzeug?.baujahr || ""}
            placeholder="z.B. 2021"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Farbe */}
        <div>
          <label htmlFor="farbe" className="block text-sm font-medium text-gray-700 mb-1">
            Farbe
          </label>
          <input
            type="text"
            id="farbe"
            name="farbe"
            defaultValue={fahrzeug?.farbe || ""}
            placeholder="z.B. Schwarz"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Kraftstoff */}
        <div>
          <label htmlFor="kraftstoff" className="block text-sm font-medium text-gray-700 mb-1">
            Kraftstoff
          </label>
          <select
            id="kraftstoff"
            name="kraftstoff"
            defaultValue={fahrzeug?.kraftstoff || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte wählen...</option>
            <option value="Benzin">Benzin</option>
            <option value="Diesel">Diesel</option>
            <option value="Elektro">Elektro</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Gas">Gas (LPG/CNG)</option>
          </select>
        </div>

        {/* Fahrgestellnummer */}
        <div>
          <label htmlFor="fahrgestellnr" className="block text-sm font-medium text-gray-700 mb-1">
            Fahrgestellnummer (VIN)
          </label>
          <input
            type="text"
            id="fahrgestellnr"
            name="fahrgestellnr"
            maxLength={17}
            defaultValue={fahrzeug?.fahrgestellnr || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
          />
        </div>

        {/* Kilometerstand */}
        <div>
          <label htmlFor="kilometerstand" className="block text-sm font-medium text-gray-700 mb-1">
            Kilometerstand
          </label>
          <input
            type="number"
            id="kilometerstand"
            name="kilometerstand"
            min="0"
            defaultValue={fahrzeug?.kilometerstand || ""}
            placeholder="z.B. 50000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Erstzulassung */}
        <div>
          <label htmlFor="erstzulassung" className="block text-sm font-medium text-gray-700 mb-1">
            Erstzulassung
          </label>
          <input
            type="date"
            id="erstzulassung"
            name="erstzulassung"
            defaultValue={formatDateForInput(fahrzeug?.erstzulassung)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Nächste HU */}
        <div>
          <label htmlFor="naechsteHU" className="block text-sm font-medium text-gray-700 mb-1">
            Nächste HU
          </label>
          <input
            type="date"
            id="naechsteHU"
            name="naechsteHU"
            defaultValue={formatDateForInput(fahrzeug?.naechsteHU)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notizen */}
        <div className="md:col-span-2">
          <label htmlFor="notizen" className="block text-sm font-medium text-gray-700 mb-1">
            Notizen
          </label>
          <textarea
            id="notizen"
            name="notizen"
            rows={3}
            defaultValue={fahrzeug?.notizen || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Speichern..." : fahrzeug ? "Änderungen speichern" : "Fahrzeug anlegen"}
        </button>
        <Link
          href={redirectUrl || (fixedKundeId ? `/kunden/${fixedKundeId}` : "/kunden")}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
