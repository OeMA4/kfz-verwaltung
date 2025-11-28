"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteKundeButton({
  kundeId,
  kundeName,
}: {
  kundeId: string;
  kundeName: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Möchten Sie den Kunden "${kundeName}" wirklich löschen? Alle zugehörigen Fahrzeuge und Rechnungen werden ebenfalls gelöscht.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/kunden/${kundeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/kunden");
        router.refresh();
      } else {
        alert("Fehler beim Löschen des Kunden");
      }
    } catch (error) {
      alert("Fehler beim Löschen des Kunden");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
    >
      {isDeleting ? "Löschen..." : "Löschen"}
    </button>
  );
}
