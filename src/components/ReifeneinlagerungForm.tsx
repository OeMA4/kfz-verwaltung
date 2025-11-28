"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CircleDot, ArrowLeft, Sun, Snowflake, Cloud, Calendar } from "lucide-react"

type Kunde = {
  id: string
  vorname: string
  nachname: string
  firma: string | null
}

type Fahrzeug = {
  id: string
  kennzeichen: string
  marke: string
  modell: string
  kundeId: string
}

const reifenTypen = [
  { value: "sommer", label: "Sommerreifen", icon: Sun, color: "text-yellow-500" },
  { value: "winter", label: "Winterreifen", icon: Snowflake, color: "text-blue-500" },
  { value: "ganzjahres", label: "Ganzjahresreifen", icon: Cloud, color: "text-gray-500" },
]

const zustandOptionen = [
  { value: "gut", label: "Gut", color: "bg-green-100 text-green-800" },
  { value: "mittel", label: "Mittel", color: "bg-yellow-100 text-yellow-800" },
  { value: "schlecht", label: "Schlecht", color: "bg-orange-100 text-orange-800" },
  { value: "ersetzen", label: "Ersetzen", color: "bg-red-100 text-red-800" },
]

const felgenTypen = [
  { value: "stahl", label: "Stahlfelgen" },
  { value: "alu", label: "Alufelgen" },
]

