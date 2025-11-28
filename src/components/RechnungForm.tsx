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
};

type VorgangsArbeit = {
  id: string;
  beschreibung: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
};

type Vorgang = {
  id: string;
  vorgangsnummer: string;
  titel: string;
  status: string;
  kundeId: string;
  fahrzeugId: string;
  fahrzeug: {
    kennzeichen: string;
  };
  kunde: {
    vorname: string;
    nachname: string;
    firma: string | null;
  };
  arbeiten: VorgangsArbeit[];
  rechnungen: { id: string }[];
};

type Position = {
  id: string;
  beschreibung: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
};

export default function RechnungForm({
  kunden,
  fahrzeuge,
  vorgaenge = [],
  nextRechnungsnummer,
  preselectedKundeId,
  preselectedFahrzeugId,
  preselectedVorgangIds = [],
}: {
  kunden: Kunde[];
  fahrzeuge: Fahrzeug[];
  vorgaenge?: Vorgang[];
  nextRechnungsnummer: string;
  preselectedKundeId?: string;
  preselectedFahrzeugId?: string;
  preselectedVorgangIds?: string[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kundeId, setKundeId] = useState(preselectedKundeId || "");
  const [fahrzeugId, setFahrzeugId] = useState(preselectedFahrzeugId || "");
  const [rechnungsnummer, setRechnungsnummer] = useState(nextRechnungsnummer);
  const [datum, setDatum] = useState(new Date().toISOString().split("T")[0]);
  const [faelligBis, setFaelligBis] = useState("");
  const [mwstSatz, setMwstSatz] = useState(19);
  const [notizen, setNotizen] = useState("");

  const [selectedVorgangIds, setSelectedVorgangIds] = useState<string[]>(preselectedVorgangIds);
  const [positionen, setPositionen] = useState<Position[]>([]);

  const filteredFahrzeuge = kundeId
    ? fahrzeuge.filter((f) => f.kundeId === kundeId)
    : fahrzeuge;

  // Filter Vorgänge nach Kunde und noch nicht abgerechnet
  const filteredVorgaenge = vorgaenge.filter(
    (v) =>
      (!kundeId || v.kundeId === kundeId) &&
      v.rechnungen.length === 0
  );

  // Lade Positionen aus Vorgängen beim Start
  useEffect(() => {
    if (preselectedVorgangIds.length > 0) {
      loadPositionenFromVorgaenge(preselectedVorgangIds);
    } else if (positionen.length === 0) {
      setPositionen([
        { id: "1", beschreibung: "", menge: 1, einheit: "Stk", einzelpreis: 0 },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (kundeId && fahrzeugId) {
      const fahrzeug = fahrzeuge.find((f) => f.id === fahrzeugId);
      if (fahrzeug && fahrzeug.kundeId !== kundeId) {
        setFahrzeugId("");
      }
    }
  }, [kundeId, fahrzeugId, fahrzeuge]);

  function loadPositionenFromVorgaenge(vorgangIds: string[]) {
    const selectedVorgaenge = vorgaenge.filter((v) => vorgangIds.includes(v.id));
    const newPositionen: Position[] = [];

    selectedVorgaenge.forEach((vorgang) => {
      // Füge einen Vorgang-Header hinzu
      newPositionen.push({
        id: `header-${vorgang.id}`,
        beschreibung: `--- ${vorgang.vorgangsnummer}: ${vorgang.titel} (${vorgang.fahrzeug.kennzeichen}) ---`,
        menge: 0,
        einheit: "Stk",
        einzelpreis: 0,
      });

      // Füge alle Arbeiten hinzu
      vorgang.arbeiten.forEach((arbeit) => {
        newPositionen.push({
          id: `${vorgang.id}-${arbeit.id}`,
          beschreibung: arbeit.beschreibung,
          menge: arbeit.menge,
          einheit: arbeit.einheit,
          einzelpreis: arbeit.einzelpreis,
        });
      });
    });

    if (newPositionen.length > 0) {
      setPositionen(newPositionen);
    }

    // Setze Kunde und Fahrzeug vom ersten Vorgang
    if (selectedVorgaenge.length > 0) {
      setKundeId(selectedVorgaenge[0].kundeId);
      setFahrzeugId(selectedVorgaenge[0].fahrzeugId);
    }
  }

  function toggleVorgang(vorgangId: string) {
    let newSelectedIds: string[];
    if (selectedVorgangIds.includes(vorgangId)) {
      newSelectedIds = selectedVorgangIds.filter((id) => id !== vorgangId);
    } else {
      newSelectedIds = [...selectedVorgangIds, vorgangId];
    }
    setSelectedVorgangIds(newSelectedIds);
    loadPositionenFromVorgaenge(newSelectedIds);
  }

  const addPosition = () => {
    setPositionen([
      ...positionen,
      {
        id: String(Date.now()),
        beschreibung: "",
        menge: 1,
        einheit: "Stk",
        einzelpreis: 0,
      },
    ]);
  };

  const removePosition = (id: string) => {
    const newPositionen = positionen.filter((p) => p.id !== id);
    if (newPositionen.length === 0) {
      setPositionen([
        { id: "1", beschreibung: "", menge: 1, einheit: "Stk", einzelpreis: 0 },
      ]);
    } else {
      setPositionen(newPositionen);
    }
  };

  const updatePosition = (id: string, field: keyof Position, value: string | number) => {
    setPositionen(
      positionen.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const calculateTotals = () => {
    const netto = positionen.reduce(
      (sum, p) => sum + p.menge * p.einzelpreis,
      0
    );
    const mwst = netto * (mwstSatz / 100);
    const brutto = netto + mwst;
    return { netto, mwst, brutto };
  };

  const totals = calculateTotals();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Filter Header-Zeilen und leere Positionen
    const validPositionen = positionen.filter(
      (p) => p.beschreibung.trim() && !p.id.startsWith("header-") && p.menge > 0
    );

    if (validPositionen.length === 0) {
      setError("Mindestens eine Position muss ausgefüllt sein");
      setIsSubmitting(false);
      return;
    }

    const data = {
      rechnungsnummer,
      datum: new Date(datum),
      faelligBis: faelligBis ? new Date(faelligBis) : null,
      kundeId,
      fahrzeugId: fahrzeugId || null,
      mwstSatz,
      notizen: notizen || null,
      vorgangIds: selectedVorgangIds,
      positionen: validPositionen.map((p, index) => ({
        position: index + 1,
        beschreibung: p.beschreibung,
        menge: p.menge,
        einheit: p.einheit,
        einzelpreis: p.einzelpreis,
        gesamtpreis: p.menge * p.einzelpreis,
      })),
    };

    try {
      const response = await fetch("/api/rechnungen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/rechnungen/${result.id}`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechnungsnummer *
            </label>
            <input
              type="text"
              required
              value={rechnungsnummer}
              onChange={(e) => setRechnungsnummer(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum *
            </label>
            <input
              type="date"
              required
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fällig bis
            </label>
            <input
              type="date"
              value={faelligBis}
              onChange={(e) => setFaelligBis(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MwSt.-Satz
            </label>
            <select
              value={mwstSatz}
              onChange={(e) => setMwstSatz(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={19}>19%</option>
              <option value={7}>7%</option>
              <option value={0}>0%</option>
            </select>
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
              onChange={(e) => {
                setKundeId(e.target.value);
                setSelectedVorgangIds([]);
              }}
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
              Fahrzeug
            </label>
            <select
              value={fahrzeugId}
              onChange={(e) => setFahrzeugId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kein Fahrzeug</option>
              {filteredFahrzeuge.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.kennzeichen} - {f.marke} {f.modell}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vorgänge auswählen */}
      {filteredVorgaenge.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Vorgänge abrechnen
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Wählen Sie Vorgänge aus, die in diese Rechnung aufgenommen werden sollen.
            Die Positionen werden automatisch übernommen.
          </p>
          <div className="space-y-2">
            {filteredVorgaenge.map((vorgang) => (
              <label
                key={vorgang.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedVorgangIds.includes(vorgang.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedVorgangIds.includes(vorgang.id)}
                  onChange={() => toggleVorgang(vorgang.id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      {vorgang.vorgangsnummer}: {vorgang.titel}
                    </span>
                    <span className="text-sm text-gray-500">
                      {vorgang.arbeiten.reduce((sum, a) => sum + a.gesamtpreis, 0).toFixed(2)} € netto
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {vorgang.fahrzeug.kennzeichen} •{" "}
                    {vorgang.kunde.firma || `${vorgang.kunde.vorname} ${vorgang.kunde.nachname}`} •{" "}
                    {vorgang.arbeiten.length} Arbeit(en)
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Positionen */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Positionen</h2>
          <button
            type="button"
            onClick={addPosition}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Position hinzufügen
          </button>
        </div>

        <div className="space-y-4">
          {positionen.map((pos) => {
            const isHeader = pos.id.startsWith("header-");
            if (isHeader) {
              return (
                <div
                  key={pos.id}
                  className="bg-gray-100 px-4 py-2 rounded-md text-sm font-medium text-gray-700"
                >
                  {pos.beschreibung}
                </div>
              );
            }

            return (
              <div
                key={pos.id}
                className="grid grid-cols-12 gap-2 items-start border-b border-gray-100 pb-4"
              >
                <div className="col-span-12 md:col-span-5">
                  <label className="block text-xs text-gray-500 mb-1">
                    Beschreibung
                  </label>
                  <input
                    type="text"
                    value={pos.beschreibung}
                    onChange={(e) =>
                      updatePosition(pos.id, "beschreibung", e.target.value)
                    }
                    placeholder="z.B. Ölwechsel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Menge</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pos.menge}
                    onChange={(e) =>
                      updatePosition(pos.id, "menge", parseFloat(e.target.value) || 0)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-4 md:col-span-1">
                  <label className="block text-xs text-gray-500 mb-1">Einheit</label>
                  <select
                    value={pos.einheit}
                    onChange={(e) => updatePosition(pos.id, "einheit", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Stk">Stk</option>
                    <option value="Std">Std</option>
                    <option value="Satz">Satz</option>
                    <option value="Liter">Liter</option>
                    <option value="km">km</option>
                    <option value="Pausch.">Pausch.</option>
                  </select>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Einzelpreis €
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pos.einzelpreis}
                    onChange={(e) =>
                      updatePosition(pos.id, "einzelpreis", parseFloat(e.target.value) || 0)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-10 md:col-span-1 flex items-end">
                  <div className="w-full text-right py-2 text-sm font-medium">
                    {(pos.menge * pos.einzelpreis).toFixed(2)} €
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removePosition(pos.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summen */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Netto:</span>
                <span>{totals.netto.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">MwSt. ({mwstSatz}%):</span>
                <span>{totals.mwst.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Brutto:</span>
                <span>{totals.brutto.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notizen */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notizen</h2>
        <textarea
          value={notizen}
          onChange={(e) => setNotizen(e.target.value)}
          rows={3}
          placeholder="Interne Notizen zur Rechnung..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Aktionen */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Erstellen..." : "Rechnung erstellen"}
        </button>
        <Link
          href="/rechnungen"
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
