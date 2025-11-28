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
import { Plus, Trash2, Calculator, ArrowLeft } from "lucide-react"

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

type Position = {
  id: string
  typ: string
  beschreibung: string
  menge: number
  einheit: string
  einzelpreis: number
}

export default function KostenvoranschlagForm({
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
  const [titel, setTitel] = useState("")
  const [beschreibung, setBeschreibung] = useState("")
  const [gueltigBis, setGueltigBis] = useState(() => {
    // Standard: 30 Tage gültig
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split("T")[0]
  })
  const [mwstSatz, setMwstSatz] = useState(19)
  const [notizen, setNotizen] = useState("")

  const [positionen, setPositionen] = useState<Position[]>([
    { id: "1", typ: "arbeit", beschreibung: "", menge: 1, einheit: "Std", einzelpreis: 0 },
  ])

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

  const addPosition = (typ: string = "arbeit") => {
    setPositionen([
      ...positionen,
      {
        id: String(Date.now()),
        typ,
        beschreibung: "",
        menge: 1,
        einheit: typ === "arbeit" ? "Std" : "Stk",
        einzelpreis: 0,
      },
    ])
  }

  const removePosition = (id: string) => {
    const newPositionen = positionen.filter((p) => p.id !== id)
    if (newPositionen.length === 0) {
      setPositionen([
        { id: "1", typ: "arbeit", beschreibung: "", menge: 1, einheit: "Std", einzelpreis: 0 },
      ])
    } else {
      setPositionen(newPositionen)
    }
  }

  const updatePosition = (id: string, field: keyof Position, value: string | number) => {
    setPositionen(
      positionen.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    )
  }

  const calculateTotals = () => {
    const netto = positionen.reduce(
      (sum, p) => sum + p.menge * p.einzelpreis,
      0
    )
    const mwst = netto * (mwstSatz / 100)
    const brutto = netto + mwst
    return { netto, mwst, brutto }
  }

  const totals = calculateTotals()

  // Gruppiere Positionen nach Typ
  const arbeitPositionen = positionen.filter(p => p.typ === "arbeit")
  const ersatzteilPositionen = positionen.filter(p => p.typ === "ersatzteil")
  const sonstigePositionen = positionen.filter(p => p.typ === "sonstiges")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const validPositionen = positionen.filter(
      (p) => p.beschreibung.trim() && p.menge > 0
    )

    if (validPositionen.length === 0) {
      setError("Mindestens eine Position muss ausgefüllt sein")
      setIsSubmitting(false)
      return
    }

    if (!titel.trim()) {
      setError("Bitte geben Sie einen Titel ein")
      setIsSubmitting(false)
      return
    }

    const data = {
      titel,
      beschreibung: beschreibung || null,
      gueltigBis: gueltigBis ? new Date(gueltigBis).toISOString() : null,
      kundeId,
      fahrzeugId: fahrzeugId || null,
      mwstSatz,
      notizen: notizen || null,
      positionen: validPositionen.map((p) => ({
        typ: p.typ,
        beschreibung: p.beschreibung,
        menge: p.menge,
        einheit: p.einheit,
        einzelpreis: p.einzelpreis,
      })),
    }

    try {
      const response = await fetch("/api/kostenvoranschlaege", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/kostenvoranschlaege/${result.id}`)
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

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
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
          <CardTitle>Basisdaten</CardTitle>
          <CardDescription>Grundlegende Informationen zum Kostenvoranschlag</CardDescription>
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
              <Label htmlFor="fahrzeug">Fahrzeug</Label>
              <Select value={fahrzeugId} onValueChange={setFahrzeugId}>
                <SelectTrigger>
                  <SelectValue placeholder="Fahrzeug auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Kein Fahrzeug</SelectItem>
                  {filteredFahrzeuge.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.kennzeichen} - {f.marke} {f.modell}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titel">Titel / Betreff *</Label>
            <Input
              id="titel"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. Reparatur Bremsen vorne"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Detaillierte Beschreibung der geplanten Arbeiten..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gueltigBis">Gültig bis</Label>
              <Input
                id="gueltigBis"
                type="date"
                value={gueltigBis}
                onChange={(e) => setGueltigBis(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mwstSatz">MwSt.-Satz</Label>
              <Select value={String(mwstSatz)} onValueChange={(v) => setMwstSatz(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="19">19%</SelectItem>
                  <SelectItem value="7">7%</SelectItem>
                  <SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positionen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Positionen</CardTitle>
              <CardDescription>Arbeiten, Ersatzteile und sonstige Kosten</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => addPosition("arbeit")}>
                <Plus className="h-4 w-4 mr-1" />
                Arbeit
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addPosition("ersatzteil")}>
                <Plus className="h-4 w-4 mr-1" />
                Ersatzteil
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addPosition("sonstiges")}>
                <Plus className="h-4 w-4 mr-1" />
                Sonstiges
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Arbeiten */}
          {arbeitPositionen.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Arbeitsleistungen</Badge>
              </div>
              {arbeitPositionen.map((pos) => (
                <PositionRow
                  key={pos.id}
                  position={pos}
                  onUpdate={updatePosition}
                  onRemove={removePosition}
                />
              ))}
            </div>
          )}

          {/* Ersatzteile */}
          {ersatzteilPositionen.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ersatzteile</Badge>
              </div>
              {ersatzteilPositionen.map((pos) => (
                <PositionRow
                  key={pos.id}
                  position={pos}
                  onUpdate={updatePosition}
                  onRemove={removePosition}
                />
              ))}
            </div>
          )}

          {/* Sonstiges */}
          {sonstigePositionen.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center gap-2">
                <Badge variant="outline">Sonstiges</Badge>
              </div>
              {sonstigePositionen.map((pos) => (
                <PositionRow
                  key={pos.id}
                  position={pos}
                  onUpdate={updatePosition}
                  onRemove={removePosition}
                />
              ))}
            </div>
          )}

          {/* Summen */}
          <Separator />
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Netto:</span>
                <span>{formatCurrency(totals.netto)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">MwSt. ({mwstSatz}%):</span>
                <span>{formatCurrency(totals.mwst)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Gesamtbetrag:</span>
                <span className="text-primary">{formatCurrency(totals.brutto)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notizen */}
      <Card>
        <CardHeader>
          <CardTitle>Interne Notizen</CardTitle>
          <CardDescription>Diese Notizen werden nicht auf dem Kostenvoranschlag angezeigt</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            rows={3}
            placeholder="Interne Anmerkungen..."
          />
        </CardContent>
      </Card>

      {/* Aktionen */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <Calculator className="h-4 w-4 mr-2" />
          {isSubmitting ? "Erstellen..." : "Kostenvoranschlag erstellen"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/kostenvoranschlaege">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Abbrechen
          </Link>
        </Button>
      </div>
    </form>
  )
}

function PositionRow({
  position,
  onUpdate,
  onRemove,
}: {
  position: Position
  onUpdate: (id: string, field: keyof Position, value: string | number) => void
  onRemove: (id: string) => void
}) {
  const gesamtpreis = position.menge * position.einzelpreis

  return (
    <div className="grid grid-cols-12 gap-2 items-end">
      <div className="col-span-12 md:col-span-5">
        <Label className="text-xs text-muted-foreground">Beschreibung</Label>
        <Input
          value={position.beschreibung}
          onChange={(e) => onUpdate(position.id, "beschreibung", e.target.value)}
          placeholder={position.typ === "arbeit" ? "z.B. Bremsbeläge wechseln" : "z.B. Bremsbeläge Vorderachse"}
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <Label className="text-xs text-muted-foreground">Menge</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={position.menge}
          onChange={(e) => onUpdate(position.id, "menge", parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-span-4 md:col-span-1">
        <Label className="text-xs text-muted-foreground">Einheit</Label>
        <Select
          value={position.einheit}
          onValueChange={(v) => onUpdate(position.id, "einheit", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Stk">Stk</SelectItem>
            <SelectItem value="Std">Std</SelectItem>
            <SelectItem value="Satz">Satz</SelectItem>
            <SelectItem value="Liter">Liter</SelectItem>
            <SelectItem value="km">km</SelectItem>
            <SelectItem value="Pausch.">Pausch.</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-4 md:col-span-2">
        <Label className="text-xs text-muted-foreground">Einzelpreis</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={position.einzelpreis}
          onChange={(e) => onUpdate(position.id, "einzelpreis", parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-span-10 md:col-span-1">
        <Label className="text-xs text-muted-foreground">Gesamt</Label>
        <div className="h-10 flex items-center justify-end font-medium">
          {gesamtpreis.toFixed(2)} €
        </div>
      </div>
      <div className="col-span-2 md:col-span-1 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(position.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
