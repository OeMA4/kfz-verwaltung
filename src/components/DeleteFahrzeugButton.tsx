"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteFahrzeugButton({
  fahrzeugId,
  kennzeichen,
}: {
  fahrzeugId: string;
  kennzeichen: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Möchten Sie das Fahrzeug "${kennzeichen}" wirklich löschen?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/fahrzeuge/${fahrzeugId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/fahrzeuge");
        router.refresh();
      } else {
        alert("Fehler beim Löschen des Fahrzeugs");
      }
    } catch (error) {
      alert("Fehler beim Löschen des Fahrzeugs");
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
