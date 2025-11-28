"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RechnungActions({
  rechnungId,
  currentStatus,
  kundeEmail,
}: {
  rechnungId: string;
  currentStatus: string;
  kundeEmail: string | null;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function updateStatus(newStatus: string) {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/rechnungen/${rechnungId}`, {
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

  async function sendEmail() {
    if (!kundeEmail) {
      alert("Der Kunde hat keine E-Mail-Adresse hinterlegt.");
      return;
    }

    if (!confirm(`Rechnung per E-Mail an ${kundeEmail} senden?`)) {
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/rechnungen/${rechnungId}/email`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Rechnung wurde erfolgreich versendet!");
      } else {
        const data = await response.json();
        alert(data.error || "Fehler beim Versenden der E-Mail");
      }
    } catch (error) {
      alert("Fehler beim Versenden der E-Mail");
    } finally {
      setIsSending(false);
    }
  }

  async function deleteRechnung() {
    if (!confirm("Möchten Sie diese Rechnung wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/rechnungen/${rechnungId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/rechnungen");
        router.refresh();
      } else {
        alert("Fehler beim Löschen der Rechnung");
      }
    } catch (error) {
      alert("Fehler beim Löschen der Rechnung");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/api/rechnungen/${rechnungId}/pdf`}
        target="_blank"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        PDF anzeigen
      </Link>

      <button
        onClick={sendEmail}
        disabled={isSending || !kundeEmail}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={!kundeEmail ? "Keine E-Mail-Adresse hinterlegt" : ""}
      >
        {isSending ? "Senden..." : "Per E-Mail senden"}
      </button>

      {currentStatus === "offen" && (
        <button
          onClick={() => updateStatus("bezahlt")}
          disabled={isUpdating}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          Als bezahlt markieren
        </button>
      )}

      {currentStatus === "bezahlt" && (
        <button
          onClick={() => updateStatus("offen")}
          disabled={isUpdating}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
        >
          Als offen markieren
        </button>
      )}

      {currentStatus !== "storniert" && (
        <button
          onClick={() => updateStatus("storniert")}
          disabled={isUpdating}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Stornieren
        </button>
      )}

      <button
        onClick={deleteRechnung}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Löschen
      </button>
    </div>
  );
}
