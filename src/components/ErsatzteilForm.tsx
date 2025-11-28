"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Package, ArrowLeft, Euro } from "lucide-react"

type Ersatzteil = {
  id: string
  artikelnummer: string
  bezeichnung: string
  beschreibung: string | null
  kategorie: string | null
  hersteller: string | null
  einkaufspreis: number
  verkaufspreis: number
  bestand: number
  mindestbestand: number
  lagerort: string | null
  fahrzeugMarken: string | null
}

const kategorien = [
  { value: "motor", label: "Motor" },
  { value: "bremsen", label: "Bremsen" },
  { value: "fahrwerk", label: "Fahrwerk" },
  { value: "elektrik", label: "Elektrik" },
  { value: "karosserie", label: "Karosserie" },
  { value: "oele", label: "Öle & Flüssigkeiten" },
  { value: "filter", label: "Filter" },
  { value: "sonstiges", label: "Sonstiges" },
]

export default function ErsatzteilForm({
  ersatzteil,
}: {
  ersatzteil?: Ersatzteil
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!ersatzteil

  const [artikelnummer, setArtikelnummer] = useState(ersatzteil?.artikelnummer || "")
  const [bezeichnung, setBezeichnung] = useState(ersatzteil?.bezeichnung || "")
  const [beschreibung, setBeschreibung] = useState(ersatzteil?.beschreibung || "")
  const [kategorie, setKategorie] = useState(ersatzteil?.kategorie || "")
  const [hersteller, setHersteller] = useState(ersatzteil?.hersteller || "")
  const [einkaufspreis, setEinkaufspreis] = useState(ersatzteil?.einkaufspreis?.toString() || "")
  const [verkaufspreis, setVerkaufspreis] = useState(ersatzteil?.verkaufspreis?.toString() || "")
  const [bestand, setBestand] = useState(ersatzteil?.bestand?.toString() || "0")
  const [mindestbestand, setMindestbestand] = useState(ersatzteil?.mindestbestand?.toString() || "0")
  const [lagerort, setLagerort] = useState(ersatzteil?.lagerort || "")
  const [fahrzeugMarken, setFahrzeugMarken] = useState(ersatzteil?.fahrzeugMarken || "")

  // Marge berechnen
  const ek = parseFloat(einkaufspreis) || 0
  const vk = parseFloat(verkaufspreis) || 0
  const marge = ek > 0 ? ((vk - ek) / ek * 100).toFixed(1) : "0"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!artikelnummer.trim()) {
      setError("Bitte geben Sie eine Artikelnummer ein")
      setIsSubmitting(false)
      return
    }

    if (!bezeichnung.trim()) {
      setError("Bitte geben Sie eine Bezeichnung ein")
      setIsSubmitting(false)
      return
    }

    const data = {
      artikelnummer: artikelnummer.trim(),
      bezeichnung: bezeichnung.trim(),
      beschreibung: beschreibung.trim() || null,
      kategorie: kategorie || null,
      hersteller: hersteller.trim() || null,
      einkaufspreis: parseFloat(einkaufspreis) || 0,
      verkaufspreis: parseFloat(verkaufspreis) || 0,
      bestand: parseInt(bestand) || 0,
      mindestbestand: parseInt(mindestbestand) || 0,
      lagerort: lagerort.trim() || null,
      fahrzeugMarken: fahrzeugMarken.trim() || null,
    }

    try {
      const url = isEditing ? `/api/ersatzteile/${ersatzteil.id}` : "/api/ersatzteile"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/ersatzteile")
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Basisdaten */}
      <Card>
        <CardHeader>
          <CardTitle>Artikeldaten</CardTitle>
          <CardDescription>Grundlegende Informationen zum Ersatzteil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="artikelnummer">Artikelnummer *</Label>
              <Input
                id="artikelnummer"
                value={artikelnummer}
                onChange={(e) => setArtikelnummer(e.target.value)}
                placeholder="z.B. BRE-001-VW"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategorie">Kategorie</Label>
              <Select value={kategorie} onValueChange={setKategorie}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {kategorien.map((kat) => (
                    <SelectItem key={kat.value} value={kat.value}>
                      {kat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bezeichnung">Bezeichnung *</Label>
            <Input
              id="bezeichnung"
              value={bezeichnung}
              onChange={(e) => setBezeichnung(e.target.value)}
              placeholder="z.B. Bremsbeläge Vorderachse"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Zusätzliche Informationen zum Artikel..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hersteller">Hersteller</Label>
              <Input
                id="hersteller"
                value={hersteller}
                onChange={(e) => setHersteller(e.target.value)}
                placeholder="z.B. Bosch, ATE, Brembo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fahrzeugMarken">Fahrzeugkompatibilität</Label>
              <Input
                id="fahrzeugMarken"
                value={fahrzeugMarken}
                onChange={(e) => setFahrzeugMarken(e.target.value)}
                placeholder="z.B. VW, Audi, Seat, Skoda"
              />
              <p className="text-xs text-muted-foreground">
                Komma-getrennte Liste der kompatiblen Marken
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Preise
          </CardTitle>
          <CardDescription>Einkaufs- und Verkaufspreise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="einkaufspreis">Einkaufspreis (netto)</Label>
              <div className="relative">
                <Input
                  id="einkaufspreis"
                  type="number"
                  step="0.01"
                  min="0"
                  value={einkaufspreis}
                  onChange={(e) => setEinkaufspreis(e.target.value)}
                  placeholder="0.00"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verkaufspreis">Verkaufspreis (netto)</Label>
              <div className="relative">
                <Input
                  id="verkaufspreis"
                  type="number"
                  step="0.01"
                  min="0"
                  value={verkaufspreis}
                  onChange={(e) => setVerkaufspreis(e.target.value)}
                  placeholder="0.00"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Marge</Label>
              <div className="h-10 flex items-center px-3 bg-muted rounded-md">
                <span className={`font-medium ${parseFloat(marge) > 0 ? "text-green-600" : parseFloat(marge) < 0 ? "text-red-600" : ""}`}>
                  {marge}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lagerbestand */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lagerbestand
          </CardTitle>
          <CardDescription>Bestandsverwaltung und Lagerort</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bestand">Aktueller Bestand</Label>
              <Input
                id="bestand"
                type="number"
                min="0"
                value={bestand}
                onChange={(e) => setBestand(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mindestbestand">Mindestbestand</Label>
              <Input
                id="mindestbestand"
                type="number"
                min="0"
                value={mindestbestand}
                onChange={(e) => setMindestbestand(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Warnung bei Unterschreitung
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lagerort">Lagerort</Label>
              <Input
                id="lagerort"
                value={lagerort}
                onChange={(e) => setLagerort(e.target.value)}
                placeholder="z.B. Regal A3, Fach 5"
              />
            </div>
          </div>

          {parseInt(bestand) <= parseInt(mindestbestand) && parseInt(mindestbestand) > 0 && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
              Achtung: Der aktuelle Bestand liegt unter oder am Mindestbestand!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aktionen */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <Package className="h-4 w-4 mr-2" />
          {isSubmitting
            ? (isEditing ? "Speichern..." : "Erstellen...")
            : (isEditing ? "Änderungen speichern" : "Ersatzteil anlegen")
          }
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/ersatzteile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Abbrechen
          </Link>
        </Button>
      </div>
    </form>
  )
}
