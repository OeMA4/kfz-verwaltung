"use client";

import { useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { de } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { de };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type Fahrzeug = {
  id: string;
  kennzeichen: string;
  marke: string;
  modell: string;
  kunde: {
    id: string;
    vorname: string;
    nachname: string;
    firma: string | null;
  };
};

type KalenderEintrag = {
  id: string;
  titel: string;
  beschreibung: string | null;
  startDatum: Date;
  endDatum: Date;
  ganztaegig: boolean;
  typ: string;
  farbe: string | null;
  fahrzeugId: string | null;
  fahrzeug: Fahrzeug | null;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: KalenderEintrag;
};

const messages = {
  allDay: "Ganztägig",
  previous: "Zurück",
  next: "Vor",
  today: "Heute",
  month: "Monat",
  week: "Woche",
  day: "Tag",
  agenda: "Agenda",
  date: "Datum",
  time: "Uhrzeit",
  event: "Termin",
  noEventsInRange: "Keine Termine in diesem Zeitraum",
  showMore: (total: number) => `+${total} weitere`,
};

export default function KalenderView({
  initialEintraege,
  fahrzeuge,
}: {
  initialEintraege: KalenderEintrag[];
  fahrzeuge: Fahrzeug[];
}) {
  const [eintraege, setEintraege] = useState<KalenderEintrag[]>(initialEintraege);
  const [selectedEvent, setSelectedEvent] = useState<KalenderEintrag | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEventSlot, setNewEventSlot] = useState<{ start: Date; end: Date } | null>(null);

  const events: CalendarEvent[] = eintraege.map((eintrag) => ({
    id: eintrag.id,
    title: eintrag.titel,
    start: new Date(eintrag.startDatum),
    end: new Date(eintrag.endDatum),
    allDay: eintrag.ganztaegig,
    resource: eintrag,
  }));

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setIsEditing(false);
    setIsModalOpen(true);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setNewEventSlot({ start, end });
    setSelectedEvent(null);
    setIsEditing(true);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setNewEventSlot(null);
    setIsEditing(false);
  };

  const handleSave = async (data: Partial<KalenderEintrag>) => {
    try {
      if (selectedEvent) {
        const response = await fetch(`/api/kalender/${selectedEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          const updated = await response.json();
          setEintraege((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e))
          );
        }
      } else if (newEventSlot) {
        const response = await fetch("/api/kalender", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            startDatum: newEventSlot.start,
            endDatum: newEventSlot.end,
          }),
        });
        if (response.ok) {
          const created = await response.json();
          setEintraege((prev) => [...prev, created]);
        }
      }
      handleCloseModal();
    } catch (error) {
      alert("Fehler beim Speichern");
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm("Möchten Sie diesen Termin wirklich löschen?")) return;

    try {
      const response = await fetch(`/api/kalender/${selectedEvent.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEintraege((prev) => prev.filter((e) => e.id !== selectedEvent.id));
        handleCloseModal();
      }
    } catch (error) {
      alert("Fehler beim Löschen");
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.resource.farbe || "#3b82f6",
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
      },
    };
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-[700px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          messages={messages}
          culture="de"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.MONTH}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {selectedEvent && !isEditing
                ? "Termindetails"
                : selectedEvent
                ? "Termin bearbeiten"
                : "Neuer Termin"}
            </h2>

            {selectedEvent && !isEditing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Titel</p>
                  <p className="font-medium">{selectedEvent.titel}</p>
                </div>
                {selectedEvent.beschreibung && (
                  <div>
                    <p className="text-sm text-gray-500">Beschreibung</p>
                    <p>{selectedEvent.beschreibung}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Zeitraum</p>
                  <p>
                    {new Date(selectedEvent.startDatum).toLocaleString("de-DE")}
                    {" - "}
                    {new Date(selectedEvent.endDatum).toLocaleString("de-DE")}
                  </p>
                </div>
                {selectedEvent.fahrzeug && (
                  <div>
                    <p className="text-sm text-gray-500">Fahrzeug</p>
                    <p>
                      {selectedEvent.fahrzeug.kennzeichen} -{" "}
                      {selectedEvent.fahrzeug.kunde.firma ||
                        `${selectedEvent.fahrzeug.kunde.vorname} ${selectedEvent.fahrzeug.kunde.nachname}`}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Löschen
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            ) : (
              <EventForm
                event={selectedEvent}
                slot={newEventSlot}
                fahrzeuge={fahrzeuge}
                onSave={handleSave}
                onCancel={handleCloseModal}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EventForm({
  event,
  slot,
  fahrzeuge,
  onSave,
  onCancel,
}: {
  event: KalenderEintrag | null;
  slot: { start: Date; end: Date } | null;
  fahrzeuge: Fahrzeug[];
  onSave: (data: Partial<KalenderEintrag>) => void;
  onCancel: () => void;
}) {
  const [titel, setTitel] = useState(event?.titel || "");
  const [beschreibung, setBeschreibung] = useState(event?.beschreibung || "");
  const [typ, setTyp] = useState(event?.typ || "rueckgabe");
  const [farbe, setFarbe] = useState(event?.farbe || "#3b82f6");
  const [fahrzeugId, setFahrzeugId] = useState(event?.fahrzeugId || "");
  const [startDatum, setStartDatum] = useState(
    formatDateTimeLocal(event?.startDatum || slot?.start || new Date())
  );
  const [endDatum, setEndDatum] = useState(
    formatDateTimeLocal(event?.endDatum || slot?.end || new Date())
  );

  function formatDateTimeLocal(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      titel,
      beschreibung: beschreibung || null,
      typ,
      farbe,
      fahrzeugId: fahrzeugId || null,
      startDatum: new Date(startDatum),
      endDatum: new Date(endDatum),
      ganztaegig: false,
    });
  };

  const colorOptions = [
    { value: "#3b82f6", label: "Blau" },
    { value: "#22c55e", label: "Grün" },
    { value: "#f59e0b", label: "Orange" },
    { value: "#ef4444", label: "Rot" },
    { value: "#8b5cf6", label: "Lila" },
    { value: "#6b7280", label: "Grau" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titel *
        </label>
        <input
          type="text"
          required
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beschreibung
        </label>
        <textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start *
          </label>
          <input
            type="datetime-local"
            required
            value={startDatum}
            onChange={(e) => setStartDatum(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ende *
          </label>
          <input
            type="datetime-local"
            required
            value={endDatum}
            onChange={(e) => setEndDatum(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Typ
          </label>
          <select
            value={typ}
            onChange={(e) => setTyp(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rueckgabe">Rückgabe</option>
            <option value="termin">Termin</option>
            <option value="erinnerung">Erinnerung</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Farbe
          </label>
          <select
            value={farbe}
            onChange={(e) => setFarbe(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {colorOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fahrzeug (optional)
        </label>
        <select
          value={fahrzeugId}
          onChange={(e) => setFahrzeugId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Kein Fahrzeug</option>
          {fahrzeuge.map((f) => (
            <option key={f.id} value={f.id}>
              {f.kennzeichen} - {f.kunde.firma || `${f.kunde.vorname} ${f.kunde.nachname}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
