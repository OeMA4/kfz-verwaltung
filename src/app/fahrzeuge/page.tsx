import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreHorizontal,
  Car,
  AlertTriangle,
  Calendar,
  Gauge,
  Fuel
} from "lucide-react"
import { formatDate } from "@/lib/utils"

async function getFahrzeuge() {
  return prisma.fahrzeug.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      kunde: true,
      _count: {
        select: {
          vorgaenge: true,
          rechnungen: true,
        },
      },
    },
  })
}

const kraftstoffConfig: Record<string, { label: string; color: string }> = {
  benzin: { label: "Benzin", color: "bg-amber-100 text-amber-800" },
  diesel: { label: "Diesel", color: "bg-gray-100 text-gray-800" },
  elektro: { label: "Elektro", color: "bg-green-100 text-green-800" },
  hybrid: { label: "Hybrid", color: "bg-blue-100 text-blue-800" },
  plugin_hybrid: { label: "Plug-in Hybrid", color: "bg-cyan-100 text-cyan-800" },
  gas: { label: "Gas/LPG", color: "bg-purple-100 text-purple-800" },
}

export default async function FahrzeugePage() {
  const fahrzeuge = await getFahrzeuge()

  const heute = new Date()
  const in30Tagen = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  // HU/AU Fälligkeiten
  const huFaellig = fahrzeuge.filter(f =>
    f.naechsteHU && new Date(f.naechsteHU) <= in30Tagen
  )
  const huUeberfaellig = fahrzeuge.filter(f =>
    f.naechsteHU && new Date(f.naechsteHU) < heute
  )

  // Statistiken
  const marken = Array.from(new Set(fahrzeuge.map(f => f.marke)))
  const kraftstoffArten = Array.from(new Set(fahrzeuge.map(f => f.kraftstoff).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fahrzeuge</h1>
          <p className="text-muted-foreground">
            Alle registrierten Kundenfahrzeuge
          </p>
        </div>
        <Button asChild>
          <Link href="/fahrzeuge/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neues Fahrzeug
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fahrzeuge gesamt</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fahrzeuge.length}</div>
            <p className="text-xs text-muted-foreground">
              von {marken.length} Marken
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kraftstoffarten</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kraftstoffArten.length}</div>
            <p className="text-xs text-muted-foreground">
              verschiedene Antriebe
            </p>
          </CardContent>
        </Card>
        <Card className={huFaellig.length > 0 ? "border-warning" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">HU bald fällig</CardTitle>
            <Calendar className={`h-4 w-4 ${huFaellig.length > 0 ? "text-warning" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{huFaellig.length}</div>
            <p className="text-xs text-muted-foreground">
              in den nächsten 30 Tagen
            </p>
          </CardContent>
        </Card>
        <Card className={huUeberfaellig.length > 0 ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">HU überfällig</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${huUeberfaellig.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{huUeberfaellig.length}</div>
            <p className="text-xs text-muted-foreground">
              Termin überschritten
            </p>
          </CardContent>
        </Card>
      </div>

      {/* HU Warnungen */}
      {huFaellig.length > 0 && (
        <Card className={huUeberfaellig.length > 0 ? "border-destructive bg-destructive/5" : "border-warning bg-warning/5"}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${huUeberfaellig.length > 0 ? "text-destructive" : "text-warning"}`}>
              <AlertTriangle className="h-5 w-5" />
              HU/AU Termine beachten
            </CardTitle>
            <CardDescription>
              Fahrzeuge deren Hauptuntersuchung bald fällig ist oder bereits überschritten wurde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {huFaellig.slice(0, 6).map((fz) => {
                const isUeberfaellig = fz.naechsteHU && new Date(fz.naechsteHU) < heute
                return (
                  <div key={fz.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium">{fz.kennzeichen}</p>
                      <p className="text-xs text-muted-foreground">
                        {fz.marke} {fz.modell}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fz.kunde.vorname} {fz.kunde.nachname}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isUeberfaellig ? "text-destructive" : "text-warning"}`}>
                        {fz.naechsteHU && formatDate(fz.naechsteHU)}
                      </p>
                      <Badge variant={isUeberfaellig ? "destructive" : "warning"}>
                        {isUeberfaellig ? "Überfällig" : "Bald fällig"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
            {huFaellig.length > 6 && (
              <p className="mt-4 text-sm text-muted-foreground">
                + {huFaellig.length - 6} weitere Fahrzeuge
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Fahrzeuge</CardTitle>
          <CardDescription>Übersicht aller registrierten Kundenfahrzeuge</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Kennzeichen, Marke oder Kunde suchen..." className="pl-9" />
            </div>
          </div>

          {fahrzeuge.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Keine Fahrzeuge vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Fügen Sie das erste Fahrzeug hinzu.
              </p>
              <Button asChild>
                <Link href="/fahrzeuge/neu">
                  <Plus className="mr-2 h-4 w-4" />
                  Fahrzeug anlegen
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kennzeichen</TableHead>
                  <TableHead>Fahrzeug</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Kraftstoff</TableHead>
                  <TableHead>Kilometerstand</TableHead>
                  <TableHead>HU/AU</TableHead>
                  <TableHead>Aufträge</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fahrzeuge.map((fz) => {
                  const kraftstoff = kraftstoffConfig[fz.kraftstoff || ""] || null
                  const huStatus = fz.naechsteHU
                    ? new Date(fz.naechsteHU) < heute
                      ? "ueberfaellig"
                      : new Date(fz.naechsteHU) <= in30Tagen
                        ? "bald"
                        : "ok"
                    : null

                  return (
                    <TableRow key={fz.id}>
                      <TableCell>
                        <Link href={`/fahrzeuge/${fz.id}`} className="font-mono font-bold hover:underline">
                          {fz.kennzeichen}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{fz.marke} {fz.modell}</div>
                        <div className="text-xs text-muted-foreground">
                          {fz.baujahr && `Bj. ${fz.baujahr}`}
                          {fz.leistungKW && ` • ${fz.leistungKW} kW`}
                          {fz.hubraum && ` • ${fz.hubraum} ccm`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/kunden/${fz.kundeId}`} className="hover:underline">
                          <div>{fz.kunde.vorname} {fz.kunde.nachname}</div>
                          {fz.kunde.firma && (
                            <div className="text-xs text-muted-foreground">{fz.kunde.firma}</div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {kraftstoff ? (
                          <Badge className={kraftstoff.color}>
                            {kraftstoff.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {fz.kilometerstand ? (
                          <div className="flex items-center gap-1">
                            <Gauge className="h-3 w-3 text-muted-foreground" />
                            <span>{fz.kilometerstand.toLocaleString("de-DE")} km</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {fz.naechsteHU ? (
                          <div className="flex items-center gap-2">
                            <span className={
                              huStatus === "ueberfaellig" ? "text-destructive font-medium" :
                              huStatus === "bald" ? "text-warning font-medium" : ""
                            }>
                              {formatDate(fz.naechsteHU)}
                            </span>
                            {huStatus === "ueberfaellig" && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            {huStatus === "bald" && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {fz._count.vorgaenge} Aufträge
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/fahrzeuge/${fz.id}`}>Details anzeigen</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/fahrzeuge/${fz.id}/bearbeiten`}>Bearbeiten</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/kunden/${fz.kundeId}/vorgang/neu?fahrzeugId=${fz.id}`}>Neuer Auftrag</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/kunden/${fz.kundeId}`}>Zum Kunden</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
