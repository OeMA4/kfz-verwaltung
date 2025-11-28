"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type Kunde = {
  id: string;
  anrede: string | null;
  vorname: string;
  nachname: string;
  firma: string | null;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string | null;
  mobil: string | null;
  email: string | null;
  notizen: string | null;
};

export default function KundeForm({ kunde }: { kunde?: Kunde }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      anrede: formData.get("anrede") || null,
      vorname: formData.get("vorname"),
      nachname: formData.get("nachname"),
      firma: formData.get("firma") || null,
      strasse: formData.get("strasse"),
      hausnummer: formData.get("hausnummer"),
      plz: formData.get("plz"),
      ort: formData.get("ort"),
      telefon: formData.get("telefon") || null,
      mobil: formData.get("mobil") || null,
      email: formData.get("email") || null,
      notizen: formData.get("notizen") || null,
    };

    try {
      const url = kunde ? `/api/kunden/${kunde.id}` : "/api/kunden";
      const method = kunde ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/kunden/${result.id}`);
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ein Fehler ist aufgetreten");
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 max-w-2xl">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anrede */}
        <div>
          <label htmlFor="anrede" className="block text-sm font-medium text-gray-700 mb-1">
            Anrede
          </label>
          <select
            id="anrede"
            name="anrede"
            defaultValue={kunde?.anrede || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Keine Angabe</option>
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
          </select>
        </div>

        {/* Firma */}
        <div>
          <label htmlFor="firma" className="block text-sm font-medium text-gray-700 mb-1">
            Firma
          </label>
          <input
            type="text"
            id="firma"
            name="firma"
            defaultValue={kunde?.firma || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Vorname */}
        <div>
          <label htmlFor="vorname" className="block text-sm font-medium text-gray-700 mb-1">
            Vorname *
          </label>
          <input
            type="text"
            id="vorname"
            name="vorname"
            required
            defaultValue={kunde?.vorname || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Nachname */}
        <div>
          <label htmlFor="nachname" className="block text-sm font-medium text-gray-700 mb-1">
            Nachname *
          </label>
          <input
            type="text"
            id="nachname"
            name="nachname"
            required
            defaultValue={kunde?.nachname || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Straße */}
        <div>
          <label htmlFor="strasse" className="block text-sm font-medium text-gray-700 mb-1">
            Straße *
          </label>
          <input
            type="text"
            id="strasse"
            name="strasse"
            required
            defaultValue={kunde?.strasse || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hausnummer */}
        <div>
          <label htmlFor="hausnummer" className="block text-sm font-medium text-gray-700 mb-1">
            Hausnummer *
          </label>
          <input
            type="text"
            id="hausnummer"
            name="hausnummer"
            required
            defaultValue={kunde?.hausnummer || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* PLZ */}
        <div>
          <label htmlFor="plz" className="block text-sm font-medium text-gray-700 mb-1">
            PLZ *
          </label>
          <input
            type="text"
            id="plz"
            name="plz"
            required
            defaultValue={kunde?.plz || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Ort */}
        <div>
          <label htmlFor="ort" className="block text-sm font-medium text-gray-700 mb-1">
            Ort *
          </label>
          <input
            type="text"
            id="ort"
            name="ort"
            required
            defaultValue={kunde?.ort || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Telefon */}
        <div>
          <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <input
            type="tel"
            id="telefon"
            name="telefon"
            defaultValue={kunde?.telefon || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mobil */}
        <div>
          <label htmlFor="mobil" className="block text-sm font-medium text-gray-700 mb-1">
            Mobil
          </label>
          <input
            type="tel"
            id="mobil"
            name="mobil"
            defaultValue={kunde?.mobil || ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* E-Mail */}
        <div className="md:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={kunde?.email || ""}
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
            defaultValue={kunde?.notizen || ""}
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
          {isSubmitting ? "Speichern..." : kunde ? "Änderungen speichern" : "Kunde anlegen"}
        </button>
        <Link
          href={kunde ? `/kunden/${kunde.id}` : "/kunden"}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
