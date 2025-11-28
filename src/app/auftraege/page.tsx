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
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  Car
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

async function getVorgaenge() {
  return prisma.vorgang.findMany({
    orderBy: { eingang: "desc" },
    include: {
      kunde: true,
      fahrzeug: true,
      mitarbeiter: {
        include: {
          mitarbeiter: true,
        },
      },
      _count: {
        select: { arbeiten: true },
      },
    },
  })
}

const statusConfig: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  offen: { label: "Offen", icon: AlertCircle, variant: "secondary" },
  in_bearbeitung: { label: "In Bearbeitung", icon: Wrench, variant: "warning" },
  wartet_auf_teile: { label: "Wartet auf Teile", icon: PauseCircle, variant: "outline" },
  abgeschlossen: { label: "Abgeschlossen", icon: CheckCircle2, variant: "success" },
  abgerechnet: { label: "Abgerechnet", icon: CheckCircle2, variant: "default" },
  abgeholt: { label: "Abgeholt", icon: Car, variant: "default" },
}

const prioritaetConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "warning" }> = {
  niedrig: { label: "Niedrig", variant: "outline" },
  normal: { label: "Normal", variant: "secondary" },
  hoch: { label: "Hoch", variant: "warning" },
  dringend: { label: "Dringend", variant: "destructive" },
}

const typConfig: Record<string, string> = {
  reparatur: "Reparatur",
  wartung: "Wartung",
  inspektion: "Inspektion",
  hu_au: "HU/AU",
  reifenwechsel: "Reifenwechsel",
  sonstiges: "Sonstiges",
}

export default async function AuftraegePage() {
  const vorgaenge = await getVorgaenge()

  const stats = {
    offen: vorgaenge.filter(v => v.status === "offen").length,
    inBearbeitung: vorgaenge.filter(v => v.status === "in_bearbeitung").length,
    wartetAufTeile: vorgaenge.filter(v => v.status === "wartet_auf_teile").length,
    abgeschlossen: vorgaenge.filter(v => v.status === "abgeschlossen").length,
  }

  const offeneVorgaenge = vorgaenge.filter(v =>
    ["offen", "in_bearbeitung", "wartet_auf_teile"].includes(v.status)
  )
  const abgeschlosseneVorgaenge = vorgaenge.filter(v =>
    ["abgeschlossen", "abgerechnet", "abgeholt"].includes(v.status)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aufträge</h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Werkstattaufträge
          </p>
        </div>
        <Button asChild>
          <Link href="/auftraege/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Auftrag
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offen</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offen}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inBearbeitung}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wartet auf Teile</CardTitle>
            <PauseCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wartetAufTeile}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.abgeschlossen}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="aktiv" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="aktiv">
              Aktive Aufträge ({offeneVorgaenge.length})
            </TabsTrigger>
            <TabsTrigger value="abgeschlossen">
              Abgeschlossen ({abgeschlosseneVorgaenge.length})
            </TabsTrigger>
            <TabsTrigger value="alle">
              Alle ({vorgaenge.length})
            </TabsTrigger>
          </TabsList>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Auftrag suchen..." className="pl-9" />
          </div>
        </div>

        <TabsContent value="aktiv">
          <Card>
            <CardContent className="pt-6">
              <VorgaengeTable vorgaenge={offeneVorgaenge} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abgeschlossen">
          <Card>
            <CardContent className="pt-6">
              <VorgaengeTable vorgaenge={abgeschlosseneVorgaenge} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alle">
          <Card>
            <CardContent className="pt-6">
              <VorgaengeTable vorgaenge={vorgaenge} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VorgaengeTable({ vorgaenge }: { vorgaenge: any[] }) {
  if (vorgaenge.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Keine Aufträge</h3>
        <p className="text-muted-foreground">
          In dieser Kategorie sind keine Aufträge vorhanden.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Auftrag</TableHead>
          <TableHead>Fahrzeug / Kunde</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priorität</TableHead>
          <TableHead>Eingang</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vorgaenge.map((vorgang) => {
          const status = statusConfig[vorgang.status] || statusConfig.offen
          const prioritaet = prioritaetConfig[vorgang.prioritaet] || prioritaetConfig.normal
          const StatusIcon = status.icon

          return (
            <TableRow key={vorgang.id}>
              <TableCell>
                <Link
                  href={`/kunden/${vorgang.kundeId}/vorgang/${vorgang.id}`}
                  className="font-medium hover:underline"
                >
                  {vorgang.vorgangsnummer}
                </Link>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {vorgang.titel}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{vorgang.fahrzeug.kennzeichen}</div>
                <div className="text-xs text-muted-foreground">
                  {vorgang.kunde.firma || `${vorgang.kunde.vorname} ${vorgang.kunde.nachname}`}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {typConfig[vorgang.typ] || vorgang.typ}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={prioritaet.variant}>
                  {prioritaet.label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(vorgang.eingang)}
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
                      <Link href={`/kunden/${vorgang.kundeId}/vorgang/${vorgang.id}`}>
                        Details anzeigen
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/kunden/${vorgang.kundeId}/vorgang/${vorgang.id}/bearbeiten`}>
                        Bearbeiten
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Status ändern</DropdownMenuItem>
                    <DropdownMenuItem>Rechnung erstellen</DropdownMenuItem>
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
