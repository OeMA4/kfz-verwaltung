import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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
  Package,
  AlertTriangle,
  TrendingDown,
  Euro
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

async function getErsatzteile() {
  return prisma.ersatzteil.findMany({
    orderBy: { bezeichnung: "asc" },
    include: {
      _count: {
        select: {
          vorgangsErsatzteile: true,
        },
      },
    },
  })
}

const kategorieConfig: Record<string, { label: string; color: string }> = {
  motor: { label: "Motor", color: "bg-red-100 text-red-800" },
  bremsen: { label: "Bremsen", color: "bg-orange-100 text-orange-800" },
  fahrwerk: { label: "Fahrwerk", color: "bg-yellow-100 text-yellow-800" },
  elektrik: { label: "Elektrik", color: "bg-blue-100 text-blue-800" },
  karosserie: { label: "Karosserie", color: "bg-green-100 text-green-800" },
  oele: { label: "Öle & Flüssigkeiten", color: "bg-purple-100 text-purple-800" },
  filter: { label: "Filter", color: "bg-cyan-100 text-cyan-800" },
  sonstiges: { label: "Sonstiges", color: "bg-gray-100 text-gray-800" },
}

export default async function ErsatzteilePage() {
  const ersatzteile = await getErsatzteile()

  const niedrigerBestand = ersatzteile.filter(
    e => e.bestand <= e.mindestbestand && e.mindestbestand > 0
  )
  const gesamtWert = ersatzteile.reduce(
    (sum, e) => sum + e.bestand * e.einkaufspreis,
    0
  )
  const kategorien = Array.from(new Set(ersatzteile.map(e => e.kategorie).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ersatzteile</h1>
          <p className="text-muted-foreground">
            Lagerverwaltung und Bestandsübersicht
          </p>
        </div>
        <Button asChild>
          <Link href="/ersatzteile/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neues Ersatzteil
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Artikelanzahl</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ersatzteile.length}</div>
            <p className="text-xs text-muted-foreground">
              in {kategorien.length} Kategorien
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lagerwert</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(gesamtWert)}</div>
            <p className="text-xs text-muted-foreground">Einkaufswert</p>
          </CardContent>
        </Card>
        <Card className={niedrigerBestand.length > 0 ? "border-warning" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nachbestellen</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${niedrigerBestand.length > 0 ? "text-warning" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{niedrigerBestand.length}</div>
            <p className="text-xs text-muted-foreground">
              unter Mindestbestand
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ohne Bestand</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ersatzteile.filter(e => e.bestand === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Artikel ausverkauft</p>
          </CardContent>
        </Card>
      </div>

      {/* Warnung bei niedrigem Bestand */}
      {niedrigerBestand.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Niedriger Bestand - Nachbestellung empfohlen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {niedrigerBestand.slice(0, 6).map((teil) => (
                <div key={teil.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="font-medium">{teil.bezeichnung}</p>
                    <p className="text-xs text-muted-foreground">{teil.artikelnummer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-warning">{teil.bestand}</p>
                    <p className="text-xs text-muted-foreground">von {teil.mindestbestand}</p>
                  </div>
                </div>
              ))}
            </div>
            {niedrigerBestand.length > 6 && (
              <p className="mt-4 text-sm text-muted-foreground">
                + {niedrigerBestand.length - 6} weitere Artikel
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle>Lagerbestand</CardTitle>
          <CardDescription>Alle Ersatzteile und deren Verfügbarkeit</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Ersatzteil suchen..." className="pl-9" />
            </div>
          </div>

          {ersatzteile.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Keine Ersatzteile vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Fügen Sie Ihr erstes Ersatzteil hinzu.
              </p>
              <Button asChild>
                <Link href="/ersatzteile/neu">
                  <Plus className="mr-2 h-4 w-4" />
                  Ersatzteil anlegen
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artikel</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Lagerort</TableHead>
                  <TableHead className="text-right">EK-Preis</TableHead>
                  <TableHead className="text-right">VK-Preis</TableHead>
                  <TableHead>Bestand</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ersatzteile.map((teil) => {
                  const kategorie = kategorieConfig[teil.kategorie || "sonstiges"] || kategorieConfig.sonstiges
                  const bestandProzent = teil.mindestbestand > 0
                    ? Math.min(100, (teil.bestand / teil.mindestbestand) * 100)
                    : 100
                  const istNiedrig = teil.bestand <= teil.mindestbestand && teil.mindestbestand > 0

                  return (
                    <TableRow key={teil.id}>
                      <TableCell>
                        <div className="font-medium">{teil.bezeichnung}</div>
                        <div className="text-xs text-muted-foreground">
                          {teil.artikelnummer}
                          {teil.hersteller && ` • ${teil.hersteller}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {teil.kategorie && (
                          <Badge className={kategorie.color}>
                            {kategorie.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {teil.lagerort || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(teil.einkaufspreis)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(teil.verkaufspreis)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <Progress
                              value={bestandProzent}
                              className={`h-2 ${istNiedrig ? "[&>div]:bg-warning" : ""}`}
                            />
                          </div>
                          <span className={`font-medium ${istNiedrig ? "text-warning" : ""}`}>
                            {teil.bestand}
                          </span>
                          {istNiedrig && (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                        </div>
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
                            <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                            <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                            <DropdownMenuItem>Bestand anpassen</DropdownMenuItem>
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
