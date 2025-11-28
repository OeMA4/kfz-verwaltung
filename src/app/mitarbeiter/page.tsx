import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Plus, MoreHorizontal, UserCog, Wrench, Clock, Phone, Mail } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

async function getMitarbeiter() {
  return prisma.mitarbeiter.findMany({
    orderBy: { nachname: "asc" },
    include: {
      _count: {
        select: {
          arbeitszeiten: true,
          vorgaenge: true,
        },
      },
    },
  })
}

const rolleLabels: Record<string, { label: string; color: string }> = {
  meister: { label: "Meister", color: "bg-purple-100 text-purple-800" },
  mechaniker: { label: "Mechaniker", color: "bg-blue-100 text-blue-800" },
  azubi: { label: "Auszubildender", color: "bg-green-100 text-green-800" },
  buero: { label: "Büro", color: "bg-gray-100 text-gray-800" },
}

export default async function MitarbeiterPage() {
  const mitarbeiter = await getMitarbeiter()

  const aktiveMitarbeiter = mitarbeiter.filter(m => m.aktiv)
  const inaktiveMitarbeiter = mitarbeiter.filter(m => !m.aktiv)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mitarbeiter</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihr Werkstatt-Team
          </p>
        </div>
        <Button asChild>
          <Link href="/mitarbeiter/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Mitarbeiter
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mitarbeiter.length}</div>
            <p className="text-xs text-muted-foreground">
              {aktiveMitarbeiter.length} aktiv
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meister</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mitarbeiter.filter(m => m.rolle === "meister").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mechaniker</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mitarbeiter.filter(m => m.rolle === "mechaniker").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Auszubildende</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mitarbeiter.filter(m => m.rolle === "azubi").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Team-Übersicht</CardTitle>
          <CardDescription>
            Alle Mitarbeiter mit ihren Rollen und Kontaktdaten
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mitarbeiter.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Keine Mitarbeiter vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Fügen Sie Ihr erstes Team-Mitglied hinzu.
              </p>
              <Button asChild>
                <Link href="/mitarbeiter/neu">
                  <Plus className="mr-2 h-4 w-4" />
                  Ersten Mitarbeiter anlegen
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aktiveMitarbeiter.map((ma) => {
                const rolleConfig = rolleLabels[ma.rolle] || { label: ma.rolle, color: "bg-gray-100 text-gray-800" }
                const initials = `${ma.vorname[0]}${ma.nachname[0]}`.toUpperCase()

                return (
                  <Card key={ma.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {ma.vorname} {ma.nachname}
                            </h3>
                          </div>
                          <Badge className={`mt-1 ${rolleConfig.color}`}>
                            {rolleConfig.label}
                          </Badge>
                          <div className="mt-3 space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {ma.personalnummer}
                              </Badge>
                            </div>
                            {ma.telefon && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {ma.telefon}
                              </div>
                            )}
                            {ma.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{ma.email}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                              <span>{ma._count.vorgaenge} Aufträge</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatCurrency(ma.stundensatz)}/Std</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/mitarbeiter/${ma.id}`}>
                                Details anzeigen
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/mitarbeiter/${ma.id}/bearbeiten`}>
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/mitarbeiter/${ma.id}/arbeitszeiten`}>
                                Arbeitszeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Deaktivieren
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Inaktive Mitarbeiter */}
          {inaktiveMitarbeiter.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                Inaktive Mitarbeiter ({inaktiveMitarbeiter.length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Personalnummer</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Austritt</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inaktiveMitarbeiter.map((ma) => (
                    <TableRow key={ma.id} className="opacity-60">
                      <TableCell>
                        {ma.vorname} {ma.nachname}
                      </TableCell>
                      <TableCell>{ma.personalnummer}</TableCell>
                      <TableCell>
                        {rolleLabels[ma.rolle]?.label || ma.rolle}
                      </TableCell>
                      <TableCell>
                        {ma.austrittsdatum
                          ? new Date(ma.austrittsdatum).toLocaleDateString("de-DE")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Reaktivieren
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