export default function ReifeneinlagerungForm({
  kunden,
  fahrzeuge,
  preselectedKundeId,
  preselectedFahrzeugId,
}: {
  kunden: Kunde[]
  fahrzeuge: Fahrzeug[]
  preselectedKundeId?: string
  preselectedFahrzeugId?: string
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [kundeId, setKundeId] = useState(preselectedKundeId || "")
  const [fahrzeugId, setFahrzeugId] = useState(preselectedFahrzeugId || "")
  const [lagerplatznummer, setLagerplatznummer] = useState("")
  const [reifenTyp, setReifenTyp] = useState("sommer")
  const [hersteller, setHersteller] = useState("")
  const [modell, setModell] = useState("")
  const [groesse, setGroesse] = useState("")
  const [dot, setDot] = useState("")
  const [profiltiefe, setProfiltiefe] = useState("")
  const [zustand, setZustand] = useState("gut")
  const [anzahl, setAnzahl] = useState("4")
  const [mitFelgen, setMitFelgen] = useState(true)
  const [felgenTyp, setFelgenTyp] = useState("")
  const [eingelagertAm, setEingelagertAm] = useState(new Date().toISOString().split("T")[0])
  const [naechsterWechsel, setNaechsterWechsel] = useState("")
  const [notizen, setNotizen] = useState("")

  const filteredFahrzeuge = kundeId
    ? fahrzeuge.filter((f) => f.kundeId === kundeId)
    : fahrzeuge

  useEffect(() => {
    if (kundeId && fahrzeugId) {
      const fahrzeug = fahrzeuge.find((f) => f.id === fahrzeugId)
      if (fahrzeug && fahrzeug.kundeId !== kundeId) {
        setFahrzeugId("")
      }
    }
  }, [kundeId, fahrzeugId, fahrzeuge])

  // Nächsten Wechseltermin vorschlagen basierend auf Reifentyp
  useEffect(() => {
    if (!naechsterWechsel) {
      const heute = new Date()
      let vorschlag: Date

      if (reifenTyp === "sommer") {
        // Sommerreifen: Wechsel im Oktober
        vorschlag = new Date(heute.getFullYear(), 9, 15) // 15. Oktober
        if (vorschlag < heute) {
          vorschlag.setFullYear(vorschlag.getFullYear() + 1)
        }
      } else if (reifenTyp === "winter") {
        // Winterreifen: Wechsel im April
        vorschlag = new Date(heute.getFullYear(), 3, 15) // 15. April
        if (vorschlag < heute) {
          vorschlag.setFullYear(vorschlag.getFullYear() + 1)
        }
      } else {
        // Ganzjahresreifen: kein automatischer Vorschlag
        return
      }

      setNaechsterWechsel(vorschlag.toISOString().split("T")[0])
    }
  }, [reifenTyp])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!kundeId) {
      setError("Bitte wählen Sie einen Kunden aus")
      setIsSubmitting(false)
      return
    }

    if (!fahrzeugId) {
      setError("Bitte wählen Sie ein Fahrzeug aus")
      setIsSubmitting(false)
      return
    }

    if (!lagerplatznummer.trim()) {
      setError("Bitte geben Sie eine Lagerplatznummer ein")
      setIsSubmitting(false)
      return
    }

    const data = {
      lagerplatznummer: lagerplatznummer.trim(),
      reifenTyp,
      hersteller: hersteller.trim() || null,
      modell: modell.trim() || null,
      groesse: groesse.trim() || null,
      dot: dot.trim() || null,
      profiltiefe: profiltiefe ? parseFloat(profiltiefe) : null,
      zustand,
      eingelagertAm: eingelagertAm ? new Date(eingelagertAm).toISOString() : new Date().toISOString(),
      naechsterWechsel: naechsterWechsel ? new Date(naechsterWechsel).toISOString() : null,
      anzahl: parseInt(anzahl) || 4,
      mitFelgen,
      felgenTyp: mitFelgen ? felgenTyp || null : null,
      notizen: notizen.trim() || null,
      fahrzeugId,
      kundeId,
    }

    try {
      const response = await fetch("/api/reifen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/reifen")
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Ein Fehler ist aufgetreten")
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedReifenTyp = reifenTypen.find(t => t.value === reifenTyp)
  const ReifenIcon = selectedReifenTyp?.icon || CircleDot

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Kunde & Fahrzeug */}
      <Card>
        <CardHeader>
          <CardTitle>Kunde & Fahrzeug</CardTitle>
          <CardDescription>Wählen Sie den Kunden und das zugehörige Fahrzeug</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kunde">Kunde *</Label>
              <Select value={kundeId} onValueChange={setKundeId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {kunden.map((kunde) => (
                    <SelectItem key={kunde.id} value={kunde.id}>
                      {kunde.firma || `${kunde.vorname} ${kunde.nachname}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fahrzeug">Fahrzeug *</Label>
              <Select value={fahrzeugId} onValueChange={setFahrzeugId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Fahrzeug auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredFahrzeuge.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.kennzeichen} - {f.marke} {f.modell}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {kundeId && filteredFahrzeuge.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Keine Fahrzeuge für diesen Kunden vorhanden
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lagerplatznummer">Lagerplatznummer *</Label>
            <Input
              id="lagerplatznummer"
              value={lagerplatznummer}
              onChange={(e) => setLagerplatznummer(e.target.value)}
              placeholder="z.B. R-001-A"
              required
            />
            <p className="text-xs text-muted-foreground">
              Eindeutige Kennung für den Lagerplatz
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reifendaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReifenIcon className={`h-5 w-5 ${selectedReifenTyp?.color}`} />
            Reifendaten
          </CardTitle>
          <CardDescription>Informationen zu den eingelagerten Reifen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reifentyp Auswahl */}
          <div className="space-y-2">
            <Label>Reifentyp *</Label>
            <div className="grid grid-cols-3 gap-3">
              {reifenTypen.map((typ) => {
                const Icon = typ.icon
                const isSelected = reifenTyp === typ.value
                return (
                  <button
                    key={typ.value}
                    type="button"
                    onClick={() => setReifenTyp(typ.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${typ.color}`} />
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                      {typ.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hersteller">Hersteller</Label>
              <Input
                id="hersteller"
                value={hersteller}
                onChange={(e) => setHersteller(e.target.value)}
                placeholder="z.B. Continental, Michelin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modell">Modell</Label>
              <Input
                id="modell"
                value={modell}
                onChange={(e) => setModell(e.target.value)}
                placeholder="z.B. WinterContact TS 870"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groesse">Größe</Label>
              <Input
                id="groesse"
                value={groesse}
                onChange={(e) => setGroesse(e.target.value)}
                placeholder="z.B. 225/45 R17"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dot">DOT-Nummer</Label>
              <Input
                id="dot"
                value={dot}
                onChange={(e) => setDot(e.target.value)}
                placeholder="z.B. 2522 (25. Woche 2022)"
              />
              <p className="text-xs text-muted-foreground">
                Herstellungsdatum der Reifen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profiltiefe">Profiltiefe (mm)</Label>
              <Input
                id="profiltiefe"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={profiltiefe}
                onChange={(e) => setProfiltiefe(e.target.value)}
                placeholder="z.B. 5.5"
              />
              {parseFloat(profiltiefe) > 0 && parseFloat(profiltiefe) < 3 && (
                <p className="text-xs text-warning">
                  Profiltiefe unter 3mm - Ersatz empfohlen
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="anzahl">Anzahl</Label>
              <Select value={anzahl} onValueChange={setAnzahl}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Reifen</SelectItem>
                  <SelectItem value="4">4 Reifen</SelectItem>
                  <SelectItem value="5">5 Reifen (inkl. Ersatz)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zustand</Label>
            <div className="flex flex-wrap gap-2">
              {zustandOptionen.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setZustand(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    zustand === option.value
                      ? `${option.color} border-current`
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Felgen */}
      <Card>
        <CardHeader>
          <CardTitle>Felgen</CardTitle>
          <CardDescription>Sind Felgen bei den Reifen dabei?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMitFelgen(true)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                mitFelgen
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="font-medium">Mit Felgen</span>
              <p className="text-xs text-muted-foreground mt-1">
                Kompletträder eingelagert
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMitFelgen(false)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                !mitFelgen
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="font-medium">Ohne Felgen</span>
              <p className="text-xs text-muted-foreground mt-1">
                Nur Reifen eingelagert
              </p>
            </button>
          </div>

          {mitFelgen && (
            <div className="space-y-2">
              <Label htmlFor="felgenTyp">Felgentyp</Label>
              <Select value={felgenTyp} onValueChange={setFelgenTyp}>
                <SelectTrigger>
                  <SelectValue placeholder="Felgentyp auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {felgenTypen.map((typ) => (
                    <SelectItem key={typ.value} value={typ.value}>
                      {typ.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Termine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Termine
          </CardTitle>
          <CardDescription>Einlagerungsdatum und geplanter Wechseltermin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eingelagertAm">Eingelagert am</Label>
              <Input
                id="eingelagertAm"
                type="date"
                value={eingelagertAm}
                onChange={(e) => setEingelagertAm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="naechsterWechsel">Nächster Wechsel</Label>
              <Input
                id="naechsterWechsel"
                type="date"
                value={naechsterWechsel}
                onChange={(e) => setNaechsterWechsel(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {reifenTyp === "sommer" && "Vorschlag: Oktober (Wechsel auf Winter)"}
                {reifenTyp === "winter" && "Vorschlag: April (Wechsel auf Sommer)"}
                {reifenTyp === "ganzjahres" && "Kein saisonaler Wechsel erforderlich"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notizen */}
      <Card>
        <CardHeader>
          <CardTitle>Notizen</CardTitle>
          <CardDescription>Zusätzliche Anmerkungen zur Einlagerung</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            rows={3}
            placeholder="z.B. Beschädigungen, besondere Hinweise..."
          />
        </CardContent>
      </Card>

      {/* Aktionen */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <CircleDot className="h-4 w-4 mr-2" />
          {isSubmitting ? "Speichern..." : "Einlagerung erfassen"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/reifen">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Abbrechen
          </Link>
        </Button>
      </div>
    </form>
  )
}
