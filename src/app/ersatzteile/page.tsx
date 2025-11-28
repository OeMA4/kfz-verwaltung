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
  motor: { label: "Motor", color: "bg-rose-50 text-rose-700 border-rose-200" },
  bremsen: { label: "Bremsen", color: "bg-amber-50 text-amber-700 border-amber-200" },
  fahrwerk: { label: "Fahrwerk", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  elektrik: { label: "Elektrik", color: "bg-sky-50 text-sky-700 border-sky-200" },
  karosserie: { label: "Karosserie", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  oele: { label: "Öle & Flüssigkeiten", color: "bg-violet-50 text-violet-700 border-violet-200" },
  filter: { label: "Filter", color: "bg-teal-50 text-teal-700 border-teal-200" },
  sonstiges: { label: "Sonstiges", color: "bg-slate-50 text-slate-700 border-slate-200" },
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Artikelanzahl</CardTitle>
            <div className="rounded-xl bg-slate-100 p-2">
              <Package className="h-4 w-4 text-slate-600" />
            </div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Lagerwert</CardTitle>
            <div className="rounded-xl bg-emerald-50 p-2">
              <Euro className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(gesamtWert)}</div>
            <p className="text-xs text-muted-foreground">Einkaufswert</p>
          </CardContent>
        </Card>
        <Card className={niedrigerBestand.length > 0 ? "border-amber-200" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nachbestellen</CardTitle>
            <div className={`rounded-xl p-2 ${niedrigerBestand.length > 0 ? "bg-amber-50" : "bg-slate-100"}`}>
              <AlertTriangle className={`h-4 w-4 ${niedrigerBestand.length > 0 ? "text-amber-600" : "text-slate-600"}`} />
            </div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Ohne Bestand</CardTitle>
            <div className="rounded-xl bg-red-50 p-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
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
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Niedriger Bestand - Nachbestellung empfohlen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {niedrigerBestand.slice(0, 6).map((teil) => (
                <div key={teil.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:bg-background">
                  <div className="flex-1">
                    <p className="font-medium">{teil.bezeichnung}</p>
                    <p className="text-xs text-muted-foreground">{teil.artikelnummer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">{teil.bestand}</p>
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
              <Input placeholder="Ersatzteil suchen..." className="pl-9 bg-background/50 border-border/60" />
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
                          <Badge variant="outline" className={kategorie.color}>
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
