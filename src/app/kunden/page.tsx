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
import { Plus, Search, MoreHorizontal, User, Car, FileText, Phone, Mail } from "lucide-react"

async function getKunden() {
  return prisma.kunde.findMany({
    orderBy: { nachname: "asc" },
    include: {
      _count: {
        select: { fahrzeuge: true, rechnungen: true, vorgaenge: true },
      },
    },
  })
}

export default async function KundenPage() {
  const kunden = await getKunden()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kunden</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kundendaten und deren Fahrzeuge
          </p>
        </div>
        <Button asChild>
          <Link href="/kunden/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Kunde
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt Kunden</CardTitle>
            <div className="rounded-xl bg-slate-100 p-2">
              <User className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kunden.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Firmenkunden</CardTitle>
            <div className="rounded-xl bg-violet-50 p-2">
              <User className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kunden.filter(k => k.firma).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Privatkunden</CardTitle>
            <div className="rounded-xl bg-emerald-50 p-2">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kunden.filter(k => !k.firma).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kundenliste</CardTitle>
          <CardDescription>
            Alle registrierten Kunden mit ihren Fahrzeugen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Kunde suchen..." className="pl-9 bg-background/50 border-border/60" />
            </div>
          </div>

          {/* Table */}
          {kunden.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Keine Kunden vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihren ersten Kunden, um loszulegen.
              </p>
              <Button asChild>
                <Link href="/kunden/neu">
                  <Plus className="mr-2 h-4 w-4" />
                  Ersten Kunden anlegen
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead className="text-center">Fahrzeuge</TableHead>
                  <TableHead className="text-center">Aufträge</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kunden.map((kunde) => (
                  <TableRow key={kunde.id}>
                    <TableCell>
                      <Link href={`/kunden/${kunde.id}`} className="hover:underline">
                        <div className="font-medium">
                          {kunde.firma ? (
                            <>
                              {kunde.firma}
                              <div className="text-xs text-muted-foreground">
                                {kunde.anrede} {kunde.vorname} {kunde.nachname}
                              </div>
                            </>
                          ) : (
                            <>
                              {kunde.anrede} {kunde.vorname} {kunde.nachname}
                            </>
                          )}
                        </div>
                        {kunde.kundennummer && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {kunde.kundennummer}
                          </Badge>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {kunde.telefon && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {kunde.telefon}
                          </div>
                        )}
                        {kunde.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {kunde.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {kunde.strasse} {kunde.hausnummer}
                        <div className="text-muted-foreground">
                          {kunde.plz} {kunde.ort}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{kunde._count.fahrzeuge}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{kunde._count.vorgaenge}</span>
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
                            <Link href={`/kunden/${kunde.id}`}>
                              Details anzeigen
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/kunden/${kunde.id}/bearbeiten`}>
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/kunden/${kunde.id}/fahrzeug-neu`}>
                              Fahrzeug hinzufügen
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/kunden/${kunde.id}/vorgang/neu`}>
                              Auftrag erstellen
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
