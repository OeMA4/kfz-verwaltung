"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function VorgangActions({
  vorgangId,
  currentStatus,
  kundeId,
  fahrzeugId,
  isAbgerechnet,
  backUrl,
}: {
  vorgangId: string;
  currentStatus: string;
  kundeId: string;
  fahrzeugId: string;
  isAbgerechnet: boolean;
  backUrl?: string;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateStatus(newStatus: string) {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/vorgaenge/${vorgangId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Fehler beim Aktualisieren des Status");
      }
    } catch (error) {
      alert("Fehler beim Aktualisieren des Status");
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteVorgang() {
    if (!confirm("Möchten Sie diesen Vorgang wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/vorgaenge/${vorgangId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(backUrl || `/kunden/${kundeId}`);
        router.refresh();
      } else {
        alert("Fehler beim Löschen des Vorgangs");
      }
    } catch (error) {
      alert("Fehler beim Löschen des Vorgangs");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/kunden/${kundeId}/vorgang/${vorgangId}/bearbeiten`}
        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
      >
        Bearbeiten
      </Link>

      {currentStatus === "offen" && (
        <button
          onClick={() => updateStatus("in_bearbeitung")}
          disabled={isUpdating}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Starten
        </button>
      )}

      {currentStatus === "in_bearbeitung" && (
        <button
          onClick={() => updateStatus("abgeschlossen")}
          disabled={isUpdating}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Abschließen
        </button>
      )}

      {(currentStatus === "abgeschlossen" || currentStatus === "in_bearbeitung") && !isAbgerechnet && (
        <Link
          href={`/rechnungen/neu?kunde=${kundeId}&fahrzeug=${fahrzeugId}&vorgang=${vorgangId}`}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
        >
          Rechnung erstellen
        </Link>
      )}

      {currentStatus !== "offen" && currentStatus !== "abgerechnet" && (
        <button
          onClick={() => updateStatus("offen")}
          disabled={isUpdating}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          Zurücksetzen
        </button>
      )}

      {!isAbgerechnet && (
        <button
          onClick={deleteVorgang}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Löschen
        </button>
      )}
    </div>
  );
}
