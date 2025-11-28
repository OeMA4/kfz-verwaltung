"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  FileText,
  Calculator,
  Calendar,
  Package,
  CircleDot,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    title: "Übersicht",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Kalender", href: "/kalender", icon: Calendar },
    ],
  },
  {
    title: "Kunden & Fahrzeuge",
    items: [
      { name: "Kunden", href: "/kunden", icon: Users },
      { name: "Fahrzeuge", href: "/fahrzeuge", icon: Car },
    ],
  },
  {
    title: "Werkstatt",
    items: [
      { name: "Aufträge", href: "/auftraege", icon: Wrench },
      { name: "Mitarbeiter", href: "/mitarbeiter", icon: UserCog },
    ],
  },
  {
    title: "Finanzen",
    items: [
      { name: "Rechnungen", href: "/rechnungen", icon: FileText },
      { name: "Kostenvoranschläge", href: "/kostenvoranschlaege", icon: Calculator },
    ],
  },
  {
    title: "Lager & Service",
    items: [
      { name: "Ersatzteile", href: "/ersatzteile", icon: Package },
      { name: "Reifeneinlagerung", href: "/reifen", icon: CircleDot },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col border-r border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border/60 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">KFZ Meisterwerkstatt</span>
                <span className="text-xs text-muted-foreground">Verwaltung</span>
              </div>
            )}
          </Link>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-4">
            {navigation.map((group) => (
              <div key={group.title}>
                {!collapsed && (
                  <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </h4>
                )}
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href))
                    const Icon = item.icon

                    const linkContent = (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    )

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return <div key={item.href}>{linkContent}</div>
                  })}
                </div>
                {!collapsed && <Separator className="mt-4" />}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/60 p-4">
          {!collapsed ? (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground/80">KFZ Meisterwerkstatt</p>
              <p>Musterstraße 123</p>
              <p>12345 Musterstadt</p>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Einstellungen</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
