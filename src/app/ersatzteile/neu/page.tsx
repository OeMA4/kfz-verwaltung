import { Suspense } from "react"
import ErsatzteilForm from "@/components/ErsatzteilForm"

export default function NeuesErsatzteilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Neues Ersatzteil</h1>
        <p className="text-muted-foreground">
          Fügen Sie ein neues Ersatzteil zum Lagerbestand hinzu
        </p>
      </div>
      <Suspense fallback={<div>Laden...</div>}>
        <ErsatzteilForm />
      </Suspense>
    </div>
  )
}
