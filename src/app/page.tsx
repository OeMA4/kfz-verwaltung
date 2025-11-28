import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Car,
  Wrench,
  FileText,
  Clock,
  AlertTriangle,
  Calendar,
  Euro,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"

async function getDashboardData() {
  const [
    kundenCount,
    fahrzeugeCount,
    offeneVorgaenge,
    vorgaengeInBearbeitung,
    offeneRechnungen,
    rechnungenSumme,
    naechsteTermine,
    faelligeHU,
  ] = await Promise.all([
    prisma.kunde.count(),
    prisma.fahrzeug.count(),
    prisma.vorgang.count({ where: { status: "offen" } }),
    prisma.vorgang.count({ where: { status: "in_bearbeitung" } }),
    prisma.rechnung.count({ where: { status: "offen" } }),
    prisma.rechnung.aggregate({
      where: { status: "offen" },
      _sum: { bruttoGesamt: true },
    }),
    prisma.kalenderEintrag.findMany({
      where: {
        startDatum: { gte: new Date() },
        erledigt: false,
      },
      include: { fahrzeug: true },
      orderBy: { startDatum: "asc" },
      take: 5,
    }),
    prisma.fahrzeug.findMany({
      where: {
        naechsteHU: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      include: { kunde: true },
      take: 5,
    }),
  ])

  const aktuelleVorgaenge = await prisma.vorgang.findMany({
    where: {
      status: { in: ["offen", "in_bearbeitung", "wartet_auf_teile"] },
    },
    include: {
      kunde: true,
      fahrzeug: true,
    },
    orderBy: { eingang: "desc" },
    take: 5,
  })

  const letzteRechnungen = await prisma.rechnung.findMany({
    where: { status: "offen" },
    include: {
      kunde: true,
      fahrzeug: true,
    },
    orderBy: { datum: "desc" },
    take: 5,
  })

  return {
    kundenCount,
    fahrzeugeCount,
    offeneVorgaenge,
    vorgaengeInBearbeitung,
    offeneRechnungen,
    offeneRechnungenSumme: rechnungenSumme._sum.bruttoGesamt || 0,
    naechsteTermine,
    faelligeHU,
    aktuelleVorgaenge,
    letzteRechnungen,
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string }> = {
    offen: { variant: "secondary", label: "Offen" },
    in_bearbeitung: { variant: "warning", label: "In Bearbeitung" },
    wartet_auf_teile: { variant: "outline", label: "Wartet auf Teile" },
    abgeschlossen: { variant: "success", label: "Abgeschlossen" },
    abgerechnet: { variant: "default", label: "Abgerechnet" },
    bezahlt: { variant: "success", label: "Bezahlt" },
    storniert: { variant: "destructive", label: "Storniert" },
  }
  const config = variants[status] || { variant: "secondary", label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function PrioritaetBadge({ prioritaet }: { prioritaet: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "warning"; label: string }> = {
    niedrig: { variant: "outline", label: "Niedrig" },
    normal: { variant: "secondary", label: "Normal" },
    hoch: { variant: "warning", label: "Hoch" },
    dringend: { variant: "destructive", label: "Dringend" },
  }
  const config = variants[prioritaet] || { variant: "secondary", label: prioritaet }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const stats = [
    {
      title: "Kunden",
      value: data.kundenCount,
      icon: Users,
      href: "/kunden",
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      title: "Fahrzeuge",
      value: data.fahrzeugeCount,
      icon: Car,
      href: "/fahrzeuge",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Offene Aufträge",
      value: data.offeneVorgaenge + data.vorgaengeInBearbeitung,
      icon: Wrench,
      href: "/auftraege",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      subtitle: `${data.vorgaengeInBearbeitung} in Bearbeitung`,
    },
    {
      title: "Offene Rechnungen",
      value: data.offeneRechnungen,
      icon: FileText,
      href: "/rechnungen",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      subtitle: formatCurrency(data.offeneRechnungenSumme),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aktuelle Aufträge */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Aktuelle Aufträge
              </CardTitle>
              <CardDescription>
                Offene und laufende Werkstattaufträge
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auftraege">
                Alle anzeigen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.aktuelleVorgaenge.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine offenen Aufträge
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auftrag</TableHead>
                    <TableHead>Fahrzeug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priorität</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.aktuelleVorgaenge.map((vorgang) => (
                    <TableRow key={vorgang.id}>
                      <TableCell>
                        <Link
                          href={`/kunden/${vorgang.kundeId}/vorgang/${vorgang.id}`}
                          className="font-medium hover:underline"
                        >
                          {vorgang.vorgangsnummer}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {vorgang.titel}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{vorgang.fahrzeug.kennzeichen}</div>
                        <div className="text-xs text-muted-foreground">
                          {vorgang.fahrzeug.marke} {vorgang.fahrzeug.modell}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={vorgang.status} />
                      </TableCell>
                      <TableCell>
                        <PrioritaetBadge prioritaet={vorgang.prioritaet} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Offene Rechnungen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Offene Rechnungen
              </CardTitle>
              <CardDescription>
                Unbezahlte Rechnungen
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/rechnungen">
                Alle anzeigen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.letzteRechnungen.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine offenen Rechnungen
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnung</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.letzteRechnungen.map((rechnung) => (
                    <TableRow key={rechnung.id}>
                      <TableCell>
                        <Link
                          href={`/rechnungen/${rechnung.id}`}
                          className="font-medium hover:underline"
                        >
                          {rechnung.rechnungsnummer}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(rechnung.datum)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {rechnung.kunde.firma || `${rechnung.kunde.vorname} ${rechnung.kunde.nachname}`}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(rechnung.bruttoGesamt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Anstehende Termine */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Anstehende Termine
              </CardTitle>
              <CardDescription>
                Die nächsten Kalendereinträge
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/kalender">
                Kalender öffnen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.naechsteTermine.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine anstehenden Termine
              </p>
            ) : (
              <div className="space-y-3">
                {data.naechsteTermine.map((termin) => (
                  <div
                    key={termin.id}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/50 p-4 transition-colors hover:bg-background"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <Clock className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{termin.titel}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(termin.startDatum)}
                        {termin.fahrzeug && ` • ${termin.fahrzeug.kennzeichen}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-border/60">{termin.typ}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* HU/AU Erinnerungen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              HU/AU fällig
            </CardTitle>
            <CardDescription>
              Fahrzeuge mit bald ablaufender HU/AU (30 Tage)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.faelligeHU.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-success mb-2" />
                <p className="text-muted-foreground">
                  Keine HU/AU in den nächsten 30 Tagen fällig
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.faelligeHU.map((fahrzeug) => (
                  <div
                    key={fahrzeug.id}
                    className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 transition-colors hover:bg-amber-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                      <Car className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{fahrzeug.kennzeichen}</p>
                      <p className="text-sm text-muted-foreground">
                        {fahrzeug.kunde.vorname} {fahrzeug.kunde.nachname}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-600">
                        {fahrzeug.naechsteHU && formatDate(fahrzeug.naechsteHU)}
                      </p>
                      <p className="text-xs text-muted-foreground">HU fällig</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
