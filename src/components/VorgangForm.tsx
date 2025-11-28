"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  kundeId: string;
  kilometerstand: number | null;
};

type Arbeit = {
  id: string;
  position: number;
  beschreibung: string;
  status: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  notizen: string | null;
};

type Vorgang = {
  id: string;
  vorgangsnummer: string;
  titel: string;
  beschreibung: string | null;
  status: string;
  eingang: Date;
  fertigstellung: Date | null;
  kmStandEingang: number | null;
  notizen: string | null;
  kundeId: string;
  fahrzeugId: string;
  arbeiten: Arbeit[];
};

type ArbeitFormData = {
  id: string;
  beschreibung: string;
  status: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  notizen: string;
};

export default function VorgangForm({
  vorgang,
  kunden,
  fahrzeuge,
  nextVorgangsnummer,
  preselectedKundeId,
  preselectedFahrzeugId,
  redirectUrl,
}: {
  vorgang?: Vorgang;
  kunden: Kunde[];
  fahrzeuge: Fahrzeug[];
  nextVorgangsnummer?: string;
  preselectedKundeId?: string;
  preselectedFahrzeugId?: string;
  redirectUrl?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kundeId, setKundeId] = useState(vorgang?.kundeId || preselectedKundeId || "");
  const [fahrzeugId, setFahrzeugId] = useState(vorgang?.fahrzeugId || preselectedFahrzeugId || "");
  const [vorgangsnummer, setVorgangsnummer] = useState(vorgang?.vorgangsnummer || nextVorgangsnummer || "");
  const [titel, setTitel] = useState(vorgang?.titel || "");
  const [beschreibung, setBeschreibung] = useState(vorgang?.beschreibung || "");
  const [eingang, setEingang] = useState(
    vorgang?.eingang
      ? new Date(vorgang.eingang).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [kmStandEingang, setKmStandEingang] = useState<string>(
    vorgang?.kmStandEingang?.toString() || ""
  );
  const [notizen, setNotizen] = useState(vorgang?.notizen || "");

  const [arbeiten, setArbeiten] = useState<ArbeitFormData[]>(
    vorgang?.arbeiten.map((a) => ({
      id: a.id,
      beschreibung: a.beschreibung,
      status: a.status,
      menge: a.menge,
      einheit: a.einheit,
      einzelpreis: a.einzelpreis,
      notizen: a.notizen || "",
    })) || []
  );

  const filteredFahrzeuge = kundeId
    ? fahrzeuge.filter((f) => f.kundeId === kundeId)
    : fahrzeuge;

  useEffect(() => {
    if (kundeId && fahrzeugId) {
      const fahrzeug = fahrzeuge.find((f) => f.id === fahrzeugId);
      if (fahrzeug && fahrzeug.kundeId !== kundeId) {
        setFahrzeugId("");
        setKmStandEingang("");
      }
    }
  }, [kundeId, fahrzeugId, fahrzeuge]);

  useEffect(() => {
    if (fahrzeugId && !kmStandEingang) {
      const fahrzeug = fahrzeuge.find((f) => f.id === fahrzeugId);
      if (fahrzeug?.kilometerstand) {
        setKmStandEingang(fahrzeug.kilometerstand.toString());
      }
    }
  }, [fahrzeugId, fahrzeuge, kmStandEingang]);

  const addArbeit = () => {
    setArbeiten([
      ...arbeiten,
      {
        id: `new-${Date.now()}`,
        beschreibung: "",
        status: "offen",
        menge: 1,
        einheit: "Stk",
        einzelpreis: 0,
        notizen: "",
      },
    ]);
  };

  const removeArbeit = (id: string) => {
    setArbeiten(arbeiten.filter((a) => a.id !== id));
  };

  const updateArbeit = (id: string, field: keyof ArbeitFormData, value: string | number) => {
    setArbeiten(
      arbeiten.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = {
      vorgangsnummer,
      titel,
      beschreibung: beschreibung || null,
      eingang: new Date(eingang),
      kmStandEingang: kmStandEingang ? parseInt(kmStandEingang) : null,
      notizen: notizen || null,
      kundeId,
      fahrzeugId,
      arbeiten: arbeiten
        .filter((a) => a.beschreibung.trim())
        .map((a, index) => ({
          id: a.id.startsWith("new-") ? undefined : a.id,
          position: index + 1,
          beschreibung: a.beschreibung,
          status: a.status,
          menge: a.menge,
          einheit: a.einheit,
          einzelpreis: a.einzelpreis,
          gesamtpreis: a.menge * a.einzelpreis,
          notizen: a.notizen || null,
        })),
    };

    try {
      const url = vorgang ? `/api/vorgaenge/${vorgang.id}` : "/api/vorgaenge";
      const method = vorgang ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(redirectUrl || `/kunden/${result.kundeId}/vorgang/${result.id}`);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {/* Basisdaten */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Basisdaten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorgangsnummer *
            </label>
            <input
              type="text"
              required
              value={vorgangsnummer}
              onChange={(e) => setVorgangsnummer(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <input
              type="text"
              required
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. Inspektion, Bremsenwechsel"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eingangsdatum *
            </label>
            <input
              type="date"
              required
              value={eingang}
              onChange={(e) => setEingang(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kunde *
            </label>
            <select
              required
              value={kundeId}
              onChange={(e) => setKundeId(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fahrzeug *
            </label>
            <select
              required
              value={fahrzeugId}
              onChange={(e) => setFahrzeugId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bitte wählen...</option>
              {filteredFahrzeuge.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.kennzeichen} - {f.marke} {f.modell}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilometerstand bei Eingang
            </label>
            <input
              type="number"
              value={kmStandEingang}
              onChange={(e) => setKmStandEingang(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beschreibung / Kundenauftrag
          </label>
          <textarea
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
            rows={3}
            placeholder="Was soll gemacht werden?"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Arbeiten */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Arbeiten / Positionen</h2>
          <button
            type="button"
            onClick={addArbeit}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Arbeit hinzufügen
          </button>
        </div>

        {arbeiten.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Noch keine Arbeiten erfasst.{" "}
            <button
              type="button"
              onClick={addArbeit}
              className="text-blue-600 hover:text-blue-800"
            >
              Erste Arbeit hinzufügen
            </button>
          </p>
        ) : (
          <div className="space-y-4">
            {arbeiten.map((arbeit, index) => (
              <div
                key={arbeit.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    Position {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeArbeit(arbeit.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Entfernen
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-xs text-gray-500 mb-1">
                      Beschreibung
                    </label>
                    <input
                      type="text"
                      value={arbeit.beschreibung}
                      onChange={(e) =>
                        updateArbeit(arbeit.id, "beschreibung", e.target.value)
                      }
                      placeholder="z.B. Ölwechsel, Bremsbeläge vorne"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Menge
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={arbeit.menge}
                      onChange={(e) =>
                        updateArbeit(arbeit.id, "menge", parseFloat(e.target.value) || 0)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Einheit
                    </label>
                    <select
                      value={arbeit.einheit}
                      onChange={(e) => updateArbeit(arbeit.id, "einheit", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Stk">Stk</option>
                      <option value="Std">Std</option>
                      <option value="Satz">Satz</option>
                      <option value="Liter">Liter</option>
                      <option value="Pausch.">Pausch.</option>
                    </select>
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Einzelpreis €
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={arbeit.einzelpreis}
                      onChange={(e) =>
                        updateArbeit(arbeit.id, "einzelpreis", parseFloat(e.target.value) || 0)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-1 flex items-end">
                    <div className="w-full text-right py-2 text-sm font-medium">
                      {(arbeit.menge * arbeit.einzelpreis).toFixed(2)} €
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Notizen (optional)
                  </label>
                  <input
                    type="text"
                    value={arbeit.notizen}
                    onChange={(e) => updateArbeit(arbeit.id, "notizen", e.target.value)}
                    placeholder="z.B. Teilenummer, Besonderheiten"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summen */}
        {arbeiten.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Netto:</span>
                  <span>
                    {arbeiten
                      .reduce((sum, a) => sum + a.menge * a.einzelpreis, 0)
                      .toFixed(2)}{" "}
                    €
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">MwSt. (19%):</span>
                  <span>
                    {(
                      arbeiten.reduce((sum, a) => sum + a.menge * a.einzelpreis, 0) *
                      0.19
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Brutto:</span>
                  <span>
                    {(
                      arbeiten.reduce((sum, a) => sum + a.menge * a.einzelpreis, 0) *
                      1.19
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interne Notizen */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Interne Notizen</h2>
        <textarea
          value={notizen}
          onChange={(e) => setNotizen(e.target.value)}
          rows={3}
          placeholder="Interne Anmerkungen zum Vorgang..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Aktionen */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Speichern..." : vorgang ? "Änderungen speichern" : "Vorgang anlegen"}
        </button>
        <Link
          href={vorgang ? `/vorgaenge/${vorgang.id}` : "/vorgaenge"}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
