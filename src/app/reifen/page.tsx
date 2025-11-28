import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CircleDot,
  Sun,
  Snowflake,
  Cloud,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { formatDate } from "@/lib/utils"

async function getReifeneinlagerungen() {
  return prisma.reifeneinlagerung.findMany({
    orderBy: { lagerplatznummer: "asc" },
    include: {
      fahrzeug: true,
      kunde: true,
      wechselHistorie: {
        orderBy: { datum: "desc" },
        take: 1,
      },
    },
  })
}

const reifenTypConfig: Record<string, { label: string; icon: any; color: string }> = {
  sommer: { label: "Sommerreifen", icon: Sun, color: "bg-yellow-100 text-yellow-800" },
  winter: { label: "Winterreifen", icon: Snowflake, color: "bg-blue-100 text-blue-800" },
  ganzjahres: { label: "Ganzjahresreifen", icon: Cloud, color: "bg-gray-100 text-gray-800" },
}

const zustandConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  gut: { label: "Gut", variant: "success" },
  mittel: { label: "Mittel", variant: "warning" },
  schlecht: { label: "Schlecht", variant: "destructive" },
  ersetzen: { label: "Ersetzen", variant: "destructive" },
}

export default async function ReifenPage() {
  const reifeneinlagerungen = await getReifeneinlagerungen()

  // Aktive Einlagerungen (nicht ausgelagert)
  const aktiveEinlagerungen = reifeneinlagerungen.filter(r => !r.ausgelagertAm)

  // Statistiken
  const sommerReifen = aktiveEinlagerungen.filter(r => r.reifenTyp === "sommer").length
  const winterReifen = aktiveEinlagerungen.filter(r => r.reifenTyp === "winter").length
  const ganzjahresReifen = aktiveEinlagerungen.filter(r => r.reifenTyp === "ganzjahres").length

  // Wechsel anstehend (in den nächsten 30 Tagen)
  const heute = new Date()
  const in30Tagen = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const anstehendeWechsel = aktiveEinlagerungen.filter(r =>
    r.naechsterWechsel && new Date(r.naechsterWechsel) <= in30Tagen && new Date(r.naechsterWechsel) >= heute
  )

  // Reifen mit schlechtem Zustand
  const schlechterZustand = aktiveEinlagerungen.filter(r =>
    r.zustand === "schlecht" || r.zustand === "ersetzen"
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reifeneinlagerung</h1>
          <p className="text-muted-foreground">
            Verwaltung der eingelagerten Kundenreifen
          </p>
        </div>
        <Button asChild>
          <Link href="/reifen/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neue Einlagerung
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <CircleDot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aktiveEinlagerungen.length}</div>
            <p className="text-xs text-muted-foreground">eingelagert</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sommerreifen</CardTitle>
            <Sun className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sommerReifen}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Winterreifen</CardTitle>
            <Snowflake className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winterReifen}</div>
          </CardContent>
        </Card>
        <Card className={anstehendeWechsel.length > 0 ? "border-warning" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wechsel anstehend</CardTitle>
            <Calendar className={`h-4 w-4 ${anstehendeWechsel.length > 0 ? "text-warning" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anstehendeWechsel.length}</div>
            <p className="text-xs text-muted-foreground">in 30 Tagen</p>
          </CardContent>
        </Card>
        <Card className={schlechterZustand.length > 0 ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ersetzen</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${schlechterZustand.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schlechterZustand.length}</div>
            <p className="text-xs text-muted-foreground">schlechter Zustand</p>
          </CardContent>
        </Card>
      </div>

      {/* Anstehende Wechsel */}
      {anstehendeWechsel.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Calendar className="h-5 w-5" />
              Anstehende Reifenwechsel
            </CardTitle>
            <CardDescription>
              Kunden, deren Reifenwechsel in den nächsten 30 Tagen fällig ist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {anstehendeWechsel.map((reifen) => {
                const typConfig = reifenTypConfig[reifen.reifenTyp] || reifenTypConfig.ganzjahres
                const TypeIcon = typConfig.icon

                return (
                  <div key={reifen.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className={`rounded-full p-2 ${typConfig.color}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{reifen.fahrzeug.kennzeichen}</p>
                      <p className="text-xs text-muted-foreground">
                        {reifen.kunde.vorname} {reifen.kunde.nachname}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-warning">
                        {reifen.naechsterWechsel && formatDate(reifen.naechsterWechsel)}
                      </p>
                      <p className="text-xs text-muted-foreground">{reifen.lagerplatznummer}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="alle" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="alle">Alle ({aktiveEinlagerungen.length})</TabsTrigger>
            <TabsTrigger value="sommer">
              <Sun className="mr-1 h-4 w-4" />
              Sommer ({sommerReifen})
            </TabsTrigger>
            <TabsTrigger value="winter">
              <Snowflake className="mr-1 h-4 w-4" />
              Winter ({winterReifen})
            </TabsTrigger>
          </TabsList>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Kennzeichen oder Kunde suchen..." className="pl-9" />
          </div>
        </div>

        <TabsContent value="alle">
          <Card>
            <CardContent className="pt-6">
              <ReifenTable einlagerungen={aktiveEinlagerungen} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sommer">
          <Card>
            <CardContent className="pt-6">
              <ReifenTable einlagerungen={aktiveEinlagerungen.filter(r => r.reifenTyp === "sommer")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winter">
          <Card>
            <CardContent className="pt-6">
              <ReifenTable einlagerungen={aktiveEinlagerungen.filter(r => r.reifenTyp === "winter")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReifenTable({ einlagerungen }: { einlagerungen: any[] }) {
  if (einlagerungen.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CircleDot className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Keine Einlagerungen</h3>
        <p className="text-muted-foreground">
          In dieser Kategorie sind keine Reifen eingelagert.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lagerplatz</TableHead>
          <TableHead>Fahrzeug / Kunde</TableHead>
          <TableHead>Reifentyp</TableHead>
          <TableHead>Größe / Hersteller</TableHead>
          <TableHead>Profil</TableHead>
          <TableHead>Zustand</TableHead>
          <TableHead>Nächster Wechsel</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {einlagerungen.map((reifen) => {
          const typConfig = reifenTypConfig[reifen.reifenTyp] || reifenTypConfig.ganzjahres
          const zustand = zustandConfig[reifen.zustand] || zustandConfig.gut
          const TypeIcon = typConfig.icon

          return (
            <TableRow key={reifen.id}>
              <TableCell>
                <span className="font-mono font-medium">{reifen.lagerplatznummer}</span>
              </TableCell>
              <TableCell>
                <div className="font-medium">{reifen.fahrzeug.kennzeichen}</div>
                <div className="text-xs text-muted-foreground">
                  {reifen.kunde.vorname} {reifen.kunde.nachname}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`gap-1 ${typConfig.color}`}>
                  <TypeIcon className="h-3 w-3" />
                  {typConfig.label}
                </Badge>
                {reifen.mitFelgen && (
                  <div className="text-xs text-muted-foreground mt-1">
                    mit {reifen.felgenTyp || "Felgen"}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>{reifen.groesse || "-"}</div>
                <div className="text-xs text-muted-foreground">
                  {reifen.hersteller} {reifen.modell}
                </div>
              </TableCell>
              <TableCell>
                {reifen.profiltiefe ? (
                  <span className={reifen.profiltiefe < 3 ? "text-warning font-medium" : ""}>
                    {reifen.profiltiefe} mm
                  </span>
                ) : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={zustand.variant}>{zustand.label}</Badge>
              </TableCell>
              <TableCell>
                {reifen.naechsterWechsel ? (
                  <span className={new Date(reifen.naechsterWechsel) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-warning font-medium" : ""}>
                    {formatDate(reifen.naechsterWechsel)}
                  </span>
                ) : "-"}
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
                    <DropdownMenuItem>Wechsel durchführen</DropdownMenuItem>
                    <DropdownMenuItem>Auslagern</DropdownMenuItem>
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
  )
}
