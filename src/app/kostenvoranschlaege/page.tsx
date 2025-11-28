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
  Calculator,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  AlertTriangle,
  TrendingUp
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

async function getKostenvoranschlaege() {
  return prisma.kostenvoranschlag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      kunde: true,
      fahrzeug: true,
      vorgang: true,
      positionen: true,
    },
  })
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; icon: any }> = {
  entwurf: { label: "Entwurf", variant: "secondary", icon: FileText },
  gesendet: { label: "Gesendet", variant: "warning", icon: Send },
  akzeptiert: { label: "Akzeptiert", variant: "success", icon: CheckCircle },
  abgelehnt: { label: "Abgelehnt", variant: "destructive", icon: XCircle },
  abgelaufen: { label: "Abgelaufen", variant: "outline", icon: Clock },
}

export default async function KostenvoranschlaegePage() {
  const kostenvoranschlaege = await getKostenvoranschlaege()

  const heute = new Date()

  // Statistiken
  const entwuerfe = kostenvoranschlaege.filter(kv => kv.status === "entwurf")
  const gesendet = kostenvoranschlaege.filter(kv => kv.status === "gesendet")
  const akzeptiert = kostenvoranschlaege.filter(kv => kv.status === "akzeptiert")
  const abgelehnt = kostenvoranschlaege.filter(kv => kv.status === "abgelehnt")

  // Bald ablaufend (in den nächsten 7 Tagen)
  const in7Tagen = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const baldAblaufend = kostenvoranschlaege.filter(kv =>
    kv.status === "gesendet" &&
    kv.gueltigBis &&
    new Date(kv.gueltigBis) <= in7Tagen &&
    new Date(kv.gueltigBis) >= heute
  )

  // Gesamtwert offener KVs
  const offenerWert = gesendet.reduce((sum, kv) => sum + kv.bruttoGesamt, 0)

  // Akzeptanzrate berechnen
  const entschieden = akzeptiert.length + abgelehnt.length
  const akzeptanzRate = entschieden > 0 ? Math.round((akzeptiert.length / entschieden) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kostenvoranschläge</h1>
          <p className="text-muted-foreground">
            Angebote erstellen und verwalten
          </p>
        </div>
        <Button asChild>
          <Link href="/kostenvoranschlaege/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Kostenvoranschlag
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entwürfe</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entwuerfe.length}</div>
            <p className="text-xs text-muted-foreground">noch nicht versendet</p>
          </CardContent>
        </Card>
        <Card className={gesendet.length > 0 ? "border-warning" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offen</CardTitle>
            <Send className={`h-4 w-4 ${gesendet.length > 0 ? "text-warning" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gesendet.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(offenerWert)} Volumen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Akzeptiert</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{akzeptiert.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(akzeptiert.reduce((sum, kv) => sum + kv.bruttoGesamt, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abgelehnt</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{abgelehnt.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(abgelehnt.reduce((sum, kv) => sum + kv.bruttoGesamt, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Akzeptanzrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{akzeptanzRate}%</div>
            <p className="text-xs text-muted-foreground">
              von {entschieden} entschieden
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bald ablaufende KVs */}
      {baldAblaufend.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Bald ablaufende Kostenvoranschläge
            </CardTitle>
            <CardDescription>
              Diese Angebote laufen in den nächsten 7 Tagen ab - ggf. beim Kunden nachfassen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {baldAblaufend.map((kv) => (
                <div key={kv.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="font-medium">{kv.kvNummer}</p>
                    <p className="text-sm">{kv.titel}</p>
                    <p className="text-xs text-muted-foreground">
                      {kv.kunde.vorname} {kv.kunde.nachname}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(kv.bruttoGesamt)}</p>
                    <p className="text-xs text-warning font-medium">
                      bis {kv.gueltigBis && formatDate(kv.gueltigBis)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="alle" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="alle">Alle ({kostenvoranschlaege.length})</TabsTrigger>
            <TabsTrigger value="entwurf">
              Entwürfe ({entwuerfe.length})
            </TabsTrigger>
            <TabsTrigger value="gesendet">
              Offen ({gesendet.length})
            </TabsTrigger>
            <TabsTrigger value="akzeptiert">
              Akzeptiert ({akzeptiert.length})
            </TabsTrigger>
          </TabsList>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="KV-Nr., Kunde oder Fahrzeug suchen..." className="pl-9" />
          </div>
        </div>

        <TabsContent value="alle">
          <Card>
            <CardContent className="pt-6">
              <KVTable kostenvoranschlaege={kostenvoranschlaege} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entwurf">
          <Card>
            <CardContent className="pt-6">
              <KVTable kostenvoranschlaege={entwuerfe} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gesendet">
          <Card>
            <CardContent className="pt-6">
              <KVTable kostenvoranschlaege={gesendet} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="akzeptiert">
          <Card>
            <CardContent className="pt-6">
              <KVTable kostenvoranschlaege={akzeptiert} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function KVTable({ kostenvoranschlaege }: { kostenvoranschlaege: any[] }) {
  const heute = new Date()

  if (kostenvoranschlaege.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Keine Kostenvoranschläge</h3>
        <p className="text-muted-foreground mb-4">
          In dieser Kategorie sind keine Kostenvoranschläge vorhanden.
        </p>
        <Button asChild>
          <Link href="/kostenvoranschlaege/neu">
            <Plus className="mr-2 h-4 w-4" />
            Kostenvoranschlag erstellen
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>KV-Nummer</TableHead>
          <TableHead>Kunde / Fahrzeug</TableHead>
          <TableHead>Titel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Gültig bis</TableHead>
          <TableHead className="text-right">Betrag</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {kostenvoranschlaege.map((kv) => {
          const status = statusConfig[kv.status] || statusConfig.entwurf
          const StatusIcon = status.icon
          const istAbgelaufen = kv.gueltigBis && new Date(kv.gueltigBis) < heute && kv.status === "gesendet"

          return (
            <TableRow key={kv.id}>
              <TableCell>
                <Link href={`/kostenvoranschlaege/${kv.id}`} className="font-mono font-bold hover:underline">
                  {kv.kvNummer}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {formatDate(kv.createdAt)}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {kv.kunde.firma || `${kv.kunde.vorname} ${kv.kunde.nachname}`}
                </div>
                {kv.fahrzeug && (
                  <div className="text-xs text-muted-foreground">
                    {kv.fahrzeug.kennzeichen} - {kv.fahrzeug.marke} {kv.fahrzeug.modell}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate" title={kv.titel}>
                  {kv.titel}
                </div>
                <div className="text-xs text-muted-foreground">
                  {kv.positionen.length} Position{kv.positionen.length !== 1 ? "en" : ""}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={istAbgelaufen ? "destructive" : status.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {istAbgelaufen ? "Abgelaufen" : status.label}
                </Badge>
                {kv.vorgang && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Auftrag: {kv.vorgang.vorgangsnummer}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {kv.gueltigBis ? (
                  <span className={
                    istAbgelaufen ? "text-destructive font-medium" :
                    new Date(kv.gueltigBis) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && kv.status === "gesendet"
                      ? "text-warning font-medium" : ""
                  }>
                    {formatDate(kv.gueltigBis)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="font-bold">{formatCurrency(kv.bruttoGesamt)}</div>
                <div className="text-xs text-muted-foreground">
                  netto {formatCurrency(kv.nettoGesamt)}
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
                    <DropdownMenuItem asChild>
                      <Link href={`/kostenvoranschlaege/${kv.id}`}>Details anzeigen</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/kostenvoranschlaege/${kv.id}/bearbeiten`}>Bearbeiten</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>PDF herunterladen</DropdownMenuItem>
                    {kv.status === "entwurf" && (
                      <DropdownMenuItem>Per E-Mail senden</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {kv.status === "gesendet" && (
                      <>
                        <DropdownMenuItem className="text-success">
                          Als akzeptiert markieren
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Als abgelehnt markieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {kv.status === "akzeptiert" && !kv.vorgangId && (
                      <>
                        <DropdownMenuItem>Auftrag erstellen</DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
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
