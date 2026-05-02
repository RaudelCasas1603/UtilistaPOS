import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Wallet, Boxes, ArrowRight } from "lucide-react"
import Link from "next/link"

const reportes = [
  {
    title: "Ventas",
    description: "Consulta reportes de ventas realizadas.",
    icon: ShoppingCart,
    ruta: "/ventas",
  },
  {
    title: "Corte de Caja",
    description: "Revisa cortes, efectivo y movimientos.",
    icon: Wallet,
    ruta: "/corte-caja",
  },
  {
    title: "Inventario",
    description: "Consulta existencias y movimientos.",
    icon: Boxes,
    ruta: "/inventario",
  },
]

export default function ReportesPage() {
  return (
    <div className="flex h-full min-h-0 flex-col p-3 lg:p-4 xl:p-5">
      <div className="shrink-0">
        <h1 className="text-xl font-bold tracking-tight xl:text-2xl">
          Reportes
        </h1>
        <p className="text-xs text-muted-foreground xl:text-sm">
          Selecciona el reporte que deseas consultar.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="grid w-full max-w-6xl gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {reportes.map((reporte, index) => {
            const Icon = reporte.icon

            return (
              <Link
                key={index}
                href={`/admin/reportes${reporte.ruta}`}
                className="block"
              >
                <Card className="group h-full rounded-2xl border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex h-28 items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground xl:text-base">
                          {reporte.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {reporte.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
